export function generateWhatsAppLink(
  name: string,
  phone: string,
  fee_amount: number
): string {
  const message = `Namaste! ${name} ki is mahine ki fees ₹${fee_amount} abhi pending hai. Kripya jald se jald payment kar dijiye. Dhanyawad! - PayRemind`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
