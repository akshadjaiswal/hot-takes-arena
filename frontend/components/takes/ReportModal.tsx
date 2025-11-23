'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, AlertTriangle } from 'lucide-react'
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
import { cn } from '@/lib/utils'

const REPORT_REASONS = [
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'spam', label: 'Spam' },
  { value: 'off_topic', label: 'Off Topic' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'other', label: 'Other' },
] as const

interface ReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  takeId: string
  onSubmit: (reason: string, additionalInfo?: string) => Promise<void>
}

export function ReportModal({
  open,
  onOpenChange,
  takeId,
  onSubmit,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)

    if (!selectedReason) {
      setError('Please select a reason for reporting')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(selectedReason, additionalInfo.trim() || undefined)

      toast.success('Report Submitted', {
        description: 'Thank you for helping keep our community safe',
      })

      onOpenChange(false)

      // Reset form
      setTimeout(() => {
        setSelectedReason('')
        setAdditionalInfo('')
      }, 300)
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to submit report'
      setError(errorMsg)
      toast.error('Report Failed', {
        description: errorMsg,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <DialogTitle>Report Take</DialogTitle>
          </div>
          <DialogDescription>
            Help us maintain a respectful community. Why are you reporting this take?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <div className="flex flex-wrap gap-2">
              {REPORT_REASONS.map((reason) => (
                <Badge
                  key={reason.value}
                  variant={
                    selectedReason === reason.value ? 'default' : 'outline'
                  }
                  className={cn(
                    'cursor-pointer transition-all hover:scale-105',
                    selectedReason === reason.value &&
                      'ring-2 ring-stone-900 ring-offset-2'
                  )}
                  onClick={() => setSelectedReason(reason.value)}
                >
                  {reason.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-2">
            <Label htmlFor="additional-info">
              Additional Information (optional)
            </Label>
            <Textarea
              id="additional-info"
              placeholder="Provide more details if needed..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <span className="text-xs text-text-secondary">
              {additionalInfo.length}/500 characters
            </span>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedReason}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
