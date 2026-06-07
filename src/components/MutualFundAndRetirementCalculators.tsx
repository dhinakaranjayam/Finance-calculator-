import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Landmark, TrendingUp, DollarSign, Percent, AlertCircle, HelpCircle, GraduationCap, Coins } from 'lucide-react';
import { formatCurrency } from '../utils/math';
import DonutChart from './DonutChart';
import SavedScenariosPanel from './SavedScenariosPanel';
import TopPerformanceFundsPanel from './TopPerformanceFundsPanel';

interface BaseCalculatorsProps {
  type: string;
  currencySymbol: string;
}

export default function MutualFundAndRetirementCalculators({ type, currencySymbol }: BaseCalculatorsProps) {
  const [params, setParams] = useState<any>({});

  // Reset defaults on tab change
  useEffect(() => {
    switch (type) {
      case 'swp':
        setParams({ investment: 1000000, withdrawal: 20000, rate: 10, tenure: 15 });
        break;
      case 'elss':
        setParams({ deposit: 10000, frequency: 'monthly', rate: 12 });
        break;
      case 'mf_overview':
        setParams({ investment: 10000, frequency: 'monthly', tenure: 10 });
        break;
      case 'nps':
        setParams({ monthly: 10000, expectedRate: 10, currentAge: 30, retirementAge: 60, annuityPurchased: 40 });
        break;
      case 'epf':
        setParams({ basicSalary: 30000, employeeContribution: 12, expectedHike: 6, currentAge: 30, retirementAge: 58 });
        break;
      case 'grt':
        setParams({ basicSalary: 50000, tenure: 15 });
        break;
      case 'aps':
        setParams({ entryAge: 25, targetPension: 5000 });
        break;
      case 'ups':
        setParams({ basicSalary: 60000, tenure: 25 });
        break;
      case 'sym':
        setParams({ entryAge: 25 });
        break;
      default:
        break;
    }
  }, [type]);

  const updateParam = (key: string, val: any) => {
    setParams((prev: any) => ({ ...prev, [key]: val }));
  };

  // 1. SWP math
  const calculateSWP = () => {
    const { investment = 1000000, withdrawal = 20000, rate = 10, tenure = 15 } = params;
    const r = (rate / 100) / 12;
    const months = tenure * 12;
    let balance = investment;
    let totalWithdrawn = 0;

    for (let m = 1; m <= months; m++) {
      if (balance >= withdrawal) {
        balance -= withdrawal;
        totalWithdrawn += withdrawal;
        balance = balance * (1 + r);
      } else {
        totalWithdrawn += balance;
        balance = 0;
        break;
      }
    }

    return {
      totalInvested: investment,
      totalWithdrawn,
      remainingBalance: balance,
    };
  };

  // 2. ELSS tax saving calculations
  const calculateELSS = () => {
    const { deposit = 10000, frequency = 'monthly', rate = 12 } = params;
    // ELSS has standard 3 years lock-in period
    const months = 36;
    const r = (rate / 100) / 12;
    
    let totalInvested = 0;
    let balance = 0;

    if (frequency === 'monthly') {
      for (let m = 1; m <= months; m++) {
        totalInvested += deposit;
        balance = (balance + deposit) * (1 + r);
      }
    } else {
      totalInvested = deposit;
      balance = deposit * Math.pow(1 + r * 12, 3);
    }

    // Maximum tax savings under 80C is capped at 1.5 Lakhs
    const taxDeductible = Math.min(150000, totalInvested);
    const taxSaved = taxDeductible * 0.312; // Assuming standard top slab (30% + cess)

    return {
      totalInvested,
      earnedWealth: Math.max(0, balance - totalInvested),
      maturityValue: balance,
      taxSaved,
      taxDeductible,
    };
  };

  // 3. Mutual Funds Overview math
  const calculateMFOverview = () => {
    const { investment = 10000, frequency = 'monthly', tenure = 10 } = params;
    
    const calculateGrowth = (avgRate: number) => {
      const r = (avgRate / 100) / 12;
      const months = tenure * 12;
      let total = 0;
      let balance = 0;
      
      if (frequency === 'monthly') {
        for (let m = 1; m <= months; m++) {
          total += investment;
          balance = (balance + investment) * (1 + r);
        }
      } else {
        total = investment;
        balance = investment * Math.pow(1 + avgRate / 100, tenure);
      }
      return { total, balance };
    };

    const largeCap = calculateGrowth(12);
    const midCap = calculateGrowth(15);
    const smallCap = calculateGrowth(18);
    const hybrid = calculateGrowth(10);

    return {
      largeCap,
      midCap,
      smallCap,
      hybrid,
    };
  };

  // 4. NPS (National Pension System)
  const calculateNPS = () => {
    const { monthly = 10000, expectedRate = 10, currentAge = 30, retirementAge = 60, annuityPurchased = 40 } = params;
    const activeYears = retirementAge - currentAge;
    const totalMonths = activeYears * 12;
    const r = (expectedRate / 100) / 12;

    let totalInvested = 0;
    let balance = 0;

    for (let m = 1; m <= totalMonths; m++) {
      totalInvested += monthly;
      balance = (balance + monthly) * (1 + r);
    }

    const npsAmount = balance;
    const annuityCorpus = npsAmount * (annuityPurchased / 100);
    const lumpsumWithdrawal = npsAmount - annuityCorpus;
    
    // Monthly pension assuming conservative 6% annuity rate
    const monthlyPension = (annuityCorpus * 0.06) / 12;

    return {
      totalInvested,
      accumulatedCorpus: npsAmount,
      lumpsumWithdrawal,
      annuityCorpus,
      monthlyPension,
    };
  };

  // 5. EPF (Employees Provident Fund)
  const calculateEPF = () => {
    const { basicSalary = 30000, employeeContribution = 12, expectedHike = 6, currentAge = 30, retirementAge = 58 } = params;
    const workingYears = retirementAge - currentAge;
    const epfRate = 8.15 / 100; // current standard EPF rate

    let balance = 0;
    let currentBasic = basicSalary;
    let totalInvesty = 0;

    for (let yr = 1; yr <= workingYears; yr++) {
      // Annual EPF cycle
      const employeeYearly = (currentBasic * (employeeContribution / 100)) * 12;
      // Employer contribution is 12% in total: 
      // 8.33% of Basic capped at 15000 salary goes to EPS (pension) -> max pension contribution is 1250/mo or 15000/yr
      // Remaining 3.67% of Basic (and any excess over limit) goes to EPF
      const employerEPSYearly = Math.min(15000 * 0.0833, currentBasic * 0.0833) * 12;
      const employerEPFYearly = ((currentBasic * 0.12) * 12) - employerEPSYearly;

      const yearlyAddition = employeeYearly + employerEPFYearly;
      totalInvesty += yearlyAddition;

      // Compound EPF annually at current standard rate
      balance = (balance + yearlyAddition) * (1 + epfRate);
      
      // Increment basic salary for the next year
      currentBasic = currentBasic * (1 + expectedHike / 100);
    }

    return {
      totalInvested: totalInvesty,
      maturityValue: balance,
      interestEarned: Math.max(0, balance - totalInvesty),
    };
  };

  // 6. Gratuity Scheme (GRT)
  const calculateGratuity = () => {
    const { basicSalary = 50000, tenure = 15 } = params;
    // Gratuity Limit: Max ₹20,00,000 (usually set under 2018 amendment)
    // Formula: (15 * last drawn monthly basic_salary * tenure_years) / 26
    const calculatedPay = (15 * basicSalary * tenure) / 26;
    const finalPayout = Math.min(2000000, calculatedPay);

    return {
      gratuityDue: finalPayout,
      exceedsLimit: calculatedPay > 2000000,
    };
  };

  // 7. APS (Atal Pension Scheme)
  const calculateAPS = () => {
    const { entryAge = 25, targetPension = 5000 } = params;
    // Premium rates scale up with entry age (ranges from ₹42 to ₹1454)
    // We can simulate premium rates based on historical data table
    let monthlyPremium = 226; // default fallback for target 5000 at age 25
    
    // Custom premium mappings for pension = 5,000 / month
    if (targetPension === 1000) {
      monthlyPremium = entryAge < 20 ? 42 : entryAge < 25 ? 59 : entryAge < 30 ? 84 : entryAge < 35 ? 126 : 198;
    } else if (targetPension === 2000) {
      monthlyPremium = entryAge < 20 ? 84 : entryAge < 25 ? 116 : entryAge < 30 ? 166 : entryAge < 35 ? 248 : 396;
    } else if (targetPension === 3000) {
      monthlyPremium = entryAge < 20 ? 126 : entryAge < 25 ? 174 : entryAge < 30 ? 248 : entryAge < 35 ? 372 : 594;
    } else if (targetPension === 4000) {
      monthlyPremium = entryAge < 20 ? 168 : entryAge < 25 ? 232 : entryAge < 30 ? 330 : entryAge < 35 ? 496 : 792;
    } else { // 5000
      monthlyPremium = entryAge < 20 ? 210 : entryAge < 25 ? 291 : entryAge < 30 ? 414 : entryAge < 35 ? 618 : 990;
    }

    const totalYears = 60 - entryAge;
    const totalInvested = monthlyPremium * 12 * totalYears;

    return {
      monthlyPremium,
      totalInvested,
      govermentMatch: totalInvested * 0.5, // government matches up to 50% for standard segments
    };
  };

  // 8. UPS (Unified Pension Scheme)
  const calculateUPS = () => {
    const { basicSalary = 60000, tenure = 25 } = params;
    // Assured pension is 50% of the average basic salary of the last 12 months 
    // for a minimum qualifying service of 25 years. Pro-rata for shorter service down to 10 years (minimum).
    let assuredPensionPercentage = 50;
    if (tenure < 25) {
      assuredPensionPercentage = 50 * (tenure / 25);
    }
    
    const monthlyPension = basicSalary * (assuredPensionPercentage / 100);

    return {
      assuredPensionPercentage,
      monthlyPension,
      familyPension: monthlyPension * 0.6, // Family pension is 60% of employee pension
    };
  };

  // 9. SYM (PM Shram Yogi Maan-dhan)
  const calculateSYM = () => {
    const { entryAge = 25 } = params;
    // Premium map from ₹55 to ₹200 based on age
    let monthlyPremium = 55;
    if (entryAge > 35) monthlyPremium = 200;
    else if (entryAge > 30) monthlyPremium = 150;
    else if (entryAge > 25) monthlyPremium = 100;
    else if (entryAge > 20) monthlyPremium = 80;

    const totalYears = 60 - entryAge;
    const totalInvested = monthlyPremium * 12 * totalYears;

    return {
      monthlyPremium,
      totalInvested,
      assuredPension: 3000, // Fixed pension of ₹3,000 for workers after age 60
    };
  };

  // Render variables depending on active type
  let title = 'Retirement Calculator';
  let description = 'Calculate growth indicators for security post working career.';
  let infoBox = '';
  let calculation: any = {};
  let donutData: any[] = [];

  if (type === 'swp') {
    title = 'SWP (Systematic Withdrawal Plan)';
    description = 'Plan a steady monthly payout from your mutual fund portfolio.';
    infoBox = 'SWP withdraws a fixed sum from your mutual fund monthly. Remaining corpus continues compounding on market-linked rates.';
    calculation = calculateSWP();
    donutData = [
      { label: 'Total Withdrawn Output', value: calculation.totalWithdrawn, color: '#16a34a' },
      { label: 'Remaining Capital Balance', value: calculation.remainingBalance, color: '#22c55e' },
    ];
  } else if (type === 'elss') {
    title = 'ELSS (Equity Linked Savings Scheme)';
    description = 'Diversified equity mutual funds offering tax deductions.';
    infoBox = 'ELSS carries the shortest lock-in period among Section 80C options (3 years) with historic growth index of 12-14%.';
    calculation = calculateELSS();
    donutData = [
      { label: 'Tax Deductible limit', value: calculation.taxDeductible, color: '#4d7c0f' },
      { label: 'Projected Wealth Growth', value: calculation.earnedWealth, color: '#84cc16' },
    ];
  } else if (type === 'mf_overview') {
    title = 'Mutual Funds Horizon Overview';
    description = 'Analyze simulated returns over customized horizons.';
    // Standard preview metrics
    calculation = calculateMFOverview();
    infoBox = 'Returns on mutual funds are market-linked and calculated conservatively. Past performance is not a guarantee of future returns.';
  } else if (type === 'nps') {
    title = 'NPS (National Pension System)';
    description = 'Contributory pension scheme with dual equity-debt compounding.';
    infoBox = `At age 60, you can withdraw up to 60% of the corpus tax-free, and use the remaining ${params.annuityPurchased}% for monthly pension payouts.`;
    calculation = calculateNPS();
    donutData = [
      { label: 'Annuity Pension Corpus', value: calculation.annuityCorpus, color: '#7c3aed' },
      { label: 'Tax-Free Lumpsum out', value: calculation.lumpsumWithdrawal, color: '#a78bfa' },
    ];
  } else if (type === 'epf') {
    title = 'EPF (Employees Provident Fund)';
    description = 'Mandatory retirement program for salaried professionals in India.';
    infoBox = 'Compounded annually at current interest of 8.15% with complete tax exemption on withdrawal and interest components.';
    calculation = calculateEPF();
    donutData = [
      { label: 'Principal Accumulated', value: calculation.totalInvested, color: '#6d28d9' },
      { label: 'EPF Compounded Interest', value: calculation.interestEarned, color: '#8b5cf6' },
    ];
  } else if (type === 'grt') {
    title = 'Gratuity Scheme Calculator';
    description = 'Calculate standard corporate gratuity payoffs after exit.';
    infoBox = 'Gratuity is a statutory credit paid to employees who complete 5 or more years of uninterrupted service.';
    calculation = calculateGratuity();
  } else if (type === 'aps') {
    title = 'APS (Atal Pension Scheme)';
    description = 'Micro-pension guarantee system for citizens of vulnerable sectors.';
    infoBox = 'Government provides guaranteed minimum pension. Premium contributions are completed until age 60.';
    calculation = calculateAPS();
  } else if (type === 'ups') {
    title = 'UPS (Unified Pension Scheme)';
    description = 'Newly announced system offering assured pensions to public employees.';
    infoBox = 'Offers guaranteed pension at 50% of the average basic salary of last 12 months for 25yrs of qualifying service.';
    calculation = calculateUPS();
  } else if (type === 'sym') {
    title = 'PM Shram Yogi Maan-dhan (SYM)';
    description = 'Voluntary pension program for workers in unorganized industries.';
    infoBox = 'Assured pension of ₹3,000 given to standard registrants beyond age 60. Insured by LIC of India.';
    calculation = calculateSYM();
  }

  const handleLoadSaved = (scInput: any) => {
    if (scInput) {
      setParams(scInput);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Parameters */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <h3 className="font-bold text-white text-base">{title}</h3>
              <p className="text-xs text-slate-400 mt-1">{description}</p>
            </div>
            <TrendingUp className="text-emerald-400 shrink-0" size={24} />
          </div>

          {/* Conditional Inputs */}
          {params.investment !== undefined && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-slate-350">Initial Portfolio Corpus</label>
                <div className="flex items-center gap-1.5 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                  <span className="text-xs text-emerald-300 font-bold">{currencySymbol}</span>
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
                min={10000}
                max={10000000}
                step={10000}
                value={params.investment}
                onChange={(e) => updateParam('investment', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                <span>{formatCurrency(10000, currencySymbol)}</span>
                <span>{formatCurrency(5000000, currencySymbol)}</span>
                <span>{formatCurrency(10000000, currencySymbol)}</span>
              </div>
            </div>
          )}

          {params.withdrawal !== undefined && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-slate-350">Monthly SWP Withdrawal</label>
                <div className="flex items-center gap-1.5 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                  <span className="text-xs text-emerald-300 font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    value={params.withdrawal}
                    onChange={(e) => updateParam('withdrawal', Math.max(0, Number(e.target.value)))}
                    className="w-24 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                  />
                </div>
              </div>
              <input
                type="range"
                min={1000}
                max={200000}
                step={1000}
                value={params.withdrawal}
                onChange={(e) => updateParam('withdrawal', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                <span>{formatCurrency(1000, currencySymbol)}</span>
                <span>{formatCurrency(100000, currencySymbol)}</span>
                <span>{formatCurrency(200000, currencySymbol)}</span>
              </div>
            </div>
          )}

          {params.monthly !== undefined && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-slate-350">Monthly NPS Investment</label>
                <div className="flex items-center gap-1.5 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                  <span className="text-xs text-emerald-300 font-bold">{currencySymbol}</span>
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
                min={500}
                max={150000}
                step={500}
                value={params.monthly}
                onChange={(e) => updateParam('monthly', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                <span>{formatCurrency(500, currencySymbol)}</span>
                <span>{formatCurrency(75000, currencySymbol)}</span>
                <span>{formatCurrency(150000, currencySymbol)}</span>
              </div>
            </div>
          )}

          {params.deposit !== undefined && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-slate-350">
                  {params.frequency === 'monthly' ? 'Monthly SIP Amount' : 'Lumpsum Investment'}
                </label>
                <div className="flex items-center gap-1.5 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                  <span className="text-xs text-emerald-300 font-bold">{currencySymbol}</span>
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
                min={500}
                max={200000}
                step={500}
                value={params.deposit}
                onChange={(e) => updateParam('deposit', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                <span>{formatCurrency(500, currencySymbol)}</span>
                <span>{formatCurrency(100000, currencySymbol)}</span>
                <span>{formatCurrency(200000, currencySymbol)}</span>
              </div>
            </div>
          )}

          {params.basicSalary !== undefined && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-slate-350">Basic monthly Salary + DA</label>
                <div className="flex items-center gap-1.5 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                  <span className="text-xs text-emerald-300 font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    value={params.basicSalary}
                    onChange={(e) => updateParam('basicSalary', Math.max(0, Number(e.target.value)))}
                    className="w-24 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                  />
                </div>
              </div>
              <input
                type="range"
                min={10000}
                max={500000}
                step={1000}
                value={params.basicSalary}
                onChange={(e) => updateParam('basicSalary', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                <span>{formatCurrency(10000, currencySymbol)}</span>
                <span>{formatCurrency(250000, currencySymbol)}</span>
                <span>{formatCurrency(500000, currencySymbol)}</span>
              </div>
            </div>
          )}

          {params.rate !== undefined && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-slate-355">Expected Return rate (p.a.)</label>
                <div className="flex items-center gap-1 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                  <input
                    type="number"
                    step="0.1"
                    value={params.rate}
                    onChange={(e) => updateParam('rate', Math.max(0, Number(e.target.value)))}
                    className="w-14 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                  />
                  <span className="text-xs text-slate-400 font-semibold">%</span>
                </div>
              </div>
              <input
                type="range"
                min={5}
                max={22}
                step={0.1}
                value={params.rate}
                onChange={(e) => updateParam('rate', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                <span>5%</span>
                <span>12%</span>
                <span>22%</span>
              </div>
            </div>
          )}

          {params.expectedRate !== undefined && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-slate-355">Average expected return rate (p.a.)</label>
                <div className="flex items-center gap-1 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                  <input
                    type="number"
                    step="0.1"
                    value={params.expectedRate}
                    onChange={(e) => updateParam('expectedRate', Math.max(0, Number(e.target.value)))}
                    className="w-14 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                  />
                  <span className="text-xs text-slate-400 font-semibold">%</span>
                </div>
              </div>
              <input
                type="range"
                min={5}
                max={15}
                step={0.1}
                value={params.expectedRate}
                onChange={(e) => updateParam('expectedRate', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                <span>5%</span>
                <span>10%</span>
                <span>15%</span>
              </div>
            </div>
          )}

          {/* Slices of years / age / annuity */}
          {params.currentAge !== undefined && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-slate-355">Current Age</span>
                <input
                  type="number"
                  value={params.currentAge}
                  onChange={(e) => updateParam('currentAge', Math.min(60, Math.max(18, Number(e.target.value))))}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-100 font-semibold text-xs text-center focus:outline-hidden"
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-slate-355">Retirement Age</span>
                <input
                  type="number"
                  value={params.retirementAge}
                  onChange={(e) => updateParam('retirementAge', Math.min(80, Math.max(50, Number(e.target.value))))}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-100 font-semibold text-xs text-center focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {params.annuityPurchased !== undefined && (
            <div className="flex flex-col gap-2 leading-none">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-slate-350">Annuity Purchase ratio</label>
                <span className="text-xs font-bold text-emerald-300 font-sans">{params.annuityPurchased}%</span>
              </div>
              <input
                type="range"
                min={40}
                max={100}
                step={5}
                value={params.annuityPurchased}
                onChange={(e) => updateParam('annuityPurchased', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                <span>40% (Min threshold)</span>
                <span>70%</span>
                <span>100% (Full pension)</span>
              </div>
            </div>
          )}

          {params.expectedHike !== undefined && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between justify-items-center text-sm">
                <label className="font-semibold text-slate-350">Expected annual salary hike</label>
                <span className="text-xs font-bold text-emerald-300 font-sans">{params.expectedHike}% / yr</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={params.expectedHike}
                onChange={(e) => updateParam('expectedHike', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
              />
            </div>
          )}

          {params.tenure !== undefined && type === 'grt' && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-slate-355">Total Qualification service (Years)</label>
                <span className="text-xs font-bold text-emerald-300 font-sans">{params.tenure} Years</span>
              </div>
              <input
                type="range"
                min={5}
                max={45}
                step={1}
                value={params.tenure}
                onChange={(e) => updateParam('tenure', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
              />
            </div>
          )}

          {params.tenure !== undefined && type === 'ups' && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-slate-355">Total Qualifying service (Years)</label>
                <span className="text-xs font-bold text-emerald-300 font-sans">{params.tenure} Years</span>
              </div>
              <input
                type="range"
                min={10}
                max={40}
                step={1}
                value={params.tenure}
                onChange={(e) => updateParam('tenure', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
              />
            </div>
          )}

          {params.entryAge !== undefined && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-slate-355">Current entrance age</label>
                <span className="text-xs font-bold text-emerald-300 font-sans">{params.entryAge} years old</span>
              </div>
              <input
                type="range"
                min={18}
                max={40}
                step={1}
                value={params.entryAge}
                onChange={(e) => updateParam('entryAge', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                <span>18 Years (Min)</span>
                <span>30 Years</span>
                <span>40 Years (Max Limit)</span>
              </div>
            </div>
          )}

          {params.targetPension !== undefined && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-355">Requested Guaranteed Monthly Pension</span>
              <div className="grid grid-cols-5 gap-1.5">
                {[1000, 2000, 3000, 4000, 5000].map((pe) => (
                  <button
                    key={pe}
                    onClick={() => updateParam('targetPension', pe)}
                    className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition-all text-center cursor-pointer ${
                      params.targetPension === pe
                        ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-xs'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {formatCurrency(pe, currencySymbol)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Info Alert */}
          {infoBox && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-slate-300 flex gap-3 text-xs leading-relaxed">
              <AlertCircle size={18} className="text-emerald-450 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">Scheme Information</span>
                {infoBox}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Column */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Dynamic Result Sheets depends on component */}
        {type === 'mf_overview' ? (
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-white border-b border-white/10 pb-2">Multi-Fund Projection Projections</h4>
            {[
              { label: 'Hybrid Schemes (Conservative)', rate: 10, data: calculation.hybrid },
              { label: 'Large Cap Schemes (Standard)', rate: 12, data: calculation.largeCap },
              { label: 'Mid Cap Schemes (Robust)', rate: 15, data: calculation.midCap },
              { label: 'Small Cap Schemes (High Growth)', rate: 18, data: calculation.smallCap },
            ].map((fu, idx) => (
              <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-white">{fu.label}</span>
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-bold px-1.5 py-0.2 rounded font-sans">@{fu.rate}% avg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400">Yield Valuation:</span>
                  <span className="text-sm font-black text-emerald-300 font-sans">{formatCurrency(fu.data.balance, currencySymbol)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {/* Primary output card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl text-white rounded-3xl border border-white/10 shadow-lg relative overflow-hidden"
            >
              <span className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                {type === 'swp' && 'Corpus Balance at End Period'}
                {type === 'elss' && 'Accumulated ELSS Maturity'}
                {type === 'nps' && 'Accumulated Pension Corpus (M)'}
                {type === 'epf' && 'Retirement EPF Corpus maturity'}
                {type === 'grt' && 'Statutory Gratuity payoff'}
                {type === 'aps' && 'Guaranteed Pension / month'}
                {type === 'ups' && 'Assured Pension starting monthly'}
                {type === 'sym' && 'Guaranteed Pension monthly'}
              </span>
              <span className="text-3xl font-black font-sans tracking-tight">
                {type === 'swp' && formatCurrency(calculation.remainingBalance, currencySymbol)}
                {type === 'elss' && formatCurrency(calculation.maturityValue, currencySymbol)}
                {type === 'nps' && formatCurrency(calculation.accumulatedCorpus, currencySymbol)}
                {type === 'epf' && formatCurrency(calculation.maturityValue, currencySymbol)}
                {type === 'grt' && formatCurrency(calculation.gratuityDue, currencySymbol)}
                {type === 'aps' && formatCurrency(params.targetPension, currencySymbol)}
                {type === 'ups' && formatCurrency(calculation.monthlyPension, currencySymbol)}
                {type === 'sym' && formatCurrency(calculation.assuredPension, currencySymbol)}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-slate-300 mt-3 border-t border-white/10 pt-2.5">
                <Coins size={11} />
                <span>
                  {type === 'elss' && `Includes an estimated ₹${calculation.taxSaved.toLocaleString()} saved in income tax deductions!`}
                  {type === 'nps' && `Splits into both cash out values and monthly payouts.`}
                  {type === 'epf' && 'Calculated at EPF p.a. compound cycle interest credit.'}
                  {type === 'swp' && `Withdrew a collective massive sum of ${formatCurrency(calculation.totalWithdrawn, currencySymbol)} across the period.`}
                  {type === 'grt' && `Calculated using standard regulatory India formulas.`}
                  {type === 'aps' && `Requires monthly premiums of ${formatCurrency(calculation.monthlyPremium, currencySymbol)} till age 60.`}
                  {type === 'ups' && `Assured family pension is set at ${formatCurrency(calculation.familyPension, currencySymbol)} / mo.`}
                  {type === 'sym' && `Requires monthly contributions of ${formatCurrency(calculation.monthlyPremium, currencySymbol)} till age 60.`}
                </span>
              </div>
            </motion.div>

            {/* Quick Stats Dual Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {type === 'swp' ? 'Total Initial Corpus' : 'Total Contributions'}
                </span>
                <span className="text-base font-extrabold text-white font-sans">
                  {type === 'swp' && formatCurrency(calculation.totalInvested, currencySymbol)}
                  {type === 'elss' && formatCurrency(calculation.totalInvested, currencySymbol)}
                  {type === 'nps' && formatCurrency(calculation.totalInvested, currencySymbol)}
                  {type === 'epf' && formatCurrency(calculation.totalInvested, currencySymbol)}
                  {type === 'grt' && formatCurrency(params.basicSalary, currencySymbol)}
                  {type === 'aps' && formatCurrency(calculation.totalInvested, currencySymbol)}
                  {type === 'ups' && `${calculation.assuredPensionPercentage}% of salary`}
                  {type === 'sym' && formatCurrency(calculation.totalInvested, currencySymbol)}
                </span>
              </div>
              <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {type === 'swp' && 'Total SWP Cash Paid'}
                  {type === 'elss' && 'Wealth Multiplier Gain'}
                  {type === 'nps' && 'Annuity monthly pension'}
                  {type === 'epf' && 'Compounded Interest out'}
                  {type === 'grt' && 'Years Service placed'}
                  {type === 'aps' && 'Monthly premium due'}
                  {type === 'ups' && 'Family Pension'}
                  {type === 'sym' && 'Monthly Contribution'}
                </span>
                <span className="text-base font-extrabold text-emerald-400 font-sans">
                  {type === 'swp' && formatCurrency(calculation.totalWithdrawn, currencySymbol)}
                  {type === 'elss' && formatCurrency(calculation.earnedWealth, currencySymbol)}
                  {type === 'nps' && `${formatCurrency(calculation.monthlyPension, currencySymbol)} / mo`}
                  {type === 'epf' && formatCurrency(calculation.interestEarned, currencySymbol)}
                  {type === 'grt' && `${params.tenure} Years`}
                  {type === 'aps' && formatCurrency(calculation.monthlyPremium, currencySymbol)}
                  {type === 'ups' && formatCurrency(calculation.familyPension, currencySymbol)}
                  {type === 'sym' && formatCurrency(calculation.monthlyPremium, currencySymbol)}
                </span>
              </div>
            </div>

            {/* Third detailed row for NPS Annuity/Lumpsum breakdown */}
            {type === 'nps' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    60% Cash Lumpsum (Tax Free)
                  </span>
                  <span className="text-sm font-extrabold text-white font-sans">
                    {formatCurrency(calculation.lumpsumWithdrawal, currencySymbol)}
                  </span>
                </div>
                <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    40% Pension Annuity Corpus
                  </span>
                  <span className="text-sm font-extrabold text-violet-300 font-sans">
                    {formatCurrency(calculation.annuityCorpus, currencySymbol)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Circular Donut split */}
        {donutData.length > 0 && (
          <DonutChart
            data={donutData}
            currencySymbol={currencySymbol}
            centerLabel={type === 'swp' ? 'Total Payout' : 'Future Value'}
            centerValue={type === 'swp' ? calculation.totalWithdrawn + calculation.remainingBalance : type === 'nps' ? calculation.accumulatedCorpus : calculation.maturityValue}
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

      {/* Top Performance Mutual Funds Database catalog shown when under mutual category */}
      {['mf_overview', 'elss', 'swp'].includes(type) && (
        <div className="lg:col-span-12 mt-4">
          <TopPerformanceFundsPanel />
        </div>
      )}
    </div>
  );
}
