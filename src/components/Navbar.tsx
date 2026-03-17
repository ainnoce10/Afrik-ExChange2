import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, LogOut, User, LayoutDashboard, ShieldCheck } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Wallet className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-900">Afrik-ExChange</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-600 hover:text-orange-500 font-medium transition-colors">Accueil</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-slate-600 hover:text-orange-500 font-medium transition-colors">Dashboard</Link>
                <Link to="/buy" className="text-slate-600 hover:text-orange-500 font-medium transition-colors">Acheter</Link>
                <Link to="/sell" className="text-slate-600 hover:text-orange-500 font-medium transition-colors">Vendre</Link>
                <Link to="/referral" className="text-slate-600 hover:text-orange-500 font-medium transition-colors">Parrainage</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-orange-600 hover:text-orange-700 font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            ) : null}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">{user.email.split('@')[0]}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="px-4 py-2 text-slate-600 font-medium hover:text-orange-500 transition-colors">Connexion</Link>
                <Link to="/register" className="px-5 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all shadow-sm">S'inscrire</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
