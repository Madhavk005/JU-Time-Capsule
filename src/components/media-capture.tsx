"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type CaptureMode = "upload" | "photo" | null;

interface MediaCaptureProps {
  onMediaCaptured: (file: File | null) => void;
}

export function MediaCapture({ onMediaCaptured }: MediaCaptureProps) {
  const [mode, setMode] = useState<CaptureMode>("photo");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Safely stop all active media tracks
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const srcStream = videoRef.current.srcObject as MediaStream;
      srcStream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setStream(null);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Media devices not available.");
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false // audio not needed for photos
      });
      
      // If component unmounted while waiting for camera, stop it immediately
      if (!videoRef.current) {
        mediaStream.getTracks().forEach(track => track.stop());
        return;
      }

      stopStream(); // Stop any existing streams just in case
      streamRef.current = mediaStream;
      setStream(mediaStream);
      
      videoRef.current.srcObject = mediaStream;
      await videoRef.current.play().catch(e => {
        if (e.name !== 'AbortError') {
          console.error("Video play failed:", e);
        }
      });
    } catch (err) {
      console.error(err);
      toast.error("Camera permission denied or unavailable.");
      setMode("upload");
    }
  }, [stopStream]);

  // Automatically start camera on mount or mode change
  useEffect(() => {
    if (mode === "photo") {
      startCamera();
    }
    return () => {
      stopStream();
    };
  }, [mode, startCamera, stopStream]);

  const switchMode = (newMode: CaptureMode) => {
    stopStream();
    setCapturedImage(null);
    setFileName(null);
    onMediaCaptured(null);
    setMode(newMode);
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Mirror the canvas to match the video preview (scale-x-[-1])
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        
        // Draw the current video frame onto the canvas
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "capsule-photo.jpg", { type: "image/jpeg" });
            const imageUrl = URL.createObjectURL(blob);
            setCapturedImage(imageUrl);
            setFileName(file.name);
            onMediaCaptured(file);
            stopStream(); // Turn off camera once captured
          }
        }, "image/jpeg", 0.9);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be under 2MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file.");
        return;
      }
      onMediaCaptured(file);
      setFileName(file.name);
      const url = URL.createObjectURL(file);
      setCapturedImage(url);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setFileName(null);
    onMediaCaptured(null);
    if (mode === "upload") {
      setMode("upload"); // force re-render logic if needed
    } else {
      startCamera();
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Manual Mode Toggle */}
      {!capturedImage && (
        <div className="flex justify-center gap-2 mb-2">
          <button type="button" onClick={() => switchMode("photo")} className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-bold transition-all ${mode === "photo" ? "bg-primary text-white shadow-md" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}>Photo</button>
          <button type="button" onClick={() => switchMode("upload")} className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-bold transition-all ${mode === "upload" ? "bg-primary text-white shadow-md" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}>Upload</button>
        </div>
      )}

      {/* Main Viewfinder / Canvas Area */}
      <div className="relative w-full aspect-[4/3] md:aspect-video bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-xl border-[6px] border-zinc-100 group">
        
        <AnimatePresence mode="wait">
          {capturedImage ? (
            <motion.div key="image" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
              <button type="button" onClick={(e) => { e.preventDefault(); resetCapture(); }} className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-full backdrop-blur-md hover:bg-primary transition shadow-xl hover:rotate-90">
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl text-white text-sm font-medium">
                {fileName}
              </div>
            </motion.div>
          ) : mode === "upload" ? (
            <motion.label key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-colors">
              <Upload className="w-16 h-16 text-zinc-300 mb-6 group-hover:-translate-y-2 transition-transform duration-500" />
              <p className="text-zinc-700 font-serif text-2xl mb-2">Upload a Photo</p>
              <p className="text-zinc-500 text-sm font-medium">Supports Images (Max 2MB)</p>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </motion.label>
          ) : (
            <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black">
              {/* Note: scale-x-[-1] mirrors the webcam horizontally so it acts like a mirror! */}
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              
              {/* Viewfinder Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="w-full h-full flex flex-col justify-between">
                  <div className="border-b border-white w-full h-1/3" />
                  <div className="border-b border-white w-full h-1/3" />
                </div>
                <div className="absolute inset-0 flex justify-between">
                  <div className="border-r border-white h-full w-1/3" />
                  <div className="border-r border-white h-full w-1/3" />
                </div>
              </div>

              {/* Camera Action Buttons */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 z-10">
                {mode === "photo" && (
                  <button type="button" onClick={(e) => { e.preventDefault(); takePhoto(); }} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-[4px] border-white/80 bg-white/30 backdrop-blur-md hover:bg-white/60 transition-all active:scale-90 shadow-2xl" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
