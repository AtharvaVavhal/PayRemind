'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateWhatsAppLink } from '@/lib/whatsapp'
import type { Student, Payment, StudentWithPayment } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  students: Student[]
  payments: Payment[]
  selectedBatch: string
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function dueDateStr(month: string, dueDay: number): string {
  return `${month}-${String(dueDay).padStart(2, '0')}`
}

function daysOverdue(month: string, dueDay: number): number {
  const due = new Date(dueDateStr(month, dueDay))
  const today = new Date(todayStr())
  return Math.floor((today.getTime() - due.getTime()) / 86400000)
}

function isReminderDue(swp: StudentWithPayment): boolean {
  const { payment } = swp
  if (!payment || payment.status === 'paid') return false

  const today = todayStr()
  const { next_reminder_due, reminder_count } = payment

  if (next_reminder_due !== null) return next_reminder_due <= today

  // next_reminder_due is null: show only if overdue and fewer than 3 reminders sent
  if ((reminder_count ?? 0) >= 3) return false
  return dueDateStr(payment.month, swp.due_day) <= today
}

export default function ReminderQueue({ students, payments, selectedBatch }: Props) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const studentsWithPayments: StudentWithPayment[] = students
    .filter((s) => selectedBatch === 'all' || s.batch_name === selectedBatch)
    .map((s) => ({
      ...s,
      payment: payments.find((p) => p.student_id === s.id),
    }))

  const due = studentsWithPayments.filter(isReminderDue)

  if (due.length === 0) return null

  async function recordReminder(paymentId: string) {
    setLoadingId(paymentId)
    await fetch(`/api/payments/${paymentId}/reminder`, { method: 'PATCH' })
    setLoadingId(null)
    router.refresh()
  }

  async function handleSend(swp: StudentWithPayment) {
    if (!swp.payment || loadingId) return
    const link = generateWhatsAppLink(swp.name, swp.phone, swp.fee_amount, swp.payment.id)
    window.open(link, '_blank', 'noopener,noreferrer')
    await recordReminder(swp.payment.id)
  }

  async function handleDismiss(swp: StudentWithPayment) {
    if (!swp.payment || loadingId) return
    await recordReminder(swp.payment.id)
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="py-4 flex flex-col gap-3">
        <p className="font-semibold text-orange-900">
          🔔 {due.length} reminder{due.length > 1 ? 's' : ''} due today
        </p>
        {due.map((swp) => {
          if (!swp.payment) return null
          const overdue = daysOverdue(swp.payment.month, swp.due_day)
          const isLoading = loadingId === swp.payment.id
          return (
            <div
              key={swp.id}
              className="flex items-center justify-between gap-4 rounded-md bg-white border border-orange-100 px-4 py-3"
            >
              <div>
                <p className="font-medium text-sm">{swp.name}</p>
                <p className="text-xs text-muted-foreground">
                  ₹{swp.fee_amount.toLocaleString('en-IN')} •{' '}
                  {overdue > 0 ? `${overdue} day${overdue > 1 ? 's' : ''} overdue` : 'due today'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  disabled={isLoading || !!loadingId}
                  onClick={() => handleSend(swp)}
                >
                  Send Reminder
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isLoading || !!loadingId}
                  onClick={() => handleDismiss(swp)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
