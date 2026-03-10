"use client";

import { useState, useEffect } from "react";

interface ApiKeyData {
  id: string;
  key: string;
  created_at: string;
  last_used?: string;
}

export default function ExtensionSettings() {
  const [apiKey, setApiKey] = useState<ApiKeyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showFullKey, setShowFullKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      const response = await fetch("/api/extension-api");
      if (response.ok) {
        const data = await response.json();
        setApiKey(data.apiKey);
      }
    } catch (error) {
      console.error("Error fetching API key:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateKey = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/extension-api", { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        setApiKey(data.apiKey);
        setRevealedKey(data.apiKey.key);
        setShowFullKey(true);
      }
    } catch (error) {
      console.error("Error generating API key:", error);
    } finally {
      setGenerating(false);
    }
  };

  const revokeKey = async () => {
    if (!confirm("Are you sure? This will revoke your current API key and the browser extension will stop working.")) {
      return;
    }
    
    try {
      const response = await fetch("/api/extension-api", { method: "DELETE" });
      if (response.ok) {
        setApiKey(null);
        setRevealedKey(null);
        setShowFullKey(false);
      }
    } catch (error) {
      console.error("Error revoking API key:", error);
    }
  };

  const copyKey = () => {
    const keyToCopy = revealedKey || apiKey?.key;
    if (keyToCopy) {
      navigator.clipboard.writeText(keyToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-700 rounded w-1/4"></div>
          <div className="h-12 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* API Key Card */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Extension API Key</h3>
        <p className="text-slate-400 text-sm mb-4">
          Use this key to connect the TypeSmart browser extension to your account.
        </p>

        {apiKey ? (
          <div className="space-y-4">
            {/* Key Display */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <label className="text-xs text-slate-500 uppercase tracking-wide">Your API Key</label>
              <div className="flex items-center gap-3 mt-2">
                <code className="flex-1 font-mono text-sm text-slate-300 bg-slate-800 px-3 py-2 rounded">
                  {showFullKey ? (revealedKey || apiKey.key) : apiKey.key}
                </code>
                <button
                  onClick={() => setShowFullKey(!showFullKey)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                  title={showFullKey ? "Hide" : "Show"}
                >
                  {showFullKey ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={copyKey}
                  className="p-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                  title="Copy"
                >
                  {copied ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
              {revealedKey && (
                <p className="mt-2 text-xs text-amber-400">
                  ⚠️ This is the only time you'll see the full key. Copy it now!
                </p>
              )}
            </div>

            {/* Key Info */}
            <div className="flex items-center justify-between text-sm">
              <div className="text-slate-400">
                Created: {new Date(apiKey.created_at).toLocaleDateString()}
                {apiKey.last_used && (
                  <span className="ml-4">
                    Last used: {new Date(apiKey.last_used).toLocaleDateString()}
                  </span>
                )}
              </div>
              <button
                onClick={revokeKey}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Revoke Key
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-slate-400 mb-4">No API key generated yet.</p>
            <button
              onClick={generateKey}
              disabled={generating}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate API Key"}
            </button>
          </div>
        )}
      </div>

      {/* Installation Guide */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Installation Guide</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-400 font-bold">1</span>
            </div>
            <div>
              <h4 className="text-white font-medium">Download Extension</h4>
              <p className="text-slate-400 text-sm mt-1">
                Download the extension for{" "}
                <a href="/extension/typesmart-extension-chrome-v1.0.0.zip" className="text-indigo-400 hover:underline">Chrome</a>
                {" or "}
                <a href="/extension/typesmart-extension-firefox-v1.0.0.zip" className="text-indigo-400 hover:underline">Firefox</a>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-400 font-bold">2</span>
            </div>
            <div>
              <h4 className="text-white font-medium">Install in Browser</h4>
              <p className="text-slate-400 text-sm mt-1">
                Chrome: Go to chrome://extensions → Enable "Developer mode" → "Load unpacked" → Select the extracted folder
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-400 font-bold">3</span>
            </div>
            <div>
              <h4 className="text-white font-medium">Connect Account</h4>
              <p className="text-slate-400 text-sm mt-1">
                Click the TypeSmart icon in your toolbar → "Set Up Extension" → Paste your API key above
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-400 font-bold">4</span>
            </div>
            <div>
              <h4 className="text-white font-medium">Start Writing</h4>
              <p className="text-slate-400 text-sm mt-1">
                Go to Gmail, LinkedIn, or any website. Click on a text field and look for the TypeSmart button!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Sites */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Supported Sites</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Gmail", "LinkedIn", "Twitter/X", "Facebook", "Instagram", "Any Website"].map((site) => (
            <div key={site} className="flex items-center gap-2 text-slate-300">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {site}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
