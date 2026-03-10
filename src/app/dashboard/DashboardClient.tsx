"use client";

import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { 
  Sparkles, 
  Zap, 
  ArrowLeft, 
  Crown, 
  Users, 
  Palette, 
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
  isOwner?: boolean;
}

type Tab = "overview" | "extension" | "account" | "billing";

export default function DashboardClient({ usage, remaining, isPro, isOwner }: DashboardClientProps) {
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
        setApiKey(data.apiKey);
      }
    } catch (error) {
      console.error('Error generating API key:', error);
    }
    setGeneratingKey(false);
  };

  const hasAccess = isPro || isOwner;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
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
            {isOwner && (
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm font-medium flex items-center gap-1">
                <Crown className="h-4 w-4" />
                Owner
              </span>
            )}
            {isPro && !isOwner && (
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
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Account Dashboard</h1>
            <p className="text-slate-400">
              Manage your account, extension, and subscription
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-800 pb-4">
            <TabButton 
              active={activeTab === "overview"} 
              onClick={() => setActiveTab("overview")}
              icon={<Zap className="h-4 w-4" />}
              label="Overview"
            />
            <TabButton 
              active={activeTab === "extension"} 
              onClick={() => setActiveTab("extension")}
              icon={<Download className="h-4 w-4" />}
              label="Extension"
            />
            <TabButton 
              active={activeTab === "account"} 
              onClick={() => setActiveTab("account")}
              icon={<Settings className="h-4 w-4" />}
              label="Account"
            />
            <TabButton 
              active={activeTab === "billing"} 
              onClick={() => setActiveTab("billing")}
              icon={<CreditCard className="h-4 w-4" />}
              label="Billing"
            />
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <OverviewTab 
              usage={usage} 
              remaining={remaining} 
              isPro={isPro} 
              isOwner={isOwner}
              user={user}
            />
          )}

          {activeTab === "extension" && (
            <ExtensionTab 
              hasAccess={hasAccess}
              apiKey={apiKey}
              setApiKey={setApiKey}
              generatingKey={generatingKey}
              generateApiKey={generateApiKey}
              copyToClipboard={copyToClipboard}
              copied={copied}
            />
          )}

          {activeTab === "account" && (
            <AccountTab 
              user={user}
              isPro={isPro}
              isOwner={isOwner}
            />
          )}

          {activeTab === "billing" && (
            <BillingTab 
              isPro={isPro}
              isOwner={isOwner}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        active 
          ? "bg-indigo-500 text-white" 
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function OverviewTab({ usage, remaining, isPro, isOwner, user }: any) {
  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {user?.firstName || 'there'}!
        </h2>
        <p className="text-indigo-200">
          {isOwner 
            ? "You have full owner access with unlimited generations and all features."
            : isPro 
              ? "You're on the Pro plan with unlimited generations."
              : "You're on the Free plan. Upgrade to Pro for unlimited access."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Zap className="h-5 w-5 text-indigo-400" />}
          bgColor="bg-indigo-500/20"
          title="Today's Usage"
          value={isPro || isOwner ? "∞" : usage}
          subtitle={isPro || isOwner ? "Unlimited generations" : "Generations used today"}
        />
        <StatCard 
          icon={<Sparkles className="h-5 w-5 text-purple-400" />}
          bgColor="bg-purple-500/20"
          title="Remaining"
          value={isPro || isOwner ? "∞" : remaining}
          subtitle={isPro || isOwner ? "Unlimited" : "Free generations left today"}
        />
        <StatCard 
          icon={<Crown className={`h-5 w-5 ${isOwner ? 'text-amber-400' : 'text-pink-400'}`} />}
          bgColor={isOwner ? 'bg-amber-500/20' : 'bg-pink-500/20'}
          title="Plan"
          value={isOwner ? "Owner" : isPro ? "Pro" : "Free"}
          subtitle={isOwner ? "All features free" : isPro ? "$9/month" : "5 generations/day"}
        />
      </div>

      {/* Features Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-semibold">Custom Tones</h2>
          </div>
          <CustomTonesManager />
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-semibold">Team</h2>
          </div>
          <TeamManager />
        </div>
      </div>

      {/* Upgrade CTA (if free) */}
      {!isPro && !isOwner && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Upgrade to Pro</h2>
          <p className="text-indigo-200 mb-6 max-w-md mx-auto">
            Get unlimited AI writing, browser extension, custom tones, team features, and more.
          </p>
          <Link
            href="/?upgrade=true"
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all"
          >
            Upgrade Now — $9/month
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, bgColor, title, value, subtitle }: any) {
  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <div className={`h-10 w-10 ${bgColor} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-slate-400 text-sm">{subtitle}</p>
    </div>
  );
}

function ExtensionTab({ hasAccess, apiKey, generatingKey, generateApiKey, copyToClipboard, copied }: any) {
  return (
    <div className="space-y-8">
      {/* Extension Download Card */}
      <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
            <Package className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Browser Extension</h2>
            <p className="text-slate-400">Rewrite text on any website with one click</p>
          </div>
        </div>

        {!hasAccess ? (
          <div className="bg-slate-900/50 rounded-xl p-6 text-center">
            <Shield className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Pro Feature</h3>
            <p className="text-slate-400 mb-4">
              The browser extension is available with Pro subscription
            </p>
            <Link
              href="/?upgrade=true"
              className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Upgrade to Pro
            </Link>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Chrome Download */}
              <div className="bg-slate-900/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img src="https://www.google.com/chrome/static/images/chrome-logo.svg" alt="Chrome" className="h-8 w-8" />
                  <h3 className="text-lg font-semibold">Chrome Extension</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  Works with Google Chrome, Microsoft Edge, Brave, and other Chromium browsers
                </p>
                <a
                  href="/extension/typesmart-extension-chrome-v1.0.0.zip"
                  download
                  className="flex items-center justify-center gap-2 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  <Download className="h-5 w-5" />
                  Download for Chrome
                </a>
              </div>

              {/* Firefox Download */}
              <div className="bg-slate-900/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img src="https://www.mozilla.org/media/img/favicons/firefox/browser.svg" alt="Firefox" className="h-8 w-8" />
                  <h3 className="text-lg font-semibold">Firefox Extension</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  Works with Mozilla Firefox and Firefox-based browsers
                </p>
                <a
                  href="/extension/typesmart-extension-firefox-v1.0.0.zip"
                  download
                  className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  <Download className="h-5 w-5" />
                  Download for Firefox
                </a>
              </div>
            </div>

            {/* Installation Instructions */}
            <div className="bg-slate-900/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Installation Instructions</h3>
              <ol className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 h-6 w-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-sm font-medium text-indigo-400">1</span>
                  <span>Download the extension ZIP file for your browser</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 h-6 w-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-sm font-medium text-indigo-400">2</span>
                  <span>Extract the ZIP file to a folder on your computer</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 h-6 w-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-sm font-medium text-indigo-400">3</span>
                  <span>Open Chrome/Edge and go to <code className="bg-slate-800 px-2 py-1 rounded">chrome://extensions/</code></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 h-6 w-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-sm font-medium text-indigo-400">4</span>
                  <span>Enable "Developer mode" (toggle in top right)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 h-6 w-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-sm font-medium text-indigo-400">5</span>
                  <span>Click "Load unpacked" and select the extracted folder</span>
                </li>
              </ol>
            </div>
          </>
        )}
      </div>

      {/* API Key Section */}
      {hasAccess && (
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Key className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">API Key</h2>
              <p className="text-slate-400">Connect the extension to your account</p>
            </div>
          </div>

          {!apiKey ? (
            <div className="text-center py-8">
              <button
                onClick={generateApiKey}
                disabled={generatingKey}
                className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-semibold transition-all"
              >
                {generatingKey ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Key className="h-5 w-5" />
                )}
                {generatingKey ? 'Generating...' : 'Generate API Key'}
              </button>
              <p className="text-slate-500 text-sm mt-4">
                Your API key is unique and should be kept secure
              </p>
            </div>
          ) : (
            <div className="bg-slate-900/50 rounded-xl p-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Your API Key
              </label>
              <div className="flex gap-3">
                <code className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 font-mono text-sm break-all">
                  {apiKey}
                </code>
                <button
                  onClick={() => copyToClipboard(apiKey)}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg font-medium transition-all"
                >
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-slate-500 text-sm mt-4">
                Paste this key in the extension settings to activate it
              </p>
              <button
                onClick={generateApiKey}
                disabled={generatingKey}
                className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${generatingKey ? 'animate-spin' : ''}`} />
                Generate new key (invalidates old one)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AccountTab({ user, isPro, isOwner }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 bg-slate-700 rounded-xl flex items-center justify-center">
            <Settings className="h-6 w-6 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold">Account Settings</h2>
        </div>

        <div className="space-y-6">
          {/* Profile Info */}
          <div className="bg-slate-900/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Name</label>
                <p className="font-medium">{user?.fullName || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Email</label>
                <p className="font-medium">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
          </div>

          {/* Plan Info */}
          <div className="bg-slate-900/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {isOwner ? "Owner Plan" : isPro ? "Pro Plan" : "Free Plan"}
                </p>
                <p className="text-slate-400">
                  {isOwner 
                    ? "Unlimited access to all features" 
                    : isPro 
                      ? "$9/month - Unlimited generations" 
                      : "5 generations per day"}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                isOwner 
                  ? 'bg-amber-500/20 text-amber-300' 
                  : isPro 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-slate-700 text-slate-400'
              }`}>
                {isOwner ? 'Owner' : isPro ? 'Active' : 'Free'}
              </span>
            </div>
          </div>

          {/* Manage Account */}
          <div className="bg-slate-900/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Manage Account</h3>
            <p className="text-slate-400 mb-4">
              Update your profile, password, and security settings
            </p>
            <a
              href="https://accounts.clerk.dev/user"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Open Account Settings
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function BillingTab({ isPro, isOwner }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 bg-green-500/20 rounded-xl flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold">Billing & Subscription</h2>
        </div>

        {isOwner ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="h-8 w-8 text-amber-400" />
              <div>
                <h3 className="text-xl font-bold text-amber-300">Owner Access</h3>
                <p className="text-amber-200/70">No billing required</p>
              </div>
            </div>
            <p className="text-slate-300">
              As the owner, you have complimentary access to all TypeSmart features. 
              No subscription or payment is required.
            </p>
          </div>
        ) : isPro ? (
          <div className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-green-300">Pro Plan Active</h3>
                  <p className="text-green-200/70">$9/month</p>
                </div>
                <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
              <p className="text-slate-300 mb-4">
                Your subscription renews automatically each month. You can cancel anytime.
              </p>
              <button className="text-red-400 hover:text-red-300 font-medium">
                Cancel Subscription
              </button>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
              <p className="text-slate-400">
                Manage your payment methods and billing history in Stripe
              </p>
              <a
                href="https://billing.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Open Billing Portal
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Subscription</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              You're on the Free plan. Upgrade to Pro for unlimited generations and premium features.
            </p>
            <Link
              href="/?upgrade=true"
              className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold transition-all"
            >
              Upgrade to Pro — $9/month
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
