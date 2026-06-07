import React, { useState, useEffect } from 'react';
import { SavedScenario, CalculatorType } from '../types';
import { formatCurrency } from '../utils/math';
import { Save, Trash2, Calendar, FileText, ChevronRight } from 'lucide-react';

interface SavedScenariosPanelProps {
  currentType: CalculatorType;
  currentInput: any;
  currentResult: any;
  onLoadScenario: (input: any) => void;
  currencySymbol: string;
}

export default function SavedScenariosPanel({
  currentType,
  currentInput,
  currentResult,
  onLoadScenario,
  currencySymbol
}: SavedScenariosPanelProps) {
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [scenarioName, setScenarioName] = useState('');

  // Hydrate scenarios from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('financial_calculator_scenarios');
      if (stored) {
        setScenarios(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse saved scenarios', e);
    }
  }, []);

  // Save current scenario configuration
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioName.trim()) return;

    const newScenario: SavedScenario = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      name: scenarioName.trim(),
      type: currentType,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      input: currentInput,
      result: currentResult
    };

    const updated = [newScenario, ...scenarios];
    setScenarios(updated);
    localStorage.setItem('financial_calculator_scenarios', JSON.stringify(updated));
    setScenarioName('');
  };

  // Delete an existing logged scenario
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering load handler
    const updated = scenarios.filter(s => s.id !== id);
    setScenarios(updated);
    localStorage.setItem('financial_calculator_scenarios', JSON.stringify(updated));
  };

  // Filter list by selected tab
  const filteredScenarios = scenarios.filter(s => s.type === currentType);

  // Quick description generator helper
  const getScenarioDescription = (sc: SavedScenario) => {
    switch (sc.type) {
      case 'emi':
        return `EMI: ${formatCurrency(sc.result.monthlyPayment, currencySymbol)}/mo (Loan: ${formatCurrency(sc.input.principal, currencySymbol)})`;
      case 'sip':
        return `${formatCurrency(sc.input.monthlyInvestment, currencySymbol)}/mo · ${sc.input.period}y · Expected ${sc.result.futureValue > 1000 ? formatCurrency(sc.result.futureValue, currencySymbol) : ''}`;
      case 'fd':
        return `FD: Maturity ${formatCurrency(sc.result.maturityValue, currencySymbol)} (Capital: ${formatCurrency(sc.input.principal, currencySymbol)})`;
      case 'tax':
        return `Taxable: ${formatCurrency(sc.result.taxableIncome, currencySymbol)} · Net due: ${formatCurrency(sc.result.netTaxpayable, currencySymbol)}`;
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col gap-4 p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg">
      <div>
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Save size={16} className="text-indigo-400" />
          Offline Scenario Logs
        </h4>
        <p className="text-xs text-slate-400">Save your current calculator settings locally for reference</p>
      </div>

      {/* Save current form as scenario */}
      <form onSubmit={handleSave} className="flex gap-2">
        <input
          type="text"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
          placeholder={`Name scenario (e.g., "House Loan 12y")`}
          className="flex-1 text-xs px-3 py-2 border border-white/10 rounded-xl bg-white/5 text-white placeholder-slate-450 focus:outline-hidden focus:border-indigo-400 font-medium"
          maxLength={30}
        />
        <button
          type="submit"
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-98 transition-all shrink-0 flex items-center gap-1 shadow-sm cursor-pointer"
        >
          Save
        </button>
      </form>

      {/* Saved scenarios log list */}
      <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
        {filteredScenarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400 border border-dashed border-white/10 rounded-xl bg-white/5">
            <FileText size={20} strokeWidth={1.5} className="mb-1 text-slate-400" />
            <span className="text-[11px] font-semibold">No saved {currentType.toUpperCase()} scenarios</span>
            <span className="text-[9px]">Enter specifications above and click save to lock it in</span>
          </div>
        ) : (
          filteredScenarios.map((sc) => (
            <div
              key={sc.id}
              onClick={() => onLoadScenario(sc.input)}
              className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10 hover:border-indigo-400/50 hover:bg-white/10 transition-all cursor-pointer group"
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-bold text-white truncate block">
                    {sc.name}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 flex items-center gap-0.5 shrink-0">
                    <Calendar size={10} />
                    {sc.date}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-300 font-sans block truncate leading-none">
                  {getScenarioDescription(sc)}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => handleDelete(sc.id, e)}
                  className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
