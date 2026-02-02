'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FileText, Clock, Tag } from 'lucide-react'
import type { Article } from '@/lib/types'

interface SourceCardProps {
  article: Article
  index: number
}

export function SourceCard({ article, index }: SourceCardProps) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="block group"
    >
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-sky-500/50 hover:bg-gray-800 transition-all duration-200">
        {/* Image or placeholder */}
        <div className="relative h-32 bg-gray-900">
          {article.image ? (
            <Image
              src={article.image.url}
              alt={article.image.alt || article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
          )}
          {/* Index badge */}
          <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center">
            {index + 1}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-white group-hover:text-sky-400 transition-colors line-clamp-2 mb-2">
            {article.title}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
            {article.summary}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {article.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTime}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
