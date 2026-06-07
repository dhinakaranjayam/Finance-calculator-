import { useState, useEffect } from 'react';
import { TaxOptions, TaxResult } from '../types';
import { calculateTax, DEFAULT_TAX_REGIMES, formatCurrency } from '../utils/math';
import TaxGauge from './TaxGauge';
import SavedScenariosPanel from './SavedScenariosPanel';
import { ShieldCheck, HelpCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface TaxEstimatorProps {
  currencySymbol: string;
}

export default function TaxEstimator({ currencySymbol }: TaxEstimatorProps) {
  // Option inputs
  const [grossIncome, setGrossIncome] = useState<number>(120000);
  const [investments80C, setInvestments80C] = useState<number>(0);
  const [houseRentAllowance, setHouseRentAllowance] = useState<number>(0);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);
  const [regimeId, setRegimeId] = useState<string>(DEFAULT_TAX_REGIMES[0].id);

  const [result, setResult] = useState<TaxResult>({
    taxableIncome: 0,
    grossTax: 0,
    totalDeductions: 0,
    netTaxpayable: 0,
    effectiveTaxRate: 0,
    bracketBreakdown: [],
  });

  // Automatically configure standard amounts or reset deductions depending on selected target regime
  useEffect(() => {
    const isIndianOldRegime = regimeId === 'in_old_24_25';
    if (!isIndianOldRegime) {
      setInvestments80C(0);
      setHouseRentAllowance(0);
      setOtherDeductions(0);
    } else {
      // Seed some standard old regime deductions
      setInvestments80C(150000); // 80C limit in India
      setOtherDeductions(50000);
    }
  }, [regimeId]);

  // Handle dynamic recalculations
  useEffect(() => {
    const taxResult = calculateTax({
      grossIncome,
      investments80C,
      houseRentAllowance,
      otherDeductions,
      regimeId,
    }, DEFAULT_TAX_REGIMES);
    setResult(taxResult);
  }, [grossIncome, investments80C, houseRentAllowance, otherDeductions, regimeId]);

  // Load configuration from scenarios block
  const handleLoadScenario = (savedInput: TaxOptions) => {
    setGrossIncome(savedInput.grossIncome);
    setInvestments80C(savedInput.investments80C);
    setHouseRentAllowance(savedInput.houseRentAllowance);
    setOtherDeductions(savedInput.otherDeductions);
    setRegimeId(savedInput.regimeId);
  };

  const selectedRegime = DEFAULT_TAX_REGIMES.find(r => r.id === regimeId) || DEFAULT_TAX_REGIMES[0];
  const currentInput = { grossIncome, investments80C, houseRentAllowance, otherDeductions, regimeId };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Inputs Column */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-3 gap-2">
            <h3 className="font-bold text-white text-base">Annual Income & Filings</h3>
            <span className="text-xs text-slate-400 font-medium">Progressive tax slab rates</span>
          </div>

          {/* 1. Regime Selector */}
          <div className="flex flex-col gap-2">
            <label htmlFor="tax-regime" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Tax Regime jurisdiction</label>
            <select
              id="tax-regime"
              value={regimeId}
              onChange={(e) => setRegimeId(e.target.value)}
              className="w-full text-xs font-semibold p-3 border border-white/10 rounded-xl bg-white/5 text-slate-100 outline-hidden hover:border-white/20 hover:bg-white/10 cursor-pointer"
            >
              {DEFAULT_TAX_REGIMES.map((reg) => (
                <option key={reg.id} value={reg.id} className="bg-slate-900 text-slate-100">
                  {reg.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Gross Annual Income */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <label htmlFor="tax-gross" className="font-semibold text-slate-350">Gross Annual Income</label>
              <div className="flex items-center gap-1.5 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                <span className="text-xs text-amber-300 font-bold">{currencySymbol}</span>
                <input
                  id="tax-gross-input"
                  type="number"
                  value={grossIncome}
                  onChange={(e) => setGrossIncome(Math.max(0, Number(e.target.value)))}
                  className="w-24 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                />
              </div>
            </div>
            <input
              id="tax-gross"
              type="range"
              min={1000}
              max={regimeId.startsWith('in_') ? 10000000 : 1000000}
              step={1000}
              value={grossIncome}
              onChange={(e) => setGrossIncome(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
              <span>{formatCurrency(1000, currencySymbol)}</span>
              <span>{formatCurrency(regimeId.startsWith('in_') ? 5000000 : 500000, currencySymbol)}</span>
              <span>{formatCurrency(regimeId.startsWith('in_') ? 10000000 : 1000000, currencySymbol)}</span>
            </div>
          </div>

          {/* Dynamic Deductions Subsections block */}
          {regimeId === 'in_old_24_25' ? (
            <div className="flex flex-col gap-5 border-t border-dashed border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Deductions & Exemptions</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold px-2 py-0.5 rounded-lg uppercase">
                  Old Regime Exemption Active
                </span>
              </div>

              {/* standard 80C */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs text-slate-350 font-semibold">
                  <div className="flex items-center gap-1">
                    <label htmlFor="tax-80c">Sec 80C Contributions (PF, LIC, ELSS)</label>
                    <div className="relative group cursor-help">
                      <HelpCircle size={12} className="text-slate-400" />
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900/95 text-slate-100 text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 leading-normal z-10 backdrop-blur-md">
                        Investments in Employee Provident Fund, Life Insurance premium, or mutual funds. Limit: ₹1,50,000.
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-white font-bold">{formatCurrency(investments80C, currencySymbol)}</span>
                </div>
                <input
                  id="tax-80c"
                  type="range"
                  min={0}
                  max={150000}
                  step={5000}
                  value={investments80C}
                  onChange={(e) => setInvestments80C(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 accent-amber-505 rounded-lg appearance-none cursor-ew-resize"
                />
              </div>

              {/* houseRentAllowance */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs text-slate-355 font-semibold">
                  <label htmlFor="tax-hra">Exempt House Rent Allowance (HRA)</label>
                  <span className="font-mono text-white font-bold">{formatCurrency(houseRentAllowance, currencySymbol)}</span>
                </div>
                <input
                  id="tax-hra"
                  type="range"
                  min={0}
                  max={300000}
                  step={5000}
                  value={houseRentAllowance}
                  onChange={(e) => setHouseRentAllowance(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 accent-amber-505 rounded-lg appearance-none cursor-ew-resize"
                />
              </div>

              {/* otherDeductions */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs text-slate-355 font-semibold">
                  <label htmlFor="tax-other">Other deductions (Medical Sec 80D, NPS, etc.)</label>
                  <span className="font-mono text-white font-bold">{formatCurrency(otherDeductions, currencySymbol)}</span>
                </div>
                <input
                  id="tax-other"
                  type="range"
                  min={0}
                  max={200000}
                  step={5000}
                  value={otherDeductions}
                  onChange={(e) => setOtherDeductions(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 accent-amber-505 rounded-lg appearance-none cursor-ew-resize"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-white/5 border border-white/10 shadow-sm rounded-xl text-slate-300 flex gap-3 text-xs leading-relaxed border-t border-dashed border-white/5 pt-4">
              <AlertCircle size={18} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-1">Standard Deductions Applied Automatically</span>
                The selected filing status incorporates an automatic standard deduction of{' '}
                <span className="font-extrabold text-amber-300">{formatCurrency(selectedRegime.standardDeduction, currencySymbol)}</span> to compute taxable income. Additional itemized exemptions are disabled under this clean tax code configuration.
              </div>
            </div>
          )}
        </div>

        {/* Marginal progressive slab explanation table */}
        {result.bracketBreakdown.length > 0 && (
          <div className="p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg flex flex-col gap-3">
            <div>
              <h4 className="text-sm font-bold text-white">Slab-by-Slab Taxation Index</h4>
              <p className="text-xs text-slate-400">Shows progressive marginal tax calculated across each income bracket</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-2 text-slate-400 font-bold uppercase">Tax bracket (Slab)</th>
                    <th className="py-2 text-slate-400 font-bold uppercase text-right">Taxable within slab</th>
                    <th className="py-2 text-slate-400 font-bold uppercase text-right">Tax Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                  {result.bracketBreakdown.map((item, index) => (
                    <tr key={index}>
                      <td className="py-2 font-sans font-semibold text-slate-350">{item.bracket}</td>
                      <td className="py-2 text-right text-slate-100 font-bold">{formatCurrency(item.taxableInSub, currencySymbol)}</td>
                      <td className="py-2 text-right text-amber-400 font-extrabold">{formatCurrency(item.taxPaid, currencySymbol)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Results visualizer column */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4">
          {/* Net tax payable display */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-br from-amber-500/25 to-orange-500/20 backdrop-blur-xl text-white rounded-3xl border border-white/10 shadow-lg relative overflow-hidden"
          >
            <div className="absolute right-[-10px] top-[-10px] opacity-10">
              <ShieldCheck size={80} />
            </div>
            <span className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
              Estimated Annual Net Tax Payable
            </span>
            <span className="text-3xl font-black font-sans tracking-tight">
              {formatCurrency(result.netTaxpayable, currencySymbol)}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-slate-300 mt-3 border-t border-white/10 pt-2.5">
              <span>*Reflects net payable after respective regional rebates</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Taxable Income
              </span>
              <span className="text-sm font-extrabold text-white font-sans">
                {formatCurrency(result.taxableIncome, currencySymbol)}
              </span>
            </div>
            <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Total Deductions
              </span>
              <span className="text-sm font-extrabold text-emerald-400 font-sans">
                {formatCurrency(result.totalDeductions, currencySymbol)}
              </span>
            </div>
          </div>
        </div>

        {/* Effective tax rate speed-ring gauge */}
        <TaxGauge rate={result.effectiveTaxRate} />

        {/* Saved offline scenario panel */}
        <SavedScenariosPanel
          currentType="tax"
          currentInput={currentInput}
          currentResult={result}
          onLoadScenario={handleLoadScenario}
          currencySymbol={currencySymbol}
        />
      </div>
    </div>
  );
}
