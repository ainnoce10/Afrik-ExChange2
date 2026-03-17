import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Transaction {
  id: number;
  type: 'buy' | 'sell';
  asset: string;
  local_currency: string;
  amount_asset: number;
  amount_local: number;
  status: string;
  created_at: string;
}

interface DashboardData {
  user: {
    email: string;
    phone: string;
    kyc_status: string;
    is_verified: boolean;
  };
  wallet: {
    address: string;
    balance: string;
  };
  transactions: Transaction[];
  rates: any[];
}

const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/transactions/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  if (loading) return <div className="flex items-center justify-center h-64">Chargement du dashboard...</div>;
  if (!data) return <div>Erreur lors du chargement des données.</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500">Bienvenue sur votre espace personnel Afrik-ExChange.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/buy" className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all shadow-sm">Acheter USDT</Link>
          <Link to="/sell" className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-all">Vendre USDT</Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Wallet className="text-orange-600 w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Solde USDT (TRC20)</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{parseFloat(data.wallet.balance).toFixed(2)} USDT</div>
          <div className="text-sm text-slate-500 mt-1">
            ≈ {(parseFloat(data.wallet.balance) * (data.rates.find(r => r.asset === 'USDT' && r.local_currency === 'XOF')?.sell_rate || 630)).toLocaleString()} XOF
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <History className="text-blue-600 w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Adresse de réception (TRC20)</span>
          </div>
          <div className="flex items-center gap-3">
            <code className="bg-slate-50 px-3 py-2 rounded-lg text-slate-700 font-mono text-sm flex-1 break-all">
              {data.wallet.address}
            </code>
            <button 
              onClick={() => navigator.clipboard.writeText(data.wallet.address)}
              className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-bold transition-colors"
            >
              Copier
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-3">Utilisez cette adresse uniquement pour recevoir des USDT sur le réseau TRON (TRC20).</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Transactions récentes</h3>
          <button className="text-sm text-orange-500 font-bold hover:underline">Voir tout</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Montant Actif</th>
                <th className="px-6 py-4">Montant Local</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.transactions.length > 0 ? (
                data.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {tx.type === 'buy' ? (
                          <div className="p-2 bg-green-100 rounded-lg"><ArrowDownLeft className="w-4 h-4 text-green-600" /></div>
                        ) : (
                          <div className="p-2 bg-red-100 rounded-lg"><ArrowUpRight className="w-4 h-4 text-red-600" /></div>
                        )}
                        <span className="font-bold text-slate-700">{tx.type === 'buy' ? 'Achat' : 'Vente'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{tx.amount_asset} {tx.asset}</td>
                    <td className="px-6 py-4 text-slate-600">{tx.amount_local.toLocaleString()} {tx.local_currency}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {tx.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                        {tx.status === 'pending' && <Clock className="w-3 h-3" />}
                        {tx.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {format(new Date(tx.created_at), 'dd MMM yyyy, HH:mm', { locale: fr })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Aucune transaction pour le moment.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
