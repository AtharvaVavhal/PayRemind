'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

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

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false)

  const handleSubscription = async () => {
    setLoading(true)

    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        alert('Razorpay failed to load. Check your internet connection.')
        setLoading(false)
        return
      }

      // 1. Create Subscription on the backend
      const res = await fetch('/api/razorpay/subscribe', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to initiate subscription')
      
      const { subscription_id } = await res.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscription_id,
        name: 'PayRemind Pro',
        description: 'Monthly Subscription to PayRemind',
        modal: {
          ondismiss: function() {
            setLoading(false)
          }
        },
        handler: async function (response: any) {
          // 2. Verify the subscription and update user profile
          const verifyRes = await fetch('/api/razorpay/verify-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscription_id: response.razorpay_subscription_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          })

          if (verifyRes.ok) {
            alert('Welcome to Pro! Your account has been upgraded.')
            window.location.reload() 
          } else {
            alert('Payment received, but account upgrade failed. Please contact support.')
          }
        },
        theme: { color: '#2563eb' } 
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Subscription Error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleSubscription} 
      disabled={loading} 
      className="bg-blue-600 hover:bg-blue-700 font-semibold px-6"
    >
      {loading ? 'Processing...' : 'Upgrade to Pro (₹99/mo)'}
    </Button>
  )
}