'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, XCircle, EyeOff, Eye, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updateReportStatus, hideTake } from '@/lib/actions/reports'
import { formatRelativeTime } from '@/lib/utils/date'
import type { Report } from '@/lib/types/database.types'
import { cn } from '@/lib/utils'

interface ReportCardProps {
  report: Report & { hottakes_takes?: any }
  onUpdate: () => void
}

export function ReportCard({ report, onUpdate }: ReportCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [actionType, setActionType] = useState<string | null>(null)

  const take = report.hottakes_takes

  const handleDismiss = async () => {
    if (!confirm('Are you sure you want to dismiss this report?')) return

    setIsProcessing(true)
    setActionType('dismiss')

    try {
      const result = await updateReportStatus(report.id, {
        status: 'dismissed',
        reviewedBy: 'admin',
      })

      if ('error' in result) {
        throw new Error(result.error)
      }

      toast.success('Report Dismissed', {
        description: 'The report has been marked as dismissed',
      })

      onUpdate()
    } catch (error: any) {
      toast.error('Action Failed', {
        description: error.message || 'Failed to dismiss report',
      })
    } finally {
      setIsProcessing(false)
      setActionType(null)
    }
  }

  const handleHideTake = async () => {
    if (!confirm('Are you sure you want to hide this take? It will be removed from public view.')) return

    setIsProcessing(true)
    setActionType('hide')

    try {
      // Hide the take
      const hideResult = await hideTake({
        takeId: report.take_id,
        hidden: true,
        reason: `Hidden due to report: ${report.reason}`,
      })

      if ('error' in hideResult) {
        throw new Error(hideResult.error)
      }

      // Update report status to actioned
      const updateResult = await updateReportStatus(report.id, {
        status: 'actioned',
        reviewedBy: 'admin',
      })

      if ('error' in updateResult) {
        throw new Error(updateResult.error)
      }

      toast.success('Take Hidden', {
        description: 'The take has been hidden and removed from public view',
      })

      onUpdate()
    } catch (error: any) {
      toast.error('Action Failed', {
        description: error.message || 'Failed to hide take',
      })
    } finally {
      setIsProcessing(false)
      setActionType(null)
    }
  }

  const handleMarkReviewed = async () => {
    setIsProcessing(true)
    setActionType('review')

    try {
      const result = await updateReportStatus(report.id, {
        status: 'reviewed',
        reviewedBy: 'admin',
      })

      if ('error' in result) {
        throw new Error(result.error)
      }

      toast.success('Report Reviewed', {
        description: 'The report has been marked as reviewed',
      })

      onUpdate()
    } catch (error: any) {
      toast.error('Action Failed', {
        description: error.message || 'Failed to update report',
      })
    } finally {
      setIsProcessing(false)
      setActionType(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'reviewed':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'actioned':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'dismissed':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200'
    }
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'hate_speech':
        return 'bg-red-100 text-red-700'
      case 'harassment':
        return 'bg-orange-100 text-orange-700'
      case 'spam':
        return 'bg-yellow-100 text-yellow-700'
      case 'off_topic':
        return 'bg-blue-100 text-blue-700'
      case 'misinformation':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-stone-100 text-stone-700'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn('relative', take?.is_hidden && 'border-red-200 bg-red-50/50')}>
        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div>
                <Badge variant="outline" className={getStatusColor(report.status)}>
                  {report.status}
                </Badge>
                {take?.is_hidden && (
                  <Badge variant="outline" className="ml-2 bg-red-100 text-red-700">
                    Hidden
                  </Badge>
                )}
              </div>
            </div>
            <span className="text-xs text-stone-500">
              {formatRelativeTime(report.reported_at)}
            </span>
          </div>

          {/* Reported Take Content */}
          {take && (
            <div className="p-4 bg-stone-100 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="category" className="text-xs">
                  {take.category}
                </Badge>
                <a
                  href={`/?takeId=${report.take_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  View Take
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-sm text-stone-900 leading-relaxed">
                {take.content}
              </p>
              <div className="flex items-center gap-4 text-xs text-stone-500">
                <span>{take.total_votes} votes</span>
                <span>•</span>
                <span>{formatRelativeTime(take.created_at)}</span>
              </div>
            </div>
          )}

          {/* Report Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-stone-700">Reason:</span>
              <Badge className={getReasonColor(report.reason)}>
                {report.reason.replace('_', ' ')}
              </Badge>
            </div>

            {report.additional_info && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-stone-700">{report.additional_info}</p>
              </div>
            )}
          </div>

          {/* Review Info */}
          {report.reviewed_by && (
            <div className="text-xs text-stone-500 border-t pt-3">
              Reviewed by {report.reviewed_by} • {formatRelativeTime(report.reviewed_at!)}
            </div>
          )}
        </CardContent>

        {/* Action Buttons */}
        {report.status === 'pending' && (
          <CardFooter className="bg-stone-50 p-4 flex flex-wrap gap-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing && actionType === 'dismiss' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Dismiss
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkReviewed}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing && actionType === 'review' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Mark Reviewed
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleHideTake}
              disabled={isProcessing || take?.is_hidden}
              className="gap-2"
            >
              {isProcessing && actionType === 'hide' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              Hide Take
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  )
}
