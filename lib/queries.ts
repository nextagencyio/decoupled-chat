import { gql } from '@apollo/client'
import type { Article } from './types'

export const GET_ALL_ARTICLES = gql`
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
        author
        tags {
          __typename
          ... on TermInterface {
            name
          }
        }
        featuredImage {
          url
          alt
        }
      }
    }
  }
`

export const GET_ARTICLE_BY_SLUG = gql`
  query GetArticleBySlug($path: String!) {
    route(path: $path) {
      ... on RouteInternal {
        entity {
          ... on NodeArticle {
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
            author
            tags {
              __typename
              ... on TermInterface {
                name
              }
            }
            featuredImage {
              url
              alt
            }
          }
        }
      }
    }
  }
`

export function transformArticle(node: any): Article | null {
  if (!node) return null

  const slug = node.path?.replace(/^\/articles\//, '') || node.id

  return {
    id: node.id,
    title: node.title,
    slug,
    body: node.body?.processed || '',
    summary: node.summary || '',
    category: 'General',
    tags: node.tags ? node.tags.map((t: any) => t.name).filter(Boolean) : [],
    readTime: '5 min read',
    publishedAt: node.created?.time || new Date().toISOString(),
    image: node.featuredImage ? {
      url: node.featuredImage.url,
      alt: node.featuredImage.alt || node.title,
    } : undefined,
  }
}
