import React, { useState } from 'react';
import { X, Send, Copy, Check, MapPin } from 'lucide-react';

export interface MemberProfile {
  name: string;
  avatarUrl?: string;
  regNumber: string;
  specialty: string;
  bio: string;
  techStack: string[];
  streakDays: number;
  points: number;
  portfolioItems: { name: string; category: string; size?: string }[];
}

interface MemberBioModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: MemberProfile;
  onStartDM?: (name: string) => void;
  onToast: (msg: string) => void;
}

export const MemberBioModal: React.FC<MemberBioModalProps> = ({
  isOpen,
  onClose,
  profile,
  onStartDM,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`mku-it-club://portfolio/${profile.regNumber.replace(/\//g, '-')}`);
    setCopied(true);
    onToast(`Copied developer portfolio token!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" id="member-bio-modal">
      {/* Container Card - matching the attached image design exactly */}
      <div className="bg-[#24274c] w-full max-w-[340px] rounded-3xl shadow-2xl overflow-hidden border border-slate-700/30 animate-scale-in flex flex-col relative">
        
        {/* Top Header: Soft Lavender Background */}
        <div className="bg-[#ECEEFC] h-[160px] w-full flex items-center justify-center relative shrink-0">
          {/* Absolute floating close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-slate-950/10 hover:bg-slate-950/20 text-slate-600 hover:text-slate-900 rounded-full transition-all cursor-pointer z-30"
            title="Close profile"
          >
            <X className="w-4.5 h-4.5" />
          </button>

          {/* Centered Circular Avatar Frame with thick dark indigo border */}
          <div className="relative mt-8">
            <div className="w-28 h-28 rounded-full overflow-hidden border-[4px] border-[#24274c] shadow-lg bg-slate-900 flex items-center justify-center">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-750 to-indigo-900 flex items-center justify-center text-white text-3xl font-black">
                  {profile.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Portion: Rich Navy/Dark Indigo Background */}
        <div className="p-6 flex flex-col items-center text-center">
          
          {/* Name & Specialty */}
          <div className="space-y-1 mt-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight leading-tight">{profile.name}</h2>
            
            {/* Registry Number with Map Pin Icon */}
            <div className="flex items-center justify-center gap-1 text-slate-300/95 font-bold font-mono text-[11px] uppercase tracking-wider mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{profile.regNumber}</span>
            </div>

            {/* Specialty Designation */}
            <p className="text-[12px] font-extrabold text-blue-300 uppercase tracking-wide pt-1">
              {profile.specialty}
            </p>
          </div>

          {/* Short Bio */}
          <p className="text-xs text-slate-300 font-semibold leading-relaxed mt-3.5 max-w-[270px]">
            {profile.bio || "Active member of MKU IT Club portfolio space."}
          </p>

          {/* Interactive buttons matching follow/message in the image */}
          <div className="grid grid-cols-2 gap-3 w-full mt-6">
            {onStartDM ? (
              <button
                onClick={() => {
                  onStartDM(profile.name);
                  onClose();
                }}
                className="bg-[#1b1c3c] hover:bg-[#15162e] text-slate-100 font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border border-slate-700/40 transition-all active:scale-[0.98]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Message</span>
              </button>
            ) : (
              <div className="bg-[#1b1c3c] opacity-50 text-slate-400 font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                <span>Message</span>
              </div>
            )}

            <button
              onClick={handleCopyLink}
              className="bg-[#1b1c3c] hover:bg-[#15162e] text-slate-100 font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border border-slate-700/40 transition-all active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-extrabold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-blue-400" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

          {/* Divider line */}
          <div className="border-t border-slate-700/40 w-full my-5" />

          {/* Skills Section */}
          <div className="w-full text-left">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
              SKILLS
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.techStack && profile.techStack.length > 0 ? (
                profile.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="bg-[#2a2c58] text-slate-200 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-slate-700/30 uppercase tracking-wider"
                  >
                    {tech}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 font-bold text-xs italic">No skills specified</span>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
