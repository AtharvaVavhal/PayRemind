'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { generateWhatsAppLink } from '@/lib/whatsapp'
import { generateReceipt } from '@/lib/receipt'
import { PaymentConfirmationTicket } from '@/components/ui/ticket-confirmation-card'
import type { Student, Payment, StudentWithPayment, Template } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import SubscribeButton from '@/components/SubscribeButton'
import ReminderQueue from '@/components/ReminderQueue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  const [confirmedPayment, setConfirmedPayment] = useState<{ swp: StudentWithPayment; paidAt: string } | null>(null)
  const [selectedBatch, setSelectedBatch] = useState('all')
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')

  useEffect(() => {
    fetch('/api/templates')
      .then((r) => r.json())
      .then((data: Template[]) => {
        setTemplates(data)
        const def = data.find((t) => t.is_default) ?? data[0]
        if (def) setSelectedTemplateId(def.id)
      })
      .catch(() => {})
  }, [])

  const todayDate = new Date().getDate()

  const allBatches = Array.from(new Set(students.map((s) => s.batch_name))).sort()
  const showBatchFilter = allBatches.length > 1

  const studentsWithPayments: StudentWithPayment[] = students
    .filter((s) => selectedBatch === 'all' || s.batch_name === selectedBatch)
    .map((student) => ({
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
    const tpl = templates.find((t) => t.id === selectedTemplateId)
    const link = generateWhatsAppLink(
      swp.name, swp.phone, swp.fee_amount, swp.payment.id,
      tpl?.message, swp.payment.month
    )
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
    setConfirmedPayment({ swp, paidAt: new Date().toISOString() })
  }

  function handleCloseConfirmation() {
    setConfirmedPayment(null)
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
      batchName: swp.batch_name,
      receiptNo: swp.payment.receipt_no ?? undefined,
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
      batchName: swp.batch_name,
      receiptNo: swp.payment.receipt_no ?? undefined,
    })
    const message = `Namaste! ${swp.name} ki fees ₹${swp.fee_amount} receive ho gayi. Receipt attached hai. Dhanyawad! - PayRemind`
    window.open(`https://wa.me/${swp.phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Payment confirmation overlay */}
      {confirmedPayment && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-black/60 backdrop-blur-sm p-6"
          onClick={handleCloseConfirmation}
        >
          <PaymentConfirmationTicket
            receiptNo={confirmedPayment.swp.payment!.receipt_no ?? ''}
            amount={confirmedPayment.swp.fee_amount}
            date={new Date(confirmedPayment.paidAt)}
            studentName={confirmedPayment.swp.name}
            phone={confirmedPayment.swp.phone}
            barcodeValue={confirmedPayment.swp.payment!.receipt_no?.replace('REC-', '') ?? confirmedPayment.swp.payment!.id.slice(0, 14)}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={handleCloseConfirmation}
            className="text-white/70 hover:text-white text-sm transition-colors"
          >
            Tap anywhere to close
          </button>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Summary card */}
        <Card>
          <CardContent className="py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                This month{selectedBatch !== 'all' ? ` · ${selectedBatch}` : ''}
              </p>
              <p className="text-2xl font-bold mt-1">
                ₹{totalCollected.toLocaleString('en-IN')}{' '}
                <span className="text-base font-normal text-muted-foreground">
                  collected / ₹{grandTotal.toLocaleString('en-IN')} total
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              {showBatchFilter && (
                <Select value={selectedBatch} onValueChange={(v) => setSelectedBatch(v ?? 'all')}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    {allBatches.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {templates.length > 1 && (
                <Select value={selectedTemplateId} onValueChange={(v) => setSelectedTemplateId(v ?? '')}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Template">
                      {templates.find((t) => t.id === selectedTemplateId)?.name ?? 'Template'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
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

        {/* Reminder queue */}
        <ReminderQueue students={students} payments={payments} selectedBatch={selectedBatch} />

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
