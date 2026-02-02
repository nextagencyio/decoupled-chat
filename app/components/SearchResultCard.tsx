import Image from 'next/image'
import Link from 'next/link'
import { Clock, Tag, Sparkles } from 'lucide-react'
import type { SearchResult } from '@/lib/types'

interface SearchResultCardProps {
  result: SearchResult
  rank: number
}

export default function SearchResultCard({ result, rank }: SearchResultCardProps) {
  const { article, score } = result
  const relevancePercent = Math.round(score * 100)

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="block group"
    >
      <article className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-lg transition-all duration-200">
        <div className="flex flex-col sm:flex-row">
          {article.image && (
            <div className="sm:w-48 sm:flex-shrink-0">
              <div className="relative h-40 sm:h-full">
                <Image
                  src={article.image.url}
                  alt={article.image.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          )}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
                  {article.category}
                </span>
                <span className="text-xs text-slate-400">#{rank}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-3 h-3" />
                <span>{relevancePercent}% match</span>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 mb-2">
              {article.title}
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-3">
              {article.summary}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime}
              </span>
              {article.tags.length > 0 && (
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  {article.tags.slice(0, 2).join(', ')}
                  {article.tags.length > 2 && ` +${article.tags.length - 2}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
