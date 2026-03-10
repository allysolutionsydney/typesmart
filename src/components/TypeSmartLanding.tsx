"use client";

import { useState, useEffect } from "react";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Sparkles, Linkedin, Mail, Heart, AlertCircle, Check, Zap, ArrowRight, Crown } from "lucide-react";
import Link from "next/link";
import HistorySidebar from "./HistorySidebar";
import Templates from "./Templates";
import FeedbackComponent from "./Feedback";
import CustomTonesManager from "./CustomTonesManager";

export default function TypeSmartLanding() {
  const { isSignedIn, isLoaded } = useAuth();
  const [activeTool, setActiveTool] = useState<"linkedin" | "email" | "dating" | "complaint">("linkedin");
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("professional");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [customToneId, setCustomToneId] = useState<string | null>(null);
  const [showCustomTones, setShowCustomTones] = useState(false);
  
  // Waitlist states
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [waitlistMessage, setWaitlistMessage] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const tones = [
    { id: "professional", label: "Professional" },
    { id: "friendly", label: "Friendly" },
    { id: "assertive", label: "Assertive" },
    { id: "apologetic", label: "Apologetic" },
    { id: "enthusiastic", label: "Enthusiastic" },
  ];

  const tools = [
    { id: "linkedin", label: "LinkedIn Post", icon: Linkedin },
    { id: "email", label: "Email", icon: Mail },
    { id: "dating", label: "Dating Message", icon: Heart },
    { id: "complaint", label: "Complaint", icon: AlertCircle },
  ];

  // Get usage on load
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchUsage();
    }
  }, [isLoaded, isSignedIn]);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/usage');
      if (response.ok) {
        const data = await response.json();
        setRemaining(data.remaining);
        setIsPro(data.isPro);
        setIsOwner(data.isOwner);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: activeTool,
          input,
          tone,
          customToneId,
        }),
      });

      if (response.status === 401) {
        setError("Please sign in to generate content.");
        setLoading(false);
        return;
      }

      if (response.status === 429) {
        const data = await response.json();
        setError(data.message || "You've reached your daily limit.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setOutput(data.output);
      setRemaining(data.remaining);
      setIsPro(data.isPro);
      setGenerationId(data.generationId || null);
    } catch (error) {
      console.error('Error generating content:', error);
      setError('Sorry, there was an error generating content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail.includes("@")) return;
    
    setWaitlistStatus("loading");
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: waitlistEmail }),
      });
      
      if (response.ok) {
        setWaitlistStatus("success");
        setWaitlistMessage("You're on the list! We'll notify you when Pro features launch.");
        setWaitlistEmail("");
      } else {
        throw new Error('Failed');
      }
    } catch (error) {
      setWaitlistStatus("error");
      setWaitlistMessage("Something went wrong. Please try again.");
    }
  };

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-400" />
            <span className="text-xl font-bold">TypeSmart</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <>
                <Link 
                  href="/dashboard"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/account"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Account
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <Link 
                  href="/sign-in"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/sign-up"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-4 py-2 text-sm font-medium text-indigo-300 mb-6">
          <Sparkles className="h-4 w-4" />
          AI-Powered Writing Assistant
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          TypeSmart.io
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
          Transform your writing in seconds. Professional LinkedIn posts, polished emails, 
          confident dating messages, and effective complaints—powered by AI.
        </p>
        
        {/* Usage indicator for signed in users */}
        {isSignedIn && (
          <>
            {isOwner ? (
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-4 py-2 rounded-full mb-6 border border-amber-500/30">
                <Crown className="h-4 w-4 text-amber-400" />
                <span className="text-amber-300">Owner — Unlimited Access</span>
              </div>
            ) : remaining !== null && !isPro ? (
              <div className="inline-flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full mb-6">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-slate-300">
                  {remaining} free generations remaining today
                </span>
              </div>
            ) : isPro ? (
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-4 py-2 rounded-full mb-6 border border-indigo-500/30">
                <Crown className="h-4 w-4 text-indigo-400" />
                <span className="text-indigo-300">Pro Plan — Unlimited</span>
              </div>
            ) : null}
          </>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button 
            onClick={scrollToDemo}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
          >
            <Zap className="h-5 w-5" />
            Try Free
          </button>
          {!isSignedIn ? (
            <Link 
              href="/sign-up"
              className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              Sign Up Free
            </Link>
          ) : (
            !isOwner && !isPro && (
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50"
              >
                {checkoutLoading ? 'Loading...' : 'Upgrade to Pro $9/mo'}
              </button>
            )
          )}
        </div>
        
        {/* Waitlist Form */}
        {!isSignedIn && (
          <div className="max-w-md mx-auto">
            <p className="text-slate-400 mb-4">Get notified about new features & updates</p>
            <form onSubmit={handleWaitlistSubmit} className="flex gap-2">
              <input
                type="email"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={waitlistStatus === "loading" || waitlistStatus === "success"}
              />
              <button
                type="submit"
                disabled={waitlistStatus === "loading" || waitlistStatus === "success"}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                {waitlistStatus === "loading" ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : waitlistStatus === "success" ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <>
                    Join <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
            {waitlistMessage && (
              <p className={`mt-3 text-sm ${waitlistStatus === "success" ? "text-green-400" : "text-red-400"}`}>
                {waitlistMessage}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Demo Section */}
      <section id="demo" className="container mx-auto px-4 py-16">
        <div className={`${isSignedIn ? 'flex flex-col lg:flex-row gap-8' : ''}`}>
          <div className="flex-1 max-w-4xl mx-auto bg-slate-800/50 rounded-3xl p-8 backdrop-blur-sm border border-slate-700">
          {/* Sign in prompt for non-authenticated users */}
          {!isSignedIn && (
            <div className="bg-slate-700/50 rounded-xl p-6 mb-6 text-center">
              <p className="text-slate-300 mb-4">
                Sign in to generate content. Free tier: 5 generations per day.
              </p>
              <div className="flex gap-4 justify-center">
                <Link 
                  href="/sign-in"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Sign In
                </Link>
                <Link 
                  href="/sign-up"
                  className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Create Account
                </Link>
              </div>
            </div>
          )}

          {/* Tool Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as typeof activeTool)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    activeTool === tool.id
                      ? "bg-indigo-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tool.label}
                </button>
              );
            })}
          </div>

          {/* Tone Selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tones.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTone(t.id);
                  setCustomToneId(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tone === t.id && !customToneId
                    ? "bg-purple-500 text-white"
                    : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {t.label}
              </button>
            ))}
            {isSignedIn && (
              <button
                onClick={() => setShowCustomTones(!showCustomTones)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                  showCustomTones || customToneId
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                }`}
              >
                <Sparkles className="h-3 w-3" />
                Custom
              </button>
            )}
          </div>

          {/* Custom Tones Panel */}
          {showCustomTones && isSignedIn && (
            <div className="mb-4">
              <CustomTonesManager
                onSelectTone={(id, name) => {
                  setCustomToneId(id);
                  setTone(name);
                  setShowCustomTones(false);
                }}
                selectedToneId={customToneId || undefined}
              />
            </div>
          )}

          {/* Templates */}
          <Templates 
            tool={activeTool} 
            onSelectTemplate={(example, templateTone) => {
              setInput(example);
              setTone(templateTone);
            }}
          />

          {/* Input */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Enter your rough ${activeTool} text here...`}
            className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-4"
          />

          {/* Error message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-4">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          {isSignedIn ? (
            <button
              onClick={handleGenerate}
              disabled={loading || !input.trim() || (remaining === 0 && !isPro)}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                  Generating...
                </>
              ) : isOwner ? (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate with AI 👑
                </>
              ) : remaining === 0 && !isPro ? (
                "Daily Limit Reached — Upgrade to Pro"
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate with AI
                  {remaining !== null && !isPro && ` (${remaining} left)`}
                </>
              )}
            </button>
          ) : (
            <Link
              href="/sign-in"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="h-5 w-5" />
              Sign In to Generate
            </Link>
          )}

          {/* Output */}
          {output && (
            <div className="mt-6 p-6 bg-slate-900/50 border border-slate-700 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm text-slate-400 font-medium">AI-Generated Result</span>
                <button
                  onClick={copyToClipboard}
                  className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Check className="h-4 w-4" />
                  Copy
                </button>
              </div>
              <p className="text-white whitespace-pre-wrap">{output}</p>
              <FeedbackComponent generationId={generationId || undefined} />
            </div>
          )}
          </div>

          {/* History Sidebar - Only for signed in users */}
          {isSignedIn && (
            <div className="lg:w-80">
              <HistorySidebar />
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why TypeSmart?</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
            <div className="h-12 w-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-slate-400">Get polished writing in 2-3 seconds. No more staring at blank screens.</p>
          </div>
          <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
            <div className="h-12 w-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Perfect Tone</h3>
            <p className="text-slate-400">5 tones to match any situation—professional, friendly, assertive, and more.</p>
          </div>
          <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
            <div className="h-12 w-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Always Ready</h3>
            <p className="text-slate-400">From LinkedIn posts to complaint letters—handle any writing situation.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-gradient-to-b from-indigo-600 to-purple-700 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Pro Plan</h3>
          <div className="text-5xl font-bold mb-2">$9<span className="text-2xl font-normal text-indigo-200">/mo</span></div>
          <p className="text-indigo-200 mb-6">Unlock unlimited writing power</p>
          <ul className="text-left space-y-3 mb-8">
            <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-400" /> Unlimited generations</li>
            <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-400" /> All 5 tones</li>
            <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-400" /> Save your history</li>
            <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-400" /> Priority support</li>
            <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-400" /> No watermarks</li>
          </ul>
          {isSignedIn ? (
            isOwner ? (
              <div className="bg-amber-500/20 text-amber-300 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2">
                👑 You're the Owner
              </div>
            ) : !isPro ? (
              <button 
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full bg-white text-indigo-600 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all disabled:opacity-50"
              >
                {checkoutLoading ? 'Loading...' : 'Upgrade Now'}
              </button>
            ) : (
              <div className="bg-green-500/20 text-green-300 py-4 rounded-xl font-bold text-lg">
                ✓ You're on Pro
              </div>
            )
          ) : (
            <Link 
              href="/sign-up"
              className="block w-full bg-white text-indigo-600 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all"
            >
              Get Started Free
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-slate-500">
        <p>&copy; 2026 TypeSmart.io. All rights reserved.</p>
      </footer>
    </div>
  );
}
