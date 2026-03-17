import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Globe, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';

const Home: React.FC = () => {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight"
          >
            Échangez vos <span className="text-orange-500">Cryptos</span> contre du <span className="text-orange-500">Cash</span> instantanément.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto"
          >
            La plateforme panafricaine la plus rapide et sécurisée pour acheter et vendre USDT, BTC, BNB et USDC via Mobile Money et Visa.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2">
              Commencer maintenant <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all">
              Se connecter
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
            <Zap className="text-orange-600 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Instantané</h3>
          <p className="text-slate-600">Transactions traitées en quelques minutes. Recevez vos fonds sans attendre.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
            <Shield className="text-blue-600 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Sécurisé</h3>
          <p className="text-slate-600">Protection avancée de vos données et de vos fonds grâce à la technologie blockchain.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
            <Smartphone className="text-green-600 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Paiements Locaux</h3>
          <p className="text-slate-600">Compatible avec Orange, MTN, Moov, Wave et Visa pour une accessibilité totale en Afrique.</p>
        </div>
      </section>

      {/* Stats/Trust */}
      <section className="bg-slate-900 rounded-3xl p-12 text-white overflow-hidden relative">
        <div className="relative z-10 grid md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">10k+</div>
            <div className="text-slate-400">Utilisateurs actifs</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">5M+</div>
            <div className="text-slate-400">Volume échangé (USDT)</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">99.9%</div>
            <div className="text-slate-400">Taux de satisfaction</div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 blur-3xl rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full -ml-32 -mb-32"></div>
      </section>
    </div>
  );
};

export default Home;
