'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import type { Report, TakeWithReports } from '@/lib/types/database.types'
import type {
  CreateReportInput,
  UpdateReportInput,
  HideTakeInput,
  ApiError,
  ApiSuccess
} from '@/lib/schemas/api.schemas'
import {
  createReportSchema,
  updateReportSchema,
  hideTakeSchema
} from '@/lib/schemas/api.schemas'
import {
  checkRateLimit,
  getRateLimitKey,
  RATE_LIMITS
} from '@/lib/utils/rate-limit'
import { hashIP, getClientIP } from '@/lib/utils/ip-hash'

/**
 * Submit a report for a take
 */
export async function createReport(
  input: CreateReportInput & { deviceFingerprint: string; ipHash: string }
): Promise<ApiSuccess<Report> | ApiError> {
  try {
    // Validate input
    const validation = createReportSchema.safeParse(input)
    if (!validation.success) {
      return {
        error: validation.error.errors[0].message,
        code: 'VALIDATION_ERROR',
        details: validation.error,
      }
    }

    const { takeId, reason, additionalInfo, deviceFingerprint, ipHash } = input

    // Check rate limit
    const rateLimitKey = getRateLimitKey('report', deviceFingerprint, ipHash)
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.REPORT)

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
      return {
        error: `Rate limit exceeded. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
        code: 'RATE_LIMIT_EXCEEDED',
        details: { retryAfter },
      }
    }

    const supabase = await createClient()

    // Insert report
    const { data: report, error: reportError } = await supabase
      .from('hottakes_reports')
      .insert({
        take_id: takeId,
        reason,
        additional_info: additionalInfo,
      })
      .select()
      .single()

    if (reportError) {
      console.error('Error creating report:', reportError)
      return {
        error: 'Failed to submit report',
        code: 'DATABASE_ERROR',
        details: reportError,
      }
    }

    // Check if take should be auto-hidden (10+ reports)
    const { data: reports } = await supabase
      .from('hottakes_reports')
      .select('id')
      .eq('take_id', takeId)
      .eq('status', 'pending')

    if (reports && reports.length >= 10) {
      // Auto-hide the take
      await supabase
        .from('hottakes_takes')
        .update({
          is_hidden: true,
          hidden_reason: 'Auto-hidden due to multiple reports (pending review)',
        })
        .eq('id', takeId)
    }

    return {
      data: report,
      message: 'Report submitted successfully',
    }
  } catch (error) {
    console.error('Unexpected error creating report:', error)
    return {
      error: 'An unexpected error occurred',
      code: 'UNEXPECTED_ERROR',
    }
  }
}

/**
 * Get all reports (admin only)
 */
export async function getReports(
  filters?: {
    status?: 'pending' | 'reviewed' | 'actioned' | 'dismissed'
    limit?: number
  }
): Promise<ApiSuccess<Report[]> | ApiError> {
  try {
    // TODO: Add admin authentication check here
    // For now, we'll assume this is called from an authenticated admin route

    const supabase = await createClient()

    let query = supabase
      .from('hottakes_reports')
      .select('*, hottakes_takes(content, category, created_at)')
      .order('reported_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching reports:', error)
      return {
        error: 'Failed to fetch reports',
        code: 'DATABASE_ERROR',
        details: error,
      }
    }

    return {
      data: data || [],
    }
  } catch (error) {
    console.error('Unexpected error fetching reports:', error)
    return {
      error: 'An unexpected error occurred',
      code: 'UNEXPECTED_ERROR',
    }
  }
}

/**
 * Update report status (admin only)
 */
export async function updateReportStatus(
  reportId: string,
  input: UpdateReportInput
): Promise<ApiSuccess<Report> | ApiError> {
  try {
    // TODO: Add admin authentication check here

    const validation = updateReportSchema.safeParse(input)
    if (!validation.success) {
      return {
        error: validation.error.errors[0].message,
        code: 'VALIDATION_ERROR',
      }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('hottakes_reports')
      .update({
        status: input.status,
        reviewed_by: input.reviewedBy,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', reportId)
      .select()
      .single()

    if (error) {
      console.error('Error updating report:', error)
      return {
        error: 'Failed to update report',
        code: 'DATABASE_ERROR',
        details: error,
      }
    }

    return {
      data,
      message: 'Report updated successfully',
    }
  } catch (error) {
    console.error('Unexpected error updating report:', error)
    return {
      error: 'An unexpected error occurred',
      code: 'UNEXPECTED_ERROR',
    }
  }
}

/**
 * Hide or unhide a take (admin only)
 */
export async function hideTake(
  input: HideTakeInput
): Promise<ApiSuccess<{ success: boolean }> | ApiError> {
  try {
    // TODO: Add admin authentication check here

    const validation = hideTakeSchema.safeParse(input)
    if (!validation.success) {
      return {
        error: validation.error.errors[0].message,
        code: 'VALIDATION_ERROR',
      }
    }

    const { takeId, hidden, reason } = validation.data

    const supabase = await createClient()

    const { error } = await supabase
      .from('hottakes_takes')
      .update({
        is_hidden: hidden,
        hidden_reason: hidden ? reason : null,
      })
      .eq('id', takeId)

    if (error) {
      console.error('Error hiding take:', error)
      return {
        error: 'Failed to update take visibility',
        code: 'DATABASE_ERROR',
        details: error,
      }
    }

    return {
      data: { success: true },
      message: hidden ? 'Take hidden successfully' : 'Take unhidden successfully',
    }
  } catch (error) {
    console.error('Unexpected error hiding take:', error)
    return {
      error: 'An unexpected error occurred',
      code: 'UNEXPECTED_ERROR',
    }
  }
}

/**
 * Get reports for a specific take
 */
export async function getReportsForTake(
  takeId: string
): Promise<ApiSuccess<Report[]> | ApiError> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('hottakes_reports')
      .select('*')
      .eq('take_id', takeId)
      .order('reported_at', { ascending: false })

    if (error) {
      console.error('Error fetching reports for take:', error)
      return {
        error: 'Failed to fetch reports',
        code: 'DATABASE_ERROR',
        details: error,
      }
    }

    return {
      data: data || [],
    }
  } catch (error) {
    console.error('Unexpected error fetching reports:', error)
    return {
      error: 'An unexpected error occurred',
      code: 'UNEXPECTED_ERROR',
    }
  }
}
