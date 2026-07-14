"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SCHOOLS, timeCapsuleSchema, type TimeCapsuleFormData } from "@/lib/constants";
import { MediaCapture } from "./media-capture";

const STEPS = [
  { id: "basic", title: "Basic Details" },
  { id: "reflections", title: "Time Capsule" },
  { id: "upload", title: "Upload & Consent" },
];

export function CapsuleForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [sealAnimation, setSealAnimation] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileName = mediaFile?.name || null;
  const router = useRouter();

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TimeCapsuleFormData>({
    resolver: zodResolver(timeCapsuleSchema),
    defaultValues: {
      school: "",
      program: "",
    },
  });

  const selectedSchool = useWatch({ control, name: "school" });
  const selectedProgram = useWatch({ control, name: "program" });

  const currentSchoolData = SCHOOLS.find((s) => s.id === selectedSchool);
  const programs = useMemo(() => currentSchoolData?.programs || [], [currentSchoolData]);

  // Auto-calculate graduation year
  useEffect(() => {
    if (selectedSchool && selectedProgram) {
      const prog = programs.find((p) => p.name === selectedProgram);
      if (prog) {
        const currentYear = new Date().getFullYear();
        setValue("graduationYear", (currentYear + prog.duration).toString());
      }
    }
  }, [selectedSchool, selectedProgram, programs, setValue]);

  // Autosave functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClient(true);
      const saved = localStorage.getItem("capsule-draft");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          Object.keys(parsed).forEach((key) => {
            setValue(key as keyof TimeCapsuleFormData, parsed[key]);
          });
        } catch (e) {
          console.error("Failed to restore draft", e);
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [setValue]);

  const formValues = useWatch({ control });

  useEffect(() => {
    localStorage.setItem("capsule-draft", JSON.stringify(formValues));
  }, [formValues]);

  const nextStep = async () => {
    let fieldsToValidate: (keyof TimeCapsuleFormData)[] = [];

    if (currentStep === 0) fieldsToValidate = ["fullName", "enrollmentNumber", "jecrcEmail", "personalEmail", "mobileNumber", "school", "program", "graduationYear"];
    if (currentStep === 1) fieldsToValidate = ["dream", "fear", "promise"];

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const onSubmit = async (data: TimeCapsuleFormData) => {
    if (!mediaFile) {
      toast.error("Please capture a photo or upload an image before sealing.");
      return;
    }

    try {
      let fileData = null;
      let fileMimeType = null;

      if (mediaFile) {
        const base64String = await getBase64(mediaFile);
        // Extracts the base64 part, removing "data:image/jpeg;base64,"
        fileData = base64String.split(",")[1];
        fileMimeType = mediaFile.type;
      }

      const payload = {
        ...data,
        fileName: fileName || "None",
        fileData: fileData || "",
        fileMimeType: fileMimeType || ""
      };

      const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
      if (!scriptUrl) throw new Error("API URL is not defined in environment variables.");

      const response = await fetch(scriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain", // Keep text/plain to avoid CORS preflight
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.status === "error") {
        toast.error(result.message || "Failed to seal the capsule. Your enrollment number or email might already be registered.");
        return;
      }

      localStorage.removeItem("capsule-draft");
      
      // Trigger the sealing animation
      setSealAnimation(true);
      
      // Wait for the animation to play before redirecting
      const unlockYear = data.graduationYear || "Graduation";
      setTimeout(() => {
        router.push(`/success?year=${encodeURIComponent(unlockYear)}`);
      }, 2500);
    } catch (error) {
      console.error(error);
      toast.error("Failed to seal the capsule. Please try again.");
    }
  };

  if (!isClient) return null; // Avoid hydration mismatch

  const inputClasses = "w-full bg-[#F9F8F6]/50 border-2 border-zinc-200/50 focus-visible:border-primary/40 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10 h-14 rounded-2xl px-5 text-base text-zinc-900 placeholder:text-zinc-400 transition-all duration-300 ease-out shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20 hover:bg-[#F9F8F6] outline-none";
  const labelClasses = "text-zinc-700 transition-colors duration-300 font-semibold text-xs tracking-[0.1em] uppercase mb-2 ml-1 inline-block";
  const promptClasses = "font-serif italic text-zinc-900 text-xl md:text-2xl mb-4 block leading-snug";
  const errorClasses = "text-red-500 text-xs mt-2 font-medium ml-1";

  return (
    <div className="space-y-8 relative">
      <AnimatePresence>
        {sealAnimation && (
          <motion.div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* The user's media in the background getting sealed */}
            {previewUrl && (
              <motion.div
                initial={{ scale: 1.1, opacity: 0.8 }}
                animate={{ scale: 0.9, opacity: 0.3, filter: "grayscale(100%)" }}
                transition={{ duration: 2.5, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none p-12"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} className="w-full h-full object-cover max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl" alt="Memory" />
              </motion.div>
            )}

            <motion.div
              initial={{ scale: 5, opacity: 0, rotate: 45 }}
              animate={{ scale: 1, opacity: 1, rotate: -8 }}
              transition={{ 
                type: "spring", 
                stiffness: 220, 
                damping: 14,
                delay: 0.2
              }}
              className="w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full flex flex-col items-center justify-center bg-transparent z-20 relative mix-blend-multiply"
            >
              {/* Thick Outer Ring */}
              <div className="absolute inset-0 border-[10px] md:border-[16px] border-[#CD201F] rounded-full" />
              
              {/* Thin Inner Ring */}
              <div className="absolute inset-[16px] md:inset-[24px] border-[2px] md:border-[3px] border-[#CD201F] rounded-full" />

              {/* Thick Inner Ring / Core */}
              <div className="absolute inset-[24px] md:inset-[34px] border-[5px] md:border-[8px] border-[#CD201F] rounded-full flex flex-col items-center justify-center bg-[#CD201F]/5 overflow-hidden">
                 {/* Top Arc Text Area (Simulated) */}
                 <span className="absolute top-6 md:top-10 text-[#CD201F] text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.5em] uppercase opacity-90">
                   Time Capsule
                 </span>

                 {/* Bottom Text */}
                 <span className="absolute bottom-6 md:bottom-10 text-[#CD201F] text-xs sm:text-sm md:text-base font-black tracking-[0.3em] uppercase drop-shadow-sm">
                   Until {formValues.graduationYear || "Graduation"}
                 </span>
              </div>
              
              {/* Center Badge Bar (moved outside to prevent clipping) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[125%] sm:w-[120%] h-[60px] sm:h-[80px] md:h-[100px] border-[4px] sm:border-[5px] md:border-[8px] border-[#CD201F] bg-[#F9F8F6] flex items-center justify-center shadow-sm -rotate-2 z-10 px-4">
                <span className="text-[#CD201F] text-4xl sm:text-6xl md:text-[5.5rem] font-black tracking-tight uppercase leading-none drop-shadow-sm whitespace-nowrap">
                   SEALED
                </span>
              </div>

              {/* Distressed Texture over everything */}
              <div className="absolute inset-[-15%] w-[130%] h-[130%] opacity-50 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] pointer-events-none rounded-full z-20" />
            </motion.div>
            
            {/* Impact dust / shockwave */}
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
              className="absolute w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 border-[4px] md:border-[6px] border-[#CD201F] rounded-full z-10 pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Progress */}
      <div className="sticky top-6 z-50 bg-[#F9F8F6]/90 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-sm flex flex-col gap-3 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="uppercase text-[10px] tracking-[0.2em] text-primary font-bold">Step {currentStep + 1} {"//"} {STEPS.length}</span>
          <span className="font-serif italic text-lg md:text-xl text-zinc-800">{STEPS[currentStep].title}</span>
        </div>
        <div className="flex gap-2 w-full mt-1">
          {STEPS.map((step, idx) => (
            <div key={step.id} className={`h-1.5 rounded-full transition-all duration-700 ease-out flex-1 ${idx <= currentStep ? "bg-primary" : "bg-zinc-200"}`} />
          ))}
        </div>
      </div>

      <Card className="border-0 sm:border border-white/60 bg-white/60 backdrop-blur-2xl shadow-xl sm:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden rounded-[2.5rem] sm:rounded-[3rem] relative">
        <div className="space-y-6 md:space-y-8">
          <CardHeader className="space-y-3 pb-8 pt-10 px-6 md:px-12">
            <CardTitle className="font-serif text-[#1A1A1A] text-[clamp(2rem,4vw+1rem,3rem)] leading-none">{STEPS[currentStep].title}</CardTitle>
            <CardDescription className="text-zinc-500 text-base font-light font-[family-name:var(--font-cormorant)] italic md:text-xl max-w-lg leading-relaxed">
              {currentStep === 0 && "Let's start with your personal and academic details."}
              {currentStep === 1 && "Take a moment. Be honest. Be bold. What does the future hold?"}
              {currentStep === 2 && "Add a selfie to remember this moment, and seal your promise."}
            </CardDescription>
          </CardHeader>

          <CardContent className="min-h-[350px] md:min-h-[400px] px-6 md:px-14 pb-10 md:pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-8"
              >
                {/* STEP 0: Basic Details */}
                {currentStep === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="md:col-span-2">
                      <Label htmlFor="fullName" className={labelClasses}>Full Name *</Label>
                      <Input id="fullName" placeholder="Aarav Sharma" {...register("fullName")} className={inputClasses} />
                      {errors.fullName?.message && <p className={errorClasses}>{errors.fullName.message as string}</p>}
                    </div>

                    <div>
                      <Label htmlFor="enrollmentNumber" className={labelClasses}>Registeration Number *</Label>
                      <Input id="enrollmentNumber" placeholder="26ABCXXXX" {...register("enrollmentNumber")} className={inputClasses} />
                      {errors.enrollmentNumber?.message && <p className={errorClasses}>{errors.enrollmentNumber.message as string}</p>}
                    </div>

                    <div>
                      <Label htmlFor="mobileNumber" className={labelClasses}>Mobile Number *</Label>
                      <Input id="mobileNumber" placeholder="9876543210" {...register("mobileNumber")} className={inputClasses} />
                      {errors.mobileNumber?.message && <p className={errorClasses}>{errors.mobileNumber.message as string}</p>}
                    </div>

                    <div>
                      <Label htmlFor="jecrcEmail" className={labelClasses}>JECRC Email ID *</Label>
                      <Input id="jecrcEmail" type="email" placeholder="aarav.26ABCDXXXX@jecrcu.edu.in" {...register("jecrcEmail")} className={inputClasses} />
                      {errors.jecrcEmail?.message && <p className={errorClasses}>{errors.jecrcEmail.message as string}</p>}
                    </div>

                    <div>
                      <Label htmlFor="personalEmail" className={labelClasses}>Personal Email ID *</Label>
                      <Input id="personalEmail" type="email" placeholder="aarav.sharma@gmail.com" {...register("personalEmail")} className={inputClasses} />
                      {errors.personalEmail?.message && <p className={errorClasses}>{errors.personalEmail.message as string}</p>}
                    </div>

                    <div className="md:col-span-2 mt-2 pt-6 md:mt-4 md:pt-8 border-t border-zinc-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div>
                          <Label htmlFor="school" className={labelClasses}>School *</Label>
                          <Select onValueChange={(val) => { setValue("school", val || ""); setValue("program", ""); setValue("graduationYear", ""); }} value={selectedSchool || ""}>
                            <SelectTrigger className={inputClasses}>
                              <span className={selectedSchool ? "text-zinc-900" : "text-zinc-400"}>
                                {selectedSchool ? SCHOOLS.find(s => s.id === selectedSchool)?.name : "Select your school"}
                              </span>
                            </SelectTrigger>
                            <SelectContent className="bg-white border-zinc-200 text-zinc-900 max-h-60 rounded-xl shadow-lg">
                              {SCHOOLS.map((school) => (
                                <SelectItem key={school.id} value={school.id} className="focus:bg-zinc-100 focus:text-zinc-900 cursor-pointer">{school.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.school?.message && <p className={errorClasses}>{errors.school.message as string}</p>}
                        </div>

                        <div>
                          <Label htmlFor="program" className={labelClasses}>Course *</Label>
                          <Select onValueChange={(val) => setValue("program", val || "")} value={selectedProgram || ""} disabled={!selectedSchool}>
                            <SelectTrigger className={inputClasses}><SelectValue placeholder="Select your course" /></SelectTrigger>
                            <SelectContent className="bg-white border-zinc-200 text-zinc-900 max-h-60 rounded-xl shadow-lg">
                              {programs.map((prog) => (
                                <SelectItem key={prog.name} value={prog.name} className="focus:bg-zinc-100 focus:text-zinc-900 cursor-pointer">{prog.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.program?.message && <p className={errorClasses}>{errors.program.message as string}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="graduationYear" className={labelClasses}>Year Of Graduation *</Label>
                      <Input
                        id="graduationYear"
                        placeholder="Auto-calculated after selecting course"
                        {...register("graduationYear")}
                        readOnly
                        className={`${inputClasses} bg-zinc-100 text-zinc-500 cursor-not-allowed border-zinc-200/50`}
                      />
                      {errors.graduationYear?.message && <p className={errorClasses}>{errors.graduationYear.message as string}</p>}
                    </div>
                  </div>
                )}

                {/* STEP 1: Reflections */}
                {currentStep === 1 && (
                  <div className="space-y-10 md:space-y-12">
                    <div>
                      <Label htmlFor="dream" className={promptClasses}>One Dream <br/><span className="text-sm font-sans not-italic text-zinc-500 tracking-wide font-normal">(What is one dream you sincerely hope to achieve before you graduate?)</span></Label>
                      <Textarea id="dream" placeholder="In four years, I want to..." {...register("dream")} className={`w-full bg-[#F9F8F6]/50 border-2 border-zinc-200/50 focus-visible:border-primary/40 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10 p-5 md:p-6 min-h-[140px] resize-none text-base text-zinc-900 placeholder:text-zinc-400 transition-all duration-300 ease-out rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20 hover:bg-[#F9F8F6] outline-none leading-relaxed`} />
                      {errors.dream?.message && <p className={errorClasses}>{errors.dream.message as string}</p>}
                    </div>
                    <div>
                      <Label htmlFor="fear" className={promptClasses}>One Fear <br/><span className="text-sm font-sans not-italic text-zinc-500 tracking-wide font-normal">(What is the biggest fear or challenge you&apos;re carrying today?)</span></Label>
                      <Textarea id="fear" placeholder="I'm afraid that..." {...register("fear")} className={`w-full bg-[#F9F8F6]/50 border-2 border-zinc-200/50 focus-visible:border-primary/40 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10 p-5 md:p-6 min-h-[140px] resize-none text-base text-zinc-900 placeholder:text-zinc-400 transition-all duration-300 ease-out rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20 hover:bg-[#F9F8F6] outline-none leading-relaxed`} />
                      {errors.fear?.message && <p className={errorClasses}>{errors.fear.message as string}</p>}
                    </div>
                    <div>
                      <Label htmlFor="promise" className={promptClasses}>One Promise <br/><span className="text-sm font-sans not-italic text-zinc-500 tracking-wide font-normal">(Make one promise to yourself that you never want to break.)</span></Label>
                      <Textarea id="promise" placeholder="I promise to never give up on..." {...register("promise")} className={`w-full bg-[#F9F8F6]/50 border-2 border-zinc-200/50 focus-visible:border-primary/40 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10 p-5 md:p-6 min-h-[140px] resize-none text-base text-zinc-900 placeholder:text-zinc-400 transition-all duration-300 ease-out rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20 hover:bg-[#F9F8F6] outline-none leading-relaxed`} />
                      {errors.promise?.message && <p className={errorClasses}>{errors.promise.message as string}</p>}
                    </div>
                  </div>
                )}

                {/* STEP 2: Final / Upload */}
                {currentStep === 2 && (
                  <div className="space-y-8 md:space-y-10">
                    <div className="space-y-4">
                      <Label className="text-zinc-800 text-lg font-serif">Capture the Moment *</Label>
                      <MediaCapture onMediaCaptured={(file) => {
                        setMediaFile(file);
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                        if (file) {
                          setPreviewUrl(URL.createObjectURL(file));
                        } else {
                          setPreviewUrl(null);
                        }
                      }} />
                    </div>

                    <div className="space-y-6 pt-6 border-t border-zinc-200">
                      <div className="p-6 md:p-8 border border-red-500/10 bg-red-50/50 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150" />
                        <h4 className="font-serif italic text-2xl md:text-3xl mb-3 text-zinc-900 relative z-10">The Final Seal</h4>
                        <p className="text-zinc-600 text-base font-light leading-relaxed relative z-10">
                          Once sealed, this capsule cannot be opened, altered, or accessed until your graduation.
                          Your promise remains unbroken until that day.
                        </p>
                      </div>

                      <label className="flex items-start space-x-4 p-4 md:p-5 border border-zinc-200 rounded-2xl cursor-pointer hover:bg-white/60 transition-colors bg-white/30">
                        <div className="flex items-center h-5 mt-0.5">
                          <input type="checkbox" {...register("privacyConsent")} className="w-5 h-5 bg-white border-zinc-300 rounded text-primary focus:ring-primary accent-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-medium text-zinc-900">Consent Checkbox *</span>
                          <span className="text-sm text-zinc-500 mt-1">I understand that JECRC University will securely store my responses and send them back to me during my graduation year. My responses will remain private and will not be shared publicly without my permission.</span>
                        </div>
                      </label>
                      {errors.privacyConsent?.message && <p className={errorClasses}>{errors.privacyConsent.message as string}</p>}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex flex-col-reverse md:flex-row justify-between gap-4 pt-6 md:pt-8 pb-6 md:pb-8 px-6 md:px-12 border-t border-zinc-100 bg-zinc-50/50">
            <Button type="button" variant="ghost" onClick={prevStep} disabled={currentStep === 0 || isSubmitting} className="w-full md:w-auto text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50 rounded-full px-6 py-6 md:py-2">
              Back
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={nextStep} className="group w-full md:w-auto bg-[#1A1A1A] text-white hover:bg-primary px-10 h-14 md:h-12 rounded-full shadow-lg transition-all duration-500 hover:shadow-primary/30 text-base font-medium hover:-translate-y-0.5">
                <span className="relative z-10 flex items-center gap-2">
                  Continue
                  <svg className="w-4 h-4 transform transition-transform duration-500 ease-[0.19,1,0.22,1] group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="group w-full md:w-auto bg-primary text-white hover:bg-primary/90 px-10 h-14 md:h-12 rounded-full shadow-lg transition-all duration-500 hover:shadow-primary/40 text-base font-medium hover:-translate-y-0.5">
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? "Locking..." : "Lock My Time Capsule"}
                  {!isSubmitting && (
                    <svg className="w-4 h-4 transform transition-transform duration-500 ease-[0.19,1,0.22,1] group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </span>
              </Button>
            )}
          </CardFooter>
        </div>
      </Card>
    </div>
  );
}
