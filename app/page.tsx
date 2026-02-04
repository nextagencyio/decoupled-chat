'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageSquare, Sparkles, FileText, AlertCircle, Trash2, X } from 'lucide-react'
import { ChatMessage } from './components/ChatMessage'
import { SourceCard } from './components/SourceCard'
import { ChatInput } from './components/ChatInput'
import { SetupGuide } from './components/SetupGuide'
import { AlmostThere } from './components/AlmostThere'
import type { ChatMessage as ChatMessageType, Article } from '@/lib/types'

interface ConfigStatus {
  configured: boolean
  services?: {
    drupal: boolean
    groq: boolean
    pinecone: boolean
  }
}

const STORAGE_KEY = 'decoupled-chat-state'

interface StoredState {
  messages: ChatMessageType[]
  sources: Article[]
}

function loadStoredState(): StoredState | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Restore Date objects
      parsed.messages = parsed.messages.map((m: ChatMessageType) => ({
        ...m,
        createdAt: new Date(m.createdAt),
      }))
      return parsed
    }
  } catch {
    // Ignore errors
  }
  return null
}

function saveState(messages: ChatMessageType[], sources: Article[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, sources }))
  } catch {
    // Ignore errors (quota exceeded, etc.)
  }
}

function clearStoredState() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [currentSources, setCurrentSources] = useState<Article[]>([])
  const [activeSourceMessageId, setActiveSourceMessageId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [showMobileSources, setShowMobileSources] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = loadStoredState()
    if (stored) {
      setMessages(stored.messages)
      setCurrentSources(stored.sources)
    }
    setIsHydrated(true)
  }, [])

  // Save state to localStorage when it changes
  useEffect(() => {
    if (isHydrated && messages.length > 0) {
      saveState(messages, currentSources)
    }
  }, [messages, currentSources, isHydrated])

  const handleClearChat = useCallback(() => {
    setMessages([])
    setCurrentSources([])
    setActiveSourceMessageId(null)
    clearStoredState()
  }, [])

  const handleShowSources = useCallback((messageId: string, sources: Article[]) => {
    setCurrentSources(sources)
    setActiveSourceMessageId(messageId)
    // Open mobile sources modal on small screens
    setShowMobileSources(true)
  }, [])

  // Check if the app is configured (lightweight check)
  useEffect(() => {
    let mounted = true

    const checkConfig = async () => {
      try {
        const res = await fetch('/api/config', {
          method: 'GET',
        })
        const data = await res.json()
        if (mounted) {
          setConfigStatus(data)
        }
      } catch {
        if (mounted) {
          // If config endpoint doesn't exist, assume configured
          setConfigStatus({ configured: true })
        }
      }
    }
    checkConfig()

    return () => {
      mounted = false
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleSendMessage = useCallback(async (content: string) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content,
      createdAt: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: abortController.signal,
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const assistantMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        sources: data.sources,
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      if (data.sources && data.sources.length > 0) {
        setCurrentSources(data.sources)
        setActiveSourceMessageId(assistantMessage.id)
      }
    } catch (err) {
      // Don't show error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      setError('Failed to get a response. Please try again.')
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [messages])

  // Show loading state while checking config
  if (configStatus === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  // Show "Almost There" if Drupal is configured but API keys are missing
  if (!configStatus.configured && configStatus.services?.drupal) {
    return (
      <AlmostThere
        hasPinecone={configStatus.services.pinecone}
        hasGroq={configStatus.services.groq}
      />
    )
  }

  // Show full setup guide if nothing is configured
  if (!configStatus.configured) {
    return <SetupGuide />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      <div className="flex h-screen">
        {/* Main chat area */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          {/* Header */}
          <header className="flex-shrink-0 border-b border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white">Decoupled Chat</h1>
                <p className="text-sm text-gray-400">AI-powered knowledge assistant</p>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  title="Clear chat"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </header>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/20 to-purple-500/20 flex items-center justify-center mb-6">
                  <MessageSquare className="w-8 h-8 text-sky-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome to Decoupled Chat
                </h2>
                <p className="text-gray-400 max-w-md mb-8">
                  Ask me anything about our content. I can search through articles
                  and provide helpful answers with sources.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {[
                    'What topics do you cover?',
                    'How do I get started?',
                    'What are the latest articles?',
                    'Explain the main concepts',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSendMessage(suggestion)}
                      className="text-left p-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-sky-500/50 transition-colors text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isSourcesActive={activeSourceMessageId === message.id}
                  onShowSources={() => message.sources && handleShowSources(message.id, message.sources)}
                />
              ))
            )}

            {isLoading && (
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                </div>
                <div className="flex-1 bg-gray-800/50 border border-gray-700 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="animate-pulse">Thinking</span>
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="flex-shrink-0 border-t border-gray-800 p-4">
            <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>

        {/* Sources sidebar - desktop */}
        <aside className="hidden lg:flex flex-col w-80 xl:w-96 border-l border-gray-800 bg-gray-900/50">
          <div className="flex-shrink-0 p-4 border-b border-gray-800">
            <div className="flex items-center gap-2 text-gray-400">
              <FileText className="w-4 h-4" />
              <span className="font-medium">Sources</span>
              {currentSources.length > 0 && (
                <span className="ml-auto text-xs bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full">
                  {currentSources.length}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentSources.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Sources from your questions will appear here
                </p>
              </div>
            ) : (
              currentSources.map((article, index) => (
                <SourceCard key={article.id} article={article} index={index} />
              ))
            )}
          </div>
        </aside>
      </div>

      {/* Mobile sources modal */}
      {showMobileSources && currentSources.length > 0 && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] bg-gray-900 rounded-t-2xl border-t border-gray-700 overflow-hidden flex flex-col">
            {/* Modal header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2 text-white">
                <FileText className="w-4 h-4" />
                <span className="font-medium">Sources</span>
                <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full">
                  {currentSources.length}
                </span>
              </div>
              <button
                onClick={() => setShowMobileSources(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentSources.map((article, index) => (
                <SourceCard key={article.id} article={article} index={index} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
