import React, { useState, useRef, useEffect } from 'react';
import { SIPYearlyDetail } from '../types';
import { formatCurrency } from '../utils/math';

interface LineTrendChartProps {
  data: SIPYearlyDetail[];
  currencySymbol: string;
}

export default function LineTrendChart({ data, currencySymbol }: LineTrendChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(400);
  const height = 220;
  const paddingX = 40;
  const paddingY = 24;

  // Track container width changes
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setWidth(Math.max(100, entry.contentRect.width));
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (data.length === 0) return null;

  // Max values for auto-scaling
  const maxVal = Math.max(...data.map(d => d.totalValue), 1);
  const totalYears = data.length;

  // Coordinate mapper functions
  const getX = (index: number) => {
    if (totalYears <= 1) return width / 2;
    return paddingX + (index / (totalYears - 1)) * (width - 2 * paddingX);
  };

  const getY = (value: number) => {
    return height - paddingY - (value / maxVal) * (height - 2 * paddingY);
  };

  // Build SVG path for Invested Amount (lower line/area)
  let investedAreaPoints = `M ${getX(0)} ${getY(0)}`;
  let investedLinePoints = '';
  
  // Build SVG path for Total Wealth Value (upper line/area)
  let totalAreaPoints = `M ${getX(0)} ${getY(0)}`;
  let totalLinePoints = '';

  data.forEach((item, idx) => {
    const x = getX(idx);
    const yInvested = getY(item.investedAmount);
    const yTotal = getY(item.totalValue);

    if (idx === 0) {
      investedLinePoints += `M ${x} ${yInvested}`;
      totalLinePoints += `M ${x} ${yTotal}`;
    } else {
      investedLinePoints += ` L ${x} ${yInvested}`;
      totalLinePoints += ` L ${x} ${yTotal}`;
    }

    investedAreaPoints += ` L ${x} ${yInvested}`;
    totalAreaPoints += ` L ${x} ${yTotal}`;
  });

  // Close areas to the bottom line
  const bottomY = height - paddingY;
  investedAreaPoints += ` L ${getX(totalYears - 1)} ${bottomY} L ${getX(0)} ${bottomY} Z`;
  totalAreaPoints += ` L ${getX(totalYears - 1)} ${bottomY} L ${getX(0)} ${bottomY} Z`;

  // Standard interactive helper
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    
    // Find closest data point
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < totalYears; i++) {
      const xCoord = getX(i);
      const distance = Math.abs(xCoord - clientX);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }
    setHoveredIdx(closestIndex);
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-3 p-5 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg w-full">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-bold text-white">Wealth Accumulation Curve</h4>
          <p className="text-xs text-slate-400">Progression map showing principal vs compounding growth</p>
        </div>
        
        {/* Dynamic Legend */}
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#475569] border border-slate-500" />
            <span className="text-xs font-medium text-slate-300">Invested</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981]" />
            <span className="text-xs font-medium text-slate-300 font-sans">Total Wealth</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg
          height={height}
          className="w-full select-none cursor-crosshair overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="totalValueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const yVal = ratio * maxVal;
            const yCoord = getY(yVal);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={yCoord}
                  x2={width - paddingX}
                  y2={yCoord}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 6}
                  y={yCoord + 4}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {maxVal >= 10000000 
                    ? `${(yVal / 10000000).toFixed(1)}Cr` 
                    : maxVal >= 100000 
                    ? `${(yVal / 100000).toFixed(0)}L` 
                    : maxVal >= 1000 
                    ? `${(yVal / 1000).toFixed(0)}k` 
                    : yVal.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Area under charts */}
          <path d={totalAreaPoints} fill="url(#totalValueGrad)" />
          <path d={investedAreaPoints} fill="url(#investedGrad)" />

          {/* Line trails */}
          <path d={investedLinePoints} fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="3,3" />
          <path d={totalLinePoints} fill="none" stroke="#10b981" strokeWidth="3" />

          {/* Hover highlight line */}
          {hoveredIdx !== null && (
            <line
              x1={getX(hoveredIdx)}
              y1={paddingY}
              x2={getX(hoveredIdx)}
              y2={height - paddingY}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />
          )}

          {/* Trend dots */}
          {data.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g key={idx} className="transition-all duration-150">
                {/* Total Value Ring Dot */}
                <circle
                  cx={getX(idx)}
                  cy={getY(item.totalValue)}
                  r={isHovered ? 6 : 4}
                  fill="#10b981"
                  stroke="#0f172a"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                />
              </g>
            );
          })}

          {/* X Axis labels */}
          {data.map((item, idx) => {
            // Label optimization depending on data set density
            const shouldLabel = data.length <= 10 
              ? true 
              : data.length <= 20 
              ? idx % 2 === 0 
              : idx % 5 === 0 || idx === data.length - 1;

            if (!shouldLabel) return null;

            return (
              <text
                key={idx}
                x={getX(idx)}
                y={height - 6}
                fill="#94a3b8"
                fontSize="10"
                fontWeight="500"
                textAnchor="middle"
              >
                Yr {item.year}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Popover Hover Card Details */}
      <div className="h-16 flex items-center justify-center border-t border-white/5 mt-1">
        {hoveredIdx !== null ? (
          <div className="grid grid-cols-3 gap-6 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/10 text-center w-full max-w-lg">
            <div>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Timeline</span>
              <span className="text-sm font-extrabold text-white">Year {data[hoveredIdx].year}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Invested Amount</span>
              <span className="text-sm font-bold text-slate-300">
                {formatCurrency(data[hoveredIdx].investedAmount, currencySymbol)}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Maturity Value</span>
              <span className="text-sm font-extrabold text-[#10b981]">
                {formatCurrency(data[hoveredIdx].totalValue, currencySymbol)}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-xs font-medium text-slate-400 animate-pulse">
            Hover or touch the graph elements above to view specific yearly compound details
          </span>
        )}
      </div>
    </div>
  );
}
