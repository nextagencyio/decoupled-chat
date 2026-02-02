import { Pinecone } from '@pinecone-database/pinecone'
import type { Article, SearchResult } from './types'

// Pinecone embedding model - no OpenAI needed!
const EMBEDDING_MODEL = 'llama-text-embed-v2'

let pineconeClient: Pinecone | null = null

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

export async function generateEmbedding(text: string): Promise<number[]> {
  const pinecone = getPineconeClient()

  // Use Pinecone's built-in inference API
  const response = await pinecone.inference.embed(
    EMBEDDING_MODEL,
    [text],
    { inputType: 'passage', truncate: 'END' }
  )

  return response.data[0].values as number[]
}

export async function generateQueryEmbedding(text: string): Promise<number[]> {
  const pinecone = getPineconeClient()

  // Use 'query' inputType for search queries (optimized for retrieval)
  const response = await pinecone.inference.embed(
    EMBEDDING_MODEL,
    [text],
    { inputType: 'query', truncate: 'END' }
  )

  return response.data[0].values as number[]
}

export async function indexArticle(article: Article): Promise<void> {
  const pinecone = getPineconeClient()
  const indexName = process.env.PINECONE_INDEX || 'decoupled-search'
  const index = pinecone.index(indexName)

  // Create text for embedding: title + summary + body (stripped of HTML)
  const plainBody = article.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const textToEmbed = `${article.title}\n\n${article.summary}\n\n${plainBody}`

  // Truncate to stay within model limits
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

  // Use query embedding (optimized for retrieval)
  const queryEmbedding = await generateQueryEmbedding(query)

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
