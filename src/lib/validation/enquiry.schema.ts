import { z } from 'zod'

export const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/

export const EnquiryInputSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  phone: z.string().trim().regex(phoneRegex, 'Please enter a valid phone number (e.g. +91 98765 43210)'),
  email: z.string().trim().email('Please enter a valid email address').optional().or(z.literal('')),
  packageId: z.string().trim().optional().or(z.literal('')),
  hotelId: z.string().trim().optional().or(z.literal('')),
  vehicleId: z.string().trim().optional().or(z.literal('')),
  travelDate: z.string().trim().optional().or(z.literal('')),
  groupSize: z.coerce.number().int().min(1, 'Group size must be at least 1').max(100, 'Group size cannot exceed 100').optional().or(z.literal('')),
  tripType: z.string().trim().optional().or(z.literal('')),
  message: z.string().trim().max(2000, 'Message cannot exceed 2000 characters').optional().or(z.literal('')),
  source: z.string().trim().max(100).optional().default('website'),
  // Honeypot field for anti-spam (must remain empty for real human submissions)
  _hp: z.string().max(0, 'Spam detected').optional().default(''),
  idempotencyKey: z.string().trim().max(128).optional(),
})

export type EnquiryInput = z.infer<typeof EnquiryInputSchema>
