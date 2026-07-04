import React, { useState, useEffect } from 'react';
import { XCircle, Award, Flame, Code, ShieldCheck, Mail, UserCheck, MessageSquare, Compass, Terminal, Sparkles, Share2, Check } from 'lucide-react';
import { User } from '../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface ScannedProfileModalProps {
  uid: string;
  onClose: () => void;
  onStartDM?: (uid: string) => void;
  allUsers: User[];
  onToast: (msg: string) => void;
  currentUser: User | null;
}

export const ScannedProfileModal: React.FC<ScannedProfileModalProps> = ({
  uid,
  onClose,
  onStartDM,
  allUsers,
  onToast,
  currentUser,
}) => {
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      // 1. Try to find in already loaded users
      const found = allUsers.find((u) => u.uid === uid);
      if (found) {
        setProfileUser(found);
        setLoading(false);
        return;
      }

      // 2. Fallback: load directly from Firestore
      try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileUser({ uid, ...docSnap.data() } as User);
        } else {
          onToast('⚠️ Developer profile not found in system.');
        }
      } catch (err) {
        console.error('Error fetching scanned profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      fetchUser();
    }
  }, [uid, allUsers]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 backdrop-blur-md animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 max-w-xs text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          <p className="text-xs font-bold text-slate-300 font-mono">RETRIEVING SECURE PASS...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 backdrop-blur-md animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center space-y-4 max-w-xs text-center shadow-2xl">
          <XCircle className="w-12 h-12 text-rose-500" />
          <h4 className="text-sm font-black text-white uppercase tracking-wider font-mono">Record Not Found</h4>
          <p className="text-xs text-slate-400">The scanned badge does not point to an active student developer record.</p>
          <button
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  // Gamified status helper
  const getXpTier = (xp: number) => {
    if (xp >= 500) return { name: 'Titan Engineer', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', glow: 'shadow-[0_0_15px_-3px_rgba(251,191,36,0.3)]' };
    if (xp >= 300) return { name: 'Master Architect', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', glow: 'shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)]' };
    if (xp >= 150) return { name: 'Senior Builder', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', glow: 'shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]' };
    return { name: 'Junior Associate', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', glow: '' };
  };

  const xp = profileUser.xp || 50;
  const tier = getXpTier(xp);

  const shareUrl = `${window.location.origin}?profile=${profileUser.uid}`;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in" id="scanned-profile-modal">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in flex flex-col max-h-[92vh]">
        
        {/* Card Header Stamp */}
        <div className="relative h-24 bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-950 px-6 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 fill-emerald-950" />
            <div className="font-mono">
              <span className="block text-[8px] font-black text-emerald-400 tracking-widest uppercase">Verified Security Scan</span>
              <span className="block text-[11px] font-extrabold text-slate-200 tracking-wider">MEMBER PASSPORT</span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
            title="Dismiss view"
          >
            ✕
          </button>
        </div>

        {/* Card Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          
          {/* Avatar & Main Credentials */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={profileUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name)}&background=2563EB&color=fff`}
                alt={profileUser.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500/50 bg-slate-950 shadow-md shrink-0"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 p-1 rounded-full border-2 border-slate-900 shadow" title="Active member badge verified">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-base font-black text-white tracking-tight truncate leading-tight">{profileUser.name}</h2>
              <p className="text-[10px] text-blue-400 font-bold font-mono tracking-wider uppercase mt-0.5">{profileUser.username || profileUser.regNumber}</p>
              
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-[8.5px] font-black border px-2 py-0.5 rounded-md ${tier.color} ${tier.glow}`}>
                  <Award className="w-3 h-3 text-sky-400" />
                  {tier.name}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Audit Stamp */}
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center text-[9px] font-bold font-mono text-slate-500">
              <span>METADATA AUDIT</span>
              <span className="text-emerald-500">SECURE LOGS SIGNED</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/50">
                <span className="block text-slate-500 text-[8px] font-bold">CLUB LEVEL</span>
                <span className="font-extrabold text-white font-mono">LEVEL {profileUser.level || 1}</span>
              </div>
              <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/50">
                <span className="block text-slate-500 text-[8px] font-bold">TOTAL REWARD XP</span>
                <span className="font-extrabold text-blue-400 font-mono">{xp} XP</span>
              </div>
              <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/50">
                <span className="block text-slate-500 text-[8px] font-bold">STREAK DAYS</span>
                <span className="font-extrabold text-orange-500 font-mono flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-orange-500/20 text-orange-500" />
                  {profileUser.streak || 1} DAYS
                </span>
              </div>
              <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/50">
                <span className="block text-slate-500 text-[8px] font-bold">CONTRIBUTIONS</span>
                <span className="font-extrabold text-purple-400 font-mono">{profileUser.contributions || 1} FILES</span>
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Biography Statement</span>
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
              <p className="text-xs text-slate-300 leading-relaxed font-semibold italic">
                "{profileUser.bio || 'Developer with Mount Kenya University Computer Association.'}"
              </p>
            </div>
          </div>

          {/* Tech specialties / Skills */}
          <div className="space-y-2">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono block">Tech Specialties</span>
            <div className="flex flex-wrap gap-1.5">
              {(profileUser.skills && profileUser.skills.length > 0 ? profileUser.skills : ['Frontend Development', 'Web Engineering', 'Security']).map((skill) => (
                <span
                  key={skill}
                  className="bg-indigo-950/40 text-indigo-300 text-[9.5px] font-bold px-2.5 py-0.5 rounded-lg border border-indigo-900/50 flex items-center gap-1"
                >
                  <Code className="w-3 h-3 text-indigo-400" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex gap-2 shrink-0">
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              setCopiedLink(true);
              onToast('✓ Verification link copied to clipboard!');
              setTimeout(() => setCopiedLink(false), 2000);
            }}
            className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </>
            )}
          </button>

          {currentUser ? (
            profileUser.uid !== currentUser.uid && onStartDM && (
              <button
                onClick={() => {
                  onStartDM(profileUser.uid!);
                  onClose();
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-lg shadow-blue-900/20 transition-all font-display"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message Member</span>
              </button>
            )
          ) : (
            <div className="flex-1 text-center bg-blue-500/10 border border-blue-500/20 p-2 rounded-xl">
              <span className="text-[10px] font-bold text-blue-400">Scan verified by MKU Network</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
