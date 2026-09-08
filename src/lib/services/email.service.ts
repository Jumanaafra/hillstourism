import type { Enquiry } from '../../types/domain'

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Sends internal notification and customer acknowledgement emails.
 * Uses transactional email provider (Resend/SendGrid/SMTP) when configured,
 * or logs cleanly in local/dev environments.
 */
export async function sendEnquiryEmails(enquiry: Enquiry): Promise<{
  internal: SendEmailResult
  customer: SendEmailResult
}> {
  const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY
  const senderEmail = process.env.SENDER_EMAIL || 'Hills Tourism <enquiries@hillstourism.com>'
  const internalRecipient = process.env.INTERNAL_NOTIFICATION_EMAIL || 'enquiries@hillstourism.com'

  const internalPayload = {
    from: senderEmail,
    to: internalRecipient,
    subject: `New Trip Enquiry [${enquiry.id}] — ${enquiry.customer.name}`,
    html: `
      <h2>New Customer Trip Enquiry</h2>
      <p><strong>Enquiry ID:</strong> ${enquiry.id}</p>
      <p><strong>Date Received:</strong> ${new Date(enquiry.createdAt).toLocaleString()}</p>
      <hr/>
      <h3>Customer Information</h3>
      <p><strong>Name:</strong> ${enquiry.customer.name}</p>
      <p><strong>Phone:</strong> ${enquiry.customer.phone}</p>
      <p><strong>Email:</strong> ${enquiry.customer.email || 'Not provided'}</p>
      <hr/>
      <h3>Travel & Preferences</h3>
      <p><strong>Selected Package:</strong> ${enquiry.package?.nameSnapshot || 'Not selected / Custom'}</p>
      <p><strong>Selected Hotel:</strong> ${enquiry.hotel?.nameSnapshot || 'Not selected'}</p>
      <p><strong>Selected Vehicle:</strong> ${enquiry.vehicle?.numberPlateSnapshot || 'Not selected'}</p>
      <p><strong>Travel Date:</strong> ${enquiry.travel.date || 'Flexible'}</p>
      <p><strong>Group Size:</strong> ${enquiry.travel.groupSize || 'Not specified'}</p>
      <p><strong>Trip Type:</strong> ${enquiry.travel.tripType || 'General'}</p>
      <p><strong>Source:</strong> ${enquiry.source || 'Website'}</p>
      <hr/>
      <h3>Customer Message</h3>
      <p>${enquiry.message ? enquiry.message.replace(/\n/g, '<br/>') : 'No additional message provided.'}</p>
    `,
  }

  const customerPayload = enquiry.customer.email
    ? {
        from: senderEmail,
        to: enquiry.customer.email,
        subject: `We have received your enquiry — Hills Tourism [${enquiry.id}]`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #07152F; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #001040; margin-bottom: 8px;">Your Enquiry Has Been Received</h2>
            <p style="color: #0878FF; font-weight: 600; font-size: 14px; text-transform: uppercase;">Reference: ${enquiry.id}</p>
            <p>Dear ${enquiry.customer.name},</p>
            <p>Thank you for reaching out to Hills Tourism. We have received your trip enquiry and our dedicated local mountain travel team is already reviewing your preferences.</p>
            <div style="background-color: #EEF3F8; border-left: 4px solid #0878FF; padding: 14px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 6px;"><strong>Selected Package:</strong> ${enquiry.package?.nameSnapshot || 'Custom Mountain Plan'}</p>
              <p style="margin: 0 0 6px;"><strong>Preferred Travel Date:</strong> ${enquiry.travel.date || 'To be determined'}</p>
              <p style="margin: 0;"><strong>Group Size:</strong> ${enquiry.travel.groupSize || '1'} traveler(s)</p>
            </div>
            <p><strong>What happens next?</strong><br/>
            One of our local destination experts will get in touch with you via WhatsApp or phone within <strong>2 hours</strong> with a personalized itinerary and clear details.</p>
            <p style="font-size: 13px; color: #667085; margin-top: 24px;">
              <em>Note: This is an enquiry acknowledgement, not a final booking confirmation. No payment has been processed.</em>
            </p>
            <hr style="border: none; border-top: 1px solid #E4EBF5; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94A3B8;">Hills Tourism · Discover the Hills Beyond the Ordinary · hello@hillstourism.com</p>
          </div>
        `,
      }
    : null

  let internalResult: SendEmailResult = { success: false }
  let customerResult: SendEmailResult = { success: false }

  // 1. Send Internal Notification
  try {
    if (apiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(internalPayload),
      })
      if (res.ok) {
        const data = await res.json()
        internalResult = { success: true, messageId: data.id }
      } else {
        const errText = await res.text()
        internalResult = { success: false, error: errText }
        console.error('[Email Service] Internal email failed:', errText)
      }
    } else {
      console.log(`[Email Service (Simulated)] Internal alert for enquiry ${enquiry.id} to ${internalRecipient}`)
      internalResult = { success: true, messageId: `mock-int-${Date.now()}` }
    }
  } catch (err: any) {
    internalResult = { success: false, error: err?.message || String(err) }
    console.error('[Email Service] Exception sending internal email:', err)
  }

  // 2. Send Customer Acknowledgement
  if (customerPayload) {
    try {
      if (apiKey) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(customerPayload),
        })
        if (res.ok) {
          const data = await res.json()
          customerResult = { success: true, messageId: data.id }
        } else {
          const errText = await res.text()
          customerResult = { success: false, error: errText }
          console.error('[Email Service] Customer email failed:', errText)
        }
      } else {
        console.log(`[Email Service (Simulated)] Customer confirmation for ${enquiry.customer.email}`)
        customerResult = { success: true, messageId: `mock-cust-${Date.now()}` }
      }
    } catch (err: any) {
      customerResult = { success: false, error: err?.message || String(err) }
      console.error('[Email Service] Exception sending customer email:', err)
    }
  } else {
    customerResult = { success: true, messageId: 'no-customer-email-provided' }
  }

  return {
    internal: internalResult,
    customer: customerResult,
  }
}
