'use server'

import { createClient } from '@/lib/supabase/server'
import type { Vote, VoteType } from '@/lib/types/database.types'
import type {
  CreateVoteInput,
  CheckVoteInput,
  ApiError,
  ApiSuccess
} from '@/lib/schemas/api.schemas'
import { createVoteSchema, checkVoteSchema } from '@/lib/schemas/api.schemas'
import {
  checkRateLimit,
  getRateLimitKey,
  RATE_LIMITS
} from '@/lib/utils/rate-limit'

/**
 * Submit a vote on a take
 */
export async function createVote(
  input: CreateVoteInput
): Promise<ApiSuccess<Vote> | ApiError> {
  try {
    // Validate input
    const validation = createVoteSchema.safeParse(input)
    if (!validation.success) {
      return {
        error: validation.error.errors[0].message,
        code: 'VALIDATION_ERROR',
        details: validation.error,
      }
    }

    const { takeId, voteType, deviceFingerprint, ipHash } = validation.data

    // Check rate limit
    const rateLimitKey = getRateLimitKey('vote', deviceFingerprint, ipHash)
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.VOTE)

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
      return {
        error: `Rate limit exceeded. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
        code: 'RATE_LIMIT_EXCEEDED',
        details: { retryAfter },
      }
    }

    const supabase = await createClient()

    // Check if user already voted on this take
    const { data: existingVote } = await supabase
      .from('hottakes_votes')
      .select('*')
      .eq('take_id', takeId)
      .eq('device_fingerprint', deviceFingerprint)
      .single()

    if (existingVote) {
      return {
        error: 'You have already voted on this take',
        code: 'DUPLICATE_VOTE',
      }
    }

    // Insert vote
    const { data: vote, error: voteError } = await supabase
      .from('hottakes_votes')
      .insert({
        take_id: takeId,
        vote_type: voteType,
        device_fingerprint: deviceFingerprint,
        ip_hash: ipHash,
      })
      .select()
      .single()

    if (voteError) {
      console.error('Error creating vote:', voteError)
      return {
        error: 'Failed to submit vote',
        code: 'DATABASE_ERROR',
        details: voteError,
      }
    }

    // Update take counts
    const column = voteType === 'agree' ? 'agree_count' : 'disagree_count'

    const { error: updateError } = await supabase.rpc('increment_vote_count', {
      take_id: takeId,
      vote_column: column,
    })

    // If RPC doesn't exist, do it manually
    if (updateError) {
      const { data: take } = await supabase
        .from('hottakes_takes')
        .select('agree_count, disagree_count')
        .eq('id', takeId)
        .single()

      if (take) {
        const newAgreeCount =
          voteType === 'agree' ? take.agree_count + 1 : take.agree_count
        const newDisagreeCount =
          voteType === 'disagree' ? take.disagree_count + 1 : take.disagree_count

        await supabase
          .from('hottakes_takes')
          .update({
            agree_count: newAgreeCount,
            disagree_count: newDisagreeCount,
            total_votes: newAgreeCount + newDisagreeCount,
          })
          .eq('id', takeId)
      }
    }

    return {
      data: vote,
      message: 'Vote submitted successfully',
    }
  } catch (error) {
    console.error('Unexpected error creating vote:', error)
    return {
      error: 'An unexpected error occurred',
      code: 'UNEXPECTED_ERROR',
    }
  }
}

/**
 * Check if user has already voted on a take
 */
export async function checkUserVote(
  input: CheckVoteInput
): Promise<ApiSuccess<{ voted: boolean; voteType?: VoteType }> | ApiError> {
  try {
    const validation = checkVoteSchema.safeParse(input)
    if (!validation.success) {
      return {
        error: validation.error.errors[0].message,
        code: 'VALIDATION_ERROR',
      }
    }

    const { takeId, deviceFingerprint } = validation.data

    const supabase = await createClient()

    const { data: vote, error } = await supabase
      .from('hottakes_votes')
      .select('vote_type')
      .eq('take_id', takeId)
      .eq('device_fingerprint', deviceFingerprint)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found", which is expected
      console.error('Error checking vote:', error)
      return {
        error: 'Failed to check vote status',
        code: 'DATABASE_ERROR',
        details: error,
      }
    }

    if (vote) {
      return {
        data: {
          voted: true,
          voteType: vote.vote_type,
        },
      }
    }

    return {
      data: {
        voted: false,
      },
    }
  } catch (error) {
    console.error('Unexpected error checking vote:', error)
    return {
      error: 'An unexpected error occurred',
      code: 'UNEXPECTED_ERROR',
    }
  }
}

/**
 * Get vote counts for multiple takes
 * Useful for batch operations
 */
export async function getVoteCounts(
  takeIds: string[]
): Promise<ApiSuccess<Record<string, { agree: number; disagree: number; total: number }>> | ApiError> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('hottakes_takes')
      .select('id, agree_count, disagree_count, total_votes')
      .in('id', takeIds)

    if (error) {
      console.error('Error fetching vote counts:', error)
      return {
        error: 'Failed to fetch vote counts',
        code: 'DATABASE_ERROR',
        details: error,
      }
    }

    const counts: Record<string, { agree: number; disagree: number; total: number }> = {}

    for (const take of data || []) {
      counts[take.id] = {
        agree: take.agree_count,
        disagree: take.disagree_count,
        total: take.total_votes,
      }
    }

    return {
      data: counts,
    }
  } catch (error) {
    console.error('Unexpected error fetching vote counts:', error)
    return {
      error: 'An unexpected error occurred',
      code: 'UNEXPECTED_ERROR',
    }
  }
}

/**
 * Batch check user votes for multiple takes
 * Much more efficient than checking one by one
 */
export async function checkUserVotes(
  takeIds: string[],
  deviceFingerprint: string
): Promise<ApiSuccess<Record<string, VoteType>> | ApiError> {
  try {
    if (!takeIds.length || !deviceFingerprint) {
      return { data: {} }
    }

    const supabase = await createClient()

    const { data: votes, error } = await supabase
      .from('hottakes_votes')
      .select('take_id, vote_type')
      .in('take_id', takeIds)
      .eq('device_fingerprint', deviceFingerprint)

    if (error) {
      console.error('Error checking user votes:', error)
      return {
        error: 'Failed to check vote status',
        code: 'DATABASE_ERROR',
        details: error,
      }
    }

    const voteMap: Record<string, VoteType> = {}

    for (const vote of votes || []) {
      voteMap[vote.take_id] = vote.vote_type
    }

    return {
      data: voteMap,
    }
  } catch (error) {
    console.error('Unexpected error checking user votes:', error)
    return {
      error: 'An unexpected error occurred',
      code: 'UNEXPECTED_ERROR',
    }
  }
}
