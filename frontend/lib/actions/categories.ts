'use server'

import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/lib/types/database.types'
import type { ApiError, ApiSuccess } from '@/lib/schemas/api.schemas'

/**
 * Fetch all active categories
 * This is cached and rarely changes
 */
export async function getCategories(): Promise<ApiSuccess<Category[]> | ApiError> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('hottakes_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return {
        error: 'Failed to fetch categories',
        code: 'FETCH_ERROR',
        details: error,
      }
    }

    return {
      data: data || [],
    }
  } catch (error) {
    console.error('Unexpected error fetching categories:', error)
    return {
      error: 'An unexpected error occurred',
      code: 'UNEXPECTED_ERROR',
    }
  }
}
