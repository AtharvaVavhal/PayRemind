'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { generateWhatsAppLink } from '@/lib/whatsapp'
import { generateReceipt } from '@/lib/receipt'
import type { Student, Payment, StudentWithPayment } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import SubscribeButton from '@/components/SubscribeButton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Props {
  students: Student[]
  payments: Payment[]
  isPro: boolean
  ownerEmail: string
}

export default function DashboardClient({ students, payments, isPro, ownerEmail }: Props) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const todayDate = new Date().getDate()

  const studentsWithPayments: StudentWithPayment[] = students.map((student) => ({
    ...student,
    payment: payments.find((p) => p.student_id === student.id),
  }))

  function displayStatus(swp: StudentWithPayment): 'paid' | 'overdue' | 'pending' {
    if (swp.payment?.status === 'paid') return 'paid'
    if (swp.payment?.status === 'pending' && todayDate > swp.due_day) return 'overdue'
    return 'pending'
  }

  const totalCollected = studentsWithPayments
    .filter((s) => s.payment?.status === 'paid')
    .reduce((sum, s) => sum + s.fee_amount, 0)

  const grandTotal = studentsWithPayments.reduce((sum, s) => sum + s.fee_amount, 0)

  async function handleReminder(swp: StudentWithPayment) {
    if (!swp.payment || loadingId) return
    const link = generateWhatsAppLink(swp.name, swp.phone, swp.fee_amount, swp.payment.id)
    window.open(link, '_blank', 'noopener,noreferrer')
    setLoadingId(swp.payment.id)
    await fetch(`/api/payments/${swp.payment.id}/reminder`, { method: 'PATCH' })
    setLoadingId(null)
    router.refresh()
  }

  async function handleMarkPaid(swp: StudentWithPayment) {
    if (!swp.payment || loadingId) return
    setLoadingId(swp.payment.id)
    await fetch(`/api/payments/${swp.payment.id}/paid`, { method: 'PATCH' })
    setLoadingId(null)
    router.refresh()
  }

  async function handleDownloadReceipt(swp: StudentWithPayment) {
    if (!swp.payment?.paid_at) return
    await generateReceipt({
      studentName: swp.name,
      phone: swp.phone,
      feeAmount: swp.fee_amount,
      month: swp.payment.month,
      paidAt: swp.payment.paid_at,
      ownerEmail,
    })
  }

  async function handleSendReceiptWhatsApp(swp: StudentWithPayment) {
    if (!swp.payment?.paid_at) return
    await generateReceipt({
      studentName: swp.name,
      phone: swp.phone,
      feeAmount: swp.fee_amount,
      month: swp.payment.month,
      paidAt: swp.payment.paid_at,
      ownerEmail,
    })
    const message = `Namaste! ${swp.name} ki fees ₹${swp.fee_amount} receive ho gayi. Receipt attached hai. Dhanyawad! - PayRemind`
    window.open(`https://wa.me/${swp.phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Summary card */}
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">This month</p>
            <p className="text-2xl font-bold mt-1">
              ₹{totalCollected.toLocaleString('en-IN')}{' '}
              <span className="text-base font-normal text-muted-foreground">
                collected / ₹{grandTotal.toLocaleString('en-IN')} total
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Upgrade banner */}
        {!isPro && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-blue-900">Upgrade to Pro</p>
                <p className="text-sm text-blue-700">Unlimited students, payment links &amp; more — ₹99/month</p>
              </div>
              <SubscribeButton />
            </CardContent>
          </Card>
        )}

        {/* Students table */}
        {studentsWithPayments.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="mb-2">No students yet.</p>
            <Link
              href="/dashboard/students"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              Add your first student.
            </Link>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Fee (₹)</TableHead>
                    <TableHead>Due Day</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reminder</TableHead>
                    <TableHead>Mark Paid</TableHead>
                    <TableHead>Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsWithPayments.map((swp) => {
                    const status = displayStatus(swp)
                    const isLoading = loadingId === swp.payment?.id
                    return (
                      <TableRow key={swp.id}>
                        <TableCell className="font-medium">{swp.name}</TableCell>
                        <TableCell>₹{swp.fee_amount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{swp.due_day}</TableCell>
                        <TableCell>
                          {status === 'paid' && (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              Paid
                            </Badge>
                          )}
                          {status === 'overdue' && (
                            <Badge variant="destructive">Overdue</Badge>
                          )}
                          {status === 'pending' && (
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {status !== 'paid' && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isLoading || !!loadingId}
                              onClick={() => handleReminder(swp)}
                            >
                              WhatsApp
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          {status !== 'paid' && (
                            <Button
                              size="sm"
                              disabled={isLoading || !!loadingId}
                              onClick={() => handleMarkPaid(swp)}
                            >
                              {isLoading ? '…' : 'Mark Paid'}
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          {status === 'paid' && swp.payment?.paid_at && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadReceipt(swp)}
                              >
                                Download PDF
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendReceiptWhatsApp(swp)}
                              >
                                Send WhatsApp
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
