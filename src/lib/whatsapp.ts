export function generateWhatsAppLink(
  name: string,
  phone: string,
  fee_amount: number,
  payment_id: string
): string {
  // Update this to your real domain when deploying (e.g., https://payremind.com)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const paymentLink = `${baseUrl}/pay/${payment_id}`

  const message = `Namaste! ${name} ki is mahine ki fees ₹${fee_amount} abhi pending hai. Kripya is link par click karke payment kar dijiye:\n\n${paymentLink}\n\nDhanyawad! - PayRemind`
  
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}