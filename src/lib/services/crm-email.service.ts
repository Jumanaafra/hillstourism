import 'server-only'
import type { Enquiry, EnquiryEmailRecord, EnquiryTimelineEvent } from '../../types/domain'
import { updateEnquiry } from '../repositories/enquiries.repo'
import { createAuditLog } from '../repositories/audit.repo'
import { checkRateLimit } from '../security/rateLimit'

export interface CrmEmailTemplate {
  key: string
  name: string
  defaultSubject: string
  defaultMessage: string
}

export const CRM_EMAIL_TEMPLATES: Record<string, CrmEmailTemplate> = {
  booking_confirmation: {
    key: 'booking_confirmation',
    name: 'Booking Confirmation',
    defaultSubject: 'Booking Confirmed! Your Mountain Journey Awaits [{{enquiry_id}}]',
    defaultMessage: `Dear {{customer_name}},

We are thrilled to confirm your upcoming mountain getaway with Hills Tourism!

Booking Summary:
• Package: {{package}}
• Accommodation: {{hotel}}
• Dedicated Vehicle: {{vehicle}}
• Travel Date: {{travel_date}}
• Guests: {{guests}} Traveler(s)
• Booking Reference: {{enquiry_id}}

What to expect next:
Our local destination concierge will contact you 24 hours prior to departure with your driver details and final itinerary checklist.

If you have any questions or special requests in the meantime, feel free to reply directly to this email or reach us on WhatsApp.

Warm regards,
Hills Tourism Concierge Team`,
  },
  package_details: {
    key: 'package_details',
    name: 'Package Details',
    defaultSubject: 'Curated Mountain Tour Details & Itinerary — Hills Tourism [{{enquiry_id}}]',
    defaultMessage: `Dear {{customer_name}},

Thank you for your interest in Hills Tourism. Based on your enquiry, we have curated a tailor-made experience for you:

Tour Overview:
• Selected Package: {{package}}
• Recommended Stay: {{hotel}}
• Chauffeur-Driven Vehicle: {{vehicle}}
• Proposed Travel Date: {{travel_date}}
• Party Size: {{guests}} Traveler(s)

Included with Hills Tourism:
• Verified luxury mountain homestays and boutique hill resorts.
• Experienced local mountain drivers skilled in winding hill terrain.
• Flexible daily itinerary with breathtaking sunrise and tea garden view stops.
• 24/7 on-ground mountain support.

Please review the details above and let us know if you would like any customizations to your schedule or accommodations.

Best regards,
Hills Tourism Travel Team`,
  },
  quotation: {
    key: 'quotation',
    name: 'Quotation',
    defaultSubject: 'Exclusive Tour Quotation for Your Journey [{{enquiry_id}}]',
    defaultMessage: `Dear {{customer_name}},

Here is your customized quotation for your upcoming mountain expedition:

Quotation Breakdown:
• Package: {{package}}
• Accommodation Category: {{hotel}}
• Vehicle Type: {{vehicle}}
• Travel Period: {{travel_date}}
• Total Travelers: {{guests}}
• Reference ID: {{enquiry_id}}

This package includes all toll fees, parking, driver accommodation, fuel, taxes, and curated local sightseeing.

This quotation is valid for the next 7 days. To lock in current seasonal dates and guaranteed vehicle allocation, simply reply to confirm your reservation.

Warm regards,
Hills Tourism Reservations`,
  },
  travel_reminder: {
    key: 'travel_reminder',
    name: 'Travel Reminder',
    defaultSubject: 'Upcoming Trip Reminder & Mountain Travel Tips [{{enquiry_id}}]',
    defaultMessage: `Dear {{customer_name}},

Your mountain escape is just around the corner! Here are key reminders to ensure a seamless and delightful trip:

Your Reservation Details:
• Destination & Package: {{package}}
• Assigned Hotel: {{hotel}}
• Transport: {{vehicle}}
• Date of Travel: {{travel_date}}
• Reference: {{enquiry_id}}

Essential Mountain Travel Checklist:
1. Warm clothing: Hill temperatures drop significantly after sunset. Bring layered light woolens or jackets.
2. Valid government ID: Required during hotel and checkpost verification.
3. Motion comfort: For travelers sensitive to winding mountain roads, motion sickness remedies are recommended.
4. Camera & power banks: Scenic mountain lookouts have limited charging facilities during day treks.

Your dedicated driver will call you prior to departure for the pickup coordination.

Safe travels!
Hills Tourism Mountain Team`,
  },
  custom: {
    key: 'custom',
    name: 'Custom Message',
    defaultSubject: 'Update regarding your enquiry [{{enquiry_id}}] — Hills Tourism',
    defaultMessage: `Dear {{customer_name}},

Thank you for contacting Hills Tourism regarding your enquiry [{{enquiry_id}}].

We are writing to update you on your upcoming travel plans:

[Your message here]

Please let us know how you would like to proceed.

Best regards,
Hills Tourism Team`,
  },
}

/**
 * Replaces {{variable}} placeholders with live enquiry values.
 */
export function interpolateTemplateVariables(
  text: string,
  variables: Record<string, string>
): string {
  let result = text
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi')
    result = result.replace(regex, value || '—')
  }
  return result
}

/**
 * Extracts available template variables from an enquiry.
 */
export function getEnquiryVariables(enquiry: Enquiry): Record<string, string> {
  const vehicleStr = enquiry.vehicle?.nameSnapshot
    ? (enquiry.vehicle.numberPlateSnapshot ? `${enquiry.vehicle.nameSnapshot} (${enquiry.vehicle.numberPlateSnapshot})` : enquiry.vehicle.nameSnapshot)
    : (enquiry.vehicle?.numberPlateSnapshot || 'Dedicated Tour Vehicle')

  return {
    customer_name: enquiry.customer?.name || 'Valued Traveler',
    package: enquiry.package?.nameSnapshot || 'Curated Mountain Journey',
    hotel: enquiry.hotel?.nameSnapshot || 'Boutique Hill Resort',
    vehicle: vehicleStr,
    travel_date: enquiry.travel?.date || 'Flexible',
    guests: enquiry.travel?.groupSize ? String(enquiry.travel.groupSize) : '1',
    enquiry_id: enquiry.id,
  }
}

/**
 * Builds responsive, branded HTML email markup.
 */
export function buildHtmlEmailBody(messageText: string, title = 'Hills Tourism'): string {
  const formattedText = messageText.replace(/\n/g, '<br/>')
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #060d24; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #060d24; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #0a1638; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 30px; background: linear-gradient(135deg, #07152f 0%, #0d2258 100%); border-bottom: 1px solid rgba(255,255,255,0.08);">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">Hills Tourism</h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #0878FF; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;">Curated Mountain Journeys</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 30px; color: #e2e8f0; font-size: 14px; line-height: 1.7;">
              ${formattedText}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #050c20; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">Hills Tourism &bull; Beyond the Ordinary &bull; Munnar &bull; Ooty &bull; Wayanad &bull; Kodaikanal</p>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #64748b;">Need instant assistance? Reach us via WhatsApp or reply directly to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export interface SendCrmEmailParams {
  enquiry: Enquiry
  templateKey: string
  subject: string
  message: string
  customTo?: string
  adminEmail?: string
}

export interface SendCrmEmailResult {
  success: boolean
  messageId?: string
  error?: string
  emailRecord?: EnquiryEmailRecord
}

/**
 * Validates RFC 5322 compliant email address.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
  return emailRegex.test(email.trim())
}

/**
 * Sends a customer email using Resend, updates enquiry email status,
 * appends to timeline and audit log.
 */
export async function sendCrmEmail(params: SendCrmEmailParams): Promise<SendCrmEmailResult> {
  const { enquiry, templateKey, subject, message, customTo, adminEmail = 'admin@hillstourism.com' } = params

  const recipient = (customTo || enquiry.customer?.email || '').trim()
  if (!recipient || !isValidEmail(recipient)) {
    return {
      success: false,
      error: `Invalid recipient email address: "${recipient}"`,
    }
  }

  // Rate Limiting per admin session/IP: 10 emails per minute
  const rateKey = `crm_email_${adminEmail.replace(/[^a-zA-Z0-9]/g, '_')}`
  const rateCheck = checkRateLimit(rateKey, { intervalMs: 60000, maxRequests: 10 })
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: 'Rate limit exceeded: You can send at most 10 emails per minute. Please wait a moment.',
    }
  }

  const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY
  const senderEmail = process.env.SENDER_EMAIL || 'Hills Tourism <enquiries@hillstourism.com>'

  const htmlBody = buildHtmlEmailBody(message, subject)
  const now = new Date().toISOString()
  const emailId = `EML-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`

  let success = false
  let messageId: string | undefined
  let errorMsg: string | undefined

  try {
    if (apiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: senderEmail,
          to: recipient,
          subject: subject.trim(),
          html: htmlBody,
          text: message.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        success = true
        messageId = data.id
      } else {
        const errText = await res.text()
        errorMsg = `Resend API error: ${errText}`
        console.error('[CRM Email Service] Resend dispatch failed:', errText)
      }
    } else {
      // Clean simulated mode in dev / test
      console.log(`[CRM Email (Simulated)] To: ${recipient} | Subject: ${subject} | By: ${adminEmail}`)
      success = true
      messageId = `simulated-${Date.now()}`
    }
  } catch (err: any) {
    errorMsg = err?.message || String(err)
    console.error('[CRM Email Service] Exception dispatching email:', err)
  }

  const emailRecord: EnquiryEmailRecord = {
    id: emailId,
    template: templateKey as any,
    subject: subject.trim(),
    to: recipient,
    bodyText: message.trim(),
    sentAt: now,
    status: success ? 'sent' : 'failed',
    error: errorMsg,
    author: adminEmail,
  }

  const timelineEvent: EnquiryTimelineEvent = {
    id: `TLE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    type: success ? 'email_sent' : 'email_failed',
    title: success ? `Email Sent: ${subject.trim()}` : `Email Delivery Failed`,
    description: success
      ? `Template: ${templateKey} to ${recipient}`
      : `Failed to send email to ${recipient}: ${errorMsg}`,
    timestamp: now,
    author: adminEmail,
    metadata: {
      emailId,
      template: templateKey,
      recipient,
      success,
      messageId,
    },
  }

  // Update Enquiry in Firestore / Memory
  const updatedEmailHistory = [...(enquiry.emailHistory || []), emailRecord]
  const updatedTimeline = [...(enquiry.timeline || []), timelineEvent]

  await updateEnquiry(enquiry.id, {
    lastEmailSentAt: now,
    lastEmailSubject: subject.trim(),
    emailStatus: success ? 'sent' : 'failed',
    integrations: {
      ...enquiry.integrations,
      emailStatus: success ? 'sent' : 'failed',
    },
    emailHistory: updatedEmailHistory,
    timeline: updatedTimeline,
  })

  // Record Audit Log
  await createAuditLog({
    action: 'email_sent',
    enquiryId: enquiry.id,
    customerName: enquiry.customer?.name,
    details: `${success ? 'Sent' : 'Failed'} email "${subject.trim()}" to ${recipient} (Template: ${templateKey})`,
    adminEmail,
    metadata: { emailId, success, messageId, error: errorMsg },
  })

  return {
    success,
    messageId,
    error: errorMsg,
    emailRecord,
  }
}
