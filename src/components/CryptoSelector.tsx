import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { CryptoAsset } from '../constants/cryptos';

interface CryptoSelectorProps {
  assets: CryptoAsset[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  label: string;
}

const CryptoSelector: React.FC<CryptoSelectorProps> = ({ assets, selectedSymbol, onSelect, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedAsset = assets.find(a => a.symbol === selectedSymbol) || assets[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold text-left"
      >
        <div className="flex items-center gap-3">
          <img src={selectedAsset.logo} alt={selectedAsset.name} className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
          <span>{selectedAsset.symbol}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto py-2">
          {assets.map((asset) => (
            <button
              key={asset.symbol}
              type="button"
              onClick={() => {
                onSelect(asset.symbol);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left ${
                selectedSymbol === asset.symbol ? 'bg-orange-50 text-orange-600' : 'text-slate-700'
              }`}
            >
              <img src={asset.logo} alt={asset.name} className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
              <div className="flex flex-col">
                <span className="font-bold">{asset.symbol}</span>
                <span className="text-xs text-slate-400">{asset.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CryptoSelector;
