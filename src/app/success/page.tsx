import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Welcome to Pro!</h1>
        <p className="text-slate-300 mb-8">
          Your subscription is active. You now have unlimited access to all TypeSmart features.
        </p>
        <Link 
          href="/"
          className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
        >
          Start Writing
        </Link>
      </div>
    </div>
  );
}
