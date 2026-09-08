/**
 * Client-safe analytics event tracker.
 * Uses Google Analytics 4 (gtag) when configured, otherwise logs to console.
 * Analytics failures must NEVER break the website (spec §59).
 */

type AnalyticsEvent =
  | 'page_view'
  | 'package_view'
  | 'hotel_view'
  | 'vehicle_view'
  | 'enquiry_start'
  | 'enquiry_submit'
  | 'chat_open'
  | 'chat_message'

interface EventParams {
  [key: string]: string | number | boolean | undefined
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

export function trackEvent(event: AnalyticsEvent, params?: EventParams): void {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, params)
    } else if (typeof window !== 'undefined') {
      console.debug(`[Analytics] ${event}`, params || '')
    }
  } catch {
    // Analytics must never crash the app
  }
}

export function trackPageView(path: string, title?: string): void {
  trackEvent('page_view', { page_path: path, page_title: title })
}

export function trackPackageView(packageName: string, packageId: string): void {
  trackEvent('package_view', { package_name: packageName, package_id: packageId })
}

export function trackHotelView(hotelName: string, hotelId: string): void {
  trackEvent('hotel_view', { hotel_name: hotelName, hotel_id: hotelId })
}

export function trackVehicleView(vehicleName: string, vehicleId: string): void {
  trackEvent('vehicle_view', { vehicle_name: vehicleName, vehicle_id: vehicleId })
}

export function trackEnquiryStart(source?: string): void {
  trackEvent('enquiry_start', { source })
}

export function trackEnquirySubmit(success: boolean, source?: string): void {
  trackEvent('enquiry_submit', { success, source })
}

export function trackChatOpen(): void {
  trackEvent('chat_open')
}

export function trackChatMessage(messageLength: number): void {
  trackEvent('chat_message', { message_length: messageLength })
}
