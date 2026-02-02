#!/usr/bin/env tsx
/**
 * Index all Drupal content into Pinecone
 *
 * This script:
 * 1. Fetches all articles from Drupal via GraphQL
 * 2. Generates embeddings using OpenAI
 * 3. Stores vectors in Pinecone for semantic search
 */

import { config } from 'dotenv'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

// Load environment variables
config({ path: '.env.local' })

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
}

function log(message: string, color?: keyof typeof COLORS) {
  const colorCode = color ? COLORS[color] : ''
  console.log(`${colorCode}${message}${COLORS.reset}`)
}

function logSuccess(message: string) {
  console.log(`${COLORS.green}✓${COLORS.reset} ${message}`)
}

function logError(message: string) {
  console.log(`${COLORS.red}✗${COLORS.reset} ${message}`)
}

interface Article {
  id: string
  title: string
  slug: string
  body: string
  summary: string
  category: string
  tags: string[]
  readTime: string
  publishedAt: string
  image?: {
    url: string
    alt: string
  }
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.DRUPAL_CLIENT_ID
  const clientSecret = process.env.DRUPAL_CLIENT_SECRET
  const baseUrl = process.env.DRUPAL_BASE_URL || process.env.NEXT_PUBLIC_DRUPAL_BASE_URL

  if (!clientId || !clientSecret || !baseUrl) {
    throw new Error('Drupal credentials not configured. Run npm run setup first.')
  }

  const tokenUrl = `${baseUrl}/oauth/token`

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}

async function fetchArticles(): Promise<Article[]> {
  const baseUrl = process.env.DRUPAL_BASE_URL || process.env.NEXT_PUBLIC_DRUPAL_BASE_URL

  if (!baseUrl) {
    throw new Error('DRUPAL_BASE_URL not configured')
  }

  const accessToken = await getAccessToken()

  const query = `
    query GetAllArticles {
      nodeArticles(first: 100) {
        nodes {
          id
          title
          path
          created {
            time
          }
          body {
            processed
          }
          summary
          category
          tags
          readTime
          image {
            url
            alt
          }
        }
      }
    }
  `

  const response = await fetch(`${baseUrl}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`)
  }

  const data = await response.json()

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
  }

  const nodes = data.data?.nodeArticles?.nodes || []

  return nodes.map((node: any) => ({
    id: node.id,
    title: node.title,
    slug: node.path?.replace(/^\/articles\//, '') || node.id,
    body: node.body?.processed || '',
    summary: node.summary || '',
    category: node.category || 'General',
    tags: node.tags ? node.tags.split(',').map((t: string) => t.trim()) : [],
    readTime: node.readTime || '5 min read',
    publishedAt: node.created?.time || new Date().toISOString(),
    image: node.image
      ? {
          url: node.image.url,
          alt: node.image.alt || node.title,
        }
      : undefined,
  }))
}

async function generateEmbedding(openai: OpenAI, text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })

  return response.data[0].embedding
}

async function ensureIndexExists(pinecone: Pinecone, indexName: string): Promise<void> {
  const indexes = await pinecone.listIndexes()
  const indexExists = indexes.indexes?.some((idx) => idx.name === indexName)

  if (!indexExists) {
    log(`Creating Pinecone index: ${indexName}`, 'cyan')

    await pinecone.createIndex({
      name: indexName,
      dimension: 1536, // text-embedding-3-small dimension
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1',
        },
      },
    })

    // Wait for index to be ready
    log('Waiting for index to be ready...', 'dim')
    await new Promise((resolve) => setTimeout(resolve, 30000))
  }
}

async function main() {
  console.log(`
${COLORS.cyan}╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ${COLORS.bright}Content Indexer${COLORS.cyan}                                        ║
║   ${COLORS.dim}Indexing Drupal content in Pinecone${COLORS.cyan}                     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝${COLORS.reset}
`)

  // Validate environment
  if (!process.env.PINECONE_API_KEY) {
    logError('PINECONE_API_KEY not configured')
    process.exit(1)
  }

  if (!process.env.OPENAI_API_KEY) {
    logError('OPENAI_API_KEY not configured')
    process.exit(1)
  }

  // Initialize clients
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  })

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const indexName = process.env.PINECONE_INDEX || 'decoupled-search'

  try {
    // Ensure index exists
    await ensureIndexExists(pinecone, indexName)
    const index = pinecone.index(indexName)

    // Fetch articles from Drupal
    log('Fetching articles from Drupal...', 'dim')
    const articles = await fetchArticles()
    logSuccess(`Found ${articles.length} articles`)

    if (articles.length === 0) {
      log('No articles to index. Make sure content is imported.', 'yellow')
      process.exit(0)
    }

    // Index each article
    log('\nIndexing articles...', 'dim')

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i]
      const progress = `[${i + 1}/${articles.length}]`

      process.stdout.write(`\r${COLORS.dim}${progress}${COLORS.reset} Processing: ${article.title.slice(0, 50)}...`)

      // Create text for embedding
      const plainBody = article.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      const textToEmbed = `${article.title}\n\n${article.summary}\n\n${plainBody}`
      const truncatedText = textToEmbed.slice(0, 32000)

      // Generate embedding
      const embedding = await generateEmbedding(openai, truncatedText)

      // Upsert to Pinecone
      await index.upsert([
        {
          id: article.id,
          values: embedding,
          metadata: {
            title: article.title,
            slug: article.slug,
            summary: article.summary,
            category: article.category,
            tags: article.tags.join(', '),
            readTime: article.readTime,
            publishedAt: article.publishedAt,
            imageUrl: article.image?.url || '',
            imageAlt: article.image?.alt || '',
          },
        },
      ])

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    console.log('\n')
    logSuccess(`Successfully indexed ${articles.length} articles in Pinecone`)

    console.log(`
${COLORS.bright}Index Summary:${COLORS.reset}
- Index name: ${indexName}
- Articles indexed: ${articles.length}
- Embedding model: text-embedding-3-small

${COLORS.dim}You can now search using: npm run dev${COLORS.reset}
`)
  } catch (error: any) {
    console.log('\n')
    logError(`Indexing failed: ${error.message}`)
    process.exit(1)
  }
}

main()
