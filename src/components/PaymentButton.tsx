'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  paymentId: string
  studentName: string
  feeAmount: number
  razorpayKey: string
  onSuccess: () => void
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true)
    const script = document.createElement('script')
    script.id = 'razorpay-script'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function PaymentButton({
  paymentId,
  studentName,
  feeAmount,
  razorpayKey,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false)

  async function handlePayment() {
    setLoading(true)

    const loaded = await loadRazorpayScript()
    if (!loaded) {
      alert('Razorpay failed to load. Check your internet connection.')
      setLoading(false)
      return
    }

    // Create order on server
    const orderRes = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id: paymentId }),
    })

    if (!orderRes.ok) {
      alert('Failed to create payment order.')
      setLoading(false)
      return
    }

    const { order_id, amount, currency } = await orderRes.json()

    const options = {
      key: razorpayKey,
      amount,
      currency,
      name: 'PayRemind',
      description: `Fee payment for ${studentName}`,
      order_id,
      handler: async (response: {
        razorpay_order_id: string
        razorpay_payment_id: string
        razorpay_signature: string
      }) => {
        // Verify on server
        const verifyRes = await fetch('/api/razorpay/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...response,
            payment_id: paymentId,
          }),
        })

        if (verifyRes.ok) {
          onSuccess()
        } else {
          alert('Payment verification failed. Contact support.')
        }
      },
      prefill: { name: studentName },
      theme: { color: '#16a34a' },
      modal: {
        ondismiss: () => setLoading(false),
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', () => {
      alert('Payment failed. Please try again.')
      setLoading(false)
    })
    rzp.open()
  }

  return (
    <Button size="sm" variant="outline" disabled={loading} onClick={handlePayment}>
      {loading ? '…' : 'Collect Online'}
    </Button>
  )
}