"use client";

import { UserButton } from "@clerk/nextjs";
import { Sparkles, Zap, ArrowLeft, Crown, Users, Palette } from "lucide-react";
import Link from "next/link";
import CustomTonesManager from "@/components/CustomTonesManager";
import TeamManager from "@/components/TeamManager";

interface DashboardClientProps {
  userId: string;
  usage: number;
  remaining: number;
  isPro: boolean;
}

export default function DashboardClient({ usage, remaining, isPro }: DashboardClientProps) {
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
              Back
            </Link>
            <div className="h-6 w-px bg-slate-700" />
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-400" />
              <span className="text-xl font-bold">TypeSmart</span>
            </Link>
          </div>
          <UserButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Usage Card */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <Zap className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold">Today's Usage</h3>
              </div>
              <p className="text-3xl font-bold mb-1">
                {isPro ? "∞" : usage}
              </p>
              <p className="text-slate-400 text-sm">
                {isPro ? "Unlimited generations" : "Generations used today"}
              </p>
            </div>

            {/* Remaining Card */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold">Remaining</h3>
              </div>
              <p className="text-3xl font-bold mb-1">
                {isPro ? "∞" : remaining}
              </p>
              <p className="text-slate-400 text-sm">
                {isPro ? "Unlimited" : "Free generations left today"}
              </p>
            </div>

            {/* Plan Card */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-pink-500/20 rounded-xl flex items-center justify-center">
                  <Crown className="h-5 w-5 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold">Plan</h3>
              </div>
              <p className="text-3xl font-bold mb-1">
                {isPro ? "Pro" : "Free"}
              </p>
              <p className="text-slate-400 text-sm">
                {isPro ? "$9/month" : "5 generations/day"}
              </p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Custom Tones Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-5 w-5 text-indigo-400" />
                <h2 className="text-xl font-semibold">Custom Tones</h2>
              </div>
              <CustomTonesManager />
            </div>

            {/* Team Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-indigo-400" />
                <h2 className="text-xl font-semibold">Team</h2>
              </div>
              <TeamManager />
            </div>
          </div>

          {/* Upgrade CTA (if free) */}
          {!isPro && (
            <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Upgrade to Pro</h2>
              <p className="text-indigo-200 mb-6 max-w-md mx-auto">
                Get unlimited AI writing generations, custom tones, team features, and more.
              </p>
              <Link
                href="/"
                className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all"
              >
                Upgrade Now — $9/month
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
