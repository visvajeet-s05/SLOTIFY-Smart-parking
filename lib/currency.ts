import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Currency auto-detect based on country code
export function detectCurrency(countryCode: string): string {
  const currencyMap: Record<string, string> = {
    IN: "INR",
    US: "USD",
    EU: "EUR",
    UK: "GBP",
    CA: "CAD",
    AU: "AUD",
    JP: "JPY",
    DE: "EUR",
    FR: "EUR",
    IT: "EUR",
    ES: "EUR",
    NL: "EUR",
    SE: "SEK",
    NO: "NOK",
    DK: "DKK",
    CH: "CHF",
    BR: "BRL",
    MX: "MXN",
    AR: "ARS",
    CL: "CLP",
    CO: "COP",
    PE: "PEN",
    VE: "VES",
    KR: "KRW",
    CN: "CNY",
    HK: "HKD",
    SG: "SGD",
    NZ: "NZD",
    ZA: "ZAR",
    NG: "NGN",
    EG: "EGP",
    SA: "SAR",
    AE: "AED",
    QA: "QAR",
    KW: "KWD",
    OM: "OMR",
    BH: "BHD",
    IL: "ILS",
    TR: "TRY",
    RU: "RUB",
    PL: "PLN",
    CZ: "CZK",
    HU: "HUF",
    GR: "EUR",
    PT: "EUR",
    IE: "EUR",
    AT: "EUR",
    BE: "EUR",
    LU: "EUR",
    FI: "EUR",
    IS: "ISK",
    LI: "CHF",
    MT: "EUR",
    CY: "EUR",
    LV: "EUR",
    LT: "EUR",
    EE: "EUR",
    SK: "EUR",
    SI: "EUR",
    HR: "EUR",
    BG: "BGN",
    RO: "RON",
    MY: "MYR",
    TH: "THB",
    ID: "IDR",
    PH: "PHP",
    VN: "VND",
    PK: "PKR",
    BD: "BDT",
    LK: "LKR",
    NP: "NPR",
    MM: "MMK",
    KH: "KHR",
    LA: "LAK",
    BN: "BND",
    MN: "MNT",
    AF: "AFN",
    IR: "IRR",
    IQ: "IQD",
    SY: "SYP",
    JO: "JOD",
    LB: "LBP",
    YE: "YER",
    GE: "GEL",
    AM: "AMD",
    AZ: "AZN",
    TM: "TMT",
    UZ: "UZS",
    KG: "KGS",
    TJ: "TJS",
    KZ: "KZT",
    BY: "BYN",
    UA: "UAH",
    MD: "MDL",
    AL: "ALL",
    ME: "EUR",
    XK: "EUR",
    MK: "MKD",
    RS: "RSD",
    BA: "BAM",
  }
  
  return currencyMap[countryCode.toUpperCase()] ?? "USD"
}

// Get user's country from IP or browser settings
export async function getUserCountry(): Promise<string> {
  try {
    // Try to get from browser's language settings first
    if (typeof navigator !== 'undefined') {
      const language = navigator.language || navigator.languages[0]
      if (language && language.includes('-')) {
        const countryCode = language.split('-')[1]
        if (countryCode) return countryCode.toUpperCase()
      }
    }
    
    // Fallback to IP-based detection
    const response = await fetch('https://ipapi.co/json/')
    if (response.ok) {
      const data = await response.json()
      return data.country || 'US'
    }
    
    return 'US'
  } catch (error) {
    console.warn('Could not detect user country:', error)
    return 'US'
  }
}

// Create payment intent with currency detection
export async function createPaymentIntent(amount: number, currency?: string, metadata?: Record<string, string>) {
  // If currency not provided, try to detect it
  if (!currency) {
    const countryCode = await getUserCountry()
    currency = detectCurrency(countryCode)
  }
  
  // Convert amount to smallest currency unit (cents)
  const amountInCents = Math.round(amount * 100)
  
  return stripe.paymentIntents.create({
    amount: amountInCents,
    currency: currency.toLowerCase(),
    automatic_payment_methods: { enabled: true },
    metadata: metadata || {}
  })
}

// Create subscription with currency detection
export async function createSubscription(customerId: string, priceId: string, currency?: string) {
  if (!currency) {
    const countryCode = await getUserCountry()
    currency = detectCurrency(countryCode)
  }
  
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    currency: currency.toLowerCase(),
    expand: ['latest_invoice.payment_intent']
  })
}

// Get currency symbol for display
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    CZK: 'Kč',
    HUF: 'Ft',
    RON: 'lei',
    BGN: 'лв',
    TRY: '₺',
    RUB: '₽',
    ILS: '₪',
    AED: 'د.إ',
    SAR: '﷼',
    QAR: 'ر.ق',
    KWD: 'د.ك',
    BHD: '.د.ب',
    OMR: 'ر.ع.',
    JOD: 'د.أ',
    LBP: 'ل.ل',
    EGP: '£',
    ZAR: 'R',
    NGN: '₦',
    GHS: '₵',
    KES: 'KSh',
    UGX: 'USh',
    TZS: 'TSh',
    ETB: 'Br',
    DZD: 'د.ج',
    MAD: 'د.م.',
    TND: 'د.ت',
    MYR: 'RM',
    SGD: 'S$',
    HKD: 'HK$',
    PHP: '₱',
    THB: '฿',
    VND: '₫',
    IDR: 'Rp',
    BDT: '৳',
    PKR: '₨',
    LKR: 'Rs',
    NPR: 'रू',
    MMK: 'K',
    KHR: '៛',
    LAK: '₭',
    MNT: '₮',
    KZT: '₸',
    UZS: 'лв',
    AZN: '₼',
    GEL: '₾',
    AMD: '֏',
    BYN: 'Br',
    UAH: '₴',
    MDL: 'L',
    ALL: 'L',
    MKD: 'ден',
    RSD: 'РСД',
    BAM: 'KM',
    HRK: 'kn',
    SKK: 'Sk',
    SIT: 'SIT',
    LTL: 'Lt',
    LVL: 'Ls',
  }
  
  return symbols[currency.toUpperCase()] || currency.toUpperCase()
}

// Format price with currency
export function formatPrice(amount: number, currency: string = 'USD'): string {
  const symbol = getCurrencySymbol(currency)
  return `${symbol}${amount.toFixed(2)}`
}

// Convert between currencies (basic implementation)
export async function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
  // In production, you'd use a real exchange rate API
  // For now, return the same amount
  return amount
}
