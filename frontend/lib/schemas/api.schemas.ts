import { z } from 'zod'

// Take schemas
export const createTakeSchema = z.object({
  content: z
    .string()
    .min(10, 'Take must be at least 10 characters')
    .max(280, 'Take must be 280 characters or less')
    .trim(),
  category: z.string().min(1, 'Category is required'),
  deviceFingerprint: z.string().min(1, 'Device fingerprint is required'),
  ipHash: z.string().min(1, 'IP hash is required'),
})

export type CreateTakeInput = z.infer<typeof createTakeSchema>

// Vote schemas
export const createVoteSchema = z.object({
  takeId: z.string().uuid('Invalid take ID'),
  voteType: z.enum(['agree', 'disagree'], {
    required_error: 'Vote type must be either "agree" or "disagree"',
  }),
  deviceFingerprint: z.string().min(1, 'Device fingerprint is required'),
  ipHash: z.string().min(1, 'IP hash is required'),
})

export type CreateVoteInput = z.infer<typeof createVoteSchema>

// Report schemas
export const createReportSchema = z.object({
  takeId: z.string().uuid('Invalid take ID'),
  reason: z.enum([
    'hate_speech',
    'harassment',
    'spam',
    'off_topic',
    'misinformation',
    'other',
  ]),
  additionalInfo: z.string().max(500).optional(),
})

export type CreateReportInput = z.infer<typeof createReportSchema>

export const updateReportSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'actioned', 'dismissed']),
  reviewedBy: z.string().optional(),
})

export type UpdateReportInput = z.infer<typeof updateReportSchema>

// Take query schemas
export const getTakesSchema = z.object({
  sort: z.enum(['controversial', 'fresh', 'trending', 'top_agreed', 'top_disagreed']).optional().default('controversial'),
  category: z.string().optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  cursor: z.string().optional(),
})

export type GetTakesInput = z.infer<typeof getTakesSchema>

// Check vote schema
export const checkVoteSchema = z.object({
  takeId: z.string().uuid('Invalid take ID'),
  deviceFingerprint: z.string().min(1, 'Device fingerprint is required'),
})

export type CheckVoteInput = z.infer<typeof checkVoteSchema>

// Hide take schema
export const hideTakeSchema = z.object({
  takeId: z.string().uuid('Invalid take ID'),
  hidden: z.boolean(),
  reason: z.string().max(200).optional(),
})

export type HideTakeInput = z.infer<typeof hideTakeSchema>

// API Error response
export interface ApiError {
  error: string
  code?: string
  details?: unknown
}

// API Success response
export interface ApiSuccess<T = unknown> {
  data: T
  message?: string
}
