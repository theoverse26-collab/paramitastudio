// Approximate exchange rate (you can update this or fetch live rates)
const USD_TO_IDR_RATE = 16000;

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
