import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-slate-800 border border-slate-700",
            headerTitle: "text-white",
            headerSubtitle: "text-slate-400",
            socialButtonsBlockButton: "bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
            dividerLine: "bg-slate-700",
            dividerText: "text-slate-400",
            formFieldLabel: "text-slate-300",
            formFieldInput: "bg-slate-700 border-slate-600 text-white",
            footerActionLink: "text-indigo-400 hover:text-indigo-300",
          }
        }}
      />
    </div>
  );
}
