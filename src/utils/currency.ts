import { CurrencyCode, getCurrency, DEFAULT_CURRENCY } from './currencyConfig';

export const formatCurrency = (amount: number, currencyCode: CurrencyCode = DEFAULT_CURRENCY): string => {
    const currency = getCurrency(currencyCode);
    return `${currency.symbol}${Math.abs(amount).toFixed(2)}`;
};

export const formatCurrencyIntl = (amount: number, currencyCode: CurrencyCode = DEFAULT_CURRENCY): string => {
    const currency = getCurrency(currencyCode);
    const formatter = new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 2
    });
    return formatter.format(amount);
};
