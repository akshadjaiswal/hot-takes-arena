import Link from 'next/link'
import { Flame } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-24 flex flex-col items-center gap-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 shadow-sm">
        <Flame className="h-10 w-10 text-white drop-shadow" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h1 className="text-6xl font-bold text-text-primary">404</h1>
        <h2 className="text-xl font-semibold text-text-primary">This take doesn&apos;t exist</h2>
        <p className="text-sm text-text-secondary max-w-sm">
          The page you&apos;re looking for may have been removed or never existed in the first place.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
      >
        Back to the Arena
      </Link>
    </div>
  )
}
