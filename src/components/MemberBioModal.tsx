import React, { useState } from 'react';
import { XCircle, Award, Zap, Flame, Code, BookOpen, Send, Copy, Check, ShieldCheck, Github } from 'lucide-react';

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

  // Gamified tier based on contribution points
  const getTier = (pts: number) => {
    if (pts >= 500) return { name: 'Gold Elite', color: 'text-amber-500 bg-amber-50 border-amber-100', icon: '🏆' };
    if (pts >= 300) return { name: 'Silver Architect', color: 'text-slate-500 bg-slate-50 border-slate-100', icon: '🥈' };
    return { name: 'Bronze Builder', color: 'text-amber-700 bg-amber-50/50 border-amber-100/50', icon: '🥉' };
  };

  const tier = getTier(profile.points);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" id="member-bio-modal">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-150 animate-scale-in flex flex-col max-h-[90vh]">
        
        {/* Profile Card Background Header */}
        <div className="relative h-28 bg-gradient-to-r from-blue-600 to-indigo-700 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-black/20 hover:bg-black/35 text-white rounded-lg cursor-pointer transition-all"
            title="Close profile"
          >
            <XCircle className="w-4 h-4" />
          </button>
          
          <div className="absolute -bottom-8 left-6">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 border-4 border-white shadow-md flex items-center justify-center text-indigo-700 text-3xl font-black">
                {profile.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Profile Body */}
        <div className="flex-1 overflow-y-auto p-6 pt-11 space-y-4 no-scrollbar">
          
          {/* Identity & Verified Info */}
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-lg font-black text-slate-800 tracking-tight">{profile.name}</h2>
              <span className="flex items-center gap-0.5 bg-blue-50 text-blue-600 text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-wider">
                <ShieldCheck className="w-2.5 h-2.5 text-blue-500 fill-blue-100" /> Verified Member
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{profile.regNumber}</p>
            <p className="text-xs font-semibold text-indigo-600 mt-0.5">{profile.specialty}</p>
          </div>

          {/* Personal Biography */}
          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              "{profile.bio}"
            </p>
          </div>

          {/* Coding Streaks and Contribution Points Grid */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Gamified Points Tier */}
            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-150 flex flex-col justify-between">
              <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Club XP & Rank</span>
              <div className="mt-1.5">
                <div className="flex items-center gap-1">
                  <span className="text-sm">{tier.icon}</span>
                  <span className="text-xs font-extrabold text-slate-800">{profile.points} XP</span>
                </div>
                <span className={`inline-block mt-1 text-[8px] font-bold border px-1.5 py-0.5 rounded ${tier.color}`}>
                  {tier.name}
                </span>
              </div>
            </div>

            {/* Daily Active Streak */}
            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-150 flex flex-col justify-between">
              <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Active Coding Streak</span>
              <div className="mt-1.5">
                <div className="flex items-center gap-1 text-xs font-extrabold text-orange-600">
                  <Flame className="w-4 h-4 fill-orange-500 text-orange-600 animate-pulse" />
                  <span>{profile.streakDays} Days</span>
                </div>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-full rounded-full"
                    style={{ width: `${Math.min((profile.streakDays / 30) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Tech Stack Skills */}
          <div>
            <h3 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Code className="w-3 h-3 text-slate-400" /> Language & Tech Stack
            </h3>
            <div className="flex flex-wrap gap-1">
              {profile.techStack.map((tech) => (
                <span
                  key={tech}
                  className="bg-indigo-50/60 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded border border-indigo-100/50"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Contribution Portfolio uploads */}
          <div>
            <h3 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-slate-400" /> Resource Hub Uploads
            </h3>
            {profile.portfolioItems.length === 0 ? (
              <p className="text-[10px] text-slate-400 font-medium italic">No files shared yet in Resources</p>
            ) : (
              <div className="space-y-1.5">
                {profile.portfolioItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-slate-50 hover:bg-slate-100/80 p-2 rounded-lg border border-slate-100 text-[10px] transition-all cursor-pointer"
                    onClick={() => onToast(`Requesting access to ${item.name}`)}
                  >
                    <span className="font-bold text-slate-700 truncate max-w-[200px]">{item.name}</span>
                    <span className="bg-slate-200/60 text-slate-500 text-[8px] font-bold px-1.5 py-0.2 rounded uppercase shrink-0">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2 shrink-0">
          <button
            onClick={handleCopyLink}
            className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600">Token Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Share Profile</span>
              </>
            )}
          </button>

          {onStartDM && (
            <button
              onClick={() => {
                onStartDM(profile.name);
                onClose();
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Direct Message</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
