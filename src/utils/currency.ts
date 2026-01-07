// Exchange rate USD to IDR (same as payment page)
const USD_TO_IDR_RATE = 15000;

/**
 * Format a price from USD to the appropriate currency based on language
 * @param priceUsd - Price in USD
 * @param language - Current language ('en' or 'id')
 */
export const formatPrice = (priceUsd: number, language: string): string => {
  if (language === 'id') {
    const priceIdr = Math.round(priceUsd * USD_TO_IDR_RATE);
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceIdr);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(priceUsd);
};

/**
 * Format a price that is stored in IDR to the appropriate currency based on language
 * Used for analytics/revenue where amounts are stored in IDR
 * @param priceIdr - Price in IDR
 * @param language - Current language ('en' or 'id')
 */
export const formatPriceFromIDR = (priceIdr: number, language: string): string => {
  if (language === 'id') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceIdr);
  }

  // Convert IDR back to USD for English display
  const priceUsd = priceIdr / USD_TO_IDR_RATE;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(priceUsd);
};
