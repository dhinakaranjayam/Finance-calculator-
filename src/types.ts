export type CalculatorType = 
  | 'emi_basic' | 'emi_advanced' | 'fd_tdr' | 'fd_stdr' | 'rd' | 'bank_rates'
  | 'ppf' | 'ssa' | 'scss' | 'kvp'
  | 'mis' | 'rd_po' | 'td_po' | 'nsc' | 'po_rates'
  | 'mf_overview' | 'elss' | 'sip' | 'swp'
  | 'nps' | 'ups' | 'epf' | 'aps' | 'sym' | 'grt'
  | 'tax' | 'cgt'
  | 'pli' | 'rpli' | 'jjb' | 'sb'
  | 'bonds_overview' | 'frsb' | 'sgb' | 'ec54'
  | 'ci' | 'si' | 'infl'
  | 'mssc' | 'vvs'
  | 'emi' // preserve old types so no refactoring breaks
  | 'fd'; // preserve old types so no refactoring breaks

export interface EMIOptions {
  principal: number;
  rate: number;
  tenure: number; // in years
  tenureType: 'years' | 'months';
}

export interface EMILineItem {
  month: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
  emi: number;
}

export interface EMIResult {
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
  amortizationSchedule: EMILineItem[];
}

export interface SIPOptions {
  monthlyInvestment: number;
  expectedRate: number;
  period: number; // in years
  stepUpPercentage?: number; // annual step up percentage
}

export interface SIPYearlyDetail {
  year: number;
  investedAmount: number;
  wealthGained: number;
  totalValue: number;
}

export interface SIPResult {
  totalInvested: number;
  totalWealth: number;
  futureValue: number;
  breakdown: SIPYearlyDetail[];
}

export interface FDOptions {
  principal: number;
  rate: number;
  tenure: number; // in years or days
  tenureType: 'years' | 'months' | 'days';
  compoundingFrequency: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';
}

export interface FDResult {
  investedAmount: number;
  interestEarned: number;
  maturityValue: number;
}

export interface TaxSlab {
  min: number;
  max: number | null;
  rate: number; // e.g., 0.1 for 10%
}

export interface TaxRegime {
  id: string;
  name: string;
  slabs: TaxSlab[];
  standardDeduction: number;
}

export interface TaxOptions {
  grossIncome: number;
  investments80C: number; // standard deductions or custom deductions
  houseRentAllowance: number;
  otherDeductions: number;
  regimeId: string;
}

export interface TaxResult {
  taxableIncome: number;
  grossTax: number;
  totalDeductions: number;
  netTaxpayable: number;
  effectiveTaxRate: number;
  bracketBreakdown: {
    bracket: string;
    taxableInSub: number;
    taxPaid: number;
    rate: number;
  }[];
}

export interface SavedScenario {
  id: string;
  name: string;
  type: CalculatorType;
  date: string;
  input: any;
  result: any;
}
