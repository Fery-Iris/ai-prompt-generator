"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
}

export default function VideoModal({ 
  isOpen, 
  onClose, 
  videoUrl = "https://www.youtube.com/embed/vNjWIIKzhDU?autoplay=1" 
}: VideoModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl mx-4 aspect-video rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 sm:top-2 sm:right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close video"
        >
          <X size={20} />
        </button>
        <iframe
          src={videoUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Live Demo Video"
        />
      </div>
    </div>
  );
}
