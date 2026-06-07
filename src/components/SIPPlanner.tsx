import { useState, useEffect } from 'react';
import { SIPOptions, SIPResult } from '../types';
import { calculateSIP, formatCurrency } from '../utils/math';
import DonutChart from './DonutChart';
import LineTrendChart from './LineTrendChart';
import SavedScenariosPanel from './SavedScenariosPanel';
import TopPerformanceFundsPanel from './TopPerformanceFundsPanel';
import { TrendingUp, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface SIPPlannerProps {
  currencySymbol: string;
}

export default function SIPPlanner({ currencySymbol }: SIPPlannerProps) {
  // Config state inputs
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(500);
  const [expectedRate, setExpectedRate] = useState<number>(12);
  const [period, setPeriod] = useState<number>(10);
  const [stepUpPercentage, setStepUpPercentage] = useState<number>(0);
  const [result, setResult] = useState<SIPResult>({
    totalInvested: 0,
    totalWealth: 0,
    futureValue: 0,
    breakdown: [],
  });

  // Calculate whenever options change
  useEffect(() => {
    const sipResult = calculateSIP({
      monthlyInvestment,
      expectedRate,
      period,
      stepUpPercentage,
    });
    setResult(sipResult);
  }, [monthlyInvestment, expectedRate, period, stepUpPercentage]);

  // Load selection from saved panel
  const handleLoadScenario = (savedInput: SIPOptions) => {
    setMonthlyInvestment(savedInput.monthlyInvestment);
    setExpectedRate(savedInput.expectedRate);
    setPeriod(savedInput.period);
    setStepUpPercentage(savedInput.stepUpPercentage || 0);
  };

  const currentInput = { monthlyInvestment, expectedRate, period, stepUpPercentage };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Input panel setup */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="font-bold text-white text-base">SIP Strategy Settings</h3>
            <span className="text-xs text-slate-400 font-medium">Map out growth targets</span>
          </div>

          {/* 1. Monthly Contribution */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <label htmlFor="sip-monthly" className="font-semibold text-slate-350">Monthly Contribution</label>
              <div className="flex items-center gap-1.5 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                <span className="text-xs text-emerald-300 font-bold">{currencySymbol}</span>
                <input
                  id="sip-monthly-input"
                  type="number"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(Math.max(0, Number(e.target.value)))}
                  className="w-20 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                />
              </div>
            </div>
            <input
              id="sip-monthly"
              type="range"
              min={10}
              max={100000}
              step={10}
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
              <span>{formatCurrency(10, currencySymbol)}</span>
              <span>{formatCurrency(50000, currencySymbol)}</span>
              <span>{formatCurrency(100000, currencySymbol)}</span>
            </div>
          </div>

          {/* 2. Expected Returns Rate */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <label htmlFor="sip-rate" className="font-semibold text-slate-350">Expected Annual Returns (p.a.)</label>
              <div className="flex items-center gap-1 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                <input
                  id="sip-rate-input"
                  type="number"
                  step="0.1"
                  value={expectedRate}
                  onChange={(e) => setExpectedRate(Math.max(0, Number(e.target.value)))}
                  className="w-14 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                />
                <span className="text-xs text-slate-400 font-semibold">%</span>
              </div>
            </div>
            <input
              id="sip-rate"
              type="range"
              min={1}
              max={30}
              step={0.1}
              value={expectedRate}
              onChange={(e) => setExpectedRate(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
              <span>1%</span>
              <span>15%</span>
              <span>30%</span>
            </div>
          </div>

          {/* 3. Duration Period */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <label htmlFor="sip-duration" className="font-semibold text-slate-350">Time Horizon (Years)</label>
              <div className="flex items-center gap-1 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                <input
                  id="sip-duration-input"
                  type="number"
                  value={period}
                  onChange={(e) => setPeriod(Math.max(1, Number(e.target.value)))}
                  className="w-12 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400 font-bold uppercase">years</span>
              </div>
            </div>
            <input
              id="sip-duration"
              type="range"
              min={1}
              max={40}
              step={1}
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
              <span>1 Yr</span>
              <span>20 Yrs</span>
              <span>40 Yrs</span>
            </div>
          </div>

          {/* 4. Annual Step-up Percentage */}
          <div className="flex flex-col gap-2 border-t border-dashed border-white/10 pt-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1.5">
                <label id="sip-stepup-label" htmlFor="sip-stepup" className="font-semibold text-slate-350">Annual Contribution Step-Up</label>
                <div className="relative group cursor-help">
                  <HelpCircle size={13} className="text-slate-400" />
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900/95 text-slate-100 text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 leading-normal z-10 backdrop-blur-md">
                    Simulates increasing your monthly investment by X% every year to match your annual career salary increments.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 border border-white/10 rounded-lg overflow-hidden px-2 py-0.5 bg-white/5">
                <input
                  id="sip-stepup"
                  type="number"
                  value={stepUpPercentage}
                  onChange={(e) => setStepUpPercentage(Math.max(0, Number(e.target.value)))}
                  className="w-12 text-right bg-transparent text-xs font-bold text-white focus:outline-hidden font-mono"
                  aria-labelledby="sip-stepup-label"
                />
                <span className="text-xs text-slate-400 font-semibold">%</span>
              </div>
            </div>
            <input
              id="sip-stepup-slider"
              type="range"
              min={0}
              max={50}
              step={1}
              value={stepUpPercentage}
              onChange={(e) => setStepUpPercentage(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-ew-resize h-1.5 bg-white/10 rounded-lg appearance-none"
              aria-labelledby="sip-stepup-label"
            />
            <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
              <span>No Step-Up (0%)</span>
              <span>25%</span>
              <span>50% Yearly</span>
            </div>
          </div>
        </div>

        {/* Compound Growth Line Chart Line Items */}
        {result.breakdown.length > 0 && (
          <LineTrendChart data={result.breakdown} currencySymbol={currencySymbol} />
        )}
      </div>

      {/* Visual results breakdowns */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4">
          {/* Compound maturity total representation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl text-white rounded-3xl border border-white/10 shadow-lg relative overflow-hidden"
          >
            <div className="absolute right-[-10px] top-[-10px] opacity-10">
              <TrendingUp size={80} />
            </div>
            <span className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
              Future Expected Portfolio Value
            </span>
            <span className="text-3xl font-black font-sans tracking-tight">
              {formatCurrency(result.futureValue, currencySymbol)}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-slate-300 mt-3 border-t border-white/10 pt-2.5">
              <span>Compounded values based on selected returns schedule</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Total Invested Capital
              </span>
              <span className="text-base font-extrabold text-white font-sans">
                {formatCurrency(result.totalInvested, currencySymbol)}
              </span>
            </div>
            <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Wealth Accumulation
              </span>
              <span className="text-base font-extrabold text-emerald-400 font-sans">
                {formatCurrency(result.totalWealth, currencySymbol)}
              </span>
            </div>
          </div>
        </div>

        {/* Donut Chart representation */}
        <DonutChart
          data={[
            { label: 'Invested Capital', value: result.totalInvested, color: '#94a3b8' },
            { label: 'Compound Wealth Gained', value: result.totalWealth, color: '#10b981' },
          ]}
          currencySymbol={currencySymbol}
          centerLabel="Total Valuation"
          centerValue={result.futureValue}
        />

        {/* Offline saved logs panel */}
        <SavedScenariosPanel
          currentType="sip"
          currentInput={currentInput}
          currentResult={result}
          onLoadScenario={handleLoadScenario}
          currencySymbol={currencySymbol}
        />
      </div>

      {/* Top Performance Mutual Funds Database catalog shown under mutual category */}
      <div className="lg:col-span-12 mt-4">
        <TopPerformanceFundsPanel />
      </div>
    </div>
  );
}
