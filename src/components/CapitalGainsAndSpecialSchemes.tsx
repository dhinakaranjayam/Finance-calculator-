import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Scale, ShieldCheck, Heart, Landmark, Info, Sparkles, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/math';
import DonutChart from './DonutChart';
import SavedScenariosPanel from './SavedScenariosPanel';

interface BaseCalculatorsProps {
  type: string;
  currencySymbol: string;
}

export default function CapitalGainsAndSpecialSchemes({ type, currencySymbol }: BaseCalculatorsProps) {
  const [params, setParams] = useState<any>({});

  // Reset defaults on type change
  useEffect(() => {
    switch (type) {
      case 'cgt':
        setParams({ assetType: 'equity', purchasePrice: 500000, salePrice: 800050, holdingYears: 2 });
        break;
      case 'pli':
      case 'rpli':
        setParams({ sumAssured: 500000, age: 30, tenure: 20 });
        break;
      case 'jjb':
      case 'sb':
        setParams({});
        break;
      case 'mssc':
        setParams({ investment: 150000 });
        break;
      case 'vvs':
        setParams({ investment: 1000000 });
        break;
      default:
        break;
    }
  }, [type]);

  const updateParam = (key: string, val: any) => {
    setParams((prev: any) => ({ ...prev, [key]: val }));
  };

  // 1. Capital Gains Tax (CGT) math - following 2024-2026 Indian tax guidelines
  const calculateCGT = () => {
    const { assetType = 'equity', purchasePrice = 500000, salePrice = 800050, holdingYears = 2 } = params;
    const gain = Math.max(0, salePrice - purchasePrice);
    
    let isLongTerm = false;
    let taxRate = 0;
    let taxAmount = 0;
    let comments = '';

    if (assetType === 'equity') {
      isLongTerm = holdingYears >= 1; // Equity LTCG threshold: 1 year
      if (isLongTerm) {
        taxRate = 12.5; // Budget 2024 revised equity LTCG flat rate
        // LTCG is tax-exempt up to ₹1.25 Lakhs cumulatively annually
        const taxableGain = Math.max(0, gain - 125000);
        taxAmount = taxableGain * (taxRate / 100);
        comments = 'LTCG on listed equity >= 1yr holding is taxed at 12.5% on gains exceeding ₹1.25 Lakh exemption limit.';
      } else {
        taxRate = 20.0; // Equity STCG flat rate
        taxAmount = gain * (taxRate / 100);
        comments = 'STCG on listed equity <= 1yr holding is taxed at a flat rate of 20%. No exemptions apply.';
      }
    } else if (assetType === 'real_estate') {
      isLongTerm = holdingYears >= 2; // Real Estate LTCG threshold: 2 years
      if (isLongTerm) {
        taxRate = 12.5; // budget revised flat property LTCG rate (prev was 20% with indexation)
        taxAmount = gain * (taxRate / 100);
        comments = 'LTCG on property held for >= 2yrs is taxed at 12.5% flat without indexation benefits in the latest budget.';
      } else {
        taxRate = 30.0; // STCG is added to user slab. Assuming highest standard 30% slab rate
        taxAmount = gain * (taxRate / 100);
        comments = 'STCG on property <= 2yrs holding is added to income under standard slab tax rates.';
      }
    } else { // Standard Debt / Gold
      isLongTerm = holdingYears >= 3; // Gold standard LTCG: 3 years
      if (isLongTerm) {
        taxRate = 12.5; // budget revised gold LTCG flat rate
        taxAmount = gain * (taxRate / 100);
        comments = 'LTCG on physical gold held for >= 3yrs is taxed flatly at 12.5% in the revised budget.';
      } else {
        taxRate = 30.0; // STCG is added to slab. Assuming 30% standard
        taxAmount = gain * (taxRate / 100);
        comments = 'STCG on physical gold / debt held <= 3yrs is taxable under the user’s income tax slab rates.';
      }
    }

    return {
      capitalGain: gain,
      isLongTerm,
      taxRate,
      taxAmount,
      postTaxGain: gain - taxAmount,
      comments,
    };
  };

  // 2. Postal Life Insurances bonus and maturity calculations
  const calculatePLI = () => {
    const { sumAssured = 500000, age = 30, tenure = 20 } = params;
    // PLI standard bonus rate matches Government records: 
    // PLI Endowment: ₹52 per ₹1,000 Sum Assured per year. 
    // RPLI Endowment: ₹48 per ₹1,000 Sum Assured per year.
    const isRPLI = type === 'rpli';
    const bonusPerThousand = isRPLI ? 48 : 52;
    
    const annualBonus = (sumAssured / 1000) * bonusPerThousand;
    const totalBonusAccumulated = annualBonus * tenure;
    const finalMaturity = sumAssured + totalBonusAccumulated;

    // Approximate monthly premiums based on typical post department tables
    const monthlyPremium = (sumAssured / (tenure * 12)) * (1 + (age / 185));

    return {
      totalInvested: monthlyPremium * 12 * tenure,
      monthlyPremium,
      totalBonusAccumulated,
      maturityValue: finalMaturity,
    };
  };

  // 3. Mahila Samman Savings Certificate (MSSC) math
  const calculateMSSC = () => {
    const { investment = 150000 } = params;
    // MSSC limits: capped at ₹2,00,000 maximum. 2-year tenure.
    // Interest rate is 7.5% compounded quarterly.
    const activeInvestment = Math.min(200000, investment);
    const progressVal = activeInvestment * Math.pow(1 + 0.075 / 4, 4 * 2);
    const interestEarned = progressVal - activeInvestment;

    return {
      totalInvested: activeInvestment,
      interestEarned,
      maturityValue: progressVal,
    };
  };

  // 4. PM Vaya Vandhana Scheme (VVS) math
  const calculateVVS = () => {
    const { investment = 1000000 } = params;
    // VVS limits: Up to 15,00,000. Closed since March 31, 2023, but showing rate at 7.4%
    const rate = 7.4;
    const monthlyPension = (investment * (rate / 100)) / 12;

    return {
      totalInvested: investment,
      monthlyPension,
      yearlyPayout: monthlyPension * 12,
      maturityValue: investment, // capital preserved
    };
  };

  // 5. General Scheme Rates lookup listings
  const getInterestRatesList = () => {
    if (type === 'bank_rates') {
      return [
        { bank: 'State Bank of India (SBI)', fd: '6.80% - 7.10%', rd: '6.80% - 7.00%', senior: '+0.50% extra' },
        { bank: 'HDFC Bank', fd: '7.10% - 7.35%', rd: '7.00% - 7.20%', senior: '+0.50% to +0.75%' },
        { bank: 'ICICI Bank', fd: '7.00% - 7.25%', rd: '6.90% - 7.10%', senior: '+0.50% to +0.80%' },
        { bank: 'Bank of Baroda', fd: '6.85% - 7.15%', rd: '6.50% - 6.80%', senior: '+0.50% to +0.65%' },
        { bank: 'Punjab National Bank (PNB)', fd: '6.75% - 7.25%', rd: '6.75% - 7.00%', senior: '+0.50% to +0.75%' },
      ];
    } else { // POST OFFICE RATES
      return [
        { scheme: 'Public Provident Fund (PPF)', rate: '7.10% p.a.', compounding: 'Annually', tax: 'EEE (Tax Exempt)' },
        { scheme: 'Sukanya Samriddhi (SSA)', rate: '8.20% p.a.', compounding: 'Annually', tax: 'EEE (Tax Exempt)' },
        { scheme: 'Senior Citizens (SCSS)', rate: '8.20% p.a.', compounding: 'Quarterly Payout', tax: 'Tax-deductible Sec 80C' },
        { scheme: 'Kisan Vikas Patra (KVP)', rate: '7.50% p.a.', compounding: 'Doubles in 115 mo', tax: 'Taxable on Maturity' },
        { scheme: 'Monthly Income Scheme (MIS)', rate: '7.40% p.a.', compounding: 'Monthly Payout', tax: 'Interest Taxable' },
        { scheme: 'National Savings Cert (NSC)', rate: '7.70% p.a.', compounding: 'At Maturity', tax: 'Eligible Sec 80C' },
        { scheme: 'PO Time Deposit (5 Year)', rate: '7.50% p.a.', compounding: 'Quarterly', tax: 'Eligible Sec 80C' },
        { scheme: 'PO Recurring Deposit (5 Yr)', rate: '6.70% p.a.', compounding: 'Quarterly', tax: 'Interest Taxable' },
      ];
    }
  };

  // Compute variables depending on active type
  let title = 'Scheme Sheet';
  let description = 'Interactive details and projections based on current Indian guidelines.';
  let infoBox = '';
  let calculation: any = {};
  let donutData: any[] = [];

  if (type === 'cgt') {
    title = 'Capital Gains Tax (CGT)';
    description = 'Calculate long-term or short-term taxes upon asset sales.';
    infoBox = 'Taxes are assessed based on Holding period rules. Gold, Securities, and Properties have custom lock-in timelines.';
    calculation = calculateCGT();
    donutData = [
      { label: 'Post-Tax Gains', value: calculation.postTaxGain, color: '#312e81' },
      { label: 'Estimated Tax Due', value: calculation.taxAmount, color: '#f43f5e' },
    ];
  } else if (type === 'pli' || type === 'rpli') {
    title = type === 'pli' ? 'Postal Life Insurance (PLI)' : 'Rural Postal Life Insurance (RPLI)';
    description = 'High bonus endowment assurance designs backed by the postal department.';
    infoBox = `PLI is open to government/semi-gov professionals with RPLI targeting individuals in rural locations. Massive standard yearly bonuses apply.`;
    calculation = calculatePLI();
    donutData = [
      { label: 'Assured Principal Sum', value: params.sumAssured || 500000, color: '#047857' },
      { label: 'Department Accumulated Bonus', value: calculation.totalBonusAccumulated, color: '#10b981' },
    ];
  } else if (type === 'jjb') {
    title = 'PM Jeevan Jyoti Bima Yojana (PMJJBY)';
    description = 'Highly subsidized life insurance scheme of the Government of India.';
    infoBox = 'Provides ₹2,00,000 life insurance cover for death due to any reason. Premium stands flatly at ₹436 annually.';
  } else if (type === 'sb') {
    title = 'PM Suraksha Bima Yojana (PMSBY)';
    description = 'Accident insurance coverage program offering micro premiums.';
    infoBox = 'Provides accident coverage up to ₹2,00,000 for death/disability. Premium is flat at ₹20 annually.';
  } else if (type === 'mssc') {
    title = 'Mahila Samman Savings Certificate (MSSC)';
    description = 'Custom 2-year savings system for women launched in Budget 2023.';
    infoBox = 'Fixed 7.5% quarterly interest rate, completely risk-free. Max investment limit: ₹2,00,000.';
    calculation = calculateMSSC();
    donutData = [
      { label: 'Placed Savings', value: calculation.totalInvested, color: '#4c1d95' },
      { label: 'Compounded Interest', value: calculation.interestEarned, color: '#ec4899' },
    ];
  } else if (type === 'vvs') {
    title = 'PM Vaya Vandhana Scheme (PMVVS)';
    description = 'Senior Citizen pension scheme launched in 2017 (now retired).';
    infoBox = 'Retired since March 31, 2023. Promised senior citizens an assured 7.4% p.a. monthly annuity pension for 10 years.';
    calculation = calculateVVS();
    donutData = [
      { label: 'Locked Deposit Capital', value: calculation.totalInvested, color: '#1e293b' },
      { label: 'Estimated Annuity Yields', value: calculation.yearlyPayout * 10, color: '#818cf8' },
    ];
  }

  // Handle Load local saved scenario
  const handleLoadSaved = (scInput: any) => {
    if (scInput) {
      setParams(scInput);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Parameters Panel */}
      <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-6">
        {type === 'bank_rates' || type === 'po_rates' ? (
          <div className="p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg flex flex-col gap-6">
            <h3 className="font-bold text-white text-base">
              {type === 'bank_rates' ? 'Leading Indian Bank Interest Rates (2025/2026)' : 'Post Office Small Savings Schemes (FY 2025-26)'}
            </h3>
            <p className="text-xs text-slate-400">
              {type === 'bank_rates' 
                ? 'Indicative annual interest rates on fixed deposits and recurring deposits across major commercial banking institutions.' 
                : 'Highest sovereign backed interest rates on various direct deposit formats offered by India Post.'}
            </p>

            <div className="flex flex-col gap-3">
              {getInterestRatesList().map((item: any, idx) => (
                <div key={idx} className="p-3.5 bg-white/5 border border-white/5 hover:border-indigo-500/20 transition-all rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0">
                      <Landmark size={18} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{item.bank || item.scheme}</span>
                      {item.senior && <span className="text-[10px] text-indigo-300 font-semibold">{item.senior}</span>}
                      {item.compounding && <span className="text-[10px] text-slate-400 block">{item.compounding} Compounding • {item.tax}</span>}
                    </div>
                  </div>
                  <div className="text-right md:self-center">
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      {item.fd ? `FD: ${item.fd}` : item.rate}
                    </span>
                    {item.rd && <span className="block text-[10px] text-slate-400">RD: {item.rd}</span>}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 flex gap-2.5 text-xs">
              <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
              <span>Rates listed are illustrative and subject to policy updates. Consult official authorities before processing actual investment accounts.</span>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-white border-white/5 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">{title}</h3>
                <p className="text-xs text-slate-400 mt-1">{description}</p>
              </div>
              <Scale className="text-indigo-400 shrink-0" size={24} />
            </div>

            {/* Inputs Block */}
            {params.assetType !== undefined && (
              <div className="flex flex-col gap-5">
                {/* Asset Choice */}
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Select Asset Classification</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'equity', name: 'Equity/Securities' },
                    { id: 'real_estate', name: 'Property/Real Estate' },
                    { id: 'gold', name: 'Gold / Debt' },
                  ].map((as) => (
                    <button
                      key={as.id}
                      onClick={() => updateParam('assetType', as.id)}
                      className={`py-2 px-3 text-2xs sm:text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer ${
                        params.assetType === as.id
                          ? 'border-indigo-500 bg-indigo-500/20 text-white'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {as.name}
                    </button>
                  ))}
                </div>

                {/* Purchase Price */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <label className="font-semibold text-slate-355">Original Buy/Purchase Price</label>
                    <div className="flex items-center gap-1.5 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                      <span className="text-xs text-indigo-300 font-bold">{currencySymbol}</span>
                      <input
                        type="number"
                        value={params.purchasePrice}
                        onChange={(e) => updateParam('purchasePrice', Math.max(0, Number(e.target.value)))}
                        className="w-24 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={10000000}
                    step={5000}
                    value={params.purchasePrice}
                    onChange={(e) => updateParam('purchasePrice', Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
                  />
                </div>

                {/* Sell Price */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <label className="font-semibold text-slate-350">Final Selling Resale Price</label>
                    <div className="flex items-center gap-1.5 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                      <span className="text-xs text-indigo-300 font-bold">{currencySymbol}</span>
                      <input
                        type="number"
                        value={params.salePrice}
                        onChange={(e) => updateParam('salePrice', Math.max(0, Number(e.target.value)))}
                        className="w-24 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={20000000}
                    step={5000}
                    value={params.salePrice}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateParam('salePrice', val);
                    }}
                    className="w-full accent-indigo-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
                  />
                </div>

                {/* Holding Timeline */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <label className="font-semibold text-slate-355">Holding Period timeline</label>
                    <span className="text-xs font-bold text-indigo-300 font-sans">{params.holdingYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    step={1}
                    value={params.holdingYears}
                    onChange={(e) => updateParam('holdingYears', Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
                  />
                </div>
              </div>
            )}

            {params.sumAssured !== undefined && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <label className="font-semibold text-slate-355">Insurance Sum Assured (Coverage)</label>
                    <div className="flex items-center gap-1.5 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                      <span className="text-xs text-indigo-300 font-bold">{currencySymbol}</span>
                      <input
                        type="number"
                        value={params.sumAssured}
                        onChange={(e) => updateParam('sumAssured', Math.max(10000, Number(e.target.value)))}
                        className="w-24 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={5000000}
                    step={10000}
                    value={params.sumAssured}
                    onChange={(e) => updateParam('sumAssured', Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-350">Proposer Age</span>
                    <input
                      type="number"
                      value={params.age}
                      onChange={(e) => updateParam('age', Math.max(19, Math.min(55, Number(e.target.value))))}
                      className="p-2 bg-white/5 border border-white/10 text-white font-bold text-xs rounded-xl focus:outline-hidden text-center"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-350">Maturity Tenure (Yrs)</span>
                    <input
                      type="number"
                      value={params.tenure}
                      onChange={(e) => updateParam('tenure', Math.max(5, Math.min(40, Number(e.target.value))))}
                      className="p-2 bg-white/5 border border-white/10 text-white font-bold text-xs rounded-xl focus:outline-hidden text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {params.investment !== undefined && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <label className="font-semibold text-slate-355">Investment Deposit principal</label>
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
                  max={type === 'mssc' ? 200000 : 1500000}
                  step={1000}
                  value={params.investment}
                  onChange={(e) => updateParam('investment', Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                  <span>{formatCurrency(1000, currencySymbol)}</span>
                  <span>{formatCurrency((type === 'mssc' ? 200000 : 1500000) / 2, currencySymbol)}</span>
                  <span>{formatCurrency(type === 'mssc' ? 200000 : 1500000, currencySymbol)}{type === 'mssc' ? ' (Max limit)' : ''}</span>
                </div>
              </div>
            )}

            {/* Educational Criteria for sub-sub insurance programs */}
            {(type === 'jjb' || type === 'sb') && (
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Heart className="text-rose-400" size={16} />
                  Program Criteria Summary
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <span className="font-bold text-white block mb-1">Target Age limit</span>
                    <span className="text-slate-400 block">{type === 'jjb' ? '18 to 50 years old (Premium payments till age 55)' : '18 to 70 years old (Premium auto debited)'}</span>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <span className="font-bold text-white block mb-1">Processing Setup</span>
                    <span className="text-slate-400 block">Requires auto-debit consent on your registered savings account. Managed by leading commercial banks.</span>
                  </div>
                </div>
              </div>
            )}

            {infoBox && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-slate-300 flex gap-3 text-xs leading-relaxed">
                <AlertCircle size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">Specifications Rule</span>
                  {infoBox}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Panel */}
      {type !== 'bank_rates' && type !== 'po_rates' && (
        <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Main Return Maturity */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 backdrop-blur-xl text-white rounded-3xl border border-white/10 shadow-lg relative overflow-hidden"
            >
              <span className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
                {type === 'cgt' && 'Estimated Capital Gains tax due'}
                {(type === 'pli' || type === 'rpli') && 'Department Guaranteed Maturity'}
                {type === 'jjb' && 'Life Insurance Cover sum assured'}
                {type === 'sb' && 'Accident Cover sum assured'}
                {type === 'mssc' && 'Estimated MSSC maturity returns'}
                {type === 'vvs' && 'Preserved Capital at maturity'}
              </span>
              <span className="text-3xl font-black font-sans tracking-tight text-white">
                {type === 'cgt' && formatCurrency(calculation.taxAmount, currencySymbol)}
                {(type === 'pli' || type === 'rpli') && formatCurrency(calculation.maturityValue, currencySymbol)}
                {type === 'jjb' && formatCurrency(200000, currencySymbol)}
                {type === 'sb' && formatCurrency(200000, currencySymbol)}
                {type === 'mssc' && formatCurrency(calculation.maturityValue, currencySymbol)}
                {type === 'vvs' && formatCurrency(calculation.maturityValue, currencySymbol)}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-slate-300 mt-3 border-t border-white/10 pt-2.5">
                <Info size={11} />
                <span>
                  {type === 'cgt' && calculation.comments}
                  {(type === 'pli' || type === 'rpli') && 'Includes accumulated department guaranteed bonuses.'}
                  {type === 'jjb' && 'Annual premium of only ₹436/year charged. Subject to bank auto debit rules.'}
                  {type === 'sb' && 'Annual premium of only ₹20/year charged. Subject to auto debit rules.'}
                  {type === 'mssc' && 'Based on fixed 7.5% compounded quarterly for standard tenure of 2 years'}
                  {type === 'vvs' && `Provides a steady senior pension annuity payout of ${formatCurrency(calculation.monthlyPension, currencySymbol)} / month.`}
                </span>
              </div>
            </motion.div>

            {/* Quick Stats Dual Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {type === 'cgt' && 'Gross Capitals Gain'}
                  {(type === 'pli' || type === 'rpli') && 'Collective Premium paid'}
                  {type === 'jjb' && 'Premium Cost'}
                  {type === 'sb' && 'Premium Cost'}
                  {type === 'mssc' && 'Deposited capital'}
                  {type === 'vvs' && 'Annuity Rate'}
                </span>
                <span className="text-base font-extrabold text-white font-sans">
                  {type === 'cgt' && formatCurrency(calculation.capitalGain, currencySymbol)}
                  {(type === 'pli' || type === 'rpli') && formatCurrency(calculation.totalInvested, currencySymbol)}
                  {type === 'jjb' && `${formatCurrency(436, currencySymbol)} / yr`}
                  {type === 'sb' && `${formatCurrency(20, currencySymbol)} / yr`}
                  {type === 'mssc' && formatCurrency(calculation.totalInvested, currencySymbol)}
                  {type === 'vvs' && '7.40% p.a.'}
                </span>
              </div>
              <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {type === 'cgt' && 'Post-Tax Net Gains'}
                  {(type === 'pli' || type === 'rpli') && 'Monthly Plan Premium'}
                  {type === 'jjb' && 'Processing Status'}
                  {type === 'sb' && 'Processing Status'}
                  {type === 'mssc' && 'Composed interest earned'}
                  {type === 'vvs' && 'Monthly Pension'}
                </span>
                <span className="text-base font-extrabold text-emerald-400 font-sans">
                  {type === 'cgt' && formatCurrency(calculation.postTaxGain, currencySymbol)}
                  {(type === 'pli' || type === 'rpli') && `${formatCurrency(calculation.monthlyPremium, currencySymbol)} / mo`}
                  {type === 'jjb' && 'Active scheme'}
                  {type === 'sb' && 'Active scheme'}
                  {type === 'mssc' && formatCurrency(calculation.interestEarned, currencySymbol)}
                  {type === 'vvs' && formatCurrency(calculation.monthlyPension, currencySymbol)}
                </span>
              </div>
            </div>
          </div>

          {/* Donut split chart logic */}
          {donutData.length > 0 && (
            <DonutChart
              data={donutData}
              currencySymbol={currencySymbol}
              centerLabel={type === 'cgt' ? 'Gains Breakdown' : 'Lock-in returns'}
              centerValue={type === 'cgt' ? calculation.capitalGain : type === 'vvs' ? calculation.maturityValue + (calculation.yearlyPayout * 10) : calculation.maturityValue}
            />
          )}

          {/* Saved scenarios local log hookup */}
          {type !== 'jjb' && type !== 'sb' && (
            <SavedScenariosPanel
              currentType={type as any}
              currentInput={params}
              currentResult={calculation}
              onLoadScenario={handleLoadSaved}
              currencySymbol={currencySymbol}
            />
          )}
        </div>
      )}
    </div>
  );
}
