'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import type {
  Take,
  TakeWithVoteCheck,
  PaginatedResponse,
  SortOption
} from '@/lib/types/database.types'
import type {
  CreateTakeInput,
  GetTakesInput,
  ApiError,
  ApiSuccess
} from '@/lib/schemas/api.schemas'
import { createTakeSchema, getTakesSchema } from '@/lib/schemas/api.schemas'
import { validateContent, sanitizeContent } from '@/lib/utils/profanity-filter'
import { hashIP, getClientIP } from '@/lib/utils/ip-hash'
import {
  checkRateLimit,
  getRateLimitKey,
  RATE_LIMITS
} from '@/lib/utils/rate-limit'
import { calculateVotePercentages } from '@/lib/utils/controversy'

/**
 * Create a new hot take
 */
export async function createTake(
  input: CreateTakeInput
): Promise<ApiSuccess<Take> | ApiError> {
  try {
    // Validate input
    const validation = createTakeSchema.safeParse(input)
    if (!validation.success) {
      return {
        error: validation.error.errors[0].message,
        code: 'VALIDATION_ERROR',
        details: validation.error,
      }
    }

    const { content, category, deviceFingerprint, ipHash } = validation.data

    // Sanitize content
    const sanitizedContent = sanitizeContent(content)

    // Validate content for profanity and spam
    const contentValidation = validateContent(sanitizedContent)
    if (!contentValidation.isValid) {
      return {
        error: contentValidation.reason || 'Invalid content',
        code: 'CONTENT_VALIDATION_ERROR',
      }
    }

    // Check rate limit
    const rateLimitKey = getRateLimitKey('post', deviceFingerprint, ipHash)
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.POST_TAKE)

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
      return {
        error: `Rate limit exceeded. You can post again in ${Math.ceil(retryAfter / 60)} minutes.`,
        code: 'RATE_LIMIT_EXCEEDED',
        details: { retryAfter },
      }
    }

    // Insert into database
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('hottakes_takes')
      .insert({
        content: sanitizedContent,
        category,
        device_fingerprint: deviceFingerprint,
        ip_hash: ipHash,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating take:', error)
      return {
        error: 'Failed to create take',
        code: 'DATABASE_ERROR',
        details: error,
      }
    }

    return {
      data,
      message: 'Take created successfully',
    }
  } catch (error) {
    console.error('Unexpected error creating take:', error)
    return {
      error: 'An unexpected error occurred',
      code: 'UNEXPECTED_ERROR',
    }
  }
}

/**
 * Fetch takes with sorting and filtering
 */
export async function getTakes(
  params: GetTakesInput = {}
): Promise<ApiSuccess<PaginatedResponse<TakeWithVoteCheck>> | ApiError> {
  try {
    const validation = getTakesSchema.safeParse(params)
    if (!validation.success) {
      return {
        error: validation.error.errors[0].message,
        code: 'VALIDATION_ERROR',
      }
    }

    const { sort, category, limit, cursor } = validation.data

    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('hottakes_takes')
      .select('*', { count: 'exact' })
      .eq('is_hidden', false)

    // Apply category filter
    if (category) {
      query = query.eq('category', category)
    }

    // Apply sorting
    switch (sort) {
      case 'controversial':
        query = query.order('controversy_score', { ascending: false, nullsFirst: false })
        break
      case 'fresh':
        query = query.order('created_at', { ascending: false })
        break
      case 'trending':
        // For trending, we'll sort by a combination of recent votes and time
        // Using total_votes desc, created_at desc as approximation
        query = query
          .order('total_votes', { ascending: false })
          .order('created_at', { ascending: false })
        break
      case 'top_agreed':
        query = query.order('agree_count', { ascending: false })
        break
      case 'top_disagreed':
        query = query.order('disagree_count', { ascending: false })
        break
    }

    // Apply pagination
    if (cursor) {
      // Cursor-based pagination (you can implement this based on your needs)
      // For now, we'll use offset-based
    }

    query = query.limit(limit)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching takes:', error)
      return {
        error: 'Failed to fetch takes',
        code: 'DATABASE_ERROR',
        details: error,
      }
    }

    // Transform takes to include vote percentages
    const takesWithPercentages: TakeWithVoteCheck[] = (data || []).map(take => {
      const { agreePercentage, disagreePercentage } = calculateVotePercentages(
        take.agree_count,
        take.disagree_count
      )

      return {
        ...take,
        agreePercentage,
        disagreePercentage,
      }
    })

    return {
      data: {
        data: takesWithPercentages,
        hasMore: (count || 0) > (data || []).length,
      },
    }
  } catch (error) {
    console.error('Unexpected error fetching takes:', error)
    return {
      error: 'An unexpected error occurred',
      code: 'UNEXPECTED_ERROR',
    }
  }
}

/**
 * Get a single take by ID
 */
export async function getTakeById(
  takeId: string
): Promise<ApiSuccess<TakeWithVoteCheck> | ApiError> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('hottakes_takes')
      .select('*')
      .eq('id', takeId)
      .single()

    if (error) {
      console.error('Error fetching take:', error)
      return {
        error: 'Take not found',
        code: 'NOT_FOUND',
        details: error,
      }
    }

    if (data.is_hidden) {
      return {
        error: 'This take has been removed',
        code: 'CONTENT_HIDDEN',
      }
    }

    const { agreePercentage, disagreePercentage } = calculateVotePercentages(
      data.agree_count,
      data.disagree_count
    )

    return {
      data: {
        ...data,
        agreePercentage,
        disagreePercentage,
      },
    }
  } catch (error) {
    console.error('Unexpected error fetching take:', error)
    return {
      error: 'An unexpected error occurred',
      code: 'UNEXPECTED_ERROR',
    }
  }
}

/**
 * Get client IP and hash it
 * Helper function for other actions
 */
export async function getHashedClientIP(): Promise<string> {
  const headersList = await headers()
  const clientIP = getClientIP(headersList)
  return hashIP(clientIP)
}
