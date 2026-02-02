export interface Article {
  id: string
  title: string
  slug: string
  body: string
  summary: string
  category: string
  tags: string[]
  image?: {
    url: string
    alt: string
    width?: number
    height?: number
  }
  readTime: string
  publishedAt: string
}

export interface SearchResult {
  id: string
  score: number
  article: Article
}

export interface SearchResponse {
  results: SearchResult[]
  query: string
  totalResults: number
}
