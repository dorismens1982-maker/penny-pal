export const formatCurrency = (amount: number) => `₵${Math.abs(amount).toFixed(2)}`;

export const formatCurrencyIntl = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 2
});
