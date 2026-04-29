function monthName(yearMonth: string): string {
  const [year, mon] = yearMonth.split('-')
  return new Date(Number(year), Number(mon) - 1, 1).toLocaleDateString('en-GB', { month: 'long' })
}

export function generateWhatsAppLink(
  name: string,
  phone: string,
  fee_amount: number,
  payment_id: string,
  template?: string,
  month?: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const paymentLink = `${baseUrl}/pay/${payment_id}`

  let message: string
  if (template) {
    message = template
      .replace(/{name}/g, name)
      .replace(/{fee}/g, String(fee_amount))
      .replace(/{month}/g, month ? monthName(month) : '')
    message += `\n\n${paymentLink}`
  } else {
    message = `Namaste! ${name} ki is mahine ki fees ₹${fee_amount} abhi pending hai. Kripya is link par click karke payment kar dijiye:\n\n${paymentLink}\n\nDhanyawad! - PayRemind`
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
