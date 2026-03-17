import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Smartphone, Info, AlertCircle, CheckCircle2, Wallet, ChevronDown } from 'lucide-react';
import CryptoSelector from '../components/CryptoSelector';
import { SELL_CRYPTOS } from '../constants/cryptos';

const Sell: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [amountAsset, setAmountAsset] = useState<string>('100');
  const [amountLocal, setAmountLocal] = useState<string>('');
  const [lastEdited, setLastEdited] = useState<'asset' | 'local'>('asset');
  const [asset, setAsset] = useState(SELL_CRYPTOS[0].symbol);
  const [localCurrency, setLocalCurrency] = useState('XOF');
  const [rates, setRates] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('orange');

  const paymentMethodsByCurrency: Record<string, string[]> = {
    'XOF': ['orange', 'mtn', 'moov', 'wave', 'visa'],
    'XAF': ['orange', 'mtn', 'visa']
  };

  const availableMethods = paymentMethodsByCurrency[localCurrency] || ['visa'];

  useEffect(() => {
    if (!availableMethods.includes(paymentMethod)) {
      setPaymentMethod(availableMethods[0]);
    }
  }, [localCurrency, availableMethods, paymentMethod]);
  const countries = [
    { name: "Côte d'Ivoire", flag: "🇨🇮", currency: "XOF" },
    { name: "Sénégal", flag: "🇸🇳", currency: "XOF" },
    { name: "Mali", flag: "🇲🇱", currency: "XOF" },
    { name: "Burkina Faso", flag: "🇧🇫", currency: "XOF" },
    { name: "Bénin", flag: "🇧🇯", currency: "XOF" },
    { name: "Togo", flag: "🇹🇬", currency: "XOF" },
    { name: "Niger", flag: "🇳🇪", currency: "XOF" },
    { name: "Guinée-Bissau", flag: "🇬🇼", currency: "XOF" },
    { name: "Cameroun", flag: "🇨🇲", currency: "XAF" },
    { name: "Gabon", flag: "🇬🇦", currency: "XAF" },
    { name: "Congo-Brazzaville", flag: "🇨🇬", currency: "XAF" },
    { name: "Tchad", flag: "🇹🇩", currency: "XAF" },
    { name: "RCA", flag: "🇨🇫", currency: "XAF" },
    { name: "Guinée Équatoriale", flag: "🇬🇶", currency: "XAF" },
    { name: "Autres", flag: "🌍", currency: "XOF" },
  ];

  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  const handleCountryChange = (countryName: string) => {
    const country = countries.find(c => c.name === countryName);
    if (country) {
      setSelectedCountry(country);
      setLocalCurrency(country.currency);
    }
  };
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState('');
  const [userWallet, setUserWallet] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rateRes, dashRes] = await Promise.all([
          axios.get('/api/transactions/rates'),
          axios.get('/api/transactions/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setRates(rateRes.data);
        setUserWallet(dashRes.data.wallet.address);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    if (token) {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const currentRateData = rates.find(r => r.asset === asset && r.local_currency === localCurrency);
  const currentRate = currentRateData?.sell_rate || 0;
  const baseRate = currentRateData?.base_rate || 0;
  const feePerAsset = baseRate - currentRate;
  const totalFee = parseFloat(amountAsset || '0') * feePerAsset;

  useEffect(() => {
    if (currentRate > 0) {
      if (lastEdited === 'asset' && amountAsset) {
        const calculated = (parseFloat(amountAsset) * currentRate).toFixed(2);
        if (calculated !== amountLocal) setAmountLocal(calculated);
      } else if (lastEdited === 'local' && amountLocal) {
        const calculated = (parseFloat(amountLocal) / currentRate).toFixed(6);
        if (calculated !== amountAsset) setAmountAsset(calculated);
      }
    }
  }, [currentRate, asset, localCurrency, lastEdited, amountAsset, amountLocal]);

  const handleAssetChange = (val: string) => {
    setAmountAsset(val);
    setLastEdited('asset');
    if (currentRate > 0 && val) {
      setAmountLocal((parseFloat(val) * currentRate).toFixed(2));
    } else if (!val) {
      setAmountLocal('');
    }
  };

  const handleLocalChange = (val: string) => {
    setAmountLocal(val);
    setLastEdited('local');
    if (currentRate > 0 && val) {
      setAmountAsset((parseFloat(val) / currentRate).toFixed(6));
    } else if (!val) {
      setAmountAsset('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/transactions/sell', {
        asset,
        local_currency: localCurrency,
        amount_asset: parseFloat(amountAsset),
        payment_method: paymentMethod,
        phone_number: phoneNumber
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="text-blue-600 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Demande de vente enregistrée !</h2>
          <p className="text-slate-500 mt-2">Veuillez envoyer vos {asset} pour recevoir vos {localCurrency}.</p>
          
          <div className="mt-8 p-6 bg-slate-50 rounded-xl text-left space-y-4">
            <h3 className="font-bold text-slate-900">Instructions de transfert :</h3>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">1. Envoyez exactement <span className="font-bold text-slate-900">{amountAsset} {asset}</span> à l'adresse suivante :</p>
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg overflow-hidden">
                <code className="font-mono font-bold text-sm text-blue-600 break-all">{userWallet}</code>
                <button 
                  onClick={() => navigator.clipboard.writeText(userWallet)}
                  className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold uppercase flex-shrink-0"
                >
                  Copier
                </button>
              </div>
              <p className="text-sm text-slate-600 mt-4">2. Une fois le transfert confirmé sur la blockchain, vous recevrez <span className="font-bold text-slate-900">{success.amount_local.toLocaleString()} {localCurrency}</span> sur votre compte {paymentMethod.toUpperCase()}.</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-8 w-full py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all"
          >
            Retour au Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Vendre des Cryptos</h1>
        <p className="text-slate-500 mt-2">Envoyez vos actifs et recevez du cash instantanément sur votre compte local.</p>
      </div>

      {/* Navigation Toggle */}
      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit mx-auto border border-slate-200">
        <button 
          onClick={() => navigate('/buy')}
          className="px-8 py-2.5 text-slate-500 hover:text-slate-700 rounded-xl font-bold transition-all"
        >
          Achat
        </button>
        <button 
          onClick={() => navigate('/sell')}
          className="px-8 py-2.5 bg-white text-orange-600 rounded-xl font-bold shadow-sm transition-all"
        >
          Vente
        </button>
      </div>

      {/* Region Selector */}
      <div className="text-center space-y-3 max-w-xs mx-auto">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Choisir ton pays</label>
        <div className="relative">
          <select
            value={selectedCountry.name}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
          >
            {countries.map((c) => (
              <option key={c.name} value={c.name}>
                {c.flag} {c.name} ({c.currency})
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ArrowRight className="w-4 h-4 rotate-90" />
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Asset & Currency Selectors */}
          <div className="grid md:grid-cols-2 gap-6">
            <CryptoSelector 
              assets={SELL_CRYPTOS}
              selectedSymbol={asset}
              onSelect={setAsset}
              label="Actif à vendre"
            />
            <div className="space-y-2 hidden">
              <label className="text-sm font-semibold text-slate-700">Monnaie locale de réception</label>
              <select 
                value={localCurrency}
                onChange={(e) => setLocalCurrency(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold"
              >
                <option value="XOF">XOF (FCFA - Côte d'Ivoire, Sénégal...)</option>
                <option value="XAF">XAF (FCFA - Cameroun, Gabon...)</option>
              </select>
            </div>
          </div>

          {/* Amount Inputs */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Vous envoyez ({asset})</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={amountAsset}
                  onChange={(e) => handleAssetChange(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold text-lg"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">{asset}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Vous recevez ({localCurrency})</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={amountLocal}
                  onChange={(e) => handleLocalChange(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold text-lg"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">{localCurrency}</span>
              </div>
            </div>
          </div>

          {/* Rate & Fee Info */}
          <div className="space-y-3">
            <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${currentRate > 0 ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500 animate-pulse'}`}>
              <Info className="w-5 h-5 flex-shrink-0" />
              <div>
                {currentRate > 0 ? (
                  <>
                    <p>Taux actuel : <span className="font-bold">1 {asset} = {currentRate.toLocaleString()} {localCurrency}</span></p>
                    <p className="text-xs opacity-80">Inclut les frais de service de {totalFee.toLocaleString()} {localCurrency}</p>
                  </>
                ) : (
                  <p>Chargement des taux en temps réel...</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-700">Recevoir via</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {availableMethods.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === method 
                      ? 'border-orange-500 bg-orange-50 text-orange-600' 
                      : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <Smartphone className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">{method}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              {paymentMethod === 'visa' ? 'Numéro de Carte / RIB' : 'Numéro de réception Mobile Money'}
            </label>
            <input 
              type="text" 
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              placeholder={paymentMethod === 'visa' ? 'XXXX XXXX XXXX XXXX' : '+225 00 00 00 00 00'}
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !amountAsset || parseFloat(amountAsset) <= 0}
            className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Traitement...' : 'Confirmer la vente'} <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sell;
