import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent } from '@/components/ui/card'
import PaymentClientWrapper from './PaymentClientWrapper'

// Update the type signature to treat params as a Promise
export default async function PublicPaymentPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Await the params to extract the id
  const { id } = await params
  
  const supabase = await createServerSupabaseClient()
  
  // 1. Fetch payment and student info
  const { data: payment } = await supabase
    .from('payments')
    .select('*, students(*)')
    .eq('id', id)
    .single()

  if (!payment) return notFound()

  // Safely cast student data
  const student = payment.students as any 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardContent className="p-6">
          
          {/* 2. If already paid, show success UI */}
          {payment.status === 'paid' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                ✓
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Complete!</h1>
              <p className="text-gray-600">
                Thank you, {student.name}. Your fee for {payment.month} has been paid successfully.
              </p>
            </div>
          ) : (
            
            /* 3. If pending, show the payment details and your Razorpay button */
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Fee Payment</h1>
                <p className="text-gray-500 mt-1">PayRemind Secure Checkout</p>
              </div>

              <div className="bg-gray-100 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Student Name:</span>
                  <span className="font-medium">{student.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee Month:</span>
                  <span className="font-medium">{payment.month}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                  <span className="text-gray-900 font-bold">Amount Due:</span>
                  <span className="text-gray-900 font-bold text-lg">₹{student.fee_amount}</span>
                </div>
              </div>

              <PaymentClientWrapper 
                paymentId={payment.id} 
                studentName={student.name} 
                feeAmount={student.fee_amount} 
              />
            </div>
          )}
          
        </CardContent>
      </Card>
    </div>
  )
}