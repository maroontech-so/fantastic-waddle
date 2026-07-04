import React, { useState, useEffect } from 'react';
import { Pencil, User as UserIcon, Bell, Lock, Github, QrCode, ChevronRight, LogOut, Camera, X, Loader2, Moon, Sun, Download, Share2, Check, ShieldCheck, Award, Sparkles } from 'lucide-react';
import { User } from '../types';
import { uploadToImgBB } from '../utils/imgUpload';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';
import QRCode from 'qrcode';

interface ProfileViewProps {
  user: User;
  onUpdateUser: (updated: User) => void;
  onSignOut: () => void;
  onToast: (msg: string) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  onSignOut,
  onToast,
  isDark: propIsDark,
  onToggleTheme,
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifChats, setNotifChats] = useState(() => {
    return localStorage.getItem('advocode_notif_chats') !== 'false';
  });
  const [notifPosts, setNotifPosts] = useState(() => {
    return localStorage.getItem('advocode_notif_posts') !== 'false';
  });
  const [notifEngagements, setNotifEngagements] = useState(() => {
    return localStorage.getItem('advocode_notif_engagements') !== 'false';
  });

  const saveNotificationSettings = (chats: boolean, posts: boolean, engagements: boolean) => {
    setNotifChats(chats);
    setNotifPosts(posts);
    setNotifEngagements(engagements);
    localStorage.setItem('advocode_notif_chats', String(chats));
    localStorage.setItem('advocode_notif_posts', String(posts));
    localStorage.setItem('advocode_notif_engagements', String(engagements));
    onToast('✓ Notification preferences saved!');
    setIsNotifModalOpen(false);
  };

  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
      onToast('🎵 Chime signal broadcasted! Notification channel verified.');
    } catch (e) {
      console.error(e);
      onToast('⚠️ Audio context is restricted. Click again or check permissions.');
    }
  };

  const [modalChats, setModalChats] = useState(true);
  const [modalPosts, setModalPosts] = useState(true);
  const [modalEngagements, setModalEngagements] = useState(true);

  useEffect(() => {
    if (isNotifModalOpen) {
      setModalChats(localStorage.getItem('advocode_notif_chats') !== 'false');
      setModalPosts(localStorage.getItem('advocode_notif_posts') !== 'false');
      setModalEngagements(localStorage.getItem('advocode_notif_engagements') !== 'false');
    }
  }, [isNotifModalOpen]);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('advocode_dark_mode') === 'true');
  const currentIsDark = propIsDark !== undefined ? propIsDark : isDark;

  // Edit fields
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [username, setUsername] = useState(user.username || user.regNumber || '@' + (user.email?.split('@')[0] || 'dev_' + Math.floor(Math.random() * 1000)));
  const [skillsString, setSkillsString] = useState(user.skills.join(', '));
  const [customAvatarUrl, setCustomAvatarUrl] = useState(user.avatarUrl || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [customCoverUrl, setCustomCoverUrl] = useState(user.coverUrl || '');
  const [downloading, setDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [localQrUrl, setLocalQrUrl] = useState<string>('');

  useEffect(() => {
    const generateQr = async () => {
      try {
        const shareUrl = `${window.location.origin}?profile=${user.uid}`;
        const dataUrl = await QRCode.toDataURL(shareUrl, {
          margin: 1,
          width: 256,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        });
        setLocalQrUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate local QR Code:', err);
      }
    };
    generateQr();
  }, [user.uid]);

  const downloadBadge = async () => {
    try {
      setDownloading(true);
      onToast('⏳ Compiling your custom Member Verification Badge...');

      // Helper function to draw the badge
      const drawAndGenerate = async (includeAvatar: boolean): Promise<string> => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas 2D context');

        // 1. Draw elegant background gradient (Dark futuristic theme)
        const grad = ctx.createLinearGradient(0, 0, 0, 600);
        grad.addColorStop(0, '#0f172a'); // slate-900
        grad.addColorStop(1, '#020617'); // slate-950
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 400, 600);

        // 2. Draw outer glowing border highlights
        ctx.strokeStyle = '#2563eb'; // blue-600
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, 380, 580);

        // 3. Draw tech grid
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
        ctx.lineWidth = 1;
        for (let i = 20; i < 400; i += 20) {
          ctx.beginPath();
          ctx.moveTo(i, 20);
          ctx.lineTo(i, 580);
          ctx.stroke();
        }
        for (let j = 20; j < 600; j += 20) {
          ctx.beginPath();
          ctx.moveTo(20, j);
          ctx.lineTo(380, j);
          ctx.stroke();
        }

        // Corner brackets
        ctx.strokeStyle = '#38bdf8'; // sky-400
        ctx.lineWidth = 3;
        // Top Left
        ctx.beginPath(); ctx.moveTo(15, 35); ctx.lineTo(15, 15); ctx.lineTo(35, 15); ctx.stroke();
        // Top Right
        ctx.beginPath(); ctx.moveTo(385, 35); ctx.lineTo(385, 15); ctx.lineTo(365, 15); ctx.stroke();
        // Bottom Left
        ctx.beginPath(); ctx.moveTo(15, 565); ctx.lineTo(15, 585); ctx.lineTo(35, 585); ctx.stroke();
        // Bottom Right
        ctx.beginPath(); ctx.moveTo(385, 565); ctx.lineTo(385, 585); ctx.lineTo(365, 585); ctx.stroke();

        // 4. Header text
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('</ADVOCODE> STUDENT DEVELOPER NETWORK', 200, 42);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 16px sans-serif';
        ctx.fillText('MEMBER VERIFICATION BADGE', 200, 64);

        // Divider line
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(40, 78); ctx.lineTo(360, 78); ctx.stroke();

        // 5. Draw Profile Photo Circle
        const avatarX = 200;
        const avatarY = 145;
        const avatarR = 48;

        const loadImg = (src: string, isCross: boolean): Promise<HTMLImageElement> => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            if (isCross) img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject();
            img.src = src;
          });
        };

        let avatarLoaded = false;
        if (includeAvatar && user.avatarUrl) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
          ctx.clip();
          try {
            // Try loading with crossOrigin first
            const avImg = await loadImg(user.avatarUrl, true);
            ctx.drawImage(avImg, avatarX - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
            avatarLoaded = true;
          } catch {
            try {
              // Try loading without crossOrigin
              const avImg = await loadImg(user.avatarUrl, false);
              ctx.drawImage(avImg, avatarX - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
              avatarLoaded = true;
            } catch {
              avatarLoaded = false;
            }
          }
          ctx.restore();
        }

        if (!avatarLoaded) {
          const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
          const placeholderGrad = ctx.createRadialGradient(avatarX, avatarY, 10, avatarX, avatarY, avatarR);
          placeholderGrad.addColorStop(0, '#2563eb');
          placeholderGrad.addColorStop(1, '#1e3a8a');
          ctx.fillStyle = placeholderGrad;
          ctx.beginPath();
          ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 28px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(initials, avatarX, avatarY);
        }

        // Border for photo
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarR + 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.textBaseline = 'alphabetic';

        // 6. Name and username details
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(user.name, 200, 222);

        ctx.fillStyle = '#60a5fa';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(user.username || user.regNumber || '@developer', 200, 242);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 11px sans-serif';
        ctx.fillText(user.bio || 'Developer • </AdvocoDe> Network', 200, 260);

        // Level / XP
        const xpText = `LEVEL ${user.level || 1} • ${user.xp || 50} XP`;
        ctx.font = '900 10px monospace';
        const textWidth = ctx.measureText(xpText).width;
        const padX = 14;
        ctx.fillStyle = 'rgba(37, 99, 235, 0.15)';
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(200 - (textWidth / 2) - padX, 275, textWidth + (padX * 2), 22, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.fillText(xpText, 200, 289);

        // 7. QR Code image
        let qrSourceUrl = localQrUrl;
        if (!qrSourceUrl) {
          const shareUrl = `${window.location.origin}?profile=${user.uid}`;
          qrSourceUrl = await QRCode.toDataURL(shareUrl, { margin: 1, width: 256 });
        }

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(120, 318, 160, 160, 12);
        ctx.fill();

        try {
          // Since qrSourceUrl is locally generated base64 dataUrl, loading it will NEVER taint the canvas.
          const qrImg = await loadImg(qrSourceUrl, false);
          ctx.drawImage(qrImg, 128, 326, 144, 144);
        } catch (err) {
          console.error(err);
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('QR CODE ERROR', 200, 395);
        }

        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(118, 316, 164, 164, 14);
        ctx.stroke();

        // 8. Security verification labels
        ctx.fillStyle = '#10b981';
        ctx.font = '900 9px monospace';
        ctx.fillText('● OFFICIAL MKU VERIFIED ID', 200, 508);

        ctx.fillStyle = '#64748b';
        ctx.font = '500 10px sans-serif';
        ctx.fillText('Scan this badge to view developer profile & verified stats', 200, 532);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.font = '900 9px monospace';
        ctx.fillText('STATUS: SYSTEM MEMBER IN GOOD STANDING', 200, 562);

        return canvas.toDataURL('image/png');
      };

      let finalDataUrl = '';
      try {
        // Try drawing with avatar
        finalDataUrl = await drawAndGenerate(true);
      } catch (securityError) {
        console.warn('Canvas was tainted by the external avatar image. Retrying with initials-based fallback...');
        // Retry drawing without avatar, which is guaranteed to succeed and prevent SecurityError/tainting
        finalDataUrl = await drawAndGenerate(false);
      }

      const link = document.createElement('a');
      link.download = `AdvocoDe_Badge_${user.name.replace(/\s+/g, '_')}.png`;
      link.href = finalDataUrl;
      link.click();

      onToast('✨ Badge downloaded successfully! Share with your peers.');
    } catch (err) {
      console.error(err);
      onToast('⚠️ Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const toggleDarkMode = () => {
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      const next = !isDark;
      setIsDark(next);
      localStorage.setItem('advocode_dark_mode', String(next));
      if (next) {
        document.documentElement.classList.add('dark');
        onToast('🌙 Dark theme enabled');
      } else {
        document.documentElement.classList.remove('dark');
        onToast('☀️ Light theme enabled');
      }
    }
  };

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCover(true);
      onToast('⏳ Uploading cover photo...');
      const url = await uploadToImgBB(file);
      setCustomCoverUrl(url);
      const updatedUser: User = {
        ...user,
        coverUrl: url,
      };
      onUpdateUser(updatedUser);
      onToast('✓ Cover photo updated successfully!');
    } catch (err: any) {
      console.error(err);
      onToast(`Cover upload failed: ${err.message}`);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      onToast('⏳ Uploading profile photo...');
      const url = await uploadToImgBB(file);
      setCustomAvatarUrl(url);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: url }).catch(() => {});
      }
      const updatedUser: User = {
        ...user,
        avatarUrl: url,
      };
      onUpdateUser(updatedUser);
      onToast('✓ Profile photo uploaded successfully!');
    } catch (err: any) {
      console.error(err);
      onToast(`Photo upload failed: ${err.message}`);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onToast('Name cannot be empty.');
      return;
    }

    const parsedSkills = skillsString
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updatedUser: User = {
      ...user,
      name: name.trim(),
      bio: bio.trim(),
      username: username.trim().startsWith('@') ? username.trim() : '@' + username.trim(),
      regNumber: username.trim(),
      skills: parsedSkills.length > 0 ? parsedSkills : ['General'],
      avatarUrl: customAvatarUrl || user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=2563EB&color=fff`,
      coverUrl: customCoverUrl || user.coverUrl || '',
    };

    onUpdateUser(updatedUser);
    setIsEditOpen(false);
    onToast('Profile updated successfully!');
  };

  return (
    <div className="space-y-8 px-6 md:px-8 pt-6 pb-24 max-w-3xl mx-auto animate-fade-in">
      <input
        type="file"
        id="profile-avatar-upload"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFileChange}
      />
      <input
        type="file"
        id="profile-cover-upload"
        accept="image/*"
        className="hidden"
        onChange={handleCoverFileChange}
      />
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10 mb-8 relative overflow-hidden">
        {/* LinkedIn style Cover Photo Banner */}
        <div 
          className="absolute top-0 left-0 w-full h-44 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 overflow-hidden group cursor-pointer"
          onClick={() => document.getElementById('profile-cover-upload')?.click()}
          title="Click to change cover photo"
        >
          {(customCoverUrl || user.coverUrl) ? (
            <img src={customCoverUrl || user.coverUrl} alt="Cover" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
          ) : (
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/30 via-slate-900 to-black flex items-end justify-end p-3">
            </div>
          )}
          <div className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-all border border-white/10 shadow-sm">
            {uploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            <span>{uploadingCover ? 'Uploading...' : 'Edit Cover Photo'}</span>
          </div>
        </div>
        
        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 mt-20 md:mt-24">
          <div className="relative group cursor-pointer" onClick={() => document.getElementById('profile-avatar-upload')?.click()}>
            <img
              src={
                customAvatarUrl || user.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563EB&color=fff&size=150`
              }
              alt="Profile"
              className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-md transition-transform duration-300 group-hover:scale-102 object-cover"
            />
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsEditOpen(true); }}
              className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 p-2.5 rounded-full text-white shadow-lg transition-all border-2 border-white cursor-pointer active:scale-90"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center md:text-left flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
              {user.name}
            </h2>
            <p className="text-sm text-slate-500 font-semibold mt-1">
              {user.bio}
            </p>
            <p className="text-xs text-blue-600 mt-1 font-mono font-bold">
              {user.username || user.regNumber || '@developer'}
            </p>
            
            {/* Skills Badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
              {user.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full shadow-inner"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Settings Section */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">
            Account Settings
          </h3>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
            <div
              onClick={() => {
                setIsEditOpen(true);
                // Sync states
                setName(user.name);
                setBio(user.bio);
                setUsername(user.username || user.regNumber || '@developer');
                setSkillsString(user.skills.join(', '));
              }}
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="bg-slate-100 p-2.5 rounded-xl text-slate-700">
                <UserIcon className="w-5 h-5" />
              </div>
              <span className="flex-1 text-sm font-bold text-slate-900">Edit Profile</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>

            <div
              onClick={toggleDarkMode}
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="bg-slate-100 p-2.5 rounded-xl text-slate-700">
                {currentIsDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
              </div>
              <span className="flex-1 text-sm font-bold text-slate-900">Dark Theme Toggle</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                {currentIsDark ? 'Dark' : 'Light'}
              </span>
            </div>

            <div
              onClick={() => setIsNotifModalOpen(true)}
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="bg-slate-100 p-2.5 rounded-xl text-slate-700">
                <Bell className="w-5 h-5" />
              </div>
              <span className="flex-1 text-sm font-bold text-slate-900">Notifications</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 uppercase">
                Configure
              </span>
            </div>

            <div
              onClick={() => onToast('Security preferences configured')}
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="bg-slate-100 p-2.5 rounded-xl text-slate-700">
                <Lock className="w-5 h-5" />
              </div>
              <span className="flex-1 text-sm font-bold text-slate-900">Privacy & Security</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        </div>

        {/* Club Integrations & Pass */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">
            Club Integrations
          </h3>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6 divide-y divide-slate-100">
            <div
              onClick={() => onToast('Your GitHub profile is synchronized with AdvocoDe organization!')}
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="bg-slate-100 p-2.5 rounded-xl text-slate-700">
                <Github className="w-5 h-5" />
              </div>
              <span className="flex-1 text-sm font-bold text-slate-900">Link GitHub</span>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200 uppercase tracking-wider">
                Connected
              </span>
            </div>

            <div
              onClick={() => setIsQrOpen(true)}
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="bg-blue-50 border border-blue-150 p-2.5 rounded-xl text-blue-600 shadow-xs">
                <QrCode className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-slate-900 truncate">Member Verification Badge</span>
                <span className="block text-[10px] text-slate-400 font-semibold mt-0.5 truncate">Share or download your verified developer credential</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>

          <button
            onClick={onSignOut}
            className="w-full bg-white text-red-600 font-bold py-4 rounded-2xl shadow-sm border border-red-100 hover:bg-red-50 hover:border-red-200 transition-all flex justify-center items-center gap-2 cursor-pointer active:scale-98 text-sm"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Member Verification Badge Modal */}
      {isQrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-opacity">
          <div className="bg-slate-900 text-slate-100 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-800 animate-scale-in flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-5 py-4.5 border-b border-slate-800 flex justify-between items-center bg-slate-950/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-widest">Verification Badge</h3>
              </div>
              <button
                onClick={() => setIsQrOpen(false)}
                className="text-slate-400 hover:text-slate-100 p-1.5 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Badge Card Live Preview Container */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center space-y-6 scrollbar-thin">
              {/* Card visual frame */}
              <div className="relative w-full aspect-[2/3] max-w-[280px] bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 rounded-2xl p-5 border-2 border-blue-500/80 shadow-[0_0_25px_-5px_rgba(59,130,246,0.5)] overflow-hidden flex flex-col items-center justify-between text-center group">
                
                {/* Tech background designs */}
                <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-full border border-blue-500/20 rounded-2xl pointer-events-none m-1"></div>

                {/* Bracket graphics */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-blue-400 pointer-events-none"></div>
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-blue-400 pointer-events-none"></div>
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-blue-400 pointer-events-none"></div>
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-blue-400 pointer-events-none"></div>

                {/* Top Title */}
                <div className="z-10 mt-1">
                  <span className="block text-[8px] font-extrabold text-blue-400 tracking-widest uppercase font-mono">&lt;/AdvocoDe&gt; System</span>
                  <span className="block text-[10px] font-black text-slate-100 tracking-wider uppercase mt-0.5">Verified Badge</span>
                </div>

                {/* Avatar and Info */}
                <div className="z-10 flex flex-col items-center mt-3">
                  <div className="relative mb-2.5">
                    <img
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563EB&color=fff`}
                      alt={user.name}
                      className="w-16 h-16 rounded-full border-2 border-blue-500/60 shadow-md object-cover bg-slate-950"
                    />
                    <span className="absolute bottom-0 right-0 bg-emerald-500 p-1 rounded-full border border-slate-950 shadow-sm" title="Verified Member">
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-white tracking-tight">{user.name}</h4>
                  <p className="text-[9px] text-blue-400 font-mono font-bold mt-0.5">{user.username || user.regNumber}</p>
                  
                  {/* Stats Badges */}
                  <div className="mt-2 flex items-center gap-1.5 bg-blue-600/10 border border-blue-500/30 px-2 py-0.5 rounded-md">
                    <Award className="w-3 h-3 text-sky-400" />
                    <span className="text-[8px] font-bold text-sky-300 font-mono">LEVEL {user.level || 1} • {user.xp || 50} XP</span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="z-10 bg-white p-2.5 rounded-xl border border-blue-500/40 my-3 shrink-0 shadow-lg relative group/qr">
                  <img
                    src={localQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${window.location.origin}?profile=${user.uid}`)}`}
                    alt="Verified QR Code"
                    className="w-24 h-24 select-none"
                  />
                  <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-[0.5px] rounded-xl opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                  </div>
                </div>

                {/* Bottom Watermark */}
                <div className="z-10 mb-1">
                  <span className="text-[7.5px] font-black text-emerald-500 tracking-wider font-mono block uppercase">● SECURE STUDENT RECORD</span>
                  <span className="text-[6.5px] font-bold text-slate-500 tracking-widest block font-mono mt-0.5">SCAN TO AUDIT REAL-TIME STATS</span>
                </div>
              </div>

              {/* Utility actions inside preview */}
              <div className="w-full space-y-3">
                <button
                  onClick={downloadBadge}
                  disabled={downloading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-900/30 active:scale-98 transition-all cursor-pointer disabled:opacity-80 animate-pulse-slow"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Generating Badge File...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Badge (PNG)</span>
                    </>
                  )}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}?profile=${user.uid}`;
                      navigator.clipboard.writeText(shareUrl);
                      setCopiedLink(true);
                      onToast('✓ Verification link copied to clipboard!');
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}?profile=${user.uid}`;
                      if (navigator.share) {
                        navigator.share({
                          title: `</AdvocoDe> Verified Developer Badge - ${user.name}`,
                          text: `Check out my verified developer credentials and XP points on the MKU AdvocoDe Network!`,
                          url: shareUrl,
                        }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(shareUrl);
                        onToast('✓ Copied to clipboard! Share it with friends.');
                      }
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Share Live</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer stamp */}
            <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 text-center shrink-0">
              <p className="text-[9.5px] text-slate-500 font-semibold uppercase tracking-wider">Mount Kenya University Computer Association</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl shadow-xl overflow-hidden h-[85vh] md:h-auto flex flex-col animate-slide-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-lg text-slate-900">Edit Profile</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-2 text-slate-400 hover:bg-white hover:text-slate-900 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
              <div className="flex flex-col items-center mb-4">
                <div className="relative group cursor-pointer" onClick={() => document.getElementById('profile-avatar-upload')?.click()}>
                  <img
                    src={
                      customAvatarUrl || user.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563EB&color=fff&size=100`
                    }
                    alt="Current Avatar"
                    className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-sm transition-opacity group-hover:opacity-90 object-cover"
                  />
                  {uploadingAvatar ? (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-full">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-blue-600 font-bold mt-2 uppercase tracking-wider cursor-pointer hover:underline" onClick={() => document.getElementById('profile-avatar-upload')?.click()}>Click photo to upload custom image</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Bio / Headline
                  </label>
                  <input
                    type="text"
                    required
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Unique Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@username"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={skillsString}
                    onChange={(e) => setSkillsString(e.target.value)}
                    placeholder="Frontend, UX/UI, Python, etc."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notifications Settings Modal */}
      {isNotifModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl shadow-xl overflow-hidden flex flex-col animate-slide-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg text-slate-900">Notification Settings</h3>
              </div>
              <button
                onClick={() => setIsNotifModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-white hover:text-slate-900 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 bg-white">
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Choose which events trigger real-time audio chimes and visual toast banners across the AdvocoDe Developer Hub.
              </p>

              <div className="space-y-4">
                {/* Chats & Direct Messages Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-xs">
                  <div className="flex-1 pr-4">
                    <h4 className="text-xs font-bold text-slate-800">Direct Chats & Channels</h4>
                    <p className="text-[10.5px] text-slate-400 font-medium mt-0.5">Receive instant visual toasts & audio chimes for new incoming messages.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalChats(!modalChats)}
                    className={`w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex items-center p-0.5 ${modalChats ? 'bg-[#008069]' : 'bg-slate-300'}`}
                  >
                    <div className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-200 ${modalChats ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Posts & Updates Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-xs">
                  <div className="flex-1 pr-4">
                    <h4 className="text-xs font-bold text-slate-800">Timeline Posts & Announcements</h4>
                    <p className="text-[10.5px] text-slate-400 font-medium mt-0.5">Get notified immediately when new code snippets or announcements are published.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalPosts(!modalPosts)}
                    className={`w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex items-center p-0.5 ${modalPosts ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <div className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-200 ${modalPosts ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Engagements Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-xs">
                  <div className="flex-1 pr-4">
                    <h4 className="text-xs font-bold text-slate-800">Social Engagements</h4>
                    <p className="text-[10.5px] text-slate-400 font-medium mt-0.5">Get alerted when club members upvote your posts or reply to your topics.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalEngagements(!modalEngagements)}
                    className={`w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex items-center p-0.5 ${modalEngagements ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-200 ${modalEngagements ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Working test channel control */}
              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100/50 flex flex-col items-center text-center">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1.5">Live Notification Channel</span>
                <p className="text-[10px] text-slate-500 font-medium max-w-xs mb-3">Test the full-duplex communication channel using a real synthesized hardware bell trigger signal.</p>
                <button
                  type="button"
                  onClick={playChime}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                  🔔 Ping Notification Chime
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNotifModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => saveNotificationSettings(modalChats, modalPosts, modalEngagements)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-95"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
