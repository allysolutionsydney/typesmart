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
// Using native alerts instead of toast

interface AccountDashboardProps {
  userId: string;
  userEmail?: string;
  isPro: boolean;
  isOwner: boolean;
  usage: number;
}

export default function AccountDashboard({ userId, userEmail, isPro, isOwner, usage }: AccountDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'extension' | 'billing' | 'team' | 'settings'>('overview');
  const [apiKey, setApiKey] = useState<{id: string, key: string, created_at: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchApiKey();
    if (isPro || isOwner) {
      fetchSubscription();
    }
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

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscription');
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    }
  };

  const generateApiKey = async () => {
    setLoading(true);
    try {
      console.log('Generating API key...');
      const res = await fetch('/api/extension-api', { method: 'POST' });
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        alert(`Error: ${errorData.error || 'Failed to generate API key'}`);
        return;
      }
      
      const data = await res.json();
      console.log('API Key generated:', data);
      
      if (data.apiKey) {
        setApiKey(data.apiKey);
        alert('API key generated successfully!');
      } else {
        alert('No API key returned from server');
      }
    } catch (err) {
      console.error('Generate API key error:', err);
      alert(`Failed to generate API key: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Dashboard</h1>
          <p className="text-slate-400">Manage your TypeSmart account and settings</p>
        </div>

        {/* Plan Banner */}
        <div className={`rounded-2xl p-6 mb-8 ${
          isOwner 
            ? 'bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border border-amber-500/30' 
            : isPro 
              ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30'
              : 'bg-slate-800/50 border border-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
                isOwner ? 'bg-amber-500/20' : isPro ? 'bg-indigo-500/20' : 'bg-slate-700'
              }`}>
                {isOwner ? (
                  <Crown className="h-7 w-7 text-amber-400" />
                ) : isPro ? (
                  <Zap className="h-7 w-7 text-indigo-400" />
                ) : (
                  <User className="h-7 w-7 text-slate-400" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isOwner ? 'Owner Plan' : isPro ? 'Pro Plan' : 'Free Plan'}
                </h2>
                <p className="text-slate-400">
                  {isOwner 
                    ? 'Unlimited access to all features' 
                    : isPro 
                      ? '$9/month — Unlimited generations'
                      : '5 generations per day'}
                </p>
              </div>
            </div>
            {!isPro && !isOwner && (
              <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
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

        {/* Tab Content */}
        <div className="space-y-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Usage Today</h3>
                </div>
                <p className="text-3xl font-bold mb-1">{isOwner || isPro ? '∞' : usage}</p>
                <p className="text-slate-400 text-sm">
                  {isOwner || isPro ? 'Unlimited generations' : 'of 5 free generations'}
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Plan Status</h3>
                </div>
                <p className="text-3xl font-bold mb-1">
                  {isOwner ? 'Owner' : isPro ? 'Active' : 'Free'}
                </p>
                <p className="text-slate-400 text-sm">
                  {isOwner ? 'Lifetime access' : isPro ? 'Renews monthly' : 'Upgrade anytime'}
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Features</h3>
                </div>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    AI Generation
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    All Tones
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    Browser Extension
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    Custom Tones
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* EXTENSION TAB */}
          {activeTab === 'extension' && (
            <div className="space-y-6">
              {/* API Key Section */}
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
                    <button
                      onClick={copyApiKey}
                      className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={generateApiKey}
                    disabled={loading}
                    className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Key className="h-4 w-4" />
                    )}
                    Generate API Key
                  </button>
                )}
              </div>

              {/* Download Section */}
              {(isPro || isOwner) ? (
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
                    <a
                      href="/extension/typesmart-extension-chrome-v1.0.0.zip"
                      download
                      className="bg-slate-700 hover:bg-slate-600 rounded-xl p-6 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">🌐</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold group-hover:text-indigo-400 transition-colors">Chrome Extension</h4>
                          <p className="text-sm text-slate-400">Version 1.0.0 • ZIP</p>
                        </div>
                        <Download className="h-5 w-5 text-slate-400 group-hover:text-white" />
                      </div>
                    </a>

                    <a
                      href="/extension/typesmart-extension-firefox-v1.0.0.zip"
                      download
                      className="bg-slate-700 hover:bg-slate-600 rounded-xl p-6 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">🦊</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold group-hover:text-indigo-400 transition-colors">Firefox Extension</h4>
                          <p className="text-sm text-slate-400">Version 1.0.0 • ZIP</p>
                        </div>
                        <Download className="h-5 w-5 text-slate-400 group-hover:text-white" />
                      </div>
                    </a>
                  </div>

                  <div className="mt-6 p-4 bg-slate-900/50 rounded-xl">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Installation Instructions
                    </h4>
                    <ol className="space-y-2 text-sm text-slate-400 list-decimal list-inside">
                      <li>Download the ZIP file for your browser</li>
                      <li>Extract the ZIP file</li>
                      <li>Open Chrome/Firefox extensions page (chrome://extensions/ or about:addons)</li>
                      <li>Enable "Developer mode"</li>
                      <li>Click "Load unpacked" and select the extracted folder</li>
                      <li>Enter your API key in the extension settings</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 text-center">
                  <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Extension Access</h3>
                  <p className="text-slate-400 mb-4">Browser extension is available for Pro users only</p>
                  <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">
                    Upgrade to Pro
                  </button>
                </div>
              )}
            </div>
          )}

          {/* BILLING TAB */}
          {activeTab === 'billing' && (
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Billing & Subscription</h3>
                  <p className="text-slate-400 text-sm">Manage your subscription and payment methods</p>
                </div>
              </div>

              {isOwner ? (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Crown className="h-6 w-6 text-amber-400" />
                    <h4 className="text-lg font-semibold text-amber-300">Owner Account</h4>
                  </div>
                  <p className="text-slate-400">
                    You have lifetime free access to all features. No billing required.
                  </p>
                </div>
              ) : subscription ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-900 rounded-xl p-4">
                      <p className="text-slate-400 text-sm mb-1">Current Plan</p>
                      <p className="text-xl font-semibold">Pro ($9/month)</p>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-4">
                      <p className="text-slate-400 text-sm mb-1">Status</p>
                      <p className="text-xl font-semibold text-green-400">Active</p>
                    </div>
                  </div>
                  <button className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1">
                    <ExternalLink className="h-4 w-4" />
                    Manage in Stripe
                  </button>
                </div>
              ) : (
                <p className="text-slate-400">Loading subscription details...</p>
              )}
            </div>
          )}

          {/* TEAM TAB */}
          {activeTab === 'team' && (
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <TeamManager />
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-slate-600/20 rounded-xl flex items-center justify-center">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Account Settings</h3>
                  <p className="text-slate-400 text-sm">Manage your profile and preferences</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900 rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-1">Email</p>
                  <p className="font-medium">{userEmail || 'Not available'}</p>
                </div>
                <div className="bg-slate-900 rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-1">User ID</p>
                  <p className="font-mono text-sm">{userId}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Team Manager Component
function TeamManager() {
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/team');
      if (res.ok) {
        const data = await res.json();
        setTeam(data.team);
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error('Error fetching team:', err);
    }
  };

  const createTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'My Team' }),
      });
      if (res.ok) {
        alert('Team created!');
        fetchTeam();
      }
    } catch (err) {
      alert('Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (res.ok) {
        alert(`Invitation sent to ${inviteEmail}`);
        setInviteEmail('');
      }
    } catch (err) {
      alert('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  if (!team) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Team Yet</h3>
        <p className="text-slate-400 mb-4">Create a team to share TypeSmart with others</p>
        <button
          onClick={createTeam}
          disabled={loading}
          className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-all"
        >
          {loading ? 'Creating...' : 'Create Team'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
          <Users className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">{team.name}</h3>
          <p className="text-slate-400 text-sm">{members.length} members</p>
        </div>
      </div>

      <form onSubmit={inviteMember} className="flex gap-2 mb-6">
        <input
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="Enter email to invite"
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !inviteEmail}
          className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-all"
        >
          Invite
        </button>
      </form>

      {members.length > 0 && (
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="bg-slate-900 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{member.email}</p>
                <p className="text-sm text-slate-400">{member.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
