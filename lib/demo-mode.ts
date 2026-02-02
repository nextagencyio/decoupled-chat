/**
 * Demo Mode Module
 *
 * This file contains ALL demo/mock mode functionality.
 * To remove demo mode from a real project:
 * 1. Delete this file (lib/demo-mode.ts)
 * 2. Delete the data/mock/ directory
 * 3. Delete app/components/DemoModeBanner.tsx
 * 4. Remove DemoModeBanner from app/layout.tsx
 * 5. Remove the demo mode check from app/api/chat/route.ts
 * 6. Remove the demo mode check from app/api/config/route.ts
 */

import type { Article } from './types'

// Import mock data
import mockArticles from '@/data/mock/articles.json'

/**
 * Check if demo mode is enabled via environment variable
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
}

/**
 * Get mock articles for demo mode
 */
export function getMockArticles(): Article[] {
  return mockArticles.articles as Article[]
}

/**
 * Generate a demo mode chat response based on the user's message
 */
export function generateDemoResponse(userMessage: string): { message: string; sources: Article[] } {
  const articles = getMockArticles()
  const lowerMessage = userMessage.toLowerCase()

  // Demo mode disclaimer
  const demoDisclaimer = `\n\n---\n*This is a demo response. Connect your Drupal backend, Pinecone, and Groq API to get real AI-powered answers from your content.*`

  // Match different types of questions
  if (lowerMessage.includes('topic') || lowerMessage.includes('cover') || lowerMessage.includes('about')) {
    return {
      message: `## Topics We Cover

Our knowledge base includes articles on:

- **Next.js & React** - Modern frontend development
- **Drupal** - Enterprise content management
- **GraphQL APIs** - Efficient data fetching
- **TypeScript** - Type-safe development
- **Performance Optimization** - Building fast websites

Check out the sources panel to explore some of our articles!${demoDisclaimer}`,
      sources: articles.slice(0, 3),
    }
  }

  if (lowerMessage.includes('started') || lowerMessage.includes('begin') || lowerMessage.includes('start')) {
    return {
      message: `## Getting Started

Here's how to get started with Decoupled Drupal:

1. **Set up your Drupal backend** - Create a space on decoupled.io
2. **Import content** - Use the content import feature
3. **Configure your frontend** - Set up environment variables
4. **Index your content** - Run the indexing script for search

The articles in the sources panel will help you get started!${demoDisclaimer}`,
      sources: articles.slice(0, 2),
    }
  }

  if (lowerMessage.includes('latest') || lowerMessage.includes('recent') || lowerMessage.includes('new')) {
    return {
      message: `## Latest Articles

Here are some of our recent articles covering modern web development topics:

- **Decoupled Architecture** - Building flexible, scalable websites
- **GraphQL Best Practices** - Efficient data fetching patterns
- **Performance Tips** - Optimizing your Next.js application

Browse the sources panel to read these articles!${demoDisclaimer}`,
      sources: articles,
    }
  }

  if (lowerMessage.includes('concept') || lowerMessage.includes('explain') || lowerMessage.includes('what is')) {
    return {
      message: `## Core Concepts

**Decoupled Architecture** separates your content management (Drupal) from your presentation layer (Next.js):

**Key Benefits:**
- **Flexibility** - Use any frontend framework
- **Performance** - Static generation & edge caching
- **Security** - Reduced attack surface
- **Developer Experience** - Modern tooling

**How it works:**
1. Content is managed in Drupal
2. GraphQL API exposes the content
3. Next.js fetches and renders pages
4. AI-powered search enhances discovery

Check the sources for more detailed explanations!${demoDisclaimer}`,
      sources: articles.slice(1, 4),
    }
  }

  // Default response
  return {
    message: `## How Can I Help?

I'm an AI-powered assistant that can help you explore our knowledge base. Try asking:

- "What topics do you cover?"
- "How do I get started?"
- "What are the latest articles?"
- "Explain the main concepts"

I'll search through our articles and provide helpful answers with sources!${demoDisclaimer}`,
    sources: articles.slice(0, 2),
  }
}
