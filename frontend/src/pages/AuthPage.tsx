import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Mail, Lock, User as UserIcon, ArrowRight, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../features/auth/context/AuthContext';
import { getErrorMessage } from '../lib/apiClient';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, login, register, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already logged in, provide a quick continue card
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-purple-500/30 bg-[#121216] p-8 text-center space-y-6 shadow-2xl shadow-purple-950/40">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-900/50">
            <Compass className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Welcome Back</h2>
            <p className="text-sm text-zinc-400">
              You are currently signed in as <strong className="text-purple-300">{user.email}</strong>.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              size="lg"
              onClick={() => navigate('/home')}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-900/40"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Enter Storefront
            </Button>

            <Button
              size="md"
              variant="outline"
              onClick={() => logout()}
              className="w-full border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white"
            >
              Sign Out / Switch Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      await login({ email: loginEmail, password: loginPassword });
      navigate('/home');
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (registerPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      await register({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      });
      setSuccessMessage('Account created successfully! Entering storefront...');
      setTimeout(() => navigate('/home'), 1200);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestBrowse = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-purple-900/20 blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 z-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-xl shadow-purple-900/50">
          <Compass className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          NovaStore
        </h1>
        <p className="text-sm text-zinc-400">
          Modern Audio, Workspace & Timepiece Hardware
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="rounded-3xl border border-zinc-800 bg-[#121216] p-7 sm:p-9 shadow-2xl shadow-purple-950/40 space-y-6">
          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-[#18181f] p-1 border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-950/60'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-950/60'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback alerts */}
          {errorMessage && (
            <div className="flex items-center gap-2.5 rounded-xl border border-rose-800/40 bg-rose-950/30 p-3.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-800/40 bg-emerald-950/30 p-3.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="developer@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                leftIcon={<Mail className="h-4 w-4" />}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                leftIcon={<Lock className="h-4 w-4" />}
              />

              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-900/40"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Sign In
              </Button>

              {/* Quick Fill Test Accounts */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider text-center">
                  Quick-Fill Test Accounts
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('seller@novastore.com');
                      setLoginPassword('seller12345');
                    }}
                    className="p-2 rounded-xl bg-[#18181f] border border-zinc-800 hover:border-purple-500/50 text-left text-xs transition-colors cursor-pointer group"
                  >
                    <span className="font-bold text-purple-300 block group-hover:text-purple-200">
                      Seller Role
                    </span>
                    <span className="text-[10px] text-zinc-500 block truncate">
                      seller@novastore.com
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('admin@novastore.com');
                      setLoginPassword('admin12345');
                    }}
                    className="p-2 rounded-xl bg-[#18181f] border border-zinc-800 hover:border-purple-500/50 text-left text-xs transition-colors cursor-pointer group"
                  >
                    <span className="font-bold text-purple-300 block group-hover:text-purple-200">
                      Admin Role
                    </span>
                    <span className="text-[10px] text-zinc-500 block truncate">
                      admin@novastore.com
                    </span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="Alex Morgan"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                required
                leftIcon={<UserIcon className="h-4 w-4" />}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="developer@example.com"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
                leftIcon={<Mail className="h-4 w-4" />}
              />

              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
                leftIcon={<Lock className="h-4 w-4" />}
              />

              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-900/40"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Create Account
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#121216] px-3 text-zinc-500 font-semibold tracking-wider">
                Or Continue As Guest
              </span>
            </div>
          </div>

          {/* Prominent "Browse the Products" Button */}
          <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-4 text-center space-y-3">
            <p className="text-xs text-zinc-300">
              Want to check out the catalog before signing up?
            </p>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleGuestBrowse}
              className="w-full border-purple-500/40 bg-purple-950/40 text-purple-200 hover:bg-purple-900/60 hover:text-white font-semibold"
              leftIcon={<Eye className="h-4 w-4 text-purple-400" />}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Browse the Products
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
