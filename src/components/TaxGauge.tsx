import { motion } from 'motion/react';

interface TaxGaugeProps {
  rate: number; // e.g., 0.15 for 15%
}

export default function TaxGauge({ rate }: TaxGaugeProps) {
  // Convert rate percentage to angle for needle rotation
  // Angle spans from -90 deg (0%) to +90 deg (50% max)
  const percent = rate * 100;
  const clampedPercent = Math.min(Math.max(percent, 0), 50);
  const angle = (clampedPercent / 50) * 180 - 90;

  // Gauge dimensions
  const viewWidth = 180;
  const viewHeight = 110;
  const radius = 70;
  const cx = viewWidth / 2;
  const cy = 90;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
      <div className="w-full text-center">
        <h4 className="text-sm font-bold text-white">Effective Tax Rate Gauge</h4>
        <p className="text-xs text-slate-400">Net tax relative to total gross income</p>
      </div>

      <div className="relative mt-4" style={{ width: viewWidth, height: viewHeight }}>
        <svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
          <defs>
            {/* Color gradient for the track arch */}
            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />       {/* emerald / Green */}
              <stop offset="50%" stopColor="#f59e0b" />      {/* amber / Warning */}
              <stop offset="100%" stopColor="#ef4444" />     {/* red / High */}
            </linearGradient>
          </defs>

          {/* Underlay Track Arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Color Gradient Track overlay */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Base Joint Circle */}
          <circle cx={cx} cy={cy} r="6" fill="#818cf8" />

          {/* Indicator Needle */}
          <motion.g
            transform={`translate(${cx}, ${cy})`}
            initial={{ rotate: -90 }}
            animate={{ rotate: angle }}
            transition={{ type: 'spring', damping: 15, stiffness: 80 }}
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2={-radius + 4}
              stroke="#f1f5f9"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </motion.g>
        </svg>

        {/* Dynamic Rate Label Box */}
        <div className="absolute inset-x-0 bottom-4 flex flex-col items-center">
          <span className="text-2xl font-black text-white font-mono tracking-tight">
            {percent.toFixed(1)}%
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {percent === 0 ? 'Tax Free' : percent < 12 ? 'Low Tax' : percent < 25 ? 'Moderate' : 'High Tax'}
          </span>
        </div>
      </div>

      {/* Speed Dial Ranges */}
      <div className="flex justify-between w-full text-[10px] font-semibold text-slate-400 font-mono mt-1 px-4">
        <span>0%</span>
        <span>25%</span>
        <span>50%+</span>
      </div>
    </div>
  );
}
