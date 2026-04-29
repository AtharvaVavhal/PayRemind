export interface Student {
  id: string
  owner_id: string
  name: string
  phone: string
  fee_amount: number
  due_day: number
  created_at: string
}

export interface Payment {
  id: string
  student_id: string
  month: string
  status: 'pending' | 'paid'
  paid_at: string | null
  reminder_sent_at: string | null
}

export type StudentWithPayment = Student & { payment?: Payment }
