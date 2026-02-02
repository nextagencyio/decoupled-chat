'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { User, Bot, FileText } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/lib/types'

interface ChatMessageProps {
  message: ChatMessageType
  isSourcesActive?: boolean
  onShowSources?: () => void
}

export function ChatMessage({ message, isSourcesActive, onShowSources }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const hasSources = message.sources && message.sources.length > 0

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-sky-500/20 text-sky-400'
            : 'bg-purple-500/20 text-purple-400'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message content */}
      <div
        className={`flex-1 max-w-[85%] rounded-2xl px-5 py-4 ${
          isUser
            ? 'bg-sky-500/10 border border-sky-500/20 text-white ml-auto'
            : 'bg-gray-800/50 border border-gray-700 text-gray-100'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <>
            <div className="prose prose-invert prose-sm max-w-none
              prose-headings:text-white prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2
              prose-h2:text-base prose-h2:text-sky-400 prose-h2:border-b prose-h2:border-gray-700 prose-h2:pb-1
              prose-h3:text-sm prose-h3:text-purple-400
              prose-p:text-gray-300 prose-p:my-2 prose-p:leading-relaxed
              prose-strong:text-white prose-strong:font-semibold
              prose-ul:my-2 prose-ul:space-y-1
              prose-ol:my-2 prose-ol:space-y-1
              prose-li:text-gray-300 prose-li:my-0
              prose-code:bg-gray-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sky-300 prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-lg prose-pre:my-3
              prose-a:text-sky-400 prose-a:no-underline hover:prose-a:underline
              first:prose-headings:mt-0
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
            {hasSources && (
              <button
                onClick={onShowSources}
                className={`mt-3 flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  isSourcesActive
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{message.sources!.length} source{message.sources!.length !== 1 ? 's' : ''}</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
