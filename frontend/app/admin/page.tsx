'use client'

import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { getReports } from '@/lib/actions/reports'
import { ReportsList } from '@/components/admin/ReportsList'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Report, ReportStatus } from '@/lib/types/database.types'

export default function AdminDashboardPage() {
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'all'>('pending')
  const queryClient = useQueryClient()

  // Fetch reports
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-reports', selectedStatus],
    queryFn: async () => {
      const result = await getReports({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        limit: 100,
      })

      if ('error' in result) {
        throw new Error(result.error)
      }

      return result.data
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  })

  const handleRefresh = () => {
    toast.promise(refetch(), {
      loading: 'Refreshing reports...',
      success: 'Reports refreshed',
      error: 'Failed to refresh',
    })
  }

  // Count reports by status
  const pendingCount = data?.filter((r) => r.status === 'pending').length || 0
  const reviewedCount = data?.filter((r) => r.status === 'reviewed').length || 0
  const actionedCount = data?.filter((r) => r.status === 'actioned').length || 0
  const dismissedCount = data?.filter((r) => r.status === 'dismissed').length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Reports Dashboard</h1>
          <p className="text-stone-600 mt-1">
            Review and moderate reported content
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleRefresh}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl text-amber-600">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Reviewed</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{reviewedCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Actioned</CardDescription>
            <CardTitle className="text-3xl text-red-600">{actionedCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Dismissed</CardDescription>
            <CardTitle className="text-3xl text-green-600">{dismissedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Reports List */}
      <Tabs value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as ReportStatus | 'all')}>
        <TabsList className="grid w-full grid-cols-5 max-w-2xl">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
          <TabsTrigger value="actioned">Actioned</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
            </div>
          ) : isError ? (
            <Card className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <p className="text-stone-600">Failed to load reports</p>
            </Card>
          ) : data && data.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-stone-500">No {selectedStatus === 'all' ? '' : selectedStatus} reports</p>
            </Card>
          ) : (
            <ReportsList reports={data || []} onUpdate={() => refetch()} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
