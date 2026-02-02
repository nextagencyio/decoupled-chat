import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  )
}
