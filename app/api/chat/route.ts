import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { searchArticles } from '@/lib/pinecone'
import type { Article } from '@/lib/types'
import { isDemoMode, generateDemoResponse } from '@/lib/demo-mode'

const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

// Tool definition for searching articles
const tools: Groq.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_articles',
      description: 'Search the knowledge base for articles relevant to the user\'s question. Use this when the user asks about topics that might be covered in our articles, wants to find information, or when you need to cite sources.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query to find relevant articles. Be specific and include key terms.',
          },
        },
        required: ['query'],
      },
    },
  },
]

const systemPrompt = `You are a focused AI assistant for a technical knowledge base about web development, including topics like Next.js, React, TypeScript, Drupal, databases, APIs, and related technologies.

## Your Role
- Help users find and understand information from the knowledge base
- Stay focused on topics covered in the articles
- Use the search_articles tool to find relevant content before answering

## Guidelines
1. ALWAYS search the knowledge base first when users ask questions
2. Base your answers primarily on the article content found
3. If a question is off-topic (not related to web development, programming, or the knowledge base topics), politely redirect: "I'm focused on helping with web development topics. Is there something about Next.js, React, TypeScript, databases, or APIs I can help you with?"
4. If no relevant articles are found for an on-topic question, briefly help but mention that the knowledge base doesn't cover that specific topic yet

## Response Formatting
Use rich markdown for readability:
- **## Headers** to organize sections
- **Bold** for key terms and article titles
- Bullet points for lists
- \`inline code\` for technical terms, commands, filenames
- Code blocks with language tags for examples

## Example Structure
## Topic Overview
Brief introduction based on articles...

**Key Points:**
- Point from article
- Another insight

## Learn More
Reference to related articles...

Stay helpful, accurate, and focused on the knowledge base content.`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Demo mode - return mock responses (remove this block for production-only builds)
    if (isDemoMode()) {
      const lastMessage = messages[messages.length - 1]
      const demoResponse = generateDemoResponse(lastMessage?.content || '')
      return NextResponse.json({
        message: demoResponse.message,
        sources: demoResponse.sources,
      }, {
        headers: {
          'X-Demo-Mode': 'true',
        },
      })
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API is not configured. Please run npm run setup.' },
        { status: 503 }
      )
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })

    // Prepare messages for Groq
    const groqMessages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    // First call - may return tool calls
    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: groqMessages,
      tools,
      tool_choice: 'auto',
      max_tokens: 2048,
    })

    const assistantMessage = response.choices[0].message
    let finalContent = assistantMessage.content || ''
    const sources: Article[] = []

    // Handle tool calls if present
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults: Groq.Chat.Completions.ChatCompletionMessageParam[] = []

      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.function.name === 'search_articles') {
          const args = JSON.parse(toolCall.function.arguments)
          const searchResults = await searchArticles(args.query, 5)

          // Add articles to sources
          for (const result of searchResults) {
            if (!sources.find(s => s.id === result.article.id)) {
              sources.push(result.article)
            }
          }

          // Format search results for the model
          const formattedResults = searchResults.length > 0
            ? searchResults.map(r =>
                `**${r.article.title}** (${r.article.category})\n${r.article.summary}`
              ).join('\n\n')
            : 'No relevant articles found.'

          toolResults.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: formattedResults,
          })
        }
      }

      // Second call with tool results
      const finalResponse = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          ...groqMessages,
          assistantMessage as Groq.Chat.Completions.ChatCompletionMessageParam,
          ...toolResults,
        ],
        max_tokens: 2048,
      })

      finalContent = finalResponse.choices[0].message.content || ''
    }

    return NextResponse.json({
      message: finalContent,
      sources,
    })
  } catch (error: unknown) {
    console.error('Chat error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    if (errorMessage.includes('GROQ_API_KEY')) {
      return NextResponse.json(
        { error: 'Groq is not configured. Please run npm run setup.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Chat failed. Please try again.' },
      { status: 500 }
    )
  }
}
