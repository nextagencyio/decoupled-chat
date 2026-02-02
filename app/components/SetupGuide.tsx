import { Terminal, Key, Database } from 'lucide-react'

export default function SetupGuide() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Database className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
          Setup Required
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Run the setup script to configure Drupal and Pinecone.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Quick Start
          </h2>
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-100">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Terminal className="w-4 h-4" />
              <span>Terminal</span>
            </div>
            <code className="text-emerald-400">npm run setup</code>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
            What you'll need
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">
                  Decoupled.io Account
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Create a free account at{' '}
                  <a href="https://decoupled.io" className="text-sky-600 hover:underline" target="_blank" rel="noopener">
                    decoupled.io
                  </a>{' '}
                  to manage your Drupal content.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">
                  Pinecone API Key
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Get a free API key from{' '}
                  <a href="https://pinecone.io" className="text-sky-600 hover:underline" target="_blank" rel="noopener">
                    pinecone.io
                  </a>{' '}
                  for vector search and embeddings.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              <strong>Good news!</strong> Pinecone includes built-in embeddings, so you only need one API key for both storage and AI embeddings.
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        The setup script will guide you through each step.
      </p>
    </div>
  )
}
