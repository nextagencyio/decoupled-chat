import Link from 'next/link'
import { Search, Sparkles } from 'lucide-react'

export default function Header() {
  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </div>
            <span>Knowledge Search</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Sparkles className="w-4 h-4" />
              AI-Powered
            </span>
            <a
              href="https://decoupled.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              Powered by Decoupled.io
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
