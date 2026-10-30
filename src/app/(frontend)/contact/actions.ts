'use server'

import { headers } from 'next/headers'

import { type EnquiryState, processEnquiry } from '@/lib/enquiry'

export async function submitEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const h = await headers()
  const clientKey = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  return processEnquiry(formData, clientKey)
}
