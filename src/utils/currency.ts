// Exchange rate USD to IDR (same as payment page)
const USD_TO_IDR_RATE = 15000;

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
