import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1 space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <Wallet className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-slate-900">Afrik-ExChange</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              La plateforme leader pour l'échange de cryptomonnaies en Afrique. Sécurisé, rapide et accessible.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-orange-500 transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-orange-500 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-orange-500 transition-colors"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Plateforme</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link to="/buy" className="hover:text-orange-500 transition-colors">Acheter USDT</Link></li>
              <li><Link to="/sell" className="hover:text-orange-500 transition-colors">Vendre USDT</Link></li>
              <li><Link to="/dashboard" className="hover:text-orange-500 transition-colors">Tableau de bord</Link></li>
              <li><Link to="/referral" className="hover:text-orange-500 transition-colors">Parrainage</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-orange-500 transition-colors">Centre d'aide</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Contactez-nous</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Frais & Limites</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Statut du réseau</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Légal</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-orange-500 transition-colors">Conditions d'utilisation</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Politique de confidentialité</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Politique AML/KYC</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Mentions légales</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs">
            © 2026 Afrik-ExChange. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Système Opérationnel
            </div>
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              support@afrik-exchange.com
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
