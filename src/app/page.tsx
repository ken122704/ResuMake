import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8">
        
        {/* Hero Section */}
        <div className="space-y-4">
          {/* Brand Logo with Wordmark */}
          <div className="flex items-center justify-center -mt-30 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <img 
              src="/logo-full.png" 
              alt="ResuMake Logo" 
              className="h-70 w-auto object-contain" 
            />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Build Your Professional <br className="hidden sm:inline" />
            <span className="text-blue-600 dark:text-blue-500">Resume in Minutes</span>
          </h1>
          <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl dark:text-slate-400">
            Create ATS-optimized, Harvard-style resumes with the power of AI. 
            Stand out to employers with clean formatting and impactful job descriptions.
          </p>
        </div>

        {/* Call to Action */}
        <div>
          {/* Next.js Link component for fast, client-side routing */}
          <Link href="/login">
            <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
              Get Started
            </Button>
          </Link>
        </div>

      </div>
    </main>
  );
}