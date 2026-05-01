export interface ReceiptData {
  studentName: string
  phone: string
  feeAmount: number
  month: string
  paidAt: string
  ownerEmail: string
  batchName?: string
  receiptNo?: string
}

function formatMonth(month: string): string {
  const [year, mon] = month.split('-')
  return new Date(Number(year), Number(mon) - 1, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildReceiptNo(receiptNo?: string): string {
  return receiptNo ?? `REC-${Math.floor(10000 + Math.random() * 90000)}`
}

async function loadImageDataUrl(url: string, pxW: number, pxH: number): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = pxW * 2
      canvas.height = pxH * 2
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, pxW * 2, pxH * 2)
      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = objectUrl
  })
}

// Palette
const NAVY:       [number, number, number] = [15,  38,  68]
const INDIGO:     [number, number, number] = [79,  70,  229]
const INDIGO_200: [number, number, number] = [199, 210, 254]
const GREEN:      [number, number, number] = [22,  163, 74]
const WHITE:      [number, number, number] = [255, 255, 255]
const DARK:       [number, number, number] = [17,  24,  39]
const GRAY:       [number, number, number] = [107, 114, 128]
const GRAY_300:   [number, number, number] = [203, 213, 225]
const GRAY_LIGHT: [number, number, number] = [229, 231, 235]
const GRAY_BG:    [number, number, number] = [249, 250, 251]

// Institution logo: 1549×666px → aspect ~2.326:1, rendered at 65×28mm
const INST_W = 65
const INST_H = 28

export async function generateReceipt(data: ReceiptData): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const W   = 210
  const ML  = 18
  const MR  = 192
  const CW  = MR - ML   // 174mm
  const receiptNo = buildReceiptNo(data.receiptNo)

  // ── HEADER: institution logo (left) + RECEIPT title (right) ──────────────────
  try {
    const png = await loadImageDataUrl('/institution-logo.png', INST_W * 5, INST_H * 5)
    doc.addImage(png, 'PNG', ML, 6, INST_W, INST_H)
  } catch {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...NAVY)
    doc.text('VISHWAKARMA INSTITUTE OF TECHNOLOGY', ML, 18)
    doc.setFontSize(9)
    doc.text('Pune', ML, 26)
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(...NAVY)
  doc.text('RECEIPT', MR, 18, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text(receiptNo, MR, 27, { align: 'right' })
  doc.text(formatDate(data.paidAt), MR, 35, { align: 'right' })

  // ── INDIGO ACCENT STRIPE ──────────────────────────────────────────────────────
  doc.setFillColor(...INDIGO)
  doc.rect(0, 41, W, 3, 'F')

  // ── INFO SECTION ─────────────────────────────────────────────────────────────
  const infoY = 58

  // Left: BILLED TO
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  doc.text('BILLED TO', ML, infoY)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...DARK)
  doc.text(data.studentName, ML, infoY + 9)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...GRAY)
  doc.text(data.phone, ML, infoY + 17)
  if (data.batchName) {
    doc.text(`Batch: ${data.batchName}`, ML, infoY + 25)
  }

  // Right: PAYMENT DATE + PROCESSED BY
  const col2 = 118

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  doc.text('PAYMENT DATE', col2, infoY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...DARK)
  doc.text(formatDate(data.paidAt), col2, infoY + 9)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  doc.text('PROCESSED BY', col2, infoY + 22)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...DARK)
  const emailDisplay = data.ownerEmail.length > 30
    ? data.ownerEmail.slice(0, 27) + '...'
    : data.ownerEmail
  doc.text(emailDisplay, col2, infoY + 31)

  // ── SECTION DIVIDER ───────────────────────────────────────────────────────────
  doc.setDrawColor(...GRAY_LIGHT)
  doc.setLineWidth(0.3)
  doc.line(ML, 98, MR, 98)

  // ── ITEMS TABLE ───────────────────────────────────────────────────────────────
  const tY  = 104
  const rH  = 11
  const cA  = ML + 100
  const cB  = cA + 40

  const tx1 = ML + 4
  const tx2 = cA + 20
  const tx3 = MR - 4

  // Header row
  doc.setFillColor(...GRAY_BG)
  doc.setDrawColor(...GRAY_LIGHT)
  doc.setLineWidth(0.25)
  doc.rect(ML, tY, CW, rH, 'FD')
  doc.line(cA, tY, cA, tY + rH)
  doc.line(cB, tY, cB, tY + rH)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...GRAY)
  doc.text('DESCRIPTION', tx1, tY + rH - 3.5)
  doc.text('PERIOD',      tx2, tY + rH - 3.5, { align: 'center' })
  doc.text('AMOUNT',      tx3, tY + rH - 3.5, { align: 'right' })

  // Data row
  const dY = tY + rH
  doc.setFillColor(...WHITE)
  doc.setDrawColor(...GRAY_LIGHT)
  doc.rect(ML, dY, CW, rH, 'FD')
  doc.line(cA, dY, cA, dY + rH)
  doc.line(cB, dY, cB, dY + rH)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...DARK)
  doc.text('Coaching Class Fee',                              tx1, dY + rH - 3.5)
  doc.text(formatMonth(data.month),                          tx2, dY + rH - 3.5, { align: 'center' })
  doc.text(`Rs. ${data.feeAmount.toLocaleString('en-IN')}`, tx3, dY + rH - 3.5, { align: 'right' })

  // ── TOTAL ROW ─────────────────────────────────────────────────────────────────
  const totY = dY + rH + 6

  doc.setFillColor(...INDIGO)
  doc.rect(ML, totY, CW, 16, 'F')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...INDIGO_200)
  doc.text('TOTAL PAID', ML + 4, totY + 5.5)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...WHITE)
  doc.text(`Rs. ${data.feeAmount.toLocaleString('en-IN')}`, MR - 4, totY + 12, { align: 'right' })

  // ── PAID STAMP ────────────────────────────────────────────────────────────────
  const sY = totY + 28
  const sW = 52
  const sH = 17
  const sX = (W - sW) / 2

  doc.setFillColor(...GREEN)
  doc.roundedRect(sX, sY, sW, sH, 3, 3, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...WHITE)
  doc.text('PAID', W / 2, sY + sH - 4, { align: 'center' })

  // ── FOOTER ───────────────────────────────────────────────────────────────────
  const fY = 257

  doc.setDrawColor(...GRAY_LIGHT)
  doc.setLineWidth(0.3)
  doc.line(ML, fY, MR, fY)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...INDIGO)
  doc.text('Thank you for your payment!', W / 2, fY + 8, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  doc.text('Generated by PayRemind  •  payremind.in', W / 2, fY + 15, { align: 'center' })
  doc.text(`Generated on: ${formatDateTime(new Date().toISOString())}`, W / 2, fY + 21, { align: 'center' })

  doc.setFontSize(7)
  doc.setTextColor(...GRAY_300)
  doc.text(
    'This is a computer-generated receipt and does not require a physical signature.',
    W / 2, fY + 27, { align: 'center' },
  )
  doc.text(receiptNo, ML, fY + 27)

  doc.save(`Receipt_${data.studentName.replace(/\s+/g, '_')}_${data.month}.pdf`)
}
