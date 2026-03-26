"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Resume {
  resume_id: string;
  title: string;
  created_at?: string;
}

export default function DashboardPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | undefined>("");
  const router = useRouter();

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      // 1. Check if the user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If no user is found, redirect back to login
        router.push("/login");
        return;
      }
      
      setUserEmail(user.email);

      // 2. Fetch their resumes from the database
      // Thanks to Row Level Security (RLS), this safely only returns THEIR data
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setResumes(data);
      }
      
      setLoading(false);
    };

    checkUserAndFetchData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDelete = async (resumeId: string, e: React.MouseEvent) => {
    e.preventDefault(); 
    
    // Standard browser confirmation popup
    const confirmDelete = window.confirm("Are you sure you want to delete this resume? This action cannot be undone.");
    if (!confirmDelete) return;

    // 1. Delete from Supabase
    const { error } = await supabase
      .from("resumes")
      .delete()
      .eq("resume_id", resumeId);

    if (error) {
      console.error("Error deleting resume:", error);
      alert("Failed to delete resume.");
    } else {
      // 2. Remove it from the React screen instantly without reloading the page
      setResumes(resumes.filter((resume) => resume.resume_id !== resumeId));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-lg font-medium text-slate-500">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
      <div className="w-full px-4 md:px-12 space-y-8">
        
        {/* 1. Top Navigation Bar */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center">
            <img 
              src="/logo-full.png" 
              alt="ResuMake Logo" 
              className="h-20 md:h-20 w-auto object-contain pointer-events-none select-none" 
            />
          </div>
          
          <Button variant="ghost" onClick={handleSignOut} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
            Sign Out
          </Button>
        </div>

        {/* 2. Page Title Area */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">My Workspace</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, {userEmail}</p>
        </div>

        {resumes.length > 0 ? (
          
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Link href="/builder/new">
              <Card className="flex h-[200px] cursor-pointer flex-col items-center justify-center border-dashed border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-900 transition-colors">
                <CardContent className="flex flex-col items-center justify-center space-y-2 pt-6">
                  <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-slate-50">Create New Resume</span>
                </CardContent>
              </Card>
            </Link>

            {resumes.map((resume) => (
              <Card key={resume.resume_id} className="flex h-[200px] flex-col justify-between group">
                
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg line-clamp-2 pr-2">
                    {resume.title || "Untitled Resume"}
                  </CardTitle>
                  
                  {/* Delete Button */}
                  <button 
                    onClick={(e) => handleDelete(resume.resume_id, e)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    title="Delete Resume"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </CardHeader>

                <CardContent>
                  <Link href={`/builder/${resume.resume_id}`}>
                    <Button variant="secondary" className="w-full">Edit Resume</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

        ) : (

          <div className="flex flex-col items-center justify-center py-24 text-center bg-white shadow-sm border border-slate-200 rounded-xl dark:bg-slate-900 dark:border-slate-800">
            <div className="bg-blue-50 text-blue-600 p-6 rounded-full mb-6 dark:bg-blue-900/30 dark:text-blue-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Your workspace is empty</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md text-lg">
              Start building your ATS-optimized resume right now. It only takes a few minutes!
            </p>
            <Button 
              onClick={() => router.push('/builder/new')}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-semibold"
            >
              + Create Your First Resume
            </Button>
          </div>

        )}
        
      </div>
    </main>
  );
}