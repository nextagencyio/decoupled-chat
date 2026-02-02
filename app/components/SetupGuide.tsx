'use client'

import { Terminal, Key, Database, Sparkles, Bot } from 'lucide-react'

export function SetupGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Setup Required
          </h1>
          <p className="text-gray-400">
            Run the setup script to configure Drupal, Pinecone, and Groq.
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4">
              Quick Start
            </h2>
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Terminal className="w-4 h-4" />
                <span>Terminal</span>
              </div>
              <code className="text-emerald-400">npm run setup</code>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              What you'll need
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Key className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">
                    Decoupled.io Account
                  </h4>
                  <p className="text-sm text-gray-400">
                    Create a free account at{' '}
                    <a href="https://decoupled.io" className="text-sky-400 hover:underline" target="_blank" rel="noopener">
                      decoupled.io
                    </a>{' '}
                    to manage your Drupal content.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Database className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">
                    Pinecone API Key
                  </h4>
                  <p className="text-sm text-gray-400">
                    Get a free API key from{' '}
                    <a href="https://pinecone.io" className="text-sky-400 hover:underline" target="_blank" rel="noopener">
                      pinecone.io
                    </a>{' '}
                    for vector search and embeddings.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">
                    Groq API Key
                  </h4>
                  <p className="text-sm text-gray-400">
                    Get a free API key from{' '}
                    <a href="https://console.groq.com" className="text-sky-400 hover:underline" target="_blank" rel="noopener">
                      console.groq.com
                    </a>{' '}
                    for fast AI-powered chat responses.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-sky-900/20 rounded-lg border border-sky-800">
              <p className="text-sm text-sky-300">
                <strong>Free tiers available!</strong> All three services offer generous free tiers, so you can get started without any cost.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          The setup script will guide you through each step.
        </p>
      </div>
    </div>
  )
}

export default SetupGuide
