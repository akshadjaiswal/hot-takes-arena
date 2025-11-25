'use client'

import { useState } from 'react'
import { ReportCard } from './ReportCard'
import type { Report } from '@/lib/types/database.types'

interface ReportsListProps {
  reports: Report[]
  onUpdate: () => void
}

export function ReportsList({ reports, onUpdate }: ReportsListProps) {
  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} onUpdate={onUpdate} />
      ))}
    </div>
  )
}
