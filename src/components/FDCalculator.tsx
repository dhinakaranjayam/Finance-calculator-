import { useState, useEffect } from 'react';
import { FDOptions, FDResult } from '../types';
import { calculateFD, formatCurrency } from '../utils/math';
import DonutChart from './DonutChart';
import SavedScenariosPanel from './SavedScenariosPanel';
import { Landmark, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface FDCalculatorProps {
  currencySymbol: string;
}

export default function FDCalculator({ currencySymbol }: FDCalculatorProps) {
  // Inputs state
  const [principal, setPrincipal] = useState<number>(50000);
  const [rate, setRate] = useState<number>(7.1);
  const [tenure, setTenure] = useState<number>(5);
  const [tenureType, setTenureType] = useState<'years' | 'months' | 'days'>('years');
  const [compoundingFrequency, setCompoundingFrequency] = useState<FDOptions['compoundingFrequency']>('quarterly');
  const [result, setResult] = useState<FDResult>({
    investedAmount: 0,
    interestEarned: 0,
    maturityValue: 0,
  });

  // Calculate whenever any input changes
  useEffect(() => {
    const fdResult = calculateFD({
      principal,
      rate,
      tenure,
      tenureType,
      compoundingFrequency,
    });
    setResult(fdResult);
  }, [principal, rate, tenure, tenureType, compoundingFrequency]);

  // Load selection from saved panel
  const handleLoadScenario = (savedInput: FDOptions) => {
    setPrincipal(savedInput.principal);
    setRate(savedInput.rate);
    setTenure(savedInput.tenure);
    setTenureType(savedInput.tenureType);
    setCompoundingFrequency(savedInput.compoundingFrequency);
  };

  const currentInput = { principal, rate, tenure, tenureType, compoundingFrequency };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Inputs block */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="font-bold text-white text-base">Deposit Configurations</h3>
            <span className="text-xs text-slate-400 font-medium">Earn secure fixed returns</span>
          </div>

          {/* 1. Deposit Principal */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <label htmlFor="fd-principal" className="font-semibold text-slate-350">Deposit Principal</label>
              <div className="flex items-center gap-1.5 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                <span className="text-xs text-indigo-300 font-bold">{currencySymbol}</span>
                <input
                  id="fd-principal-input"
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                  className="w-24 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                />
              </div>
            </div>
            <input
              id="fd-principal"
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

          {/* 2. Rate of Interest */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <label htmlFor="fd-rate" className="font-semibold text-slate-350">Rate of Interest (p.a.)</label>
              <div className="flex items-center gap-1 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                <input
                  id="fd-rate-input"
                  type="number"
                  step="0.05"
                  value={rate}
                  onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
                  className="w-14 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                />
                <span className="text-xs text-slate-400 font-semibold">%</span>
              </div>
            </div>
            <input
              id="fd-rate"
              type="range"
              min={1}
              max={15}
              step={0.05}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
              <span>1%</span>
              <span>8%</span>
              <span>15%</span>
            </div>
          </div>

          {/* 3. Tenure */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <label htmlFor="fd-tenure" className="font-semibold text-slate-350">Maturity Tenure</label>
              
              <div className="flex items-center gap-2">
                {/* Years, Months, Days dual togglers */}
                <div className="flex border border-white/10 rounded-lg overflow-hidden text-xs font-semibold p-0.5 bg-white/5">
                  <button
                    onClick={() => {
                      if (tenureType === 'months') setTenure(Math.ceil(tenure / 12));
                      else if (tenureType === 'days') setTenure(Math.ceil(tenure / 365));
                      setTenureType('years');
                    }}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${tenureType === 'years' ? 'bg-indigo-500 text-white shadow-xs' : 'text-slate-450 hover:text-white'}`}
                  >
                    Yr
                  </button>
                  <button
                    onClick={() => {
                      if (tenureType === 'years') setTenure(tenure * 12);
                      else if (tenureType === 'days') setTenure(Math.ceil(tenure / 30));
                      setTenureType('months');
                    }}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${tenureType === 'months' ? 'bg-indigo-500 text-white shadow-xs' : 'text-slate-450 hover:text-white'}`}
                  >
                    Mo
                  </button>
                  <button
                    onClick={() => {
                      if (tenureType === 'years') setTenure(tenure * 365);
                      else if (tenureType === 'months') setTenure(tenure * 30);
                      setTenureType('days');
                    }}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${tenureType === 'days' ? 'bg-indigo-500 text-white shadow-xs' : 'text-slate-450 hover:text-white'}`}
                  >
                    Da
                  </button>
                </div>

                <div className="flex items-center gap-1 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                  <input
                    id="fd-tenure-input"
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(Math.max(1, Number(e.target.value)))}
                    className="w-12 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{tenureType.substring(0, 2)}</span>
                </div>
              </div>
            </div>
            
            <input
              id="fd-tenure"
              type="range"
              min={1}
              max={tenureType === 'years' ? 10 : tenureType === 'months' ? 120 : 3650}
              step={1}
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
              <span>{tenureType === 'years' ? '1 Year' : tenureType === 'months' ? '1 Month' : '1 Day'}</span>
              <span>{tenureType === 'years' ? '5 Years' : tenureType === 'months' ? '60 Months' : '1825 Days'}</span>
              <span>{tenureType === 'years' ? '10 Years' : tenureType === 'months' ? '120 Months' : '3650 Days'}</span>
            </div>
          </div>

          {/* 4. Compounding Intervals */}
          <div className="flex flex-col gap-2.5 border-t border-dashed border-white/10 pt-4">
            <span className="text-sm font-semibold text-slate-355">Compounding Frequency</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'monthly', name: 'Monthly' },
                { id: 'quarterly', name: 'Quarterly (Std)' },
                { id: 'half-yearly', name: 'Half-Yearly' },
                { id: 'yearly', name: 'Yearly' },
              ].map((freq) => (
                <button
                  key={freq.id}
                  onClick={() => setCompoundingFrequency(freq.id as FDOptions['compoundingFrequency'])}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer ${
                    compoundingFrequency === freq.id
                      ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-xs'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {freq.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Visual results breakdowns */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4">
          {/* Total Maturity Value result */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 backdrop-blur-xl text-white rounded-3xl border border-white/10 shadow-lg relative overflow-hidden"
          >
            <div className="absolute right-[-10px] top-[-10px] opacity-10">
              <Landmark size={80} />
            </div>
            <span className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
              Maturity Valuation amount (A)
            </span>
            <span className="text-3xl font-black font-sans tracking-tight">
              {formatCurrency(result.maturityValue, currencySymbol)}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-slate-300 mt-3 border-t border-white/10 pt-2.5">
              <Info size={11} />
              <span>Includes principal compounding at interest updates</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Invested Capital
              </span>
              <span className="text-base font-extrabold text-white font-sans">
                {formatCurrency(principal, currencySymbol)}
              </span>
            </div>
            <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Interest Earned
              </span>
              <span className="text-base font-extrabold text-indigo-300 font-sans">
                {formatCurrency(result.interestEarned, currencySymbol)}
              </span>
            </div>
          </div>
        </div>

        {/* Circular Donut split */}
        <DonutChart
          data={[
            { label: 'Deposit Principal', value: principal, color: '#312e81' },
            { label: 'Interest Earned', value: result.interestEarned, color: '#6366f1' },
          ]}
          currencySymbol={currencySymbol}
          centerLabel="Total Return"
          centerValue={result.maturityValue}
        />

        {/* Local scenarios panel */}
        <SavedScenariosPanel
          currentType="fd"
          currentInput={currentInput}
          currentResult={result}
          onLoadScenario={handleLoadScenario}
          currencySymbol={currencySymbol}
        />
      </div>
    </div>
  );
}
