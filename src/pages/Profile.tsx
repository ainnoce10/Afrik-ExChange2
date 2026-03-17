import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User, Shield, Smartphone, Upload, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const Profile: React.FC = () => {
  const { token, user: authUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [kycData, setKycData] = useState({
    document_type: 'CNI',
    document_url: 'https://picsum.photos/seed/id/400/300', // Mock URL
    selfie_url: 'https://picsum.photos/seed/selfie/400/300' // Mock URL
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProfile();
  }, [token]);

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post('/api/user/kyc', kycData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Documents KYC soumis avec succès. En attente de validation.' });
      // Refresh profile to show pending status
      const response = await axios.get('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erreur lors de la soumission' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64">Chargement du profil...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mon Profil</h1>
        <p className="text-slate-500">Gérez vos informations personnelles et votre sécurité.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="text-orange-600 w-10 h-10" />
            </div>
            <h3 className="font-bold text-slate-900">{profile?.email.split('@')[0]}</h3>
            <p className="text-sm text-slate-500">{profile?.email}</p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
              ID: #{profile?.id}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-500" /> Sécurité
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Statut KYC</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  profile?.kyc_status === 'approved' ? 'bg-green-100 text-green-700' :
                  profile?.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {profile?.kyc_status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">2FA</span>
                <span className="text-xs font-bold text-red-500">DÉSACTIVÉ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: KYC Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Vérification d'identité (KYC)</h3>
            
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
                message.type === 'success' ? 'bg-green-50 border border-green-100 text-green-600' : 'bg-red-50 border border-red-100 text-red-600'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p>{message.text}</p>
              </div>
            )}

            {profile?.kyc_status === 'approved' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="text-green-600 w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Compte Vérifié</h4>
                <p className="text-slate-500 mt-2">Votre identité a été confirmée. Vous avez accès à toutes les fonctionnalités.</p>
              </div>
            ) : profile?.kyc_status === 'pending' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-yellow-600 w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Vérification en cours</h4>
                <p className="text-slate-500 mt-2">Nos administrateurs examinent vos documents. Cela prend généralement moins de 24h.</p>
              </div>
            ) : (
              <form onSubmit={handleKycSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Type de document</label>
                  <select 
                    value={kycData.document_type}
                    onChange={(e) => setKycData({...kycData, document_type: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="CNI">Carte Nationale d'Identité</option>
                    <option value="PASSPORT">Passeport</option>
                    <option value="DRIVING_LICENSE">Permis de conduire</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Photo du document (Recto)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-orange-500 transition-colors cursor-pointer bg-slate-50">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <span className="text-xs text-slate-500 font-medium">Cliquez pour uploader</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Selfie avec le document</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-orange-500 transition-colors cursor-pointer bg-slate-50">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <span className="text-xs text-slate-500 font-medium">Cliquez pour uploader</span>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={uploading}
                  className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploading ? 'Envoi...' : 'Soumettre pour vérification'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
