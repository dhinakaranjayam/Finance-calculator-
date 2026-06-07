import { useState } from 'react';
import { EMILineItem } from '../types';
import { formatCurrency } from '../utils/math';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AmortizationScheduleProps {
  schedule: EMILineItem[];
  currencySymbol: string;
}

export default function AmortizationSchedule({ schedule, currencySymbol }: AmortizationScheduleProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // View annual segments (12 months)
  
  if (schedule.length === 0) return null;

  const totalPages = Math.ceil(schedule.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = schedule.slice(startIndex, startIndex + itemsPerPage);

  const prevPage = () => {
    setCurrentPage(p => Math.max(1, p - 1));
  };

  const nextPage = () => {
    setCurrentPage(p => Math.min(totalPages, p + 1));
  };

  return (
    <div className="flex flex-col gap-4 p-5 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/5 pb-3">
        <div>
          <h4 className="text-sm font-bold text-white">Monthly Amortization Schedule</h4>
          <p className="text-xs text-slate-400">Detailed principal and interest paydowns split monthly</p>
        </div>

        {/* Dynamic Pagination Controls */}
        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="p-1 px-1.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-semibold text-slate-300 font-sans">
            Year {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="p-1 px-1.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Month</th>
              <th className="py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">EMI Portion</th>
              <th className="py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Principal</th>
              <th className="py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Interest</th>
              <th className="py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {currentItems.map((item) => (
              <tr key={item.month} className="hover:bg-white/5 transition-colors">
                <td className="py-2 text-xs font-mono font-medium text-slate-400">
                  M-{item.month < 10 ? `0${item.month}` : item.month}
                </td>
                <td className="py-2 text-xs font-semibold text-white text-right">
                  {formatCurrency(item.emi, currencySymbol)}
                </td>
                <td className="py-2 text-xs text-emerald-450 text-right font-medium">
                  {formatCurrency(item.principalPaid, currencySymbol)}
                </td>
                <td className="py-2 text-xs text-rose-400 text-right font-medium">
                  {formatCurrency(item.interestPaid, currencySymbol)}
                </td>
                <td className="py-2 text-xs font-mono text-slate-300 text-right">
                  {formatCurrency(item.balance, currencySymbol)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
