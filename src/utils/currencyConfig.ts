export type CurrencyCode = 'GHS' | 'USD' | 'EUR' | 'GBP' | 'NGN' | 'ZAR';

export interface Currency {
    code: CurrencyCode;
    symbol: string;
    name: string;
    locale: string;
}

export const CURRENCIES: Currency[] = [
    { code: 'GHS', symbol: '₵', name: 'Ghana Cedi', locale: 'en-GH' },
    { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
    { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-EU' },
    { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
];

export const DEFAULT_CURRENCY: CurrencyCode = 'GHS';

export const getCurrency = (code: CurrencyCode): Currency => {
    return CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
};

export const getCurrencySymbol = (code: CurrencyCode): string => {
    return getCurrency(code).symbol;
};
