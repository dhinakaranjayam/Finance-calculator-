import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Landmark, TrendingUp, DollarSign, Calendar, AlertCircle, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../utils/math';
import DonutChart from './DonutChart';
import SavedScenariosPanel from './SavedScenariosPanel';

interface BaseCalculatorsProps {
  type: string;
  currencySymbol: string;
}

export default function GeneralAndBondCalculators({ type, currencySymbol }: BaseCalculatorsProps) {
  const [params, setParams] = useState<any>({});

  // Reset parameters when type changes
  useEffect(() => {
    switch (type) {
      case 'si':
        setParams({ principal: 100000, rate: 8.5, tenure: 5, tenureType: 'years' });
        break;
      case 'ci':
        setParams({ principal: 100000, rate: 8.5, tenure: 5, frequency: 'quarterly' });
        break;
      case 'infl':
        setParams({ expense: 30000, rate: 6, tenure: 15 });
        break;
      case 'frsb':
        setParams({ investment: 100000 });
        break;
      case 'sgb':
        setParams({ grams: 50, nominalPrice: 7200, growthRate: 6 });
        break;
      case 'ec54':
        setParams({ investment: 1000000 });
        break;
      case 'bonds_overview':
        setParams({});
        break;
      default:
        break;
    }
  }, [type]);

  const updateParam = (key: string, val: any) => {
    setParams((prev: any) => ({ ...prev, [key]: val }));
  };

  // 1. Simple Interest (SI) math
  const calculateSI = () => {
    const { principal = 100000, rate = 8.5, tenure = 5, tenureType = 'years' } = params;
    const t = tenureType === 'months' ? tenure / 12 : tenure;
    const interestEarned = (principal * rate * t) / 100;
    const maturityValue = principal + interestEarned;

    return {
      totalInvested: principal,
      interestEarned,
      maturityValue,
    };
  };

  // 2. Compound Interest (CI) math
  const calculateCI = () => {
    const { principal = 100000, rate = 8.5, tenure = 5, frequency = 'quarterly' } = params;
    let n = 4; // default compounding quarterly
    if (frequency === 'monthly') n = 12;
    else if (frequency === 'half-yearly') n = 2;
    else if (frequency === 'yearly') n = 1;

    const r = rate / 100;
    const maturityValue = principal * Math.pow(1 + r / n, n * tenure);
    const interestEarned = maturityValue - principal;

    return {
      totalInvested: principal,
      interestEarned,
      maturityValue,
    };
  };

  // 3. Inflation math
  const calculateInflation = () => {
    const { expense = 30005, rate = 6, tenure = 15 } = params;
    const r = rate / 100;
    
    // Future cost of same expense
    const futureExpense = expense * Math.pow(1 + r, tenure);
    // Purchasing power depreciation of same savings sum
    const currentPower = expense / Math.pow(1 + r, tenure);

    return {
      totalExpense: expense,
      futureCost: futureExpense,
      purchasingPowerLoss: currentPower,
    };
  };

  // 4. Floating Rate Savings Bonds (FRSB) math
  const calculateFRSB = () => {
    const { investment = 100000 } = params;
    // Current interest rate for floating rate bonds is stabilized at 8.05%
    const rate = 8.05;
    const tenure = 7; // Fixed 7-year lock-in
    
    // Paid semi-annually
    const semiAnnualPayout = (investment * (rate / 100)) / 2;
    const totalPayout = semiAnnualPayout * 2 * tenure;

    return {
      totalInvested: investment,
      payoutPeriodical: semiAnnualPayout,
      totalInterestEarned: totalPayout,
      maturityValue: investment,
    };
  };

  // 5. Sovereign Gold Bonds (SGB) math
  const calculateSGB = () => {
    const { grams = 50, nominalPrice = 7200, growthRate = 6 } = params;
    const totalInvested = grams * nominalPrice;
    
    // Lock-in period for SGB is 8 years
    // Fixed SGB incentive interest: 2.5% of nominal buying price paid simple annually
    const annualInterestPayout = totalInvested * 0.025;
    const totalInterestPayed = annualInterestPayout * 8;
    
    // Simulated gold value growth
    const finalGoldPrice = nominalPrice * Math.pow(1 + growthRate / 100, 8);
    const maturityGoldVal = grams * finalGoldPrice;

    return {
      totalInvested,
      annualInterestPayout,
      totalInterestPayed,
      maturityValue: maturityGoldVal,
      totalYield: maturityGoldVal + totalInterestPayed,
    };
  };

  // 6. 54EC Bonds math
  const calculate54EC = () => {
    const { investment = 1000000 } = params;
    // Max allowable investment in 54EC is capped at ₹50 Lakhs (50,00,000)
    const activeInvestment = Math.min(5000000, investment);
    // Interest rate is 5.25% p.a. paid annually
    const rate = 5.25;
    const tenure = 5; // 5-year lock-in

    const annualPayout = activeInvestment * (rate / 100);
    const totalPayout = annualPayout * tenure;

    return {
      totalInvested: activeInvestment,
      payoutPeriodical: annualPayout,
      totalInterestEarned: totalPayout,
      maturityValue: activeInvestment,
    };
  };

  // Render specifications
  let title = 'General Calculator';
  let description = 'Calculate foundational finance ratios and gold-indexed yields.';
  let infoBox = '';
  let calculation: any = {};
  let donutData: any[] = [];

  if (type === 'si') {
    title = 'Simple Interest (SI)';
    description = 'Calculate basic, non-compounded interest returns.';
    infoBox = 'Simple interest applies interest purely to original principal. Frequently used for standard promissory loans and basic deposits.';
    calculation = calculateSI();
    donutData = [
      { label: 'Initial Principal', value: calculation.totalInvested, color: '#d97706' },
      { label: 'Simple Yield Interest', value: calculation.interestEarned, color: '#fbbf24' },
    ];
  } else if (type === 'ci') {
    title = 'Compound Interest (CI)';
    description = 'Future value calculation with dynamic compounding options.';
    infoBox = 'Compound interest accumulates interest over previous periods, creating a parabolic acceleration Curve.';
    calculation = calculateCI();
    donutData = [
      { label: 'Locked Principal', value: calculation.totalInvested, color: '#b45309' },
      { label: 'Compounded Interest', value: calculation.interestEarned, color: '#f59e0b' },
    ];
  } else if (type === 'infl') {
    title = 'Inflation & Purchasing Power';
    description = 'Estimate the future cost of living adjusted for annual inflation.';
    infoBox = 'Inflation erodes purchasing power over time. A 6% inflation rate doubles standard living expenses in approximately 12 years.';
    calculation = calculateInflation();
  } else if (type === 'frsb') {
    title = 'Floating Rate Savings Bonds (FRSB)';
    description = 'Sovereign-backed floating rate savings bonds issued by RBI.';
    infoBox = 'Semi-annually paid treasury asset. Returns are tied to National Savings Certificate rate + 0.35% premium.';
    calculation = calculateFRSB();
    donutData = [
      { label: 'Invested Capital', value: calculation.totalInvested, color: '#0f766e' },
      { label: 'Semi-Annual Bond Payouts', value: calculation.totalInterestEarned, color: '#14b8a6' },
    ];
  } else if (type === 'sgb') {
    title = 'Sovereign Gold Bonds (SGB)';
    description = 'Sovereign bonds denominated in grams of physical gold.';
    infoBox = 'Tied to international gold indexes. Tax-exempt on capital gains at 8 years maturity. Earns 2.5% extra cash simple interest annually.';
    calculation = calculateSGB();
    donutData = [
      { label: 'Gold Purchase Capital', value: calculation.totalInvested, color: '#a16207' },
      { label: '2.5% Cash Interest Bonus', value: calculation.totalInterestPayed, color: '#eab308' },
      { label: 'Gold Price Appreciation', value: Math.max(0, calculation.maturityValue - calculation.totalInvested), color: '#ca8a04' },
    ];
  } else if (type === 'ec54') {
    title = '54EC Capital Gains Bonds';
    description = 'NHAI/REC bonds to completely offset property sell capital gains taxes.';
    infoBox = 'Save 20% indexation taxes on long-term property sales when capital is locked in 54EC within 6 months of sale. Limit: Max ₹50L.';
    calculation = calculate54EC();
    donutData = [
      { label: 'Saved Tax Capital Locked', value: calculation.totalInvested, color: '#0369a1' },
      { label: 'Annual Bond Payout', value: calculation.totalInterestEarned, color: '#0ea5e9' },
    ];
  }

  // Handle Load Saved local scenarion
  const handleLoadSaved = (scInput: any) => {
    if (scInput) {
      setParams(scInput);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Parameters Panel */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {type === 'bonds_overview' ? (
          <div className="p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg flex flex-col gap-6">
            <h3 className="font-bold text-white text-base">Indian Sovereign & PSU Bonds Overview</h3>
            <p className="text-xs text-slate-400">Secure sovereign fixed-income assets authorized by the Reserve Bank of India & PSUs.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Sovereign Gold Bonds', rate: '2.50% p.a. + Gold Growth', exit: '8 Years (Exit @ Year 5)', tax: 'Capital Gains Tax Free on Maturity' },
                { title: 'Floating Rate Bonds (FRSB)', rate: '8.05% p.a. Adjusting', exit: '7 Years Lock-in', tax: 'Interest fully taxable under slabs' },
                { title: '54EC Tax Saving Bonds', rate: '5.25% p.a. Fixed', exit: '5 Years Lock-in', tax: 'Offset capital gains tax on property sales' },
                { title: 'PSU Tax-Free Bonds', rate: 'VAR (Inflation linked)', exit: '10/15/20 Years', tax: 'Completely Tax-Free Interest payouts' },
              ].map((bo, idx) => (
                <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <span className="text-xs font-bold text-white block mb-2">{bo.title}</span>
                  <div className="flex flex-col gap-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-amber-300">Interest Offer: {bo.rate}</span>
                    <span>Lock-in Schedule: {bo.exit}</span>
                    <span>Tax Status: {bo.tax}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-slate-300 flex gap-3 text-xs leading-relaxed">
              <ShieldCheck className="text-amber-400 shrink-0 mt-0.5" size={18} />
              <div>
                <span className="font-bold text-white block mb-0.5">Sovereign Credit Rating</span>
                Bonds listed here are backed directly by the Government of India or highly stabilized PSUs, representing AAA sovereign ratings with virtually zero default risk.
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">{title}</h3>
                <p className="text-xs text-slate-400 mt-1">{description}</p>
              </div>
              <Landmark className="text-amber-400 shrink-0" size={24} />
            </div>

            {/* Inputs Block */}
            {params.principal !== undefined && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <label className="font-semibold text-slate-355">Principal Capital</label>
                  <div className="flex items-center gap-1.5 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                    <span className="text-xs text-amber-300 font-bold">{currencySymbol}</span>
                    <input
                      type="number"
                      value={params.principal}
                      onChange={(e) => updateParam('principal', Math.max(0, Number(e.target.value)))}
                      className="w-24 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={5000000}
                  step={1000}
                  value={params.principal}
                  onChange={(e) => updateParam('principal', Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
                />
              </div>
            )}

            {params.expense !== undefined && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <label className="font-semibold text-slate-355">Current monthly Lifestyle Expense</label>
                  <div className="flex items-center gap-1.5 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                    <span className="text-xs text-amber-300 font-bold">{currencySymbol}</span>
                    <input
                      type="number"
                      value={params.expense}
                      onChange={(e) => updateParam('expense', Math.max(0, Number(e.target.value)))}
                      className="w-24 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={500000}
                  step={500}
                  value={params.expense}
                  onChange={(e) => updateParam('expense', Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
                />
              </div>
            )}

            {params.investment !== undefined && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <label className="font-semibold text-slate-355">Bond Investment principal</label>
                  <div className="flex items-center gap-1.5 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                    <span className="text-xs text-amber-300 font-bold">{currencySymbol}</span>
                    <input
                      type="number"
                      value={params.investment}
                      onChange={(e) => updateParam('investment', Math.max(0, Number(e.target.value)))}
                      className="w-24 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={type === 'ec54' ? 5000000 : 10000000}
                  step={1000}
                  value={params.investment}
                  onChange={(e) => updateParam('investment', Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                  <span>{formatCurrency(1000, currencySymbol)}</span>
                  <span>{formatCurrency((type === 'ec54' ? 5000000 : 10000000) / 2, currencySymbol)}</span>
                  <span>{formatCurrency(type === 'ec54' ? 5000000 : 10000000, currencySymbol)}{type === 'ec54' ? ' (Max limit)' : ''}</span>
                </div>
              </div>
            )}

            {params.grams !== undefined && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-355">Total Gold Weight (Grams)</span>
                    <input
                      type="number"
                      value={params.grams}
                      onChange={(e) => updateParam('grams', Math.max(1, Number(e.target.value)))}
                      className="p-2 bg-white/5 border border-white/10 text-white font-extrabold text-sm rounded-xl focus:outline-hidden"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-355">Gold purchase price (₹/gm)</span>
                    <input
                      type="number"
                      value={params.nominalPrice}
                      onChange={(e) => updateParam('nominalPrice', Math.max(1000, Number(e.target.value)))}
                      className="p-2 bg-white/5 border border-white/10 text-white font-extrabold text-sm rounded-xl focus:outline-hidden"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <label className="font-semibold text-slate-355">Expected annual Gold price appreciation</label>
                    <span className="text-xs font-bold text-amber-300 font-sans">{params.growthRate}% / p.a.</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={15}
                    step={0.1}
                    value={params.growthRate}
                    onChange={(e) => updateParam('growthRate', Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
                  />
                </div>
              </div>
            )}

            {params.rate !== undefined && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <label className="font-semibold text-slate-355">Rate of Interest (p.a.)</label>
                  <div className="flex items-center gap-1 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                    <input
                      type="number"
                      step="0.05"
                      value={params.rate}
                      onChange={(e) => updateParam('rate', Math.max(0, Number(e.target.value)))}
                      className="w-14 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                    />
                    <span className="text-xs text-slate-400 font-semibold">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={25}
                  step={0.05}
                  value={params.rate}
                  onChange={(e) => updateParam('rate', Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
                />
              </div>
            )}

            {params.tenure !== undefined && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <label className="font-semibold text-slate-355">Duration (Tenure)</label>
                  <span className="text-xs font-bold text-amber-300 font-sans">{params.tenure} Years</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={type === 'infl' ? 40 : 30}
                  step={1}
                  value={params.tenure}
                  onChange={(e) => updateParam('tenure', Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
                />
              </div>
            )}

            {/* Compounding options */}
            {params.frequency !== undefined && (
              <div className="flex flex-col gap-2.5">
                <span className="text-sm font-semibold text-slate-355">Compounding Intervals</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'monthly', name: 'Monthly' },
                    { id: 'quarterly', name: 'Quarterly' },
                    { id: 'half-yearly', name: 'Half-Yrly' },
                    { id: 'yearly', name: 'Yearly' },
                  ].map((freq) => (
                    <button
                      key={freq.id}
                      onClick={() => updateParam('frequency', freq.id)}
                      className={`py-1.5 px-2 text-[10px] sm:text-xs font-bold rounded-xl border transition-all text-center cursor-pointer ${
                        params.frequency === freq.id
                          ? 'border-amber-500 bg-amber-500/20 text-white shadow-xs'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {freq.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {infoBox && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-slate-300 flex gap-3 text-xs leading-relaxed">
                <AlertCircle size={18} className="text-amber-450 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">Parameters Guidelines</span>
                  {infoBox}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Column */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {type === 'bonds_overview' ? (
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-amber-500/30 transition-all flex flex-col gap-4">
            <h4 className="text-sm font-bold text-white mb-2">Government Savings Guidelines</h4>
            <div className="flex gap-3 text-xs leading-relaxed text-slate-300">
              <ShieldCheck className="text-indigo-400 shrink-0" size={18} />
              <div>
                <span className="font-bold text-white block">Offline Bond Processing</span>
                Sovereign bonds are processed through bank portals, post office units, or directly on the RBI Retail Direct platform with full paperless setups.
              </div>
            </div>
            <div className="flex gap-3 text-xs leading-relaxed text-slate-300">
              <TrendingUp className="text-emerald-400 shrink-0" size={18} />
              <div>
                <span className="font-bold text-white block">Income Tax Rules</span>
                LTCG is tax-exempt for SGBs. Other interest income is tax-subjective matching income slab files.
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {/* Primary Result Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl text-white rounded-3xl border border-white/10 shadow-lg relative overflow-hidden"
            >
              <span className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                {type === 'infl' && 'Future Cost of Lifestyle Expense'}
                {type === 'si' && 'Total Maturities value'}
                {type === 'ci' && 'Estimated Maturity Valuation (CI)'}
                {type === 'frsb' && 'Initial Bond principal return'}
                {type === 'sgb' && 'Simulated maturity weight value'}
                {type === 'ec54' && 'Deducted property sale capital'}
              </span>
              <span className="text-3xl font-black font-sans tracking-tight">
                {type === 'infl' && formatCurrency(calculation.futureCost, currencySymbol)}
                {type === 'si' && formatCurrency(calculation.maturityValue, currencySymbol)}
                {type === 'ci' && formatCurrency(calculation.maturityValue, currencySymbol)}
                {type === 'frsb' && formatCurrency(calculation.totalInvested, currencySymbol)}
                {type === 'sgb' && formatCurrency(calculation.maturityValue, currencySymbol)}
                {type === 'ec54' && formatCurrency(calculation.maturityValue, currencySymbol)}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-slate-300 mt-3 border-t border-white/10 pt-2.5">
                <HelpCircle size={11} />
                <span>
                  {type === 'infl' && `Due to inflation, inflation depreciates purchasing power value to ${formatCurrency(calculation.purchasingPowerLoss, currencySymbol)}.`}
                  {type === 'si' && `Simple interest yielded clean ${formatCurrency(calculation.interestEarned, currencySymbol)} returns.`}
                  {type === 'ci' && `Interest compounded ${params.frequency} yields ${formatCurrency(calculation.interestEarned, currencySymbol)} returns.`}
                  {type === 'frsb' && `Floating rates payout total bond interest credits of ${formatCurrency(calculation.totalInterestEarned, currencySymbol)} over 7 years.`}
                  {type === 'sgb' && `Inclusive of SGB simple annual cash interests of ${formatCurrency(calculation.totalInterestPayed, currencySymbol)} (Total: ${formatCurrency(calculation.totalYield, currencySymbol)})`}
                  {type === 'ec54' && `Deducts capital taxation with total bond yield credits of ${formatCurrency(calculation.totalInterestEarned, currencySymbol)} over 5 years.`}
                </span>
              </div>
            </motion.div>

            {/* Quick stats dual row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {type === 'infl' ? 'Original Lifestyle Rate' : 'Total principal invested'}
                </span>
                <span className="text-base font-extrabold text-white font-sans">
                  {type === 'infl' && formatCurrency(params.expense, currencySymbol)}
                  {type === 'si' && formatCurrency(calculation.totalInvested, currencySymbol)}
                  {type === 'ci' && formatCurrency(calculation.totalInvested, currencySymbol)}
                  {type === 'frsb' && formatCurrency(calculation.totalInvested, currencySymbol)}
                  {type === 'sgb' && formatCurrency(calculation.totalInvested, currencySymbol)}
                  {type === 'ec54' && formatCurrency(calculation.totalInvested, currencySymbol)}
                </span>
              </div>
              <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {type === 'infl' && 'Expense Multiplier Ratio'}
                  {type === 'si' && 'Total Simple Interest'}
                  {type === 'ci' && 'Total Compounding interest'}
                  {type === 'frsb' && 'Semi-annual cash card'}
                  {type === 'sgb' && 'Annual cash payout'}
                  {type === 'ec54' && 'Annual payout credit'}
                </span>
                <span className="text-base font-extrabold text-amber-400 font-sans">
                  {type === 'infl' && `${(calculation.futureCost / params.expense).toFixed(2)}x Expense`}
                  {type === 'si' && formatCurrency(calculation.interestEarned, currencySymbol)}
                  {type === 'ci' && formatCurrency(calculation.interestEarned, currencySymbol)}
                  {type === 'frsb' && `${formatCurrency(calculation.payoutPeriodical, currencySymbol)} / 6m`}
                  {type === 'sgb' && `${formatCurrency(calculation.annualInterestPayout, currencySymbol)} / yr`}
                  {type === 'ec54' && `${formatCurrency(calculation.payoutPeriodical, currencySymbol)} / yr`}
                </span>
              </div>
            </div>

            {/* Donut chart analysis visual */}
            {donutData.length > 0 && (
              <DonutChart
                data={donutData}
                currencySymbol={currencySymbol}
                centerLabel={type === 'frsb' || type === 'ec54' ? 'Total Payouts' : 'Future Value'}
                centerValue={type === 'frsb' || type === 'ec54' ? calculation.totalInvested + calculation.totalInterestEarned : type === 'sgb' ? calculation.totalYield : calculation.maturityValue}
              />
            )}

            {/* Saved scenarios local log hookup */}
            <SavedScenariosPanel
              currentType={type as any}
              currentInput={params}
              currentResult={calculation}
              onLoadScenario={handleLoadSaved}
              currencySymbol={currencySymbol}
            />
          </div>
        )}
      </div>
    </div>
  );
}
