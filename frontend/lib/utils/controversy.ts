/**
 * Controversy score calculation utilities
 * Formula: 1 - abs(agree_count - disagree_count) / total_votes
 * Range: 0 (unanimous) to 1 (perfectly split)
 */

export interface ControversyData {
  agreeCount: number
  disagreeCount: number
  totalVotes: number
}

/**
 * Calculate controversy score
 * @param agreeCount Number of agree votes
 * @param disagreeCount Number of disagree votes
 * @returns Controversy score between 0 and 1
 */
export function calculateControversyScore(
  agreeCount: number,
  disagreeCount: number
): number {
  const totalVotes = agreeCount + disagreeCount

  if (totalVotes === 0) {
    return 0
  }

  const score = 1 - Math.abs(agreeCount - disagreeCount) / totalVotes

  return Number(score.toFixed(4))
}

/**
 * Check if a take is controversial (score >= 0.7 and minimum votes met)
 */
export function isControversial(
  agreeCount: number,
  disagreeCount: number,
  minimumVotes: number = 50
): boolean {
  const totalVotes = agreeCount + disagreeCount

  if (totalVotes < minimumVotes) {
    return false
  }

  const score = calculateControversyScore(agreeCount, disagreeCount)
  return score >= 0.7
}

/**
 * Calculate vote percentages
 */
export interface VotePercentages {
  agreePercentage: number
  disagreePercentage: number
}

export function calculateVotePercentages(
  agreeCount: number,
  disagreeCount: number
): VotePercentages {
  const totalVotes = agreeCount + disagreeCount

  if (totalVotes === 0) {
    return {
      agreePercentage: 50,
      disagreePercentage: 50,
    }
  }

  return {
    agreePercentage: Math.round((agreeCount / totalVotes) * 100),
    disagreePercentage: Math.round((disagreeCount / totalVotes) * 100),
  }
}

/**
 * Get controversy level description
 */
export function getControversyLevel(score: number): string {
  if (score >= 0.9) return 'Extremely Controversial'
  if (score >= 0.8) return 'Very Controversial'
  if (score >= 0.7) return 'Controversial'
  if (score >= 0.5) return 'Somewhat Divisive'
  return 'Clear Consensus'
}

/**
 * Get heat meter color based on controversy score
 * Returns Tailwind color class
 */
export function getHeatMeterColor(score: number): string {
  if (score >= 0.9) return 'text-red-500'
  if (score >= 0.8) return 'text-orange-500'
  if (score >= 0.7) return 'text-amber-500'
  if (score >= 0.5) return 'text-yellow-500'
  return 'text-green-500'
}

/**
 * Calculate trending score
 * Takes into account recency and engagement
 */
export function calculateTrendingScore(
  totalVotes: number,
  createdAt: string
): number {
  const now = Date.now()
  const created = new Date(createdAt).getTime()
  const ageInHours = (now - created) / (1000 * 60 * 60)

  // Decay factor: older posts are penalized
  // Posts older than 48 hours get heavily penalized
  const decayFactor = Math.exp(-ageInHours / 24)

  // Trending score = votes * decay factor
  // Recent posts with high engagement score higher
  return totalVotes * decayFactor
}
