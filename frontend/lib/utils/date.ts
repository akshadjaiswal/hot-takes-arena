/**
 * Date formatting utilities
 */

import { formatDistanceToNow, format } from 'date-fns'

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return formatDistanceToNow(dateObj, { addSuffix: true })
  } catch (error) {
    return 'recently'
  }
}

/**
 * Format a date as absolute time (e.g., "Jan 5, 2025 at 3:45 PM")
 */
export function formatAbsoluteTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'MMM d, yyyy \'at\' h:mm a')
  } catch (error) {
    return 'Invalid date'
  }
}

/**
 * Format a date for display in the UI
 * Shows relative time for recent dates, absolute time for older dates
 */
export function formatDisplayTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60)

    // Show relative time for dates within the last 24 hours
    if (diffInHours < 24) {
      return formatRelativeTime(dateObj)
    }

    // Show absolute time for older dates
    return formatAbsoluteTime(dateObj)
  } catch (error) {
    return 'recently'
  }
}

/**
 * Check if a date is recent (within the last 24 hours)
 */
export function isRecent(date: string | Date): boolean {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60)
    return diffInHours < 24
  } catch (error) {
    return false
  }
}
