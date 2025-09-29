import React from 'react';
import type { PricingSuggestion } from '../types';

interface PricingResultProps {
  result: PricingSuggestion | null;
}

const PricingResult: React.FC<PricingResultProps> = ({ result }) => {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center text-center bg-zinc-900 p-8 rounded-2xl shadow-lg border border-zinc-800 h-full">
        <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
            <path d="M12 18.01V18" />
            <path d="M12 4.5c4.142 0 7.5 3.358 7.5 7.5s-3.358 7.5-7.5 7.5S4.5 16.142 4.5 12 7.858 4.5 12 4.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-zinc-100">Your pricing report will appear here</h3>
        <p className="text-zinc-400 mt-2">Fill out the form to get an AI-powered pricing analysis for your creation.</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-emerald-400';
    if (profit < 0) return 'text-red-400';
    return 'text-zinc-400';
  }

  return (
    <div className="bg-zinc-900 p-6 md:p-8 rounded-2xl shadow-lg border border-zinc-800 animate-fade-in space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">Pricing Suggestions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PriceCard title="Low-End Price" price={formatCurrency(result.suggestedPrices.lowEnd)} profit={formatCurrency(result.profitAnalysis.lowEndProfit)} profitColor={getProfitColor(result.profitAnalysis.lowEndProfit)} />
          <PriceCard title="Market Rate" price={formatCurrency(result.suggestedPrices.marketRate)} profit={formatCurrency(result.profitAnalysis.marketRateProfit)} profitColor={getProfitColor(result.profitAnalysis.marketRateProfit)} isFeatured={true} />
          <PriceCard title="High-End Price" price={formatCurrency(result.suggestedPrices.highEnd)} profit={formatCurrency(result.profitAnalysis.highEndProfit)} profitColor={getProfitColor(result.profitAnalysis.highEndProfit)} />
        </div>
      </div>
      
      <div className="pt-6 border-t border-zinc-800">
        <h3 className="text-xl font-semibold text-zinc-100 mb-3">AI Pricing Rationale</h3>
        <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{result.pricingRationale}</p>
      </div>
      
      <div className="pt-6 border-t border-zinc-800">
        <h3 className="text-xl font-semibold text-zinc-100 mb-3">Marketing & Sales Tips</h3>
        <ul className="space-y-3 list-disc list-inside text-zinc-300">
          {result.marketingSuggestions.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>

    </div>
  );
};

interface PriceCardProps {
    title: string;
    price: string;
    profit: string;
    profitColor: string;
    isFeatured?: boolean;
}

const PriceCard: React.FC<PriceCardProps> = ({ title, price, profit, profitColor, isFeatured = false }) => (
    <div className={`p-4 rounded-lg text-center transition-transform transform ${isFeatured ? 'bg-red-600/10 border-2 border-red-500 scale-105' : 'bg-zinc-800 border border-zinc-700'}`}>
        <h4 className="text-sm font-semibold text-zinc-400">{title}</h4>
        <p className={`text-2xl font-bold ${isFeatured ? 'text-red-500' : 'text-zinc-100'}`}>{price}</p>
        <p className={`text-xs font-medium mt-1 ${profitColor}`}>Profit: {profit}</p>
    </div>
);


export default PricingResult;