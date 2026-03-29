"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function ResumeBuilderPage() {
  const params = useParams();
  const router = useRouter();
  
  const resumeId = params.id as string; 

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("Untitled Resume");
  const [personalDetails, setPersonalDetails] = useState({ fullName: "", email: "", phone: "", location: "" });

  const [experiences, setExperiences] = useState([
    { id: "1", company: "", position: "", startDate: "", endDate: "", description: "" }
  ]);
  const [educations, setEducations] = useState([
    { id: "1", school: "", degree: "", startDate: "", endDate: "" }
  ]);
  const [skills, setSkills] = useState("");

  const [projects, setProjects] = useState([
    { id: "1", name: "", technologies: "", link: "", description: "" }
  ]);

  const addProject = () => setProjects([...projects, { id: Date.now().toString(), name: "", technologies: "", link: "", description: "" }]);
  const updateProject = (id: string, field: string, value: string) => {
    setProjects(projects.map(proj => proj.id === id ? { ...proj, [field]: value } : proj));
  };
  const removeProject = (id: string) => setProjects(projects.filter(proj => proj.id !== id));

  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const enhanceDescription = async (id: string, type: 'experience' | 'project', currentText: string) => {
    if (!currentText.trim()) {
      alert("Please type a few rough notes first so the AI has something to work with!");
      return;
    }

    setIsGenerating(id);
    try {
      const res = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentText, section: type }),
      });

      if (!res.ok) throw new Error("Failed to generate");

      const data = await res.json();

      if (type === 'experience') {
        updateExperience(id, "description", data.text);
      } else if (type === 'project') {
        updateProject(id, "description", data.text);
      }
    } catch (error) {
      alert("Oops! The AI encountered an error. Please try again.");
    } finally {
      setIsGenerating(null);
    }
  };


  const addExperience = () => setExperiences([...experiences, { id: Date.now().toString(), company: "", position: "", startDate: "", endDate: "", description: "" }]);
  const updateExperience = (id: string, field: string, value: string) => {
    setExperiences(experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };
  const removeExperience = (id: string) => setExperiences(experiences.filter(exp => exp.id !== id));

  const addEducation = () => setEducations([...educations, { id: Date.now().toString(), school: "", degree: "", startDate: "", endDate: "" }]);
  const updateEducation = (id: string, field: string, value: string) => {
    setEducations(educations.map(edu => edu.id === id ? { ...edu, [field]: value } : edu));
  };
  const removeEducation = (id: string) => setEducations(educations.filter(edu => edu.id !== id));
  
  useEffect(() => {
    const fetchResume = async () => {
      if (resumeId === "new") {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("resume_id", resumeId)
        .single();

    if (data && !error) {
        setTitle(data.title);
        if (data.personal_details) setPersonalDetails(data.personal_details);
        
        if (data.experiences) setExperiences(data.experiences);
        if (data.projects) setProjects(data.projects);
        if (data.educations) setEducations(data.educations); 
        if (data.skills) setSkills(data.skills);
      }
      
      setLoading(false);
    };

    fetchResume();
  }, [resumeId]);
  
const handleSave = async () => {
    setIsSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsSaving(false);
      return;
    }

    const payload = {
      user_id: user.id,
      title: title,
      personal_details: personalDetails,
      experiences: experiences,
      projects: projects,
      educations: educations,
      skills: skills,
      updated_at: new Date().toISOString(),
    };

    console.log("🚀 PAYLOAD LEAVING NEXT.JS:", payload);

    if (resumeId === "new") {
      const { data, error } = await supabase
        .from("resumes")
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error("Insert Error:", error);
        alert(`Failed to save: ${error.message}`); 
      } else if (data) {
        router.replace(`/builder/${data.resume_id}`);
      }
    } else {
      const { data, error } = await supabase
        .from("resumes")
        .update(payload)
        .eq("resume_id", resumeId)
        .select(); 

      if (error) {
        console.error("Update Error:", error);
        alert(`Failed to update: ${error.message}`); 
      } else {
        console.log("✅ WHAT SUPABASE SAVED:", data);
      }
    }
    
    setIsSaving(false);
  };


  if (loading) return <div className="p-8 text-center text-slate-500">Loading editor...</div>;

  return (
    <main className="h-screen max-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* THE CONTAINER */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-12 py-6 flex flex-col gap-6 overflow-hidden">
        
        {/* Top Header & Save Bar */}
        <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border dark:bg-slate-900 dark:border-slate-800 print:hidden">
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="max-w-xs font-semibold text-lg border-transparent hover:border-slate-200 focus:border-blue-500"
            placeholder="Resume Title"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>Cancel</Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Resume"}
            </Button>
            <Button variant="secondary" onClick={() => window.print()}>
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export PDF
            </Button>
          </div>
        </div>

        {/* 2. THE SPLIT GRID */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden min-h-0">
          
          {/* LEFT COLUMN: The Form  */}
          <div className="h-full overflow-y-auto pb-32 pr-2 custom-scrollbar print:hidden">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <CardTitle>
                  {step === 1 && "Personal Details"}
                  {step === 2 && "Work Experience"}
                  {step === 3 && "Projects"}
                  {step === 4 && "Education & Skills"}
                </CardTitle>
                <div className="text-sm font-medium text-slate-500">Step {step} of 4</div>
              </CardHeader>
              <CardContent className="pt-6">
                
                {/* STEP 1: Personal Details UI */}
                {step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input 
                        value={personalDetails.fullName} 
                        onChange={(e) => setPersonalDetails({...personalDetails, fullName: e.target.value})} 
                        placeholder="Enter your full name" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input 
                        value={personalDetails.email} 
                        onChange={(e) => setPersonalDetails({...personalDetails, email: e.target.value})} 
                        placeholder="email@example.com" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input 
                        value={personalDetails.phone} 
                        onChange={(e) => setPersonalDetails({...personalDetails, phone: e.target.value})} 
                        placeholder="+63 912 345 6789" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input 
                        value={personalDetails.location} 
                        onChange={(e) => setPersonalDetails({...personalDetails, location: e.target.value})} 
                        placeholder="Manila, Philippines" 
                      />
                    </div>
                  </div>
                )}
                
                {/* STEP 2: Work Experience */}
                {step === 2 && (
                  <div className="space-y-6">
                    {experiences.map((exp, index) => (
                      <div key={exp.id} className="p-4 border rounded-md relative bg-white dark:bg-slate-950 print:break-inside-avoid">
                        {experiences.length > 1 && (
                          <Button variant="ghost" size="sm" className="absolute top-2 right-2 text-red-500" onClick={() => removeExperience(exp.id)}>
                            Remove
                          </Button>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <div className="space-y-2"><Label>Company</Label><Input value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} placeholder="Google" /></div>
                          <div className="space-y-2"><Label>Position</Label><Input value={exp.position} onChange={(e) => updateExperience(exp.id, "position", e.target.value)} placeholder="Software Engineer" /></div>
                          <div className="space-y-2"><Label>Start Date</Label><Input value={exp.startDate} onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)} placeholder="Jan 2023" /></div>
                          <div className="space-y-2"><Label>End Date</Label><Input value={exp.endDate} onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)} placeholder="Present" /></div>
                          
                          <div className="md:col-span-2 space-y-2">
                            <div className="flex justify-between items-center">
                              <Label>Description</Label>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => enhanceDescription(exp.id, 'experience', exp.description)}
                                disabled={isGenerating === exp.id}
                                className="h-7 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800"
                              >
                                {isGenerating === exp.id ? "✨ Generating..." : "✨ Enhance with AI"}
                              </Button>
                            </div>
                            <Textarea 
                              value={exp.description} 
                              onChange={(e) => updateExperience(exp.id, "description", e.target.value)} 
                              placeholder="Describe your responsibilities and achievements..."
                              className="h-32"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full border-dashed" onClick={addExperience}>+ Add Another Job</Button>
                  </div>
                )}
                
                {/* STEP 3: Projects */}
                {step === 3 && (
                  <div className="space-y-6">
                    {projects.map((proj) => (
                      <div key={proj.id} className="p-4 border rounded-md relative bg-white dark:bg-slate-950 print:break-inside-avoid">
                        {projects.length > 1 && (
                          <Button variant="ghost" size="sm" className="absolute top-2 right-2 text-red-500" onClick={() => removeProject(proj.id)}>
                            Remove
                          </Button>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <div className="space-y-2"><Label>Project Name</Label><Input value={proj.name} onChange={(e) => updateProject(proj.id, "name", e.target.value)} placeholder="Enter project name" /></div>
                          <div className="space-y-2"><Label>Technologies Used</Label><Input value={proj.technologies} onChange={(e) => updateProject(proj.id, "technologies", e.target.value)} placeholder="React, Firebase, Tailwind" /></div>
                          <div className="space-y-2 md:col-span-2"><Label>Project Link (Optional)</Label><Input value={proj.link} onChange={(e) => updateProject(proj.id, "link", e.target.value)} placeholder="https://github.com/yourusername/project" /></div>
                          
                          <div className="md:col-span-2 space-y-2">
                            <div className="flex justify-between items-center">
                              <Label>Description</Label>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => enhanceDescription(proj.id, 'project', proj.description)}
                                disabled={isGenerating === proj.id}
                                className="h-7 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800"
                              >
                                {isGenerating === proj.id ? "✨ Generating..." : "✨ Enhance with AI"}
                              </Button>
                            </div>
                            <Textarea 
                              value={proj.description} 
                              onChange={(e) => updateProject(proj.id, "description", e.target.value)} 
                              placeholder="Developed a full-stack web application that..."
                              className="h-32"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full border-dashed" onClick={addProject}>+ Add Another Project</Button>
                  </div>
                )}
                
                {/* STEP 4: Education & Skills */}
                {step === 4 && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">Education</h3>
                      {educations.map((edu) => (
                        <div key={edu.id} className="p-4 border rounded-md relative bg-white dark:bg-slate-950 print:break-inside-avoid">
                          {educations.length > 1 && (
                            <Button variant="ghost" size="sm" className="absolute top-2 right-2 text-red-500" onClick={() => removeEducation(edu.id)}>Remove</Button>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div className="space-y-2"><Label>School</Label><Input value={edu.school} onChange={(e) => updateEducation(edu.id, "school", e.target.value)} placeholder="University of Science and Technology of Southern Philippines" /></div>
                            <div className="space-y-2"><Label>Degree</Label><Input value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} placeholder="B.S. Computer Science" /></div>
                            <div className="space-y-2"><Label>Start Date</Label><Input value={edu.startDate} onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)} placeholder="Aug 2019" /></div>
                            <div className="space-y-2"><Label>End Date</Label><Input value={edu.endDate} onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)} placeholder="May 2023" /></div>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full border-dashed" onClick={addEducation}>+ Add Another Degree</Button>
                    </div>

                    <div className="space-y-4 pt-4">
                      <h3 className="font-semibold text-lg border-b pb-2">Skills</h3>
                      <div className="space-y-2">
                        <Label>Core Competencies</Label>
                        <Textarea 
                          value={skills} 
                          onChange={(e) => setSkills(e.target.value)} 
                          placeholder="React, Next.js, TypeScript, Node.js (Separate with commas)"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </CardContent>
              
              {/* Form Navigation Buttons */}
              <div className="flex justify-between border-t p-4 bg-slate-50 rounded-b-lg dark:bg-slate-900">
                <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1}>
                  Previous
                </Button>
                <Button variant="outline" onClick={() => setStep(step + 1)} disabled={step === 4}>
                  Next Step
                </Button>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: The Real-Time Preview */}
          <div className="h-full overflow-y-auto overflow-x-auto pb-32 w-full flex justify-center items-start print:pb-0 print:block print:overflow-visible custom-scrollbar">
            <div id="resume-preview" className="relative w-full max-w-[210mm] h-[297mm] max-h-[297mm] overflow-hidden bg-white p-4 sm:p-6 shadow-lg ring-1 ring-slate-200 text-slate-900 font-serif text-[11pt] leading-snug print:shadow-none print:ring-0 print:m-0 print:h-[297mm] print:max-h-[297mm] print:overflow-hidden print:break-inside-avoid print:p-6 exact-print">
              
              {/* Resume Header */}
              <div className="text-center mb-10">
                <h1 className="text-2xl font-bold mb-1 text-slate-900">
                  {personalDetails.fullName || "Your Name"}
                </h1>
                
                <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 mt-1 text-sm text-slate-700">
                  {personalDetails.email && <span>{personalDetails.email}</span>}
                  {personalDetails.email && personalDetails.phone && <span>•</span>}
                  {personalDetails.phone && <span>{personalDetails.phone}</span>}
                  {(personalDetails.email || personalDetails.phone) && personalDetails.location && <span>•</span>}
                  {personalDetails.location && <span>{personalDetails.location}</span>}
                </div>
              </div>

              {/* Dynamic Body */}
              <div className="mt-4 text-left space-y-3">
                
                {/* Render Experience */}
                {experiences.some(exp => exp.company || exp.position) && (
                  <div>
                    <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-1 text-slate-800">Experience</h2>
                    <div className="space-y-2">
                      {experiences.map((exp) => (
                        <div key={exp.id}>
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{exp.position}</span>
                            <span>{exp.startDate} {exp.startDate && exp.endDate && "-"} {exp.endDate}</span>
                          </div>
                          <div className="italic text-slate-700">{exp.company}</div>
                          <div className="text-[10.5pt] text-slate-700 whitespace-pre-line leading-tight mt-0.5">
                            {exp.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Render Projects */}
                {projects.some(proj => proj.name || proj.technologies) && (
                  <div>
                    {/* Standardized Header */}
                    <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-1 text-slate-800">Projects</h2>
                    <div className="space-y-2">
                      {projects.map((proj) => (
                        <div key={proj.id}>
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{proj.name}</span>
                            {proj.link && <span className="font-normal text-blue-600">{proj.link}</span>}
                          </div>
                          <div className="italic text-slate-700 text-[10.5pt]">{proj.technologies}</div>
                          <div className="text-[10.5pt] text-slate-700 whitespace-pre-line leading-tight mt-0.5">
                            {proj.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Render Education */}
                {educations.some(edu => edu.school || edu.degree) && (
                  <div>
                    {/* Standardized Header */}
                    <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-1 text-slate-800">Education</h2>
                    <div className="space-y-1.5">
                      {educations.map((edu) => (
                        <div key={edu.id}>
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{edu.school}</span>
                            <span>{edu.startDate} {edu.startDate && edu.endDate && "-"} {edu.endDate}</span>
                          </div>
                          <div className="italic text-slate-700">{edu.degree}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Render Skills */}
                {skills && (
                  <div>
                    {/* Standardized Header */}
                    <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-1 text-slate-800">Skills</h2>
                    <p className="text-[10.5pt] text-slate-700 leading-snug whitespace-pre-line">{skills}</p>
                  </div>
                )}
                
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}