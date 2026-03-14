'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Key, 
  Download, 
  CreditCard, 
  Settings, 
  Shield, 
  Check,
  Copy,
  ExternalLink,
  Zap,
  Crown,
  Users,
  BarChart3,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface AccountDashboardProps {
  userId: string;
  isPro: boolean;
  usage: number;
}

export default function AccountDashboard({ userId, isPro, usage }: AccountDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'extension' | 'billing' | 'team' | 'settings'>('overview');
  const [apiKey, setApiKey] = useState<{id: string, key: string, created_at: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      const res = await fetch('/api/extension-api');
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.apiKey);
      }
    } catch (err) {
      console.error('Error fetching API key:', err);
    }
  };

  const generateApiKey = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/extension-api', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.apiKey);
        alert('API key generated successfully!');
      }
    } catch (err) {
      alert('Failed to generate API key');
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = () => {
    if (apiKey?.key) {
      navigator.clipboard.writeText(apiKey.key);
      alert('API key copied to clipboard!');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'extension', label: 'Browser Extension', icon: Download },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Dashboard</h1>
          <p className="text-slate-400">Manage your TypeSmart account and settings</p>
        </div>

        <div className={`rounded-2xl p-6 mb-8 ${
          isPro 
            ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30'
            : 'bg-slate-800/50 border border-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
                isPro ? 'bg-indigo-500/20' : 'bg-slate-700'
              }`}>
                {isPro ? (
                  <Zap className="h-7 w-7 text-indigo-400" />
                ) : (
                  <User className="h-7 w-7 text-slate-400" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{isPro ? 'Pro Plan' : 'Free Plan'}</h2>
                <p className="text-slate-400">{isPro ? '$9/month — Unlimited generations' : '5 generations per day'}</p>
              </div>
            </div>
            {!isPro && (
              <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-800 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Usage Today</h3>
                </div>
                <p className="text-3xl font-bold mb-1">{isPro ? '∞' : usage}</p>
                <p className="text-slate-400 text-sm">{isPro ? 'Unlimited generations' : 'of 5 free generations'}</p>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Plan Status</h3>
                </div>
                <p className="text-3xl font-bold mb-1">{isPro ? 'Active' : 'Free'}</p>
                <p className="text-slate-400 text-sm">{isPro ? 'Renews monthly' : 'Upgrade anytime'}</p>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Features</h3>
                </div>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> AI Generation</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> All Tones</li>
                  {isPro && (
                    <>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Browser Extension</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Custom Tones</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'extension' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <Key className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">API Key</h3>
                    <p className="text-slate-400 text-sm">Use this key to authenticate the browser extension</p>
                  </div>
                </div>

                {apiKey ? (
                  <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between">
                    <code className="text-sm text-indigo-400 font-mono">{apiKey.key}</code>
                    <button onClick={copyApiKey} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                      <Copy className="h-4 w-4" /> Copy
                    </button>
                  </div>
                ) : (
                  <button onClick={generateApiKey} disabled={loading} className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                    Generate API Key
                  </button>
                )}
              </div>

              {isPro ? (
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <Download className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Download Extension</h3>
                      <p className="text-slate-400 text-sm">Install TypeSmart in your browser</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <a href="/extension/typesmart-extension-chrome-v1.0.0.zip" download className="bg-slate-700 hover:bg-slate-600 rounded-xl p-6 transition-all">
                      <h4 className="font-semibold">Chrome Extension</h4>
                      <p className="text-sm text-slate-400">Version 1.0.0</p>
                    </a>
                    <a href="/extension/typesmart-extension-firefox-v1.0.0.zip" download className="bg-slate-700 hover:bg-slate-600 rounded-xl p-6 transition-all">
                      <h4 className="font-semibold">Firefox Extension</h4>
                      <p className="text-sm text-slate-400">Version 1.0.0</p>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 text-center">
                  <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Extension Access</h3>
                  <p className="text-slate-400 mb-4">Browser extension is available for Pro users only</p>
                  <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">Upgrade to Pro</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Billing & Subscription</h3>
                  <p className="text-slate-400 text-sm">Manage your subscription</p>
                </div>
              </div>
              {isPro ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-green-300">Pro Plan Active</h4>
                  <p className="text-slate-400">$9/month subscription</p>
                </div>
              ) : (
                <p className="text-slate-400">You are on the Free plan. Upgrade to Pro for unlimited access.</p>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-slate-600/20 rounded-xl flex items-center justify-center">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Account Settings</h3>
                  <p className="text-slate-400 text-sm">Manage your profile</p>
                </div>
              </div>
              <div className="bg-slate-900 rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-1">User ID</p>
                <p className="font-mono text-sm">{userId}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
