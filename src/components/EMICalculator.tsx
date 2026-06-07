import { useState, useEffect, useRef } from 'react';
import { EMIOptions, EMIResult } from '../types';
import { calculateEMI, formatCurrency } from '../utils/math';
import DonutChart from './DonutChart';
import AmortizationSchedule from './AmortizationSchedule';
import SavedScenariosPanel from './SavedScenariosPanel';
import { Info, HelpCircle, DollarSign, RefreshCw, Share2, MoreVertical, Wifi, Battery, Signal, Smartphone, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';

interface EMICalculatorProps {
  currencySymbol: string;
  isAdvancedMode?: boolean;
}

export default function EMICalculator({ currencySymbol, isAdvancedMode = false }: EMICalculatorProps) {
  // Input states defaulting to the exact screenshot values for immediate agreement
  const [principal, setPrincipal] = useState<number>(1200000);
  const [rate, setRate] = useState<number>(11.4);
  const [tenure, setTenure] = useState<number>(5);
  const [tenureType, setTenureType] = useState<'years' | 'months'>('years');
  const [viewMode, setViewMode] = useState<'easy_emi' | 'professional'>('easy_emi');
  const [showSchedule, setShowSchedule] = useState<boolean>(false);
  const scheduleRef = useRef<HTMLDivElement>(null);

  const [result, setResult] = useState<EMIResult>({
    monthlyPayment: 0,
    totalInterest: 0,
    totalAmount: 0,
    amortizationSchedule: [],
  });

  // Re-calculate synchronously when inputs alter
  useEffect(() => {
    const emiResult = calculateEMI({
      principal,
      rate,
      tenure,
      tenureType,
    });
    setResult(emiResult);
  }, [principal, rate, tenure, tenureType]);

  // Load configuration from scenarios panel
  const handleLoadScenario = (savedInput: EMIOptions) => {
    setPrincipal(savedInput.principal);
    setRate(savedInput.rate);
    setTenure(savedInput.tenure);
    setTenureType(savedInput.tenureType);
  };

  const handleReset = () => {
    setPrincipal(1200000);
    setRate(11.40);
    setTenure(5);
    setTenureType('years');
    setShowSchedule(false);
  };

  const currentInput = { principal, rate, tenure, tenureType };

  // Calculate Effective Flat Rates
  const tenureInYears = tenureType === 'years' ? tenure : tenure / 12;
  const effectiveRatePa = tenureInYears > 0 ? (result.totalInterest / principal) / tenureInYears * 100 : 0;
  // Screenshot is floored to 2 decimal places to get 0.52% from 0.5275%
  const effectiveRatePm = Math.floor((effectiveRatePa / 12) * 100) / 100;

  const formattedEmi = formatCurrency(result.monthlyPayment, currencySymbol);
  const formattedInterest = formatCurrency(result.totalInterest, currencySymbol);
  const formattedTotal = formatCurrency(result.totalAmount, currencySymbol);
  const formattedRatePa = effectiveRatePa.toFixed(2) + '%';
  const formattedRatePm = effectiveRatePm.toFixed(2) + '%';

  // Smooth scroll to schedule when expanded
  useEffect(() => {
    if (showSchedule && scheduleRef.current) {
      scheduleRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showSchedule]);

  return (
    <div className="flex flex-col gap-6">
      {/* Layout Mode Selector Selector Header */}
      <div className="flex items-center justify-between bg-white/5 border border-white/15 rounded-2xl p-2 max-w-md">
        <span className="text-xs font-bold text-slate-300 pl-3">Layout Style:</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => setViewMode('easy_emi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              viewMode === 'easy_emi'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone size={13} />
            Easy EMI View
          </button>
          <button
            onClick={() => setViewMode('professional')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              viewMode === 'professional'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid size={13} />
            Professional Bento
          </button>
        </div>
      </div>

      {viewMode === 'easy_emi' ? (
        /* ================= PREMIUM EASY EMI BENTO GRID ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {/* Bento Box 1: Inputs Grid */}
          <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-slate-800/90 p-6 flex flex-col justify-between shadow-xl group transition-all duration-300 hover:border-slate-700/50">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-widest font-mono">Loan Parameters</span>
                <button 
                  onClick={handleReset} 
                  className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800/40 transition-colors"
                  title="Reset inputs to default values"
                >
                  <RefreshCw size={13} />
                </button>
              </div>

              <div className="flex flex-col gap-5">
                {/* 1. Loan Amount input & slider combo */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="easy-loan-principal" className="text-xs font-bold text-slate-400">Loan Principal</label>
                    <div className="flex items-center gap-1.5 border border-slate-850 bg-slate-950/40 rounded-lg px-2.5 py-1">
                      <span className="text-[11px] font-bold text-slate-500">{currencySymbol}</span>
                      <input
                        id="easy-loan-principal-input"
                        type="number"
                        value={principal}
                        onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                        className="w-20 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <input
                    id="easy-loan-principal"
                    type="range"
                    min={1000}
                    max={10000000}
                    step={1000}
                    value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))}
                    className="w-full cursor-ew-resize"
                  />
                </div>

                {/* 2. Rate input & slider combo */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="easy-loan-rate" className="text-xs font-bold text-slate-400">Interest Rate (p.a.)</label>
                    <div className="flex items-center gap-1 border border-slate-850 bg-slate-950/40 rounded-lg px-2.5 py-1">
                      <input
                        id="easy-loan-rate-input"
                        type="number"
                        step="0.01"
                        value={rate}
                        onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
                        className="w-12 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                      />
                      <span className="text-[11px] font-semibold text-slate-500">%</span>
                    </div>
                  </div>
                  <input
                    id="easy-loan-rate"
                    type="range"
                    min={1}
                    max={30}
                    step={0.1}
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full cursor-ew-resize"
                  />
                </div>

                {/* 3. Tenure input with embedded Unit Toggle */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="easy-loan-tenure" className="text-xs font-bold text-slate-400">Tenure</label>
                    <div className="flex items-center gap-2">
                      <div className="flex bg-slate-950/50 p-0.5 rounded-lg border border-slate-850 text-[10px] font-bold">
                        <button
                          onClick={() => {
                            if (tenureType === 'months') {
                              setTenure(Math.ceil(tenure / 12));
                            }
                            setTenureType('years');
                          }}
                          className={`py-0.5 px-2 rounded-md transition-all cursor-pointer ${
                            tenureType === 'years' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Yr
                        </button>
                        <button
                          onClick={() => {
                            if (tenureType === 'years') {
                              setTenure(tenure * 12);
                            }
                            setTenureType('months');
                          }}
                          className={`py-0.5 px-2 rounded-md transition-all cursor-pointer ${
                            tenureType === 'months' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Mo
                        </button>
                      </div>

                      <div className="flex items-center gap-1 border border-slate-850 bg-slate-950/40 rounded-lg px-2.5 py-1">
                        <input
                          id="easy-loan-tenure-input"
                          type="number"
                          value={tenure}
                          onChange={(e) => setTenure(Math.max(1, Number(e.target.value)))}
                          className="w-10 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                  <input
                    id="easy-loan-tenure"
                    type="range"
                    min={1}
                    max={tenureType === 'years' ? 30 : 360}
                    step={1}
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-full cursor-ew-resize"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="w-full mt-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex justify-center items-center gap-2 border border-slate-750/30"
            >
              {showSchedule ? 'Collapse Monthly Table' : 'Create Amortization Chart'}
            </button>
          </div>

          {/* Bento Box 2: Centered Installment Details (Hero Card) */}
          <div className="bg-gradient-to-b from-slate-950/40 to-slate-900/40 backdrop-blur-2xl rounded-2xl border border-indigo-500/20 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group transition-all duration-300 hover:border-indigo-500/35">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none"></div>
            
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-widest font-mono font-bold">CALCULATED OUTPUT</span>
                <span className="bg-indigo-500/10 text-indigo-400 text-[9px] px-2 py-0.5 rounded-md font-mono border border-indigo-500/15 font-bold">
                  REDUCING RATE
                </span>
              </div>

              <div className="flex flex-col items-center justify-center text-center py-6">
                <span className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest pl-1">
                  LOAN EMI IS
                </span>
                <motion.span 
                  key={formattedEmi}
                  initial={{ scale: 0.95, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl font-black text-white font-sans tracking-tight leading-none text-center"
                >
                  {formattedEmi}
                </motion.span>
                <span className="text-[10px] text-slate-500 font-medium max-w-[200px] leading-normal text-center mt-3">
                  Applied reduction basis of {rate}% per annum
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 border-t border-slate-800/80 pt-5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-400">Total Interest Paid</span>
                <span className="font-bold text-[#f43f5e] font-sans">{formattedInterest}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-850/60 pt-2.5">
                <span className="font-semibold text-slate-400">Total Amount Paid</span>
                <span className="font-bold text-white font-sans">{formattedTotal}</span>
              </div>
            </div>
          </div>

          {/* Bento Box 3: Technical Metrics & Quick Scenarios combo */}
          <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-slate-800/90 p-6 flex flex-col justify-between shadow-xl group transition-all duration-300 hover:border-slate-700/50 lg:col-span-1 md:col-span-2">
            <div>
              <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-widest block mb-4 font-mono">EFFECTIVE FLAT CALIBRATION</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/40 border border-slate-850/80 rounded-xl p-3.5 flex flex-col gap-1 transition-all hover:bg-slate-900/10">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Rate p.a.</span>
                  <span className="text-base font-extrabold text-slate-200">{formattedRatePa}</span>
                </div>
                <div className="bg-slate-950/40 border border-slate-850/80 rounded-xl p-3.5 flex flex-col gap-1 transition-all hover:bg-slate-900/10">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Rate p.m.</span>
                  <span className="text-base font-extrabold text-slate-200">{formattedRatePm}</span>
                </div>
              </div>

              <div className="mt-5 p-3.5 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-slate-400">
                <p className="text-[11px] leading-relaxed flex items-start gap-2">
                  <Info size={13} className="text-indigo-400 mt-0.5 shrink-0" />
                  <span>
                    The continuous monthly calculations assume reducing principal balance tracking over the customized tenure of <strong>{tenure} {tenureType}</strong>.
                  </span>
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-4 mt-4">
              <SavedScenariosPanel
                currentType="emi"
                currentInput={currentInput}
                currentResult={result}
                onLoadScenario={handleLoadScenario}
                currencySymbol={currencySymbol}
              />
            </div>
          </div>
        </div>
      ) : (
        /* ================= PROFESSIONAL DASHBOARD VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inputs block */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="font-bold text-white text-base">Loan Configuration</h3>
                <span className="text-xs text-slate-400 font-medium">Fine-tune specifications</span>
              </div>

              {/* 1. Loan Amount */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <label htmlFor="emi-principal" className="font-semibold text-slate-350">Loan Principal</label>
                  <div className="flex items-center gap-1.5 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                    <span className="text-xs text-indigo-300 font-bold">{currencySymbol}</span>
                    <input
                      id="emi-principal-input"
                      type="number"
                      value={principal}
                      onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                      className="w-24 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                    />
                  </div>
                </div>
                <input
                  id="emi-principal"
                  type="range"
                  min={1000}
                  max={10000000}
                  step={1000}
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                  <span>{formatCurrency(1000, currencySymbol)}</span>
                  <span>{formatCurrency(5000000, currencySymbol)}</span>
                  <span>{formatCurrency(10000000, currencySymbol)}</span>
                </div>
              </div>

              {/* 2. Interest Rate */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <label htmlFor="emi-rate" className="font-semibold text-slate-350">Interest Rate (p.a.)</label>
                  <div className="flex items-center gap-1 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                    <input
                      id="emi-rate-input"
                      type="number"
                      step="0.01"
                      value={rate}
                      onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
                      className="w-14 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                    />
                    <span className="text-xs text-slate-400 font-semibold">%</span>
                  </div>
                </div>
                <input
                  id="emi-rate"
                  type="range"
                  min={1}
                  max={30}
                  step={0.1}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                  <span>1%</span>
                  <span>15%</span>
                  <span>30%</span>
                </div>
              </div>

              {/* 3. Tenure */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <label htmlFor="emi-tenure" className="font-semibold text-slate-350">Loan Tenure</label>
                  
                  <div className="flex items-center gap-2">
                    {/* Tenure Dual Input Toggle */}
                    <div className="flex border border-white/10 rounded-lg overflow-hidden text-xs font-semibold p-0.5 bg-white/5">
                      <button
                        onClick={() => {
                          if (tenureType === 'months') {
                            setTenure(Math.ceil(tenure / 12));
                          }
                          setTenureType('years');
                        }}
                        className={`px-2.5 py-0.5 rounded-md transition-colors cursor-pointer ${tenureType === 'years' ? 'bg-indigo-500 text-white' : 'text-slate-450 hover:text-white'}`}
                      >
                        Yr
                      </button>
                      <button
                        onClick={() => {
                          if (tenureType === 'years') {
                            setTenure(tenure * 12);
                          }
                          setTenureType('months');
                        }}
                        className={`px-2.5 py-0.5 rounded-md transition-colors cursor-pointer ${tenureType === 'months' ? 'bg-indigo-500 text-white' : 'text-slate-450 hover:text-white'}`}
                      >
                        Mo
                      </button>
                    </div>

                    <div className="flex items-center gap-1 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                      <input
                        id="emi-tenure-input"
                        type="number"
                        value={tenure}
                        onChange={(e) => setTenure(Math.max(1, Number(e.target.value)))}
                        className="w-12 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{tenureType}</span>
                    </div>
                  </div>
                </div>
                
                <input
                  id="emi-tenure"
                  type="range"
                  min={1}
                  max={tenureType === 'years' ? 30 : 360}
                  step={1}
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                  <span>{tenureType === 'years' ? '1 Year' : '1 Month'}</span>
                  <span>{tenureType === 'years' ? '15 Years' : '180 Months'}</span>
                  <span>{tenureType === 'years' ? '30 Years' : '360 Months'}</span>
                </div>
              </div>
            </div>

            {/* General instructions block */}
            <div className="p-5 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg text-slate-300">
              <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-1.5">
                <Info size={15} className="text-indigo-400" />
                Comprehensive Dashboard Details
              </h4>
              <p className="text-xs leading-relaxed">
                Standard monthly reducing balance formulas are calibrated for flat and monthly parameters.
                Toggle views above to verify the output visual structure of the mobile screenshot.
              </p>
            </div>
          </div>

          {/* Results visualizer column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Statistics highlights */}
            <div className="grid grid-cols-1 gap-4">
              {/* Monthly EMI Result */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-xl text-white rounded-3xl border border-white/10 shadow-lg relative overflow-hidden"
              >
                <div className="absolute right-[-10px] top-[-10px] opacity-10">
                  <DollarSign size={80} />
                </div>
                <span className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
                  Monthly Installment (EMI)
                </span>
                <span className="text-3xl font-black font-sans tracking-tight">
                  {formattedEmi}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-slate-300 mt-3 border-t border-white/10 pt-2.5">
                  <Info size={11} />
                  <span>Calculated based on standard monthly reducing balance rate</span>
                </div>
              </motion.div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Loan Principal
                  </span>
                  <span className="text-base font-extrabold text-white font-sans">
                    {formatCurrency(principal, currencySymbol)}
                  </span>
                </div>
                <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Interest Payable
                  </span>
                  <span className="text-base font-extrabold text-[#f43f5e] font-sans">
                    {formattedInterest}
                  </span>
                </div>
              </div>

              {/* Effective Rate Indicators (Row panel aligned like screenshots) */}
              <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
                  <span>Effective Rate p.a.</span>
                  <span className="text-sm font-bold text-white font-sans">{formattedRatePa}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 font-semibold border-t border-white/5 pt-2">
                  <span>Effective Rate p.m.</span>
                  <span className="text-sm font-bold text-white font-sans">{formattedRatePm}</span>
                </div>
              </div>
            </div>

            {/* Donut Chart representation */}
            <DonutChart
              data={[
                { label: 'Principal Loan Amount', value: principal, color: '#6366f1' },
                { label: 'Total Interest Paid', value: result.totalInterest, color: '#f43f5e' },
              ]}
              currencySymbol={currencySymbol}
              centerLabel="Total Payable"
              centerValue={result.totalAmount}
            />

            {/* AMORTIZATION COLLAPSE Toggle in Pro view */}
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md transition-all active:scale-99 cursor-pointer"
            >
              {showSchedule ? 'Hide Monthly Schedule' : 'View Monthly Amortization Schedule'}
            </button>

            {/* Save scenarios side element */}
            <SavedScenariosPanel
              currentType="emi"
              currentInput={currentInput}
              currentResult={result}
              onLoadScenario={handleLoadScenario}
              currencySymbol={currencySymbol}
            />
          </div>
        </div>
      )}

      {/* Amortization Schedule Table container with scroll focal point */}
      {showSchedule && result.amortizationSchedule.length > 0 && (
        <div ref={scheduleRef} className="mt-4">
          <AmortizationSchedule
            schedule={result.amortizationSchedule}
            currencySymbol={currencySymbol}
          />
        </div>
      )}
    </div>
  );
}
