import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Save,
  ArrowUpRight,
  ArrowDownLeft,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Transaction {
  id: number;
  user_id: string;
  email: string;
  phone: string;
  type: 'buy' | 'sell';
  asset: string;
  local_currency: string;
  amount_asset: number;
  amount_local: number;
  status: string;
  created_at: string;
  payment_method: string;
  payment_details: string;
}

interface Rate {
  id: number;
  asset: string;
  local_currency: string;
  buy_rate: number;
  sell_rate: number;
  updated_at: string;
}

interface Stats {
  volume: number;
  users: number;
  pending: number;
}

const Admin: React.FC = () => {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingRate, setUpdatingRate] = useState<number | null>(null);
  const [refreshingLive, setRefreshingLive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const [txRes, statsRes, ratesRes] = await Promise.all([
        axios.get('/api/admin/transactions', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/transactions/rates')
      ]);
      setTransactions(txRes.data);
      setStats(statsRes.data);
      setRates(ratesRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleUpdateRate = async (rate: Rate) => {
    setUpdatingRate(rate.id);
    try {
      await axios.post('/api/admin/rates', rate, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Taux mis à jour avec succès');
    } catch (err) {
      alert('Erreur lors de la mise à jour des taux');
    } finally {
      setUpdatingRate(null);
    }
  };

  const handleRefreshLiveRates = async () => {
    setRefreshingLive(true);
    try {
      const res = await axios.post('/api/admin/rates/refresh', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRates(res.data.rates);
      alert('Taux actualisés depuis le marché direct');
    } catch (err) {
      alert('Erreur lors de l\'actualisation en direct');
    } finally {
      setRefreshingLive(false);
    }
  };

  const handleValidateTransaction = async (id: number, status: string) => {
    try {
      await axios.post(`/api/admin/transactions/${id}/validate`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Erreur lors de la validation');
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    tx.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.phone.includes(searchTerm) ||
    tx.id.toString().includes(searchTerm)
  );

  if (loading) return <div className="flex items-center justify-center h-64">Chargement de l'administration...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Administration</h1>
        <button 
          onClick={fetchData}
          className="p-2 text-slate-400 hover:text-orange-500 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <TrendingUp className="text-orange-600 w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Volume Total</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats?.volume.toLocaleString()} FCFA</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="text-blue-600 w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Utilisateurs</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats?.users}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Clock className="text-yellow-600 w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">En attente</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats?.pending}</div>
        </div>
      </div>

      {/* Rates Management */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">Gestion des taux</h3>
          <button 
            onClick={handleRefreshLiveRates}
            disabled={refreshingLive}
            className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-xl font-bold text-sm hover:bg-orange-200 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshingLive ? 'animate-spin' : ''}`} />
            {refreshingLive ? 'Actualisation...' : 'Actualiser (Live Market)'}
          </button>
        </div>
        <div className="space-y-4">
          {rates.map((rate) => (
            <div key={rate.id} className="grid md:grid-cols-6 gap-4 items-end p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Paire</span>
                <div className="font-bold text-slate-700">{rate.asset} / {rate.local_currency}</div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Achat (Client paye)</label>
                <input 
                  type="number" 
                  value={rate.buy_rate}
                  onChange={(e) => setRates(rates.map(r => r.id === rate.id ? {...r, buy_rate: parseFloat(e.target.value)} : r))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Vente (Client reçoit)</label>
                <input 
                  type="number" 
                  value={rate.sell_rate}
                  onChange={(e) => setRates(rates.map(r => r.id === rate.id ? {...r, sell_rate: parseFloat(e.target.value)} : r))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Dernière MAJ</span>
                <div className="text-[10px] text-slate-500">{format(new Date(rate.updated_at), 'HH:mm:ss', { locale: fr })}</div>
              </div>
              <button 
                onClick={() => handleUpdateRate(rate)}
                disabled={updatingRate === rate.id}
                className="py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {updatingRate === rate.id ? '...' : 'Enregistrer'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* All Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-900">Toutes les transactions</h3>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher (Email, Tel, ID)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Montant Actif</th>
                <th className="px-6 py-4">Montant Local</th>
                <th className="px-6 py-4">Détails Paiement</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">{tx.email}</div>
                    <div className="text-xs text-slate-500">{tx.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {tx.type === 'buy' ? (
                        <ArrowDownLeft className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium">{tx.type === 'buy' ? 'Achat' : 'Vente'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">{tx.amount_asset} {tx.asset}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">{tx.amount_local.toLocaleString()} {tx.local_currency}</div>
                    <div className="text-[10px] text-slate-400">Taux: {tx.rate}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold uppercase text-slate-400">{tx.payment_method}</div>
                    <div className="text-sm text-slate-700">{tx.payment_details}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                      tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                      tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {tx.status === 'pending' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleValidateTransaction(tx.id, 'completed')}
                          className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          title="Valider"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleValidateTransaction(tx.id, 'cancelled')}
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Annuler"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
