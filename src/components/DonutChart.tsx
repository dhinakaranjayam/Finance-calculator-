import { motion } from 'motion/react';
import { formatCurrency } from '../utils/math';

interface DonutChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  currencySymbol: string;
  centerLabel?: string;
  centerValue?: number;
}

export default function DonutChart({ data, currencySymbol, centerLabel = 'Total', centerValue }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // SVG circular calculations
  const radius = 60;
  const strokeWidth = 14;
  const size = 160;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg">
      {/* SVG Donut Visualizer */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-270 transform">
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Segments */}
          {total > 0 &&
            data.map((item, index) => {
              const percentage = item.value / total;
              const strokeLength = percentage * circumference;
              const strokeOffset = circumference - (accumulatedPercentage * circumference);
              
              accumulatedPercentage += percentage;

              return (
                <motion.circle
                  key={index}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: strokeOffset }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.15 }}
                  strokeLinecap="round"
                />
              );
            })}
        </svg>

        {/* Center Text Panel */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            {centerLabel}
          </span>
          <span className="text-sm font-bold text-white tracking-tight truncate max-w-[130px]">
            {formatCurrency(centerValue !== undefined ? centerValue : total, currencySymbol)}
          </span>
        </div>
      </div>

      {/* Legend & Percentages List */}
      <div className="flex-1 flex flex-col gap-3.5 w-full">
        {data.map((item, index) => {
          const percent = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div key={index} className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20 shadow-xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-slate-300">
                  {item.label}
                </span>
              </div>
              <div className="text-right flex flex-col">
                <span className="text-sm font-bold text-white">
                  {formatCurrency(item.value, currencySymbol)}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {percent.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
