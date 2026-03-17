import { Currency } from "@/types"

export interface ParsedAmount {
  currency: Currency
  amount: number
}

export type ExchangeRates = Record<string, number>

/**
 * Parse API amount string like "NGN 2148810" or "usd 80"
 */
export const parseAmount = (value: string): ParsedAmount => {
  const [currency, amount] = value.trim().split(" ")

  return {
    currency: currency.toUpperCase() as Currency,
    amount: Number(amount),
  }
}

/**
 * Convert amount between currencies using NGN as base
 */
export const convertCurrency = (
  value: string,
  targetCurrency: Currency,
  rates: ExchangeRates
): number => {
  const { currency: sourceCurrency, amount } = parseAmount(value)

  if (sourceCurrency === targetCurrency) return amount

  const sourceRate = rates[sourceCurrency]
  const targetRate = rates[targetCurrency]

  if (!sourceRate || !targetRate) return amount

  // convert to NGN first
  const amountInNGN =
    sourceCurrency === "NGN" ? amount : amount / sourceRate

  // convert NGN → target
  return targetCurrency === "NGN"
    ? amountInNGN
    : amountInNGN * targetRate
}

/**
 * Format currency safely
 */
export const formatCurrency = (amount: number, currency: Currency) => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}