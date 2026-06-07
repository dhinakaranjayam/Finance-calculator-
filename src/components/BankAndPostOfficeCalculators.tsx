import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Landmark, TrendingUp, DollarSign, Calendar, AlertCircle, HelpCircle, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../utils/math';
import DonutChart from './DonutChart';
import SavedScenariosPanel from './SavedScenariosPanel';

interface BaseCalculatorsProps {
  type: string;
  currencySymbol: string;
}

export default function BankAndPostOfficeCalculators({ type, currencySymbol }: BaseCalculatorsProps) {
  // Common states that get customized by component
  const [params, setParams] = useState<any>({});
  
  // Set default parameters on type change
  useEffect(() => {
    switch (type) {
      case 'ppf':
        setParams({ deposit: 50000, frequency: 'annual', rate: 7.1, tenure: 15 });
        break;
      case 'ssa':
        setParams({ deposit: 50000, age: 5, rate: 8.2 });
        break;
      case 'scss':
        setParams({ investment: 100000, rate: 8.2 });
        break;
      case 'kvp':
        setParams({ investment: 50000 });
        break;
      case 'mis':
        setParams({ investment: 100000, rate: 7.4 });
        break;
      case 'nsc':
        setParams({ investment: 50000, rate: 7.7 });
        break;
      case 'td_po':
        setParams({ investment: 50000, tenure: 5 });
        break;
      case 'rd':
      case 'rd_po':
        setParams({ monthly: 5000, rate: type === 'rd_po' ? 6.7 : 7.0, tenure: 5 });
        break;
      default:
        break;
    }
  }, [type]);

  const updateParam = (key: string, val: any) => {
    setParams((prev: any) => ({ ...prev, [key]: val }));
  };

  // 1. PPF math
  const calculatePPF = () => {
    const { deposit = 50000, rate = 7.1, tenure = 15 } = params;
    const r = rate / 100;
    let totalInvested = 0;
    let balance = 0;
    let interestEarned = 0;

    for (let yr = 1; yr <= tenure; yr++) {
      totalInvested += deposit;
      // PPF receives compounding annually at the end of the year
      balance = (balance + deposit) * (1 + r);
    }
    interestEarned = Math.max(0, balance - totalInvested);

    return {
      totalInvested,
      interestEarned,
      maturityValue: balance,
    };
  };

  // 2. SSA (Sukanya Samriddhi) math
  const calculateSSA = () => {
    const { deposit = 50000, rate = 8.2 } = params;
    const r = rate / 100;
    let totalInvested = 0;
    let balance = 0;

    // SSA contribution period is 15 years, account matures in 21 years (6 more years compounding without deposit)
    for (let yr = 1; yr <= 21; yr++) {
      if (yr <= 15) {
        totalInvested += deposit;
        balance = (balance + deposit) * (1 + r);
      } else {
        balance = balance * (1 + r);
      }
    }
    const interestEarned = Math.max(0, balance - totalInvested);

    return {
      totalInvested,
      interestEarned,
      maturityValue: balance,
    };
  };

  // 3. SCSS math
  const calculateSCSS = () => {
    const { investment = 100000, rate = 8.2 } = params;
    const quarterlyRate = (rate / 100) / 4;
    const quarterlyPayout = investment * quarterlyRate;
    const totalDeductionPayout = quarterlyPayout * 4 * 5; // 5 years

    return {
      totalInvested: investment,
      payoutPeriodical: quarterlyPayout,
      totalInterestEarned: totalDeductionPayout,
      maturityValue: investment,
    };
  };

  // 4. KVP math
  const calculateKVP = () => {
    const { investment = 50000 } = params;
    // Guaranteed double in 115 months (7.5% p.a.)
    return {
      totalInvested: investment,
      interestEarned: investment,
      maturityValue: investment * 2,
      months: 115,
    };
  };

  // 5. MIS math
  const calculateMIS = () => {
    const { investment = 100000, rate = 7.4 } = params;
    const monthlyRate = (rate / 100) / 12;
    const monthlyPayout = investment * monthlyRate;
    const totalPayout = monthlyPayout * 12 * 5; // 5 years

    return {
      totalInvested: investment,
      payoutPeriodical: monthlyPayout,
      totalInterestEarned: totalPayout,
      maturityValue: investment,
    };
  };

  // 6. NSC math
  const calculateNSC = () => {
    const { investment = 50000, rate = 7.7 } = params;
    const r = rate / 100;
    // Interest compounded annually, maturity in 5 years
    const maturityValue = investment * Math.pow(1 + r, 5);
    const interestEarned = maturityValue - investment;

    return {
      totalInvested: investment,
      interestEarned,
      maturityValue,
    };
  };

  // 7. TD post office math
  const calculateTD = () => {
    const { investment = 50000, tenure = 5 } = params;
    // Post office Time Deposit interest rate for 2024-2026: 
    // 1yr=6.9%, 2yr=7.0%, 3yr=7.1%, 5yr=7.5%
    let rate = 7.5;
    if (tenure === 1) rate = 6.9;
    else if (tenure === 2) rate = 7.0;
    else if (tenure === 3) rate = 7.1;

    const r = rate / 100;
    // Compounded quarterly
    const maturityValue = investment * Math.pow(1 + r / 4, 4 * tenure);
    const interestEarned = maturityValue - investment;

    return {
      rate,
      totalInvested: investment,
      interestEarned,
      maturityValue,
    };
  };

  // 8. RD (Recurring Deposit) math
  const calculateRD = () => {
    const { monthly = 5000, rate = 6.7, tenure = 5 } = params;
    const quarters = tenure * 4;
    const monthlyInterest = (rate / 100) / 12;
    let balance = 0;
    let totalInvested = 0;

    // We do month-by-month compounding. 
    // RD interest compounded quarterly in India. Let's simulate month-by-month:
    // Interest is calculated on monthly balances and added to principal at the end of each quarter.
    let quarterAccumulatedInterest = 0;
    for (let month = 1; month <= tenure * 12; month++) {
      totalInvested += monthly;
      balance += monthly;
      // Calculate interest on current balance for 1 month
      const monthInterest = balance * monthlyInterest;
      quarterAccumulatedInterest += monthInterest;

      // At end of each quarter, compound the interest
      if (month % 3 === 0) {
        balance += quarterAccumulatedInterest;
        quarterAccumulatedInterest = 0;
      }
    }
    // Add remaining interest if any
    balance += quarterAccumulatedInterest;
    const interestEarned = Math.max(0, balance - totalInvested);

    return {
      totalInvested,
      interestEarned,
      maturityValue: balance,
    };
  };

  // Render variables depending on active type
  let title = 'Financial Scheme';
  let description = 'Calculate secure returns based on standard Indian financial schemes.';
  let infoBox = '';
  let calculation: any = { totalInvested: 0, interestEarned: 0, maturityValue: 0 };
  let donutData: any[] = [];

  if (type === 'ppf') {
    title = 'PPF (Public Provident Fund)';
    description = 'State-backed long-term compounding tax-free savings scheme.';
    infoBox = 'PPF has a mandatory 15-year lock-in period and provides EEE tax status. Interest is compounded annually.';
    calculation = calculatePPF();
    donutData = [
      { label: 'Invested Amount', value: calculation.totalInvested, color: '#1e3a8a' },
      { label: 'Compounded Interest', value: calculation.interestEarned, color: '#3b82f6' },
    ];
  } else if (type === 'ssa') {
    title = 'SSA (Sukanya Samriddhi Account)';
    description = 'Dedicated savings scheme for the girl child under "Beti Bachao Beti Padhao".';
    infoBox = 'Deposits allowed up to 15 years. Compounded annually. Scheme matures after 21 years from account registration.';
    calculation = calculateSSA();
    donutData = [
      { label: 'Incuraded Principal', value: calculation.totalInvested, color: '#4c1d95' },
      { label: 'Cumulative Interest', value: calculation.interestEarned, color: '#8b5cf6' },
    ];
  } else if (type === 'scss') {
    title = 'SCSS (Senior Citizens Savings Scheme)';
    description = 'Secure income preservation scheme for senior citizens aged 60 and above.';
    infoBox = 'Quarterly interest is directly credited to depositor. Lock-in period is 5 years.';
    calculation = calculateSCSS();
    donutData = [
      { label: 'Locked Capital', value: calculation.totalInvested, color: '#115e59' },
      { label: 'Total Interest Payout', value: calculation.totalInterestEarned, color: '#14b8a6' },
    ];
  } else if (type === 'kvp') {
    title = 'KVP (Kisan Vikas Patra)';
    description = 'Direct certificate-based scheme that doubles your money over a fixed period.';
    infoBox = 'Your investment doubles with 100% sovereign guarantee. Current maturity period is set at 115 months.';
    calculation = calculateKVP();
    donutData = [
      { label: 'Initial Principal', value: calculation.totalInvested, color: '#78350f' },
      { label: 'Guaranteed Growth', value: calculation.interestEarned, color: '#f59e0b' },
    ];
  } else if (type === 'mis') {
    title = 'MIS (Monthly Income Scheme)';
    description = 'Post Office scheme providing a steady interest inflow monthly.';
    infoBox = 'Provides monthly interest payout with capital safety. Max single deposit: ₹9 Lakhs; Joint: ₹15 Lakhs.';
    calculation = calculateMIS();
    donutData = [
      { label: 'Locked Deposits', value: calculation.totalInvested, color: '#9f1239' },
      { label: 'Monthly Interest Flow', value: calculation.totalInterestEarned, color: '#f43f5e' },
    ];
  } else if (type === 'nsc') {
    title = 'NSC (National Savings Certificate)';
    description = 'Secure tax-saving investment with 5-year lock-in with sovereign backing.';
    infoBox = 'Interest is compounded annually but paid collectively at maturity. Eligible for Sec 80C deductions.';
    calculation = calculateNSC();
    donutData = [
      { label: 'Total Placed Capital', value: calculation.totalInvested, color: '#27272a' },
      { label: 'Compounded Yield', value: calculation.interestEarned, color: '#a1a1aa' },
    ];
  } else if (type === 'td_po') {
    title = 'TD (Post Office Time Deposit)';
    description = 'Government term deposits with fixed returns compounded quarterly.';
    infoBox = `Calculated at tenure-specific rate of ${calculateTD().rate}% compounded quarterly. Eligible for 80C only for 5-yr TD.`;
    calculation = calculateTD();
    donutData = [
      { label: 'Deposit Principal', value: calculation.totalInvested, color: '#1e293b' },
      { label: 'Quarterly Composed Interest', value: calculation.interestEarned, color: '#64748b' },
    ];
  } else if (type === 'rd' || type === 'rd_po') {
    title = type === 'rd_po' ? 'Post Office Recurring Deposit (RD)' : 'RD (Recurring Deposit)';
    description = 'Build custom wealth incrementally through systematic monthly contributions.';
    infoBox = 'Allows systematic monthly deposits to earn premium interest. Interest compounded quarterly.';
    calculation = calculateRD();
    donutData = [
      { label: 'Accumulated Monthly Deposits', value: calculation.totalInvested, color: '#1f2937' },
      { label: 'Compounded Interest', value: calculation.interestEarned, color: '#9ca3af' },
    ];
  }

  // Handle Loading of Scenario local load
  const handleLoadSaved = (scInput: any) => {
    if (scInput) {
      setParams(scInput);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Parameters Panel */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <h3 className="font-bold text-white text-base">{title}</h3>
              <p className="text-xs text-slate-400 mt-1">{description}</p>
            </div>
            <Landmark className="text-indigo-400 shrink-0" size={24} />
          </div>

          {/* Conditional Inputs Block depends on parameters */}
          {params.deposit !== undefined && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-slate-350">
                  {type === 'ppf' || type === 'ssa' ? 'Annual Contribution' : 'Deposit Amount'}
                </label>
                <div className="flex items-center gap-1.5 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                  <span className="text-xs text-indigo-300 font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    value={params.deposit}
                    onChange={(e) => updateParam('deposit', Math.max(0, Number(e.target.value)))}
                    className="w-24 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                  />
                </div>
              </div>
              <input
                type="range"
                min={type === 'ssa' ? 1000 : 500}
                max={150000}
                step={500}
                value={params.deposit}
                onChange={(e) => updateParam('deposit', Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                <span>{formatCurrency(type === 'ssa' ? 1000 : 500, currencySymbol)}</span>
                <span>{formatCurrency(75000, currencySymbol)}</span>
                <span>{formatCurrency(150000, currencySymbol)} (Max Limit)</span>
              </div>
            </div>
          )}

          {params.investment !== undefined && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-slate-350">Lumpsum Investment</label>
                <div className="flex items-center gap-1.5 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                  <span className="text-xs text-indigo-300 font-bold">{currencySymbol}</span>
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
                max={type === 'scss' ? 3000000 : type === 'mis' ? 900000 : 1500000}
                step={1000}
                value={params.investment}
                onChange={(e) => updateParam('investment', Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                <span>{formatCurrency(1000, currencySymbol)}</span>
                <span>
                  {formatCurrency((type === 'scss' ? 3000000 : type === 'mis' ? 900000 : 1500000) / 2, currencySymbol)}
                </span>
                <span>
                  {formatCurrency(type === 'scss' ? 3000000 : type === 'mis' ? 900000 : 1500000, currencySymbol)}
                </span>
              </div>
            </div>
          )}

          {params.monthly !== undefined && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-slate-350">Monthly RD Investment</label>
                <div className="flex items-center gap-1.5 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                  <span className="text-xs text-indigo-300 font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    value={params.monthly}
                    onChange={(e) => updateParam('monthly', Math.max(0, Number(e.target.value)))}
                    className="w-24 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                  />
                </div>
              </div>
              <input
                type="range"
                min={100}
                max={150000}
                step={500}
                value={params.monthly}
                onChange={(e) => updateParam('monthly', Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                <span>{formatCurrency(100, currencySymbol)}</span>
                <span>{formatCurrency(75000, currencySymbol)}</span>
                <span>{formatCurrency(150000, currencySymbol)}</span>
              </div>
            </div>
          )}

          {params.rate !== undefined && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-slate-350">Scheme Rate of Interest (p.a.)</label>
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
                min={3}
                max={12}
                step={0.05}
                value={params.rate}
                onChange={(e) => updateParam('rate', Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                <span>3%</span>
                <span>7.5%</span>
                <span>12%</span>
              </div>
            </div>
          )}

          {/* Special parameters */}
          {params.age !== undefined && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-slate-350">Girl Child Current Age</label>
                <span className="text-xs font-bold text-indigo-300 font-sans">{params.age} Years Old</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={params.age}
                onChange={(e) => updateParam('age', Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                <span>1 Year</span>
                <span>5 Years</span>
                <span>10 Years (Max Entry)</span>
              </div>
            </div>
          )}

          {params.tenure !== undefined && type === 'td_po' && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Time Deposit Tenure</span>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 5].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => updateParam('tenure', yr)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer ${
                      params.tenure === yr
                        ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-xs'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {yr} Year{yr > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {params.tenure !== undefined && type !== 'td_po' && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-slate-350">Lock-in Period (Tenure)</label>
                <span className="text-xs font-bold text-indigo-300 font-sans">{params.tenure} Years</span>
              </div>
              <input
                type="range"
                min={5}
                max={25}
                step={5}
                value={params.tenure}
                onChange={(e) => updateParam('tenure', Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                <span>5 Years</span>
                <span>15 Years (Standard)</span>
                <span>25 Years</span>
              </div>
            </div>
          )}

          {/* Descriptive alert info box */}
          {infoBox && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-slate-300 flex gap-3 text-xs leading-relaxed">
              <AlertCircle size={18} className="text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">Scheme Regulations</span>
                {infoBox}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Column */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4">
          {/* Main Return Maturity */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 backdrop-blur-xl text-white rounded-3xl border border-white/10 shadow-lg relative overflow-hidden"
          >
            <span className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
              {type === 'scss' || type === 'mis' ? 'Direct Principal Preserved' : 'Estimated Maturity Valuation'}
            </span>
            <span className="text-3xl font-black font-sans tracking-tight">
              {formatCurrency(calculation.maturityValue, currencySymbol)}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-slate-300 mt-3 border-t border-white/10 pt-2.5">
              <HelpCircle size={11} />
              <span>
                {type === 'scss' || type === 'mis' 
                  ? 'Principal completely preserved & returned at end of 5 years.' 
                  : 'Based on the specified annual or monthly compounding schedule.'}
              </span>
            </div>
          </motion.div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Total Placed Principal
              </span>
              <span className="text-base font-extrabold text-white font-sans">
                {formatCurrency(calculation.totalInvested, currencySymbol)}
              </span>
            </div>
            <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {type === 'scss' || type === 'mis' ? 'Periodic Payout Rec' : 'Interest Earned'}
              </span>
              <span className="text-base font-extrabold text-emerald-400 font-sans">
                {type === 'scss' || type === 'mis'
                  ? `${formatCurrency(calculation.payoutPeriodical, currencySymbol)} / ${type === 'scss' ? 'Qtr' : 'Mo'}`
                  : formatCurrency(calculation.interestEarned, currencySymbol)}
              </span>
            </div>
          </div>
          
          {/* Third stat row for periodical payouts total interest income */}
          {(type === 'scss' || type === 'mis') && (
            <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Total Periodic Interests Credit Received (over 5 years)
              </span>
              <span className="text-lg font-black text-amber-300 font-sans">
                {formatCurrency(calculation.totalInterestEarned, currencySymbol)}
              </span>
            </div>
          )}
        </div>

        {/* Circular Donut split */}
        {donutData.length > 0 && (
          <DonutChart
            data={donutData}
            currencySymbol={currencySymbol}
            centerLabel={type === 'scss' || type === 'mis' ? 'Total Payouts' : 'Maturity Amount'}
            centerValue={type === 'scss' || type === 'mis' ? calculation.totalInvested + calculation.totalInterestEarned : calculation.maturityValue}
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
    </div>
  );
}
