import { useState, useId, useMemo } from 'react';
import { CalculatorType } from './types';
import EMICalculator from './components/EMICalculator';
import SIPPlanner from './components/SIPPlanner';
import FDCalculator from './components/FDCalculator';
import TaxEstimator from './components/TaxEstimator';
import BankAndPostOfficeCalculators from './components/BankAndPostOfficeCalculators';
import MutualFundAndRetirementCalculators from './components/MutualFundAndRetirementCalculators';
import GeneralAndBondCalculators from './components/GeneralAndBondCalculators';
import CapitalGainsAndSpecialSchemes from './components/CapitalGainsAndSpecialSchemes';

import { DollarSign, Landmark, TrendingUp, Scale, Coins, Search, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CURRENCIES = [
  { symbol: '₹', name: 'INR (₹)' },
  { symbol: '$', name: 'USD ($)' },
  { symbol: '€', name: 'EUR (€)' },
  { symbol: '£', name: 'GBP (£)' },
  { symbol: '¥', name: 'JPY (¥)' },
];

interface NavItem {
  id: CalculatorType;
  abbr: string;
  name: string;
  badgeBg: string; // Tailwind bg class
}

interface NavCategory {
  title: string;
  items: NavItem[];
}

const getBadgeStyles = (badgeBg: string) => {
  const colorMap: Record<string, string> = {
    fuchsia: "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/15",
    indigo: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15",
    blue: "bg-blue-500/10 text-blue-400 border border-blue-550/15",
    rose: "bg-rose-500/10 text-rose-400 border border-rose-500/15",
    orange: "bg-orange-500/10 text-orange-400 border border-orange-500/15",
    emerald: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15",
    violet: "bg-violet-500/10 text-violet-400 border border-violet-500/15",
    purple: "bg-purple-500/10 text-purple-400 border border-purple-500/15",
    slate: "bg-slate-500/10 text-slate-400 border border-slate-500/15",
    teal: "bg-teal-500/10 text-teal-400 border border-teal-500/15",
    red: "bg-red-500/10 text-red-400 border border-red-500/15",
    amber: "bg-amber-500/10 text-amber-400 border border-amber-500/15",
    neutral: "bg-slate-400/10 text-slate-300 border border-slate-500/10",
  };

  const matchedKey = Object.keys(colorMap).find(key => badgeBg.includes(key));
  return matchedKey ? colorMap[matchedKey] : "bg-slate-500/10 text-slate-300 border border-slate-500/20";
};

export default function App() {
  const [activeTab, setActiveTab] = useState<CalculatorType>('emi_basic');
  const [currency, setCurrency] = useState('₹'); // Default to INR to match India Pro calculator screen
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState<'directory' | 'calculator'>('directory');
  
  const currencySelectId = useId();

  // Unified categorized data representing the exact screenshot hierarchy!
  const directory: NavCategory[] = useMemo(() => [
    {
      title: 'BANK',
      items: [
        { id: 'emi_basic', abbr: 'EMI', name: 'Loan - Basic', badgeBg: 'bg-fuchsia-600' },
        { id: 'emi_advanced', abbr: 'EMI', name: 'Loan - Advanced', badgeBg: 'bg-fuchsia-600' },
        { id: 'fd_tdr', abbr: 'FD', name: 'Fixed Deposit - TDR (Interest Payout)', badgeBg: 'bg-indigo-600' },
        { id: 'fd_stdr', abbr: 'FD', name: 'Fixed Deposit - STDR (Cumulative)', badgeBg: 'bg-indigo-500' },
        { id: 'rd', abbr: 'RD', name: 'Recurring Deposit', badgeBg: 'bg-fuchsia-500' },
        { id: 'bank_rates', abbr: '%', name: 'Interest Rates (%)', badgeBg: 'bg-indigo-500' },
      ],
    },
    {
      title: 'BANK & POST OFFICE',
      items: [
        { id: 'ppf', abbr: 'PPF', name: 'Public Provident Fund', badgeBg: 'bg-blue-600' },
        { id: 'ssa', abbr: 'SSA', name: 'Sukanya Samriddhi Account', badgeBg: 'bg-indigo-650' },
        { id: 'scss', abbr: 'SCSS', name: 'Senior Citizens Savings Scheme', badgeBg: 'bg-indigo-650' },
        { id: 'kvp', abbr: 'KVP', name: 'Kisan Vikas Patra', badgeBg: 'bg-indigo-650' },
      ],
    },
    {
      title: 'POST OFFICE',
      items: [
        { id: 'mis', abbr: 'MIS', name: 'Monthly Income Scheme', badgeBg: 'bg-rose-500' },
        { id: 'rd_po', abbr: 'RD', name: 'Recurring Deposit', badgeBg: 'bg-rose-500' },
        { id: 'td_po', abbr: 'TD', name: 'Time Deposit', badgeBg: 'bg-rose-500' },
        { id: 'nsc', abbr: 'NSC', name: 'National Savings Certificate', badgeBg: 'bg-orange-500' },
        { id: 'po_rates', abbr: '%', name: 'Interest Rates (%)', badgeBg: 'bg-orange-500' },
      ],
    },
    {
      title: 'MUTUAL FUNDS',
      items: [
        { id: 'mf_overview', abbr: 'MF', name: 'Mutual Funds Overview', badgeBg: 'bg-emerald-600' },
        { id: 'elss', abbr: 'ELSS', name: 'Equity Linked Savings Scheme', badgeBg: 'bg-emerald-500' },
        { id: 'sip', abbr: 'SIP', name: 'Systematic Investment Plan', badgeBg: 'bg-emerald-600' },
        { id: 'swp', abbr: 'SWP', name: 'Systematic Withdrawal Plan', badgeBg: 'bg-emerald-500' },
      ],
    },
    {
      title: 'RETIREMENT',
      items: [
        { id: 'nps', abbr: 'NPS', name: 'National Pension System', badgeBg: 'bg-violet-600' },
        { id: 'ups', abbr: 'UPS', name: 'Unified Pension Scheme', badgeBg: 'bg-violet-500' },
        { id: 'epf', abbr: 'EPF', name: 'Employees Provident Fund', badgeBg: 'bg-violet-600' },
        { id: 'aps', abbr: 'APS', name: 'Atal Pension Scheme', badgeBg: 'bg-purple-600' },
        { id: 'sym', abbr: 'SYM', name: 'PM Shram Yogi Maan-dhan', badgeBg: 'bg-violet-600' },
        { id: 'grt', abbr: 'GRT', name: 'Gratuity Scheme', badgeBg: 'bg-purple-500' },
      ],
    },
    {
      title: 'TAX',
      items: [
        { id: 'tax', abbr: 'IT', name: 'Income Tax Estimator', badgeBg: 'bg-slate-600' },
        { id: 'cgt', abbr: 'CGT', name: 'Capital Gains Tax', badgeBg: 'bg-slate-500' },
      ],
    },
    {
      title: 'INSURANCE',
      items: [
        { id: 'pli', abbr: 'PLI', name: 'Postal Life Insurance', badgeBg: 'bg-teal-600' },
        { id: 'rpli', abbr: 'RPLI', name: 'Rural Postal Life Insurance', badgeBg: 'bg-teal-500' },
        { id: 'jjb', abbr: 'JJB', name: 'PM Jeevan Jyoti Bima (Life)', badgeBg: 'bg-teal-600' },
        { id: 'sb', abbr: 'SB', name: 'PM Suraksha Bima (Accident)', badgeBg: 'bg-teal-500' },
      ],
    },
    {
      title: 'BONDS',
      items: [
        { id: 'bonds_overview', abbr: 'BOND', name: 'Bonds Overview', badgeBg: 'bg-red-400' },
        { id: 'frsb', abbr: 'FRSB', name: 'Floating Rate Savings Bonds', badgeBg: 'bg-red-400' },
        { id: 'sgb', abbr: 'SGB', name: 'Sovereign Gold Bond Scheme', badgeBg: 'bg-red-400' },
        { id: 'ec54', abbr: '54EC', name: '54EC Bonds (save Capital Gains Tax)', badgeBg: 'bg-red-400' },
      ],
    },
    {
      title: 'GENERAL',
      items: [
        { id: 'ci', abbr: 'CI', name: 'Compound Interest (Future Value)', badgeBg: 'bg-amber-500' },
        { id: 'si', abbr: 'SI', name: 'Simple Interest', badgeBg: 'bg-amber-500' },
        { id: 'infl', abbr: 'INFL', name: 'Inflation Adjustor', badgeBg: 'bg-amber-500' },
      ],
    },
    {
      title: 'CLOSED',
      items: [
        { id: 'mssc', abbr: 'MSSC', name: 'Mahila Samman Savings Certificate', badgeBg: 'bg-neutral-600' },
        { id: 'vvs', abbr: 'VVS', name: 'PM Vaya Vandhana Scheme', badgeBg: 'bg-neutral-500' },
      ],
    },
  ], []);

  // Soft client side filter logic for search bar
  const filteredDirectory = useMemo(() => {
    if (!searchQuery) return directory;
    const norm = searchQuery.toLowerCase();
    return directory.map(cat => ({
      ...cat,
      items: cat.items.filter(item => 
        item.name.toLowerCase().includes(norm) || 
        item.abbr.toLowerCase().includes(norm) ||
        cat.title.toLowerCase().includes(norm)
      ),
    })).filter(cat => cat.items.length > 0);
  }, [searchQuery, directory]);

  const selectCalculator = (item: NavItem) => {
    setActiveTab(item.id);
    setMobileView('calculator');
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 py-6 md:py-10 px-4 md:px-8 flex flex-col font-sans select-none antialiased relative overflow-hidden">
      {/* Dynamic Accent Ambient Lights */}
      <div className="absolute top-[-250px] left-[-250px] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute bottom-[-250px] right-[-250px] w-[700px] h-[700px] bg-blue-500/5 rounded-full blur-[180px] pointer-events-none"></div>

      {/* Main Suite bounds container */}
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-8 relative z-10">
        
        {/* Dynamic header row */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl shadow-lg border border-indigo-500/15 shrink-0">
              <Coins size={26} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-display">
                Financial Calculator India Pro
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5 max-w-[620px] leading-relaxed">
                Full-spectrum Indian & global personal asset solvers with progressive tax estimators, treasury bonds, and post department logs.
              </p>
            </div>
          </div>

          {/* Interactive Currency Selector */}
          <div className="flex items-center gap-2.5 self-start md:self-center bg-slate-950/40 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800/80 hover:border-slate-700/50 shadow-lg text-slate-200 transition-colors">
            <label htmlFor={currencySelectId} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Currency:</label>
            <select
              id={currencySelectId}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="text-xs font-bold text-white bg-transparent outline-hidden cursor-pointer"
            >
              {CURRENCIES.map((cur) => (
                <option key={cur.symbol} value={cur.symbol} className="bg-[#0b0f19] text-slate-100">
                  {cur.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Master Workspaces Grid: 12 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SEARCH & NAVIGATION COLUMN */}
          <div className={`lg:col-span-4 flex flex-col gap-4 ${mobileView === 'calculator' ? 'hidden lg:flex' : 'flex'}`}>
            <div className="bg-[#0b101d]/85 backdrop-blur-2xl rounded-2xl border border-slate-800/90 p-5 flex flex-col gap-4 shadow-xl">
              <div className="flex justify-between items-center px-0.5">
                <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-widest font-mono">SOLVER LIBRARY</span>
                <span className="text-[10px] font-bold text-slate-500">Search 30+ Tools</span>
              </div>

              {/* Dynamic Instant Tool Filter */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter solvers (e.g. PPF, FRSB, EMI)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950/40 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500/50 hover:border-slate-700/40 font-medium transition-all"
                />
              </div>

              {/* Collapsed Category Index List */}
              <div className="flex flex-col gap-6 max-h-[65vh] overflow-y-auto pr-1">
                {filteredDirectory.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No calculator matching "{searchQuery}"
                  </div>
                ) : (
                  filteredDirectory.map((cat, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest pl-1 font-mono">
                        {cat.title}
                      </span>
                      
                      <div className="flex flex-col gap-1.5">
                        {cat.items.map((item) => {
                          const isSelected = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => selectCalculator(item)}
                              className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600/10 border-indigo-500/45 text-white shadow-md shadow-indigo-600/5'
                                  : 'bg-slate-950/15 border-slate-900/60 hover:border-slate-800/80 hover:bg-slate-900/30 text-slate-400 hover:text-slate-100'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 pr-2">
                                <span className={`text-[9px] font-bold w-12 py-1 text-center shrink-0 rounded-md font-mono tracking-wider ${getBadgeStyles(item.badgeBg)}`}>
                                  {item.abbr}
                                </span>
                                <span className="text-xs font-bold truncate">
                                  {item.name}
                                </span>
                              </div>
                              <ArrowUpRight size={13} className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* CALCULATOR ACTIVE WRAPPER PANEL */}
          <div className={`lg:col-span-8 flex flex-col gap-4 ${mobileView === 'directory' ? 'hidden lg:flex' : 'flex'}`}>
            {/* Mobile Navigation Header */}
            {mobileView === 'calculator' && (
              <button
                onClick={() => setMobileView('directory')}
                className="lg:hidden flex items-center gap-2 self-start text-xs font-bold bg-[#0b101d] border border-slate-800 rounded-xl px-4 py-2 text-indigo-300 hover:text-white active:scale-98 transition-all shrink-0 cursor-pointer mb-2"
              >
                <ArrowLeft size={14} />
                <span>← Back to Tools Directory</span>
              </button>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.99, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.99, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {/* 1. Legacy Standard Components */}
                {/* Basic Loan EMI */}
                {activeTab === 'emi_basic' && <EMICalculator currencySymbol={currency} />}
                
                {/* Advanced Loan EMI */}
                {activeTab === 'emi_advanced' && (
                  <EMICalculator currencySymbol={currency} isAdvancedMode={true} />
                )}

                {/* Cumulative STDR FD */}
                {activeTab === 'fd_stdr' && <FDCalculator currencySymbol={currency} />}

                {/* Legacy direct mappings */}
                {activeTab === 'emi' && <EMICalculator currencySymbol={currency} />}
                {activeTab === 'fd' && <FDCalculator currencySymbol={currency} />}

                {/* Tax Progressive Estimator */}
                {activeTab === 'tax' && <TaxEstimator currencySymbol={currency} />}

                {/* Mutual Fund SIP planner */}
                {activeTab === 'sip' && <SIPPlanner currencySymbol={currency} />}

                {/* 2. Bank and Post Office Scheme Components */}
                {['ppf', 'ssa', 'scss', 'kvp', 'mis', 'nsc', 'td_po', 'rd', 'rd_po', 'fd_tdr'].includes(activeTab) && (
                  <BankAndPostOfficeCalculators type={activeTab} currencySymbol={currency} />
                )}

                {/* 3. Retirement & SWP Mutual Fund Components */}
                {['swp', 'elss', 'mf_overview', 'nps', 'epf', 'grt', 'aps', 'ups', 'sym'].includes(activeTab) && (
                  <MutualFundAndRetirementCalculators type={activeTab} currencySymbol={currency} />
                )}

                {/* 4. Bonds & General Mathematics Components */}
                {['si', 'ci', 'infl', 'frsb', 'sgb', 'ec54', 'bonds_overview'].includes(activeTab) && (
                  <GeneralAndBondCalculators type={activeTab} currencySymbol={currency} />
                )}

                {/* 5. Special Closed / Insurance & Rate lists */}
                {['cgt', 'pli', 'rpli', 'jjb', 'sb', 'mssc', 'vvs', 'bank_rates', 'po_rates'].includes(activeTab) && (
                  <CapitalGainsAndSpecialSchemes type={activeTab} currencySymbol={currency} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* Humility signature footer bar */}
        <footer className="mt-12 border-t border-white/5 pt-6 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans">
            Financial Suite India Pro • Private Personal Offline Calculator
          </span>
        </footer>

      </div>
    </div>
  );
}
