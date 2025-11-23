'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { Category } from '@/lib/types/database.types'
import { cn } from '@/lib/utils'

interface PostTakeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  onSubmit: (content: string, category: string) => Promise<void>
}

export function PostTakeModal({
  open,
  onOpenChange,
  categories,
  onSubmit,
}: PostTakeModalProps) {
  const [content, setContent] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const characterLimit = 280
  const characterCount = content.length
  const charactersRemaining = characterLimit - characterCount

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setContent('')
        setSelectedCategory('')
        setError(null)
        setShowSuccess(false)
      }, 300)
    }
  }, [open])

  const handleSubmit = async () => {
    setError(null)

    if (!content.trim()) {
      setError('Please enter your hot take')
      return
    }

    if (content.length < 10) {
      setError('Hot take must be at least 10 characters')
      return
    }

    if (!selectedCategory) {
      setError('Please select a category')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(content.trim(), selectedCategory)
      setShowSuccess(true)

      // Close modal after success animation
      setTimeout(() => {
        onOpenChange(false)
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to post take')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {!showSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>Share Your Hot Take</DialogTitle>
              <DialogDescription>
                What controversial opinion do you want to share? Be bold!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category.id}
                      variant={
                        selectedCategory === category.name ? 'default' : 'outline'
                      }
                      className={cn(
                        'cursor-pointer transition-all hover:scale-105',
                        selectedCategory === category.name &&
                          'ring-2 ring-stone-900 ring-offset-2'
                      )}
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      {category.emoji && (
                        <span className="mr-1">{category.emoji}</span>
                      )}
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Content Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Your Take *</Label>
                  <span
                    className={cn(
                      'text-xs',
                      charactersRemaining < 50
                        ? charactersRemaining < 0
                          ? 'text-red-500 font-semibold'
                          : 'text-amber-500'
                        : 'text-text-secondary'
                    )}
                  >
                    {charactersRemaining} characters remaining
                  </span>
                </div>
                <Textarea
                  id="content"
                  placeholder="Example: Pineapple on pizza is actually delicious..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] resize-none"
                  maxLength={characterLimit}
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-button text-sm text-red-600"
                >
                  {error}
                </motion.div>
              )}

              {/* Guidelines */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-button text-xs text-text-secondary space-y-1">
                <p className="font-semibold text-text-primary">Guidelines:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Keep it respectful (no hate speech or harassment)</li>
                  <li>Make it interesting and controversial</li>
                  <li>Be authentic and thoughtful</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting || !content.trim() || !selectedCategory || charactersRemaining < 0
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post Take'
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          // Success state
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center"
            >
              <Check className="h-8 w-8 text-green-600" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">Take Posted!</h3>
            <p className="text-text-secondary text-center">
              Your hot take is now live. Let's see how divisive it is!
            </p>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}
