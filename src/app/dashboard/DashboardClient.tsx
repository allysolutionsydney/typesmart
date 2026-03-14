"use client";

import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { 
  Sparkles, 
  Zap, 
  ArrowLeft, 
  Crown, 
  Download,
  Key,
  CreditCard,
  Settings,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Package,
  Shield
} from "lucide-react";
import Link from "next/link";
import CustomTonesManager from "@/components/CustomTonesManager";
import TeamManager from "@/components/TeamManager";

interface DashboardClientProps {
  userId: string;
  usage: number;
  remaining: number;
  isPro: boolean;
}

type Tab = "overview" | "extension" | "account" | "billing";

export default function DashboardClient({ usage, remaining, isPro }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { user } = useUser();
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateApiKey = async () => {
    setGeneratingKey(true);
    try {
      const response = await fetch('/api/extension-api', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setApiKey(data.apiKey?.key || null);
      }
    } catch (error) {
      console.error('Error generating API key:', error);
    }
    setGeneratingKey(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              Back to App
            </Link>
            <div className="h-6 w-px bg-slate-700" />
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-400" />
              <span className="text-xl font-bold">TypeSmart</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {isPro && (
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-medium flex items-center gap-1">
                <Crown className="h-4 w-4" />
                Pro
              </span>
            )}
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Account Dashboard</h1>
            <p className="text-slate-400">Manage your account, extension, and subscription</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-800 pb-4">
            {[
              { id: "overview", label: "Overview", icon: Zap },
              { id: "extension", label: "Extension", icon: Download },
              { id: "account", label: "Account", icon: Settings },
              { id: "billing", label: "Billing", icon: CreditCard },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName || 'there'}!</h2>
                <p className="text-indigo-200">
                  {isPro ? "You're on the Pro plan with unlimited generations." : "You're on the Free plan. Upgrade to Pro for unlimited access."}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <StatCard icon={<Zap className="h-5 w-5 text-indigo-400" />} bgColor="bg-indigo-500/20" title="Today's Usage" value={isPro ? "∞" : usage} subtitle={isPro ? "Unlimited generations" : "Generations used today"} />
                <StatCard icon={<Sparkles className="h-5 w-5 text-purple-400" />} bgColor="bg-purple-500/20" title="Remaining" value={isPro ? "∞" : remaining} subtitle={isPro ? "Unlimited" : "Free generations left today"} />
                <StatCard icon={<Crown className="h-5 w-5 text-pink-400" />} bgColor="bg-pink-500/20" title="Plan" value={isPro ? "Pro" : "Free"} subtitle={isPro ? "$9/month" : "5 generations/day"} />
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                  <h2 className="text-xl font-semibold mb-4">Custom Tones</h2>
                  <CustomTonesManager />
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                  <h2 className="text-xl font-semibold mb-4">Team</h2>
                  <TeamManager />
                </div>
              </div>

              {!isPro && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Upgrade to Pro</h2>
                  <p className="text-indigo-200 mb-6">Get unlimited AI writing, browser extension, custom tones, and more.</p>
                  <Link href="/?upgrade=true" className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold">Upgrade Now — $9/month</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "extension" && (
            <div className="space-y-8">
              <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold mb-2">Browser Extension</h2>
                <p className="text-slate-400 mb-6">Rewrite text on any website with one click</p>

                {!isPro ? (
                  <div className="bg-slate-900/50 rounded-xl p-6 text-center">
                    <Shield className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Pro Feature</h3>
                    <p className="text-slate-400 mb-4">The browser extension is available with Pro subscription</p>
                    <Link href="/?upgrade=true" className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold">Upgrade to Pro</Link>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <a href="/extension/typesmart-extension-chrome-v1.0.0.zip" download className="bg-slate-900/50 rounded-xl p-6 block">
                        <h3 className="text-lg font-semibold mb-2">Chrome Extension</h3>
                        <p className="text-slate-400 text-sm mb-4">Works with Chrome, Edge, Brave</p>
                        <span className="inline-flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg"><Download className="h-4 w-4" /> Download</span>
                      </a>
                      <a href="/extension/typesmart-extension-firefox-v1.0.0.zip" download className="bg-slate-900/50 rounded-xl p-6 block">
                        <h3 className="text-lg font-semibold mb-2">Firefox Extension</h3>
                        <p className="text-slate-400 text-sm mb-4">Works with Mozilla Firefox</p>
                        <span className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg"><Download className="h-4 w-4" /> Download</span>
                      </a>
                    </div>

                    <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
                      <h2 className="text-2xl font-bold mb-2">API Key</h2>
                      <p className="text-slate-400 mb-6">Connect the extension to your account</p>
                      {!apiKey ? (
                        <button onClick={generateApiKey} disabled={generatingKey} className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-semibold">
                          {generatingKey ? 'Generating...' : 'Generate API Key'}
                        </button>
                      ) : (
                        <div className="bg-slate-900/50 rounded-xl p-6">
                          <div className="flex gap-3">
                            <code className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 font-mono text-sm break-all">{apiKey}</code>
                            <button onClick={() => copyToClipboard(apiKey)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg">
                              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div className="bg-slate-900/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div><label className="text-sm text-slate-400">Name</label><p className="font-medium">{user?.fullName || 'Not set'}</p></div>
                      <div><label className="text-sm text-slate-400">Email</label><p className="font-medium">{user?.primaryEmailAddress?.emailAddress}</p></div>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{isPro ? "Pro Plan" : "Free Plan"}</p>
                        <p className="text-slate-400">{isPro ? "$9/month - Unlimited generations" : "5 generations per day"}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${isPro ? 'bg-green-500/20 text-green-300' : 'bg-slate-700 text-slate-400'}`}>{isPro ? 'Active' : 'Free'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold mb-6">Billing & Subscription</h2>
                {isPro ? (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-green-300">Pro Plan Active</h3>
                    <p className="text-green-200/70">$9/month</p>
                    <p className="text-slate-300 mt-4">Your subscription renews automatically each month.</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Active Subscription</h3>
                    <p className="text-slate-400 mb-6">You're on the Free plan. Upgrade to Pro for unlimited generations.</p>
                    <Link href="/?upgrade=true" className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold">Upgrade to Pro — $9/month</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, bgColor, title, value, subtitle }: any) {
  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <div className={`h-10 w-10 ${bgColor} rounded-xl flex items-center justify-center`}>{icon}</div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-slate-400 text-sm">{subtitle}</p>
    </div>
  );
}
