'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, Users } from 'lucide-react'
import type { Staff } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface StaffResponse {
  isOwner: boolean
  ownerEmail: string
  staff: Staff[]
}

export default function StaffManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [staffData, setStaffData] = useState<StaffResponse | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function fetchStaff() {
    const res = await fetch('/api/staff')
    if (res.ok) setStaffData(await res.json())
  }

  async function toggle() {
    const next = !isOpen
    setIsOpen(next)
    if (next && !staffData) await fetchStaff()
  }

  function openDialog() {
    setName('')
    setEmail('')
    setError('')
    setDialogOpen(true)
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    })

    const json = await res.json()
    setSubmitting(false)

    if (!res.ok) {
      setError(json.error ?? 'Something went wrong')
      return
    }

    setDialogOpen(false)
    await fetchStaff()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/staff/${id}`, { method: 'DELETE' })
    await fetchStaff()
  }

  return (
    <Card>
      <CardContent className="p-0">
        <button
          onClick={toggle}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/40 transition-colors rounded-lg"
        >
          <span className="font-medium text-sm flex items-center gap-2">
            <Users className="size-4" />
            Staff Members
          </span>
          {isOpen
            ? <ChevronUp className="size-4 text-muted-foreground" />
            : <ChevronDown className="size-4 text-muted-foreground" />}
        </button>

        {isOpen && (
          <div className="border-t border-border px-4 py-4 flex flex-col gap-2">

            {/* Owner row */}
            {staffData && (
              <div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2.5">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{staffData.ownerEmail}</span>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs shrink-0">
                      Owner
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground truncate">{staffData.ownerEmail}</span>
                </div>
              </div>
            )}

            {/* Staff rows */}
            {staffData?.staff.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2.5"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{member.name}</span>
                    <Badge variant="outline" className="text-xs shrink-0 text-muted-foreground">
                      Staff
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground truncate">{member.email}</span>
                </div>
                <Button
                  size="icon-sm"
                  variant="destructive"
                  className="shrink-0"
                  onClick={() => handleDelete(member.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}

            {staffData?.staff.length === 0 && (
              <p className="text-sm text-muted-foreground py-1">No staff members yet.</p>
            )}

            <Button size="sm" variant="outline" className="self-start mt-1" onClick={openDialog}>
              <Plus className="size-3.5 mr-1.5" />
              Invite Staff
            </Button>
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) setDialogOpen(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Staff Member</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleInvite} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staff-name">Staff Name</Label>
              <Input
                id="staff-name"
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staff-email">Staff Email</Label>
              <Input
                id="staff-email"
                type="email"
                placeholder="e.g. priya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Staff member must sign up at payremind.in first before being added.
            </p>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Adding…' : 'Add Staff'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
