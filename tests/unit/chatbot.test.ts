import { describe, it, expect } from 'vitest'
import { retrieveGroundedContext } from '../../src/lib/rag/retrieval'
import { generateChatbotReply } from '../../src/lib/services/gemini.service'

describe('Chatbot RAG Grounding & Policy Compliance (spec.md Section 36, 37, 61)', () => {
  it('retrieves relevant company data and packages based on user query', async () => {
    const context = await retrieveGroundedContext('Tell me about packages in Munnar')
    expect(context.companyInfo).toContain('Hills Tourism')
    expect(context.relevantPackages.some(p => p.toLowerCase().includes('munnar'))).toBe(true)
  })

  it('retrieves hotel details when user inquires about stays', async () => {
    const context = await retrieveGroundedContext('What 5 star hotels do you offer?')
    expect(context.relevantHotels.length).toBeGreaterThan(0)
  })

  it('refuses to make online bookings or take payment, guiding customer to enquiry model', async () => {
    const response = await generateChatbotReply('Can I book a hotel online right now with my credit card?')
    expect(response.grounded).toBe(true)
    expect(response.reply.toLowerCase()).toContain('enquiry')
    expect(response.chips.some(c => c.toLowerCase().includes('enquir') || c.toLowerCase().includes('whatsapp'))).toBe(true)
  })

  it('answers vehicle fleet questions accurately from company fleet data', async () => {
    const response = await generateChatbotReply('Do you have Innova Crysta with a driver?')
    expect(response.reply.toLowerCase()).toContain('innova')
    expect(response.reply.toLowerCase()).toContain('driver')
  })
})
