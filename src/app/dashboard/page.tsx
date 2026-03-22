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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-lg font-medium text-slate-500">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">Welcome back, {userEmail}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        {/* Resumes Grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          
          {/* "Create New Resume" Card */}
          <Link href="/builder/new">
            <Card className="flex h-[200px] cursor-pointer flex-col items-center justify-center border-dashed border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-900 transition-colors">
              <CardContent className="flex flex-col items-center justify-center space-y-2 pt-6">
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                  {/* Plus Icon */}
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-50">Create New Resume</span>
              </CardContent>
            </Card>
          </Link>

          {/* Loop through and display existing resumes */}
          {resumes.map((resume) => (
            <Card key={resume.resume_id} className="flex h-[200px] flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-lg">{resume.title || "Untitled Resume"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/builder/${resume.resume_id}`}>
                  <Button variant="secondary" className="w-full">Edit Resume</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
          
        </div>
      </div>
    </main>
  );
}