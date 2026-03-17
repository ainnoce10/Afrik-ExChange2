import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Users, Gift, Copy, Share2, CheckCircle2 } from 'lucide-react';

const Referral: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/user/referrals', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
      } catch (err) {
        console.error('Error fetching referral data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const copyToClipboard = () => {
    const link = `${window.location.origin}/register?ref=${data?.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex items-center justify-center h-64">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-orange-500 rounded-3xl p-12 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-extrabold mb-4">Parrainez vos amis et gagnez des USDT !</h1>
          <p className="text-orange-100 text-lg mb-8">
            Partagez votre lien de parrainage et recevez 0.5% de commission sur chaque transaction effectuée par vos filleuls.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-4 flex-1 flex items-center justify-between">
              <code className="font-mono font-bold text-lg">{data?.referral_code}</code>
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-sm font-bold hover:text-orange-200 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copié !' : 'Copier'}
              </button>
            </div>
          </div>
        </div>
        <Gift className="absolute right-12 top-1/2 -translate-y-1/2 w-48 h-48 text-white/10 rotate-12" />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Mes Filleuls</h3>
              <p className="text-sm text-slate-500">Nombre total de personnes parrainées</p>
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900">{data?.total_referrals}</div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-green-100 rounded-xl">
              <Gift className="text-green-600 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Gains totaux</h3>
              <p className="text-sm text-slate-500">Commissions accumulées</p>
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900">{data?.earnings_usdt.toFixed(2)} USDT</div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Comment ça marche ?</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">1</div>
            <h4 className="font-bold text-slate-900">Partagez votre lien</h4>
            <p className="text-sm text-slate-500">Envoyez votre lien unique à vos amis ou partagez-le sur les réseaux sociaux.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">2</div>
            <h4 className="font-bold text-slate-900">Ils s'inscrivent</h4>
            <p className="text-sm text-slate-500">Vos amis créent un compte et effectuent leur première transaction.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">3</div>
            <h4 className="font-bold text-slate-900">Gagnez des USDT</h4>
            <p className="text-sm text-slate-500">Recevez automatiquement une commission sur chaque échange qu'ils réalisent.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referral;
