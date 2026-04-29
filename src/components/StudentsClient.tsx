'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import type { Student } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  userId: string
}

type DialogMode = 'add' | 'edit' | null

interface FormState {
  name: string
  phone: string
  fee_amount: string
  due_day: string
}

const EMPTY_FORM: FormState = { name: '', phone: '', fee_amount: '', due_day: '1' }
const DUE_DAYS = Array.from({ length: 28 }, (_, i) => String(i + 1))

export default function StudentsClient({ students, userId }: Props) {
  const router = useRouter()

  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [editTarget, setEditTarget] = useState<Student | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function field(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  function openAdd() {
    setForm(EMPTY_FORM)
    setError('')
    setEditTarget(null)
    setDialogMode('add')
  }

  function openEdit(student: Student) {
    setForm({
      name: student.name,
      phone: student.phone.slice(2),
      fee_amount: String(student.fee_amount),
      due_day: String(student.due_day),
    })
    setError('')
    setEditTarget(student)
    setDialogMode('edit')
  }

  function closeForm() {
    setDialogMode(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const body = {
      name: form.name.trim(),
      phone: '91' + form.phone.trim(),
      fee_amount: Number(form.fee_amount),
      due_day: Number(form.due_day),
      owner_id: userId,
    }

    const isEdit = dialogMode === 'edit' && editTarget
    const res = await fetch(
      isEdit ? `/api/students/${editTarget.id}` : '/api/students',
      {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )

    if (!res.ok) {
      setError('Something went wrong. Please try again.')
    } else {
      setDialogMode(null)
      router.refresh()
    }

    setLoading(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setLoading(true)
    await fetch(`/api/students/${deleteTarget.id}`, { method: 'DELETE' })
    setLoading(false)
    setDeleteTarget(null)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <h1 className="text-base font-semibold">
              Students ({students.length})
            </h1>
          </div>
          <Button size="sm" onClick={openAdd}>
            <Plus />
            Add Student
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {students.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="mb-3">No students yet. Add your first student.</p>
            <Button variant="outline" size="sm" onClick={openAdd}>
              <Plus />
              Add Student
            </Button>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Fee (₹)</TableHead>
                    <TableHead>Due Day</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        +{student.phone}
                      </TableCell>
                      <TableCell>
                        ₹{student.fee_amount.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>{student.due_day}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => openEdit(student)}
                            aria-label={`Edit ${student.name}`}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="destructive"
                            onClick={() => setDeleteTarget(student)}
                            aria-label={`Delete ${student.name}`}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Add / Edit dialog */}
      <Dialog
        open={dialogMode !== null}
        onOpenChange={(open) => { if (!open) closeForm() }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'edit' ? 'Edit Student' : 'Add Student'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-name">Name</Label>
              <Input
                id="s-name"
                type="text"
                placeholder="Student name"
                value={form.name}
                onChange={field('name')}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-phone">WhatsApp Number</Label>
              <div className="flex">
                <span className="flex h-8 shrink-0 items-center rounded-l-lg border border-r-0 border-input bg-muted px-2.5 text-sm text-muted-foreground select-none">
                  +91
                </span>
                <Input
                  id="s-phone"
                  type="number"
                  placeholder="98XXXXXXXX"
                  value={form.phone}
                  onChange={field('phone')}
                  className="rounded-l-none"
                  min={1000000000}
                  max={9999999999}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-fee">Monthly Fee (₹)</Label>
              <Input
                id="s-fee"
                type="number"
                placeholder="e.g. 1500"
                value={form.fee_amount}
                onChange={field('fee_amount')}
                min={100}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Due Day</Label>
              <Select
                value={form.due_day}
                onValueChange={(val) => {
                  if (val !== null) setForm((f) => ({ ...f, due_day: String(val) }))
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DUE_DAYS.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button variant="outline" type="button" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? 'Saving…'
                  : dialogMode === 'edit'
                    ? 'Save Changes'
                    : 'Add Student'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Delete {deleteTarget?.name}? This will remove all their payment history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button variant="destructive" disabled={loading} onClick={handleDelete}>
              {loading ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
