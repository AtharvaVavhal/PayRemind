'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react'
import type { Template } from '@/types'
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

const DEFAULT_MESSAGE =
  'Namaste! {name} ki is mahine ki fees ₹{fee} abhi pending hai. Kripya jald se jald payment kar dijiye. Dhanyawad! - PayRemind'

interface FormState {
  name: string
  message: string
  is_default: boolean
}

const EMPTY_FORM: FormState = { name: '', message: '', is_default: false }

export default function TemplateManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Template | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadTemplates() {
    const res = await fetch('/api/templates')
    if (!res.ok) return
    const data: Template[] = await res.json()
    setTemplates(data)
    return data
  }

  useEffect(() => {
    loadTemplates().then((data) => {
      if (data && data.length === 0) {
        fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Default', message: DEFAULT_MESSAGE, is_default: true }),
        }).then(() => loadTemplates())
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function openAdd() {
    setForm(EMPTY_FORM)
    setError('')
    setEditTarget(null)
    setDialogOpen(true)
  }

  function openEdit(t: Template) {
    setForm({ name: t.name, message: t.message, is_default: t.is_default })
    setError('')
    setEditTarget(t)
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const isEdit = !!editTarget
    const res = await fetch(
      isEdit ? `/api/templates/${editTarget.id}` : '/api/templates',
      {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }
    )

    if (!res.ok) {
      setError('Something went wrong. Please try again.')
    } else {
      setDialogOpen(false)
      await loadTemplates()
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/templates/${id}`, { method: 'DELETE' })
    await loadTemplates()
  }

  return (
    <Card>
      <CardContent className="p-0">
        <button
          onClick={() => setIsOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/40 transition-colors rounded-lg"
        >
          <span className="font-medium text-sm">📝 Reminder Templates</span>
          {isOpen
            ? <ChevronUp className="size-4 text-muted-foreground" />
            : <ChevronDown className="size-4 text-muted-foreground" />}
        </button>

        {isOpen && (
          <div className="border-t border-border px-4 py-4 flex flex-col gap-3">
            {templates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No templates yet.</p>
            ) : (
              templates.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start justify-between gap-3 rounded-md border border-border p-3"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{t.name}</span>
                      {t.is_default && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t.message}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon-sm" variant="ghost" onClick={() => openEdit(t)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      onClick={() => handleDelete(t.id)}
                      disabled={templates.length === 1}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}

            <Button size="sm" variant="outline" className="self-start" onClick={openAdd}>
              Add Template
            </Button>
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) setDialogOpen(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Template' : 'Add Template'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-name">Template Name</Label>
              <Input
                id="t-name"
                placeholder="e.g. Hindi Reminder, Marathi Reminder"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-msg">Message</Label>
              <p className="text-xs text-muted-foreground">
                Use <code className="bg-muted px-1 rounded">{'{name}'}</code> for student name,{' '}
                <code className="bg-muted px-1 rounded">{'{fee}'}</code> for fee amount,{' '}
                <code className="bg-muted px-1 rounded">{'{month}'}</code> for month name.
                The payment link is appended automatically.
              </p>
              <textarea
                id="t-msg"
                rows={5}
                placeholder={DEFAULT_MESSAGE}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                required
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
                className="rounded border-input"
              />
              <span className="text-sm">Set as default template</span>
            </label>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving…' : editTarget ? 'Save Changes' : 'Add Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
