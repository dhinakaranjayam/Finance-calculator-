import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Award, TrendingUp, Calendar, ArrowUpRight, HelpCircle, Flame, Shield, Layers, Bookmark } from 'lucide-react';

interface FundPerformance {
  name: string;
  category: 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'ELSS';
  inception: number;
  yr5: number;
  yr3: number;
  yr1: number;
  description: string;
}

const TOP_MUTUAL_FUNDS: FundPerformance[] = [
  // 1. Large Cap Funds
  { 
    name: 'Nippon India Large Cap Fund', 
    category: 'Large Cap', 
    inception: 16.20, 
    yr5: 19.80, 
    yr3: 21.50, 
    yr1: 32.40,
    description: 'High liquidity focus prioritizing blue-chip corporates.' 
  },
  { 
    name: 'ICICI Prudential Bluechip Fund', 
    category: 'Large Cap', 
    inception: 15.50, 
    yr5: 18.20, 
    yr3: 19.80, 
    yr1: 29.50,
    description: 'Relatively conservative approach within the mega-cap ecosystem.' 
  },
  { 
    name: 'HDFC Top 100 Fund', 
    category: 'Large Cap', 
    inception: 14.80, 
    yr5: 17.90, 
    yr3: 20.40, 
    yr1: 31.20,
    description: 'Diversified top-tier industry captains with long-term compound track record.' 
  },
  { 
    name: 'SBI Bluechip Fund', 
    category: 'Large Cap', 
    inception: 15.10, 
    yr5: 16.50, 
    yr3: 17.20, 
    yr1: 25.80,
    description: 'Sectoral leaders focus managed under India\'s largest national banking desk.' 
  },
  { 
    name: 'Mirae Asset Large Cap Fund', 
    category: 'Large Cap', 
    inception: 15.80, 
    yr5: 17.10, 
    yr3: 18.00, 
    yr1: 28.10,
    description: 'Aggressive growth themes within high quality index giants.' 
  },

  // 2. Mid Cap Funds
  { 
    name: 'Motilal Oswal Midcap Fund', 
    category: 'Mid Cap', 
    inception: 20.40, 
    yr5: 26.50, 
    yr3: 31.80, 
    yr1: 48.20,
    description: 'Focused high-conviction mid-sized market winners selection.' 
  },
  { 
    name: 'Quant Mid Cap Fund', 
    category: 'Mid Cap', 
    inception: 19.30, 
    yr5: 27.90, 
    yr3: 28.50, 
    yr1: 46.10,
    description: 'Dynamic volatility asset allocation using predictive market models.' 
  },
  { 
    name: 'HDFC Mid-Cap Opportunities Fund', 
    category: 'Mid Cap', 
    inception: 19.80, 
    yr5: 24.20, 
    yr3: 26.80, 
    yr1: 42.50,
    description: 'Heavy corpus style capitalizing on industrial scale adjustments.' 
  },
  { 
    name: 'Nippon India Growth Fund', 
    category: 'Mid Cap', 
    inception: 18.50, 
    yr5: 23.80, 
    yr3: 25.40, 
    yr1: 39.80,
    description: 'Alpha generation prioritizing emerging niche sectoral headers.' 
  },
  { 
    name: 'SBI Magnum Midcap Fund', 
    category: 'Mid Cap', 
    inception: 17.90, 
    yr5: 22.10, 
    yr3: 23.70, 
    yr1: 36.20,
    description: 'Sturdy risk adjusted mid-bracket allocation with structural anchors.' 
  },

  // 3. Small Cap Funds
  { 
    name: 'Quant Small Cap Fund', 
    category: 'Small Cap', 
    inception: 21.20, 
    yr5: 33.40, 
    yr3: 34.10, 
    yr1: 52.80,
    description: 'Hyperactive micro-cap trading focus delivering extreme high growth spikes.' 
  },
  { 
    name: 'Nippon India Small Cap Fund', 
    category: 'Small Cap', 
    inception: 20.80, 
    yr5: 31.20, 
    yr3: 32.80, 
    yr1: 49.50,
    description: 'Largest small cap pool in India backing potential multi-baggers early.' 
  },
  { 
    name: 'HDFC Small Cap Fund', 
    category: 'Small Cap', 
    inception: 19.50, 
    yr5: 28.10, 
    yr3: 29.50, 
    yr1: 44.20,
    description: 'Fundamental value-centric small cap hunting targeting sustainable scale.' 
  },
  { 
    name: 'SBI Small Cap Fund', 
    category: 'Small Cap', 
    inception: 19.90, 
    yr5: 26.40, 
    yr3: 24.80, 
    yr1: 38.60,
    description: 'Strict liquidity gates choosing robust high-yield emerging local enterprises.' 
  },
  { 
    name: 'Tata Small Cap Fund', 
    category: 'Small Cap', 
    inception: 18.70, 
    yr5: 25.80, 
    yr3: 26.10, 
    yr1: 39.40,
    description: 'Balanced multi-sector risk tracking in emerging consumer scopes.' 
  },

  // 4. ELSS Funds
  { 
    name: 'Quant ELSS Tax Saver Fund', 
    category: 'ELSS', 
    inception: 18.80, 
    yr5: 28.50, 
    yr3: 27.20, 
    yr1: 43.40,
    description: 'Tax saving equity fund with adaptive risk hedges and macro tracking.' 
  },
  { 
    name: 'SBI Long Term Equity Fund', 
    category: 'ELSS', 
    inception: 15.60, 
    yr5: 22.80, 
    yr3: 24.50, 
    yr1: 38.10,
    description: 'India\'s longest serving tax-saver fund with multi-decade resilience.' 
  },
  { 
    name: 'Mirae Asset ELSS Tax Saver Fund', 
    category: 'ELSS', 
    inception: 17.20, 
    yr5: 19.50, 
    yr3: 19.80, 
    yr1: 32.50,
    description: 'Consistent core sector compounder with standard lock-in benefits.' 
  },
  { 
    name: 'DSP ELSS Tax Saver Fund', 
    category: 'ELSS', 
    inception: 16.10, 
    yr5: 18.60, 
    yr3: 18.20, 
    yr1: 30.20,
    description: 'Growth-at-reasonable-price target overlay saving Section 80C taxes.' 
  },
  { 
    name: 'Bandhan ELSS Tax Saver Fund', 
    category: 'ELSS', 
    inception: 15.40, 
    yr5: 17.90, 
    yr3: 17.60, 
    yr1: 29.80,
    description: 'Mid-and-large cap hybrid blend aimed at steady asset appreciation.' 
  }
];

type Timeframe = 'inception' | 'yr5' | 'yr3' | 'yr1';

export default function TopPerformanceFundsPanel() {
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('yr5');
  const [hoveredFund, setHoveredFund] = useState<string | null>(null);

  // Timeframe labels
  const timeframeOptions: { value: Timeframe; label: string; sub: string }[] = [
    { value: 'inception', label: 'Since Inception', sub: 'Long-term' },
    { value: 'yr5', label: 'Last 5 Years', sub: 'Macro Cycle' },
    { value: 'yr3', label: 'Last 3 Years', sub: 'Medium Term' },
    { value: 'yr1', label: 'Last 1 Year', sub: 'Short Term' },
  ];

  // Dynamic sorting function to fetch top 5 performing funds per section sorted growth-wise
  const getSortedCategoryFunds = (cat: 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'ELSS') => {
    return TOP_MUTUAL_FUNDS
      .filter((fund) => fund.category === cat)
      .sort((a, b) => b[activeTimeframe] - a[activeTimeframe])
      .slice(0, 5);
  };

  const categories: { id: 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'ELSS'; title: string; color: string; icon: any; bgLight: string }[] = [
    { id: 'Large Cap', title: 'Large Cap Funds', color: 'text-blue-400', icon: Shield, bgLight: 'bg-blue-500/5 border-blue-500/10' },
    { id: 'Mid Cap', title: 'Mid Cap Funds', color: 'text-indigo-400', icon: Layers, bgLight: 'bg-indigo-500/5 border-indigo-500/10' },
    { id: 'Small Cap', title: 'Small Cap Funds', color: 'text-amber-400', icon: Flame, bgLight: 'bg-amber-500/5 border-amber-500/10' },
    { id: 'ELSS', title: 'ELSS (Tax Saving) Funds', color: 'text-emerald-400', icon: Bookmark, bgLight: 'bg-emerald-500/5 border-emerald-500/10' },
  ];

  return (
    <div className="bg-[#0b101d]/65 backdrop-blur-2xl rounded-2xl border border-slate-800/95 p-6 flex flex-col gap-6 shadow-2xl relative overflow-hidden mt-8">
      {/* Decorative vector flare */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-[90px] pointer-events-none"></div>
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/15 shadow-sm">
            <Award size={22} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
              Top Performance Mutual Funds Catalog
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Top 5 historically performing Indian & global active mutual schemes sorted interactively by growth trajectory.
            </p>
          </div>
        </div>

        {/* Timeframe Selector Segmented Pill Control */}
        <div className="flex flex-wrap gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 self-start md:self-center">
          {timeframeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActiveTimeframe(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 relative cursor-pointer flex flex-col items-center min-w-[90px] ${
                activeTimeframe === opt.value
                  ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/5 scale-102 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{opt.label.replace('Last ', '')}</span>
              <span className={`text-[8px] mt-0.5 font-bold block ${activeTimeframe === opt.value ? 'text-indigo-200' : 'text-slate-500'}`}>
                {opt.sub}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bento 4-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((catSpec) => {
          const sortedList = getSortedCategoryFunds(catSpec.id);
          const CatIcon = catSpec.icon;

          return (
            <div 
              key={catSpec.id} 
              className={`rounded-xl border p-5 flex flex-col justify-between transition-all duration-300 hover:border-slate-700/60 shadow-lg ${catSpec.bgLight}`}
            >
              <div>
                {/* Category Header Card */}
                <div className="flex justify-between items-center mb-4 border-b border-slate-800/40 pb-2.5">
                  <div className="flex items-center gap-2">
                    <CatIcon size={16} className={catSpec.color} />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">
                      {catSpec.title}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono">Active tracking</span>
                </div>

                {/* Sorted list of 5 items */}
                <div className="flex flex-col gap-2">
                  {sortedList.map((fund, idx) => {
                    const isHovered = hoveredFund === fund.name;
                    const cagrValue = fund[activeTimeframe];

                    return (
                      <div
                        key={fund.name}
                        onMouseEnter={() => setHoveredFund(fund.name)}
                        onMouseLeave={() => setHoveredFund(null)}
                        className={`p-2.5 rounded-lg border transition-all duration-200 flex items-center justify-between relative cursor-help ${
                          isHovered 
                            ? 'bg-slate-900/80 border-slate-700/50 scale-101' 
                            : 'bg-slate-950/20 border-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-4">
                          {/* Rank Badge */}
                          <span className={`text-[10px] font-mono font-bold w-5 h-5 flex items-center justify-center rounded-md shrink-0 ${
                            idx === 0 ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 font-black' :
                            idx === 1 ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/10' :
                            'bg-slate-800/40 text-slate-400'
                          }`}>
                            {idx + 1}
                          </span>
                          
                          {/* Fund Name & Description */}
                          <div className="min-w-0 flex flex-col">
                            <span className="text-xs font-bold text-slate-200 hover:text-white transition-colors truncate">
                              {fund.name}
                            </span>
                            {isHovered ? (
                              <motion.span 
                                initial={{ opacity: 0, y: 2 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[9px] text-indigo-400 font-semibold mt-0.5 line-clamp-1"
                              >
                                {fund.description}
                              </motion.span>
                            ) : (
                              <span className="text-[9px] text-slate-500 font-medium mt-0.5 max-w-[200px] truncate">
                                CAGR since: {fund.inception}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Yield Highlight Column */}
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-xs font-extrabold text-emerald-400 font-mono flex items-center gap-0.5">
                            {cagrValue.toFixed(1)}% <span className="text-[9px] font-medium text-emerald-500/80">p.a.</span>
                          </span>
                          <span className="text-[8px] text-slate-500 font-mono">
                            {activeTimeframe === 'inception' ? 'Inception' : activeTimeframe === 'yr5' ? '5Y CAGR' : activeTimeframe === 'yr3' ? '3Y CAGR' : '1Y Return'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Footer Indicator */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-4 border-t border-slate-800/40 pt-3">
                <span className="flex items-center gap-1">
                  <TrendingUp size={11} className="text-emerald-500" />
                  <span>Avg Return: ~{((sortedList.reduce((sum, f) => sum + f[activeTimeframe], 0) / 5)).toFixed(1)}%</span>
                </span>
                <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded font-mono text-slate-400 border border-slate-800">
                  Top 5 List
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimers & Regulatory details under the Bento Grid */}
      <div className="p-3 bg-slate-950/40 border border-slate-850/60 rounded-xl text-slate-400 flex gap-2.5 items-start text-[11px] leading-relaxed">
        <Calendar size={13} className="text-indigo-400 mt-0.5 shrink-0" />
        <div>
          <span>
            <strong>Disclaimer:</strong> Returns are annualized CAGR and direct plans based. Performance data is sourced dynamically for educational simulation planning relative with 2026 guidelines. Past performance is never a reliable predictor of future profits. Mutual fund investments are subject to market risks. Please read all scheme-related documents carefully before investing.
          </span>
        </div>
      </div>
    </div>
  );
}
