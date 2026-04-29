'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ParsedRow {
  name: string
  phone: string
  fee_amount: string
  due_day: string
  batch_name: string
  error?: string
}

interface ImportResult {
  imported: number
  skipped: number
  errors: { row: number; reason: string }[]
}

// RFC-4180 compliant CSV parser that handles quoted fields
function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')

  for (const line of lines) {
    if (!line.trim()) continue
    const fields: string[] = []
    let i = 0
    while (i < line.length) {
      if (line[i] === '"') {
        i++
        let field = ''
        while (i < line.length) {
          if (line[i] === '"' && line[i + 1] === '"') { field += '"'; i += 2 }
          else if (line[i] === '"') { i++; break }
          else { field += line[i++] }
        }
        fields.push(field)
        if (line[i] === ',') i++
      } else {
        const end = line.indexOf(',', i)
        if (end === -1) { fields.push(line.slice(i).trim()); i = line.length }
        else { fields.push(line.slice(i, end).trim()); i = end + 1 }
      }
    }
    rows.push(fields)
  }
  return rows
}

function validateParsedRow(row: ParsedRow): string | null {
  if (!row.name.trim()) return 'Name is required'
  const phone = row.phone.trim().replace(/\D/g, '')
  if (!/^\d{10}$/.test(phone)) return 'Phone must be 10 digits'
  const fee = Number(row.fee_amount)
  if (isNaN(fee) || fee < 100) return 'Fee must be at least ₹100'
  const day = Number(row.due_day)
  if (!Number.isInteger(day) || day < 1 || day > 28) return 'Due day must be 1–28'
  return null
}

function downloadTemplate() {
  const header = 'name,phone,fee_amount,due_day,batch_name'
  const rows = [
    'Rahul Sharma,9800000001,1500,5,Morning Batch',
    'Priya Patel,9800000002,1200,7,Evening Batch',
  ]
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'payremind_students_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function CSVImport() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setResult(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const parsed = parseCSV(text)
      if (parsed.length < 2) { setRows([]); return }

      const header = parsed[0].map((h) => h.toLowerCase().trim())
      const nameIdx = header.indexOf('name')
      const phoneIdx = header.indexOf('phone')
      const feeIdx = header.indexOf('fee_amount')
      const dayIdx = header.indexOf('due_day')
      const batchIdx = header.indexOf('batch_name')

      if (nameIdx === -1 || phoneIdx === -1 || feeIdx === -1 || dayIdx === -1) {
        setRows([{ name: '', phone: '', fee_amount: '', due_day: '', batch_name: '', error: 'Missing required headers: name, phone, fee_amount, due_day' }])
        return
      }

      const dataRows = parsed.slice(1).map((cols) => {
        const row: ParsedRow = {
          name: cols[nameIdx] ?? '',
          phone: cols[phoneIdx] ?? '',
          fee_amount: cols[feeIdx] ?? '',
          due_day: cols[dayIdx] ?? '',
          batch_name: batchIdx !== -1 ? (cols[batchIdx] ?? '') : '',
        }
        row.error = validateParsedRow(row) ?? undefined
        return row
      }).filter((r) => r.name || r.phone || r.fee_amount)

      setRows(dataRows)
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    const valid = rows.filter((r) => !r.error)
    if (valid.length === 0) return
    setLoading(true)
    setResult(null)

    const res = await fetch('/api/students/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        students: valid.map((r) => ({
          name: r.name.trim(),
          phone: r.phone.trim().replace(/\D/g, ''),
          fee_amount: Number(r.fee_amount),
          due_day: Number(r.due_day),
          batch_name: r.batch_name.trim() || 'Default',
        })),
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setResult({ imported: 0, skipped: valid.length, errors: [{ row: 0, reason: data.error }] })
      return
    }

    setResult(data)
    if (data.imported > 0) {
      setRows([])
      setFileName('')
      if (fileRef.current) fileRef.current.value = ''
      router.refresh()
    }
  }

  const validCount = rows.filter((r) => !r.error).length
  const invalidCount = rows.filter((r) => !!r.error).length
  const preview = rows.slice(0, 5)

  return (
    <Card>
      <CardContent className="p-0">
        <button
          onClick={() => setIsOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/40 transition-colors rounded-lg"
        >
          <span className="font-medium text-sm">📥 Import Students</span>
          {isOpen
            ? <ChevronUp className="size-4 text-muted-foreground" />
            : <ChevronDown className="size-4 text-muted-foreground" />}
        </button>

        {isOpen && (
          <div className="border-t border-border px-4 py-4 flex flex-col gap-4">
            {/* Step 1 */}
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Step 1 — Download template</p>
              <p className="text-xs text-muted-foreground">Fill it in with your students&apos; details and save as CSV.</p>
              <Button size="sm" variant="outline" className="self-start mt-1" onClick={downloadTemplate}>
                Download CSV Template
              </Button>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Step 2 — Upload your CSV</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                onChange={handleFile}
                className="text-sm text-muted-foreground file:mr-3 file:py-1 file:px-3 file:rounded-md file:border file:border-input file:bg-background file:text-sm file:font-medium file:text-foreground hover:file:bg-muted cursor-pointer"
              />
            </div>

            {/* Step 3 — Preview */}
            {rows.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">
                  Step 3 — Preview
                  <span className="ml-2 font-normal text-muted-foreground text-xs">
                    {validCount > 0 && <span className="text-green-600">{validCount} ready</span>}
                    {validCount > 0 && invalidCount > 0 && ' · '}
                    {invalidCount > 0 && <span className="text-red-600">{invalidCount} invalid</span>}
                    {rows.length > 5 && ` · showing first 5 of ${rows.length}`}
                  </span>
                </p>
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-2 py-1.5 font-medium">Name</th>
                        <th className="text-left px-2 py-1.5 font-medium">Phone</th>
                        <th className="text-left px-2 py-1.5 font-medium">Fee</th>
                        <th className="text-left px-2 py-1.5 font-medium">Due Day</th>
                        <th className="text-left px-2 py-1.5 font-medium">Batch</th>
                        <th className="text-left px-2 py-1.5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr
                          key={i}
                          className={row.error ? 'bg-red-50' : undefined}
                        >
                          <td className="px-2 py-1.5 border-t border-border">{row.name || '—'}</td>
                          <td className="px-2 py-1.5 border-t border-border">{row.phone || '—'}</td>
                          <td className="px-2 py-1.5 border-t border-border">{row.fee_amount || '—'}</td>
                          <td className="px-2 py-1.5 border-t border-border">{row.due_day || '—'}</td>
                          <td className="px-2 py-1.5 border-t border-border">{row.batch_name || 'Default'}</td>
                          <td className="px-2 py-1.5 border-t border-border">
                            {row.error
                              ? <span className="text-red-600">{row.error}</span>
                              : <span className="text-green-600">✓ Valid</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Step 4 — Import */}
            {validCount > 0 && (
              <Button
                size="sm"
                className="self-start"
                disabled={loading}
                onClick={handleImport}
              >
                {loading ? 'Importing…' : `Import ${validCount} Student${validCount > 1 ? 's' : ''}`}
              </Button>
            )}

            {/* Result */}
            {result && (
              <div className="rounded-md border border-border px-3 py-2 text-sm flex flex-col gap-1">
                {result.imported > 0 && (
                  <p className="text-green-700">✅ {result.imported} student{result.imported > 1 ? 's' : ''} imported</p>
                )}
                {result.skipped > 0 && (
                  <p className="text-yellow-700">⚠️ {result.skipped} row{result.skipped > 1 ? 's' : ''} skipped</p>
                )}
                {result.errors.map((e, i) => (
                  <p key={i} className="text-muted-foreground text-xs">
                    {e.row > 0 ? `Row ${e.row}: ` : ''}{e.reason}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
