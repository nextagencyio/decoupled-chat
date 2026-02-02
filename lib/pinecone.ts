import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'
import type { Article, SearchResult } from './types'

let pineconeClient: Pinecone | null = null
let openaiClient: OpenAI | null = null

export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY environment variable is not set')
    }
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    })
  }
  return pineconeClient
}

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient()

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })

  return response.data[0].embedding
}

export async function indexArticle(article: Article): Promise<void> {
  const pinecone = getPineconeClient()
  const indexName = process.env.PINECONE_INDEX || 'decoupled-search'
  const index = pinecone.index(indexName)

  // Create text for embedding: title + summary + body (stripped of HTML)
  const plainBody = article.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const textToEmbed = `${article.title}\n\n${article.summary}\n\n${plainBody}`

  // Truncate to ~8000 tokens (~32000 chars) to stay within embedding model limits
  const truncatedText = textToEmbed.slice(0, 32000)

  const embedding = await generateEmbedding(truncatedText)

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
}

export async function searchArticles(
  query: string,
  topK: number = 10
): Promise<SearchResult[]> {
  const pinecone = getPineconeClient()
  const indexName = process.env.PINECONE_INDEX || 'decoupled-search'
  const index = pinecone.index(indexName)

  const queryEmbedding = await generateEmbedding(query)

  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  })

  return results.matches?.map((match) => ({
    id: match.id,
    score: match.score || 0,
    article: {
      id: match.id,
      title: match.metadata?.title as string || '',
      slug: match.metadata?.slug as string || '',
      body: '', // Not stored in Pinecone to save space
      summary: match.metadata?.summary as string || '',
      category: match.metadata?.category as string || 'General',
      tags: (match.metadata?.tags as string || '').split(', ').filter(Boolean),
      readTime: match.metadata?.readTime as string || '5 min read',
      publishedAt: match.metadata?.publishedAt as string || '',
      image: match.metadata?.imageUrl ? {
        url: match.metadata.imageUrl as string,
        alt: match.metadata.imageAlt as string || '',
      } : undefined,
    },
  })) || []
}

export async function deleteArticle(articleId: string): Promise<void> {
  const pinecone = getPineconeClient()
  const indexName = process.env.PINECONE_INDEX || 'decoupled-search'
  const index = pinecone.index(indexName)

  await index.deleteOne(articleId)
}

export async function clearIndex(): Promise<void> {
  const pinecone = getPineconeClient()
  const indexName = process.env.PINECONE_INDEX || 'decoupled-search'
  const index = pinecone.index(indexName)

  await index.deleteAll()
}
