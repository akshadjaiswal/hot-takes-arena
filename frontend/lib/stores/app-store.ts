import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { getDeviceFingerprint } from '@/lib/utils/fingerprint'
import { getHashedClientIP } from '@/lib/actions/takes'
import type { SortOption } from '@/lib/types/database.types'

interface AppStore {
  // Device Identifiers
  deviceFingerprint: string
  ipHash: string
  isIdentifiersReady: boolean
  setDeviceFingerprint: (fp: string) => void
  setIpHash: (hash: string) => void
  initializeIdentifiers: () => Promise<void>

  // Filter State
  selectedCategory: string | null
  selectedSort: SortOption
  setCategory: (category: string | null) => void
  setSort: (sort: SortOption) => void

  // Modal State
  postModalOpen: boolean
  reportModalOpen: boolean
  reportingTakeId: string | null
  openPostModal: () => void
  closePostModal: () => void
  openReportModal: (takeId: string) => void
  closeReportModal: () => void
}

export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      // Device Identifiers - Initial State
      deviceFingerprint: '',
      ipHash: '',
      isIdentifiersReady: false,

      // Device Identifiers - Actions
      setDeviceFingerprint: (fp) => {
        console.log('[AppStore] Device fingerprint set:', fp?.substring(0, 8))
        set({ deviceFingerprint: fp })
      },

      setIpHash: (hash) => {
        console.log('[AppStore] IP hash set:', hash?.substring(0, 8))
        set({ ipHash: hash })
      },

      initializeIdentifiers: async () => {
        console.log('[AppStore] Initializing device identifiers...')

        try {
          // Get device fingerprint
          const fp = await getDeviceFingerprint()
          set({ deviceFingerprint: fp })
          console.log('[AppStore] Device fingerprint loaded:', fp?.substring(0, 8))

          // Get IP hash
          const hash = await getHashedClientIP()
          set({ ipHash: hash })
          console.log('[AppStore] IP hash loaded:', hash?.substring(0, 8))

          // Mark as ready
          set({ isIdentifiersReady: true })
          console.log('[AppStore] Device identifiers ready')
        } catch (error) {
          console.error('[AppStore] Failed to initialize identifiers:', error)
          // Set fallback values
          set({
            deviceFingerprint: 'unknown',
            ipHash: 'unknown',
            isIdentifiersReady: true,
          })
        }
      },

      // Filter State - Initial State
      selectedCategory: null,
      selectedSort: 'controversial',

      // Filter State - Actions
      setCategory: (category) => {
        console.log('[AppStore] Category changed:', category)
        set({ selectedCategory: category })
      },

      setSort: (sort) => {
        console.log('[AppStore] Sort changed:', sort)
        set({ selectedSort: sort })
      },

      // Modal State - Initial State
      postModalOpen: false,
      reportModalOpen: false,
      reportingTakeId: null,

      // Modal State - Actions
      openPostModal: () => {
        console.log('[AppStore] Opening post modal')
        set({ postModalOpen: true })
      },

      closePostModal: () => {
        console.log('[AppStore] Closing post modal')
        set({ postModalOpen: false })
      },

      openReportModal: (takeId) => {
        console.log('[AppStore] Opening report modal for take:', takeId)
        set({ reportModalOpen: true, reportingTakeId: takeId })
      },

      closeReportModal: () => {
        console.log('[AppStore] Closing report modal')
        set({ reportModalOpen: false, reportingTakeId: null })
      },
    }),
    { name: 'AppStore' } // DevTools name
  )
)

// Selectors for optimized re-renders
// Components can use these to subscribe to specific slices of state

export const useDeviceFingerprint = () =>
  useAppStore((state) => state.deviceFingerprint)

export const useIpHash = () => useAppStore((state) => state.ipHash)

export const useIsIdentifiersReady = () =>
  useAppStore((state) => state.isIdentifiersReady)

export const useSelectedCategory = () =>
  useAppStore((state) => state.selectedCategory)

export const useSelectedSort = () => useAppStore((state) => state.selectedSort)

// Post Modal selectors (split to avoid creating new objects)
export const usePostModalOpen = () =>
  useAppStore((state) => state.postModalOpen)

export const useOpenPostModal = () =>
  useAppStore((state) => state.openPostModal)

export const useClosePostModal = () =>
  useAppStore((state) => state.closePostModal)

// Report Modal selectors (split to avoid creating new objects)
export const useReportModalOpen = () =>
  useAppStore((state) => state.reportModalOpen)

export const useReportingTakeId = () =>
  useAppStore((state) => state.reportingTakeId)

export const useOpenReportModal = () =>
  useAppStore((state) => state.openReportModal)

export const useCloseReportModal = () =>
  useAppStore((state) => state.closeReportModal)
