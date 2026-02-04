'use client'

import { CheckCircle2, Circle, Database, Bot, ExternalLink } from 'lucide-react'

interface AlmostThereProps {
  hasPinecone: boolean
  hasGroq: boolean
}

export function AlmostThere({ hasPinecone, hasGroq }: AlmostThereProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Almost There!
          </h1>
          <p className="text-gray-400">
            Drupal is connected. Just add your API keys to enable AI chat.
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          {/* Status checklist */}
          <div className="p-5 border-b border-gray-700">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-white">Drupal connected</span>
              </div>
              <div className="flex items-center gap-3">
                {hasPinecone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-500" />
                )}
                <span className={hasPinecone ? 'text-white' : 'text-gray-400'}>
                  Pinecone API key
                </span>
              </div>
              <div className="flex items-center gap-3">
                {hasGroq ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-500" />
                )}
                <span className={hasGroq ? 'text-white' : 'text-gray-400'}>
                  Groq API key
                </span>
              </div>
            </div>
          </div>

          {/* Missing keys instructions */}
          <div className="p-5 space-y-4">
            {!hasPinecone && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Database className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">
                    Get Pinecone API Key
                  </h4>
                  <p className="text-sm text-gray-400 mb-2">
                    Free tier includes 100K vectors - plenty for getting started.
                  </p>
                  <a
                    href="https://app.pinecone.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    Open Pinecone Console
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {!hasGroq && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">
                    Get Groq API Key
                  </h4>
                  <p className="text-sm text-gray-400 mb-2">
                    Free tier with fast inference - no credit card required.
                  </p>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    Open Groq Console
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Environment variables hint */}
          <div className="p-5 bg-gray-900/50 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-3">
              Add these to your <code className="text-emerald-400 bg-gray-800 px-1.5 py-0.5 rounded">.env.local</code> file:
            </p>
            <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm overflow-x-auto">
              {!hasPinecone && (
                <div className="text-gray-300">
                  <span className="text-purple-400">PINECONE_API_KEY</span>=your-key-here
                </div>
              )}
              {!hasGroq && (
                <div className="text-gray-300">
                  <span className="text-orange-400">GROQ_API_KEY</span>=your-key-here
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Restart your dev server after adding the keys.
        </p>
      </div>
    </div>
  )
}

export default AlmostThere
