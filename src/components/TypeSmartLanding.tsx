"use client";

import { useState } from "react";
import { Sparkles, Linkedin, Mail, Heart, AlertCircle, Check, Zap, ArrowRight } from "lucide-react";

export default function TypeSmartLanding() {
  const [activeTool, setActiveTool] = useState<"linkedin" | "email" | "dating" | "complaint">("linkedin");
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("professional");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Waitlist states
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [waitlistMessage, setWaitlistMessage] = useState("");

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

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    
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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setOutput(data.output);
    } catch (error) {
      console.error('Error generating content:', error);
      setOutput('Sorry, there was an error generating content. Please try again.');
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16 text-center">
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
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button 
            onClick={scrollToDemo}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
          >
            <Zap className="h-5 w-5" />
            Try Free (5/day)
          </button>
          <a 
            href="#pricing"
            className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center"
          >
            Upgrade to Pro $9/mo
          </a>
        </div>
        
        {/* Waitlist Form */}
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
      </header>

      {/* Demo Section */}
      <section id="demo" className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-slate-800/50 rounded-3xl p-8 backdrop-blur-sm border border-slate-700">
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
          <div className="flex flex-wrap gap-2 mb-6">
            {tones.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tone === t.id
                    ? "bg-purple-500 text-white"
                    : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Enter your rough ${activeTool} text here...`}
            className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-4"
          />

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate with AI
              </>
            )}
          </button>

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
          <a 
            href="https://buy.stripe.com/test_4gwaGtg5W4zY7aE288" 
            className="block w-full bg-white text-indigo-600 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all"
          >
            Upgrade Now
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-slate-500">
        <p>&copy; 2026 TypeSmart.io. All rights reserved.</p>
      </footer>
    </div>
  );
}
