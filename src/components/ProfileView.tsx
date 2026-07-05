import React, { useState, useEffect } from 'react';
import { Pencil, User as UserIcon, Bell, Lock, Github, QrCode, ChevronRight, LogOut, Camera, X, Loader2, Moon, Sun, Download, Share2, Check, ShieldCheck, Award, Sparkles, ArrowLeft, MessageSquare, Terminal } from 'lucide-react';
import { User } from '../types';
import { ACHIEVEMENTS, getLevelProgress, getLevel } from '../data/achievements';
import { DEFAULT_POSTS, EngagementPost } from './ChatView';

import { uploadToImgBB } from '../utils/imgUpload';
import { requestNotificationPermission, sendPushNotification } from '../utils/notifications';
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
  isReadOnly?: boolean;
  onBack?: () => void;
  onStartDM?: (uid: string, name: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  onSignOut,
  onToast,
  isDark: propIsDark,
  onToggleTheme,
  isReadOnly = false,
  onBack,
  onStartDM,
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

  const [achQuery, setAchQuery] = useState('');
  const [achCategory, setAchCategory] = useState('All');


  const saveNotificationSettings = async (chats: boolean, posts: boolean, engagements: boolean) => {
    setNotifChats(chats);
    setNotifPosts(posts);
    setNotifEngagements(engagements);
    localStorage.setItem('advocode_notif_chats', String(chats));
    localStorage.setItem('advocode_notif_posts', String(posts));
    localStorage.setItem('advocode_notif_engagements', String(engagements));
    
    if (chats || posts || engagements) {
      const granted = await requestNotificationPermission();
      if (granted) {
        sendPushNotification('🎉 Push Notifications Enabled!', { body: 'You will now receive alerts for new chats and community updates.', icon: '/logo.svg' });
      }
    }
    
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
  const [vcardQrUrl, setVcardQrUrl] = useState<string>('');
  const [qrType, setQrType] = useState<'link' | 'vcard'>('link');

  useEffect(() => {
    const generateQrs = async () => {
      try {
        const shareUrl = `${window.location.origin}?profile=${user.uid}`;
        const linkCode = await QRCode.toDataURL(shareUrl, {
          margin: 1,
          width: 256,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        });
        setLocalQrUrl(linkCode);

        const vcardData = `BEGIN:VCARD\nVERSION:3.0\nFN:${user.name}\nORG:AdvocoDe Workspace Hub\nTITLE:${user.role || 'Member'} (Level ${user.level || 1})\nEMAIL;TYPE=PREF,INTERNET:${user.email || ''}\nNOTE:AdvocoDe Profile. Level: ${user.level || 1}. XP: ${user.xp || 50}. Streak: ${user.streak || 0} days. Skills: ${user.skills ? user.skills.join(', ') : ''}\nURL:${window.location.origin}?profile=${user.uid}\nEND:VCARD`;
        const vcardCode = await QRCode.toDataURL(vcardData, {
          margin: 1,
          width: 256,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        });
        setVcardQrUrl(vcardCode);
      } catch (err) {
        console.error('Failed to generate local QR Codes:', err);
      }
    };
    generateQrs();
  }, [user.uid, user.name, user.role, user.level, user.xp, user.streak, user.skills, user.email]);

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
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 animate-fade-in text-slate-800 dark:text-slate-100">
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

      {/* Floating Back Button if onBack is provided */}
      {onBack && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Hub</span>
          </button>
        </div>
      )}
      
      {/* Profile Header Full-Width Card */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 relative overflow-hidden w-full mt-2">
        {/* LinkedIn style Cover Photo Banner */}
        <div 
          className={`w-full h-48 md:h-60 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 overflow-hidden relative ${isReadOnly ? '' : 'group cursor-pointer'}`}
          onClick={isReadOnly ? undefined : () => document.getElementById('profile-cover-upload')?.click()}
          title={isReadOnly ? undefined : "Click to change cover photo"}
        >
          {(customCoverUrl || user.coverUrl) ? (
            <img src={customCoverUrl || user.coverUrl} alt="Cover" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
          ) : (
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/30 via-slate-900 to-black flex items-end justify-end p-3">
            </div>
          )}
          {!isReadOnly && (
            <div className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-all border border-white/10 shadow-sm animate-fade-in">
              {uploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              <span>{uploadingCover ? 'Uploading...' : 'Edit Cover'}</span>
            </div>
          )}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 relative">
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
            <div 
              className={`relative shrink-0 -mt-16 md:-mt-20 z-10 ${isReadOnly ? '' : 'group cursor-pointer'}`}
              onClick={isReadOnly ? undefined : () => document.getElementById('profile-avatar-upload')?.click()}
            >
              <img
                src={
                  customAvatarUrl || user.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563EB&color=fff&size=150`
                }
                alt="Profile"
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-slate-900 shadow-md transition-transform duration-300 group-hover:scale-102 object-cover bg-white animate-fade-in"
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsEditOpen(true); }}
                  className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 p-2.5 rounded-full text-white shadow-lg transition-all border-2 border-white dark:border-slate-900 cursor-pointer active:scale-90"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-center md:text-left flex-1 min-w-0 pt-3 md:pt-5 md:mb-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 justify-center md:justify-start">
                <h2 className="text-2xl md:text-3.5xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                  {user.name}
                </h2>
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs tracking-wider uppercase">
                    Level {user.level || 1}
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9.5px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} /> Verified Member
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1 max-w-2xl">
                {user.bio}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5 mt-2 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                <span className="text-blue-600 dark:text-blue-400">
                  {user.username || user.regNumber || '@developer'}
                </span>
                <span>•</span>
                <span>Streak: {user.streak || 1} Days 🔥</span>
                <span>•</span>
                <span>Total: {user.xp || 50} XP ⭐</span>
              </div>
              
              {/* Skills Badges */}
              <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mt-4">
                {user.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/50 text-[9.5px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-md shadow-inner"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Action Buttons (IG Style Profile Actions) */}
              {isReadOnly ? (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 animate-fade-in">
                  {onStartDM && (
                    <button
                      type="button"
                      onClick={() => onStartDM(user.uid || '', user.name)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 text-xs cursor-pointer active:scale-95"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Message Member</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${window.location.origin}?profile=${user.uid || user.regNumber || user.name}`;
                      navigator.clipboard.writeText(url);
                      onToast(`✓ Copied link to ${user.name}'s profile!`);
                    }}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 text-xs cursor-pointer active:scale-95"
                  >
                    <Share2 className="w-4 h-4 text-blue-500" />
                    <span>Share Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsQrOpen(true)}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 text-xs cursor-pointer active:scale-95"
                  >
                    <QrCode className="w-4 h-4 text-indigo-500" />
                    <span>View Passport</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToast(`🌟 You endorsed ${user.name} for engineering excellence!`)}
                    className="bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-bold px-4 py-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/50 transition-all flex items-center gap-1.5 text-xs cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Endorse</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 animate-fade-in">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(true)}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 text-xs cursor-pointer active:scale-95"
                  >
                    <Pencil className="w-3.5 h-3.5 text-blue-500" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${window.location.origin}?profile=${user.uid || user.regNumber || user.name}`;
                      navigator.clipboard.writeText(url);
                      onToast(`✓ Profile URL copied to clipboard!`);
                    }}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 text-xs cursor-pointer active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Share Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsQrOpen(true)}
                    className="bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold px-4 py-2 rounded-xl border border-blue-200/60 dark:border-blue-800/50 transition-all flex items-center gap-1.5 text-xs cursor-pointer active:scale-95"
                  >
                    <QrCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Verification Passport</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Columns Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT/CENTER COLUMN: Settings and Links OR Visitor Timeline Showcase (Span 2) */}
          <div className="lg:col-span-2 space-y-8">
            
            {isReadOnly ? (
              <div className="space-y-6 animate-fade-in">
                {/* Visitor Mode Banner */}
                <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
                  <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Visitor Profile View</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed font-medium">
                      You are viewing <strong className="text-blue-600 dark:text-blue-400">{user.name}</strong>&apos;s public student developer profile. Profile modification, private account settings, and creating posts on behalf of another member are disabled.
                    </p>
                  </div>
                </div>

                {/* Academic & Developer Highlights */}
                <div>
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Academic & Developer Highlights
                  </h3>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Registration / Handle</span>
                        <span className="text-xs font-mono font-extrabold text-blue-600 dark:text-blue-400 block truncate">{user.username || user.regNumber || '@advocode_member'}</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Community Standing</span>
                        <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 block flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Verified Developer (Level {user.level || 1})
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Technical Specializations</span>
                      <div className="flex flex-wrap gap-1.5">
                        {user.skills.map((s, idx) => (
                          <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg text-xs font-bold font-mono">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Posts & Showcase by this member */}
                <div>
                  <div className="flex items-center justify-between mb-3 ml-2">
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" /> Published Community Posts & Showcase
                    </h3>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full uppercase border border-blue-200/50 dark:border-blue-800/50">
                      View Only Feed
                    </span>
                  </div>
                  
                  {(() => {
                    let memberPosts: EngagementPost[] = [];
                    try {
                      const saved = localStorage.getItem('advocode_posts_v2') || localStorage.getItem('advocode_posts');
                      const allPosts: EngagementPost[] = saved ? JSON.parse(saved) : DEFAULT_POSTS;
                      memberPosts = allPosts.filter(p => 
                        p.author?.name?.toLowerCase() === user.name?.toLowerCase() ||
                        p.author?.regNumber?.toLowerCase() === (user.regNumber || '').toLowerCase()
                      );
                    } catch (err) {
                      memberPosts = DEFAULT_POSTS.slice(0, 1);
                    }

                    if (memberPosts.length === 0) {
                      return (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                            <Terminal className="w-6 h-6" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Published Community Posts</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                            {user.name} has not published any code snippets, questions, or discussions to the AdvocoDe community timeline yet.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {memberPosts.map((post) => (
                          <div key={post.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50">
                                {post.type.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{post.time}</span>
                            </div>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">{post.title || 'Community Update'}</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                            {post.code && (
                              <pre className="bg-slate-950 text-slate-200 p-3.5 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800">
                                <code>{post.code}</code>
                              </pre>
                            )}
                            <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                              <span>👍 {post.upvotes || 0} Upvotes</span>
                              <span>💬 {post.comments?.length || 0} Comments</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              /* Settings Grid for Profile Owner */
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Settings Section */}
                  <div>
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5" /> Account Settings
                    </h3>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                      <div
                        onClick={() => {
                          setIsEditOpen(true);
                          setName(user.name);
                          setBio(user.bio);
                          setUsername(user.username || user.regNumber || '@developer');
                          setSkillsString(user.skills.join(', '));
                        }}
                        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl text-slate-700 dark:text-slate-300">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        <span className="flex-1 text-sm font-bold text-slate-900 dark:text-slate-200">Edit Profile Details</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                      </div>

                      <div
                        onClick={toggleDarkMode}
                        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl text-slate-700 dark:text-slate-300">
                          {currentIsDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
                        </div>
                        <span className="flex-1 text-sm font-bold text-slate-900 dark:text-slate-200">Dark Theme Toggle</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                          {currentIsDark ? 'Dark' : 'Light'}
                        </span>
                      </div>

                      <div
                        onClick={() => setIsNotifModalOpen(true)}
                        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl text-slate-700 dark:text-slate-300">
                          <Bell className="w-5 h-5" />
                        </div>
                        <span className="flex-1 text-sm font-bold text-slate-900 dark:text-slate-200">Notifications Setup</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 uppercase border border-blue-100/50 dark:border-blue-900/30">
                          Configure
                        </span>
                      </div>

                      <div
                        onClick={() => {
                          if ((window as any).triggerPwaInstallModal) {
                            (window as any).triggerPwaInstallModal();
                          } else {
                            onToast('PWA install instructions loading...');
                          }
                        }}
                        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-t border-slate-100 dark:border-slate-800/60"
                      >
                        <div className="bg-amber-100 dark:bg-amber-950/40 p-2.5 rounded-xl text-amber-600 dark:text-amber-400">
                          <Download className="w-5 h-5 animate-bounce" />
                        </div>
                        <span className="flex-1 text-sm font-bold text-slate-900 dark:text-slate-200">Install &lt;/AdvocoDe&gt; PWA App</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 uppercase border border-amber-100/50 dark:border-amber-900/30">
                          Download
                        </span>
                      </div>

                      <div
                        onClick={() => onToast('Security preferences configured')}
                        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl text-slate-700 dark:text-slate-300">
                          <Lock className="w-5 h-5" />
                        </div>
                        <span className="flex-1 text-sm font-bold text-slate-900 dark:text-slate-200">Privacy & Security</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                      </div>
                    </div>
                  </div>

                  {/* Club Integrations & Pass */}
                  <div>
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2 flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5" /> Club Connections
                    </h3>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                      <div
                        onClick={() => onToast('GitHub organization connections are active for AdvocoDe!')}
                        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl text-slate-700 dark:text-slate-300">
                          <Github className="w-5 h-5" />
                        </div>
                        <span className="flex-1 text-sm font-bold text-slate-900 dark:text-slate-200">Link GitHub organization</span>
                        <span className="text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-200/60 dark:border-emerald-850/40 uppercase tracking-wider">
                          Connected
                        </span>
                      </div>

                      <div
                        onClick={() => setIsQrOpen(true)}
                        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-150 dark:border-blue-900/30 p-2.5 rounded-xl text-blue-600 dark:text-blue-400 shadow-xs">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-sm font-bold text-slate-900 dark:text-slate-200 truncate">Verification Passport</span>
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 truncate">Share or download your verified member credential</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logout Row */}
                <div className="pt-2 animate-fade-in">
                  <button
                    onClick={onSignOut}
                    className="w-full md:w-auto md:px-12 bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 font-bold py-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-900/40 transition-all flex justify-center items-center gap-2 cursor-pointer active:scale-98 text-sm"
                  >
                    <LogOut className="w-5 h-5" /> Sign Out from Account
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Achievements & XP Progress Hub (Span 1) */}
          <div className="space-y-8">
            {/* XP PROGRESS CARD */}
            {(() => {
              const prog = getLevelProgress(user.xp || 50);
              return (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" /> XP Progression
                    </h3>
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-md">
                      RANK: {
                        prog.level >= 10 ? 'Elite Grandmaster' :
                        prog.level >= 5 ? 'Master Architect' :
                        prog.level >= 3 ? 'Systems Analyst' : 'Code Cadet'
                      }
                    </span>
                  </div>
                  
                  {/* Massive Level Badge */}
                  <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4.5 border border-slate-150 dark:border-slate-855 text-center flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Current Standing</span>
                    <span className="text-4xl font-black text-slate-900 dark:text-white block tracking-tight">
                      LEVEL {prog.level}
                    </span>
                    
                    {/* Level progression bar */}
                    <div className="w-full mt-4">
                      <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 mb-1.5">
                        <span>{user.xp || 50} XP Accumulation</span>
                        <span>{prog.maxXP} XP Goal</span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-[1px]">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-md transition-all duration-500 relative" 
                          style={{ width: `${Math.min(Math.max(prog.progressPercent, 5), 100)}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                      </div>
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-semibold text-left">
                        {prog.xpRemaining} XP remaining to level up (Next Level: {prog.level + 1})!
                      </span>
                    </div>

                    {/* Daily Check-In Interaction */}
                    {!isReadOnly && (
                      <div className="w-full mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/60">
                        {user.lastCheckIn === new Date().toISOString().split('T')[0] ? (
                          <div className="w-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 rounded-xl py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span>Checked In Today! Streak: {user.streak || 1} 🔥</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              const todayStr = new Date().toISOString().split('T')[0];
                              const prevStreak = user.streak || 0;
                              
                              // Check if last check-in was yesterday to maintain streak
                              let newStreak = prevStreak + 1;
                              if (user.lastCheckIn) {
                                const lastCheck = new Date(user.lastCheckIn);
                                const today = new Date(todayStr);
                                const diffTime = Math.abs(today.getTime() - lastCheck.getTime());
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                if (diffDays > 1) {
                                  newStreak = 1;
                                }
                              } else {
                                newStreak = 1;
                              }

                              const updatedXP = (user.xp || 0) + 25;
                              const updatedLevel = getLevel(updatedXP);
                              
                              const updatedUser: User = {
                                ...user,
                                lastCheckIn: todayStr,
                                xp: updatedXP,
                                level: updatedLevel,
                                streak: newStreak
                              };
                              
                              onUpdateUser(updatedUser);
                              onToast(`🎉 Daily Check-In claimed! +25 XP! Streak: ${newStreak} 🔥`);
                              
                              // Play sound effect
                              try {
                                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                                const osc = ctx.createOscillator();
                                const gain = ctx.createGain();
                                osc.connect(gain);
                                gain.connect(ctx.destination);
                                osc.type = 'triangle';
                                osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                                osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
                                osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
                                osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
                                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                                osc.start();
                                osc.stop(ctx.currentTime + 0.5);
                              } catch (e) {}
                            }}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white rounded-xl py-2 px-4 text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
                            <span>Claim Daily Check-In (+25 XP)</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stats Counters */}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="bg-slate-50/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850">
                      <span className="block text-lg font-black text-slate-800 dark:text-slate-200">{(user.contributions || 0)}</span>
                      <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mt-0.5">Posts</span>
                    </div>
                    <div className="bg-slate-50/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850">
                      <span className="block text-lg font-black text-slate-800 dark:text-slate-200">{(user.learningCount || 0)}</span>
                      <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mt-0.5">Studies</span>
                    </div>
                    <div className="bg-slate-50/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-150 dark:border-slate-855">
                      <span className="block text-lg font-black text-slate-800 dark:text-slate-200">{(user.engagementCount || 0)}</span>
                      <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mt-0.5">Chats</span>
                    </div>
                  </div>
                </div>
              );
            })()}
               {/* ACHIEVEMENTS GRID CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col max-h-[550px]">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
              
              <div className="flex items-center justify-between mb-3 shrink-0">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-500" /> Master Achievements
                </h3>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md shrink-0">
                  {user.unlockedAchievements?.length || 0} / {ACHIEVEMENTS.length} Earned
                </span>
              </div>

              {/* Search Bar */}
              <div className="mb-3 shrink-0">
                <input
                  type="text"
                  placeholder="Search 250+ achievements..."
                  value={achQuery}
                  onChange={(e) => setAchQuery(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Category Pills Scrolling Container */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3 shrink-0">
                {['All', 'Onboarding', 'HTML', 'CSS', 'JavaScript', 'Streak', 'Special'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAchCategory(cat)}
                    className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all shrink-0 cursor-pointer ${
                      achCategory === cat
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-150 dark:border-slate-850 hover:bg-slate-200 dark:hover:bg-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Achievements Stack */}
              <div className="space-y-3.5 overflow-y-auto no-scrollbar pr-1 flex-1">
                {(() => {
                  const filtered = ACHIEVEMENTS.filter((ach) => {
                    const matchesQuery = ach.name.toLowerCase().includes(achQuery.toLowerCase()) || 
                                         ach.description.toLowerCase().includes(achQuery.toLowerCase());
                    const matchesCategory = achCategory === 'All' || ach.category === achCategory;
                    return matchesQuery && matchesCategory;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                        No achievements found matching your selection.
                      </div>
                    );
                  }

                  return filtered.map((ach) => {
                    const isUnlocked = user.unlockedAchievements?.includes(ach.id) || false;
                    
                    // Map color dynamically based on category with vibrant brightened colors for unlocked
                    let colorClasses = 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-50';
                    if (isUnlocked) {
                      switch(ach.category) {
                        case 'Onboarding':
                          colorClasses = 'from-blue-500/35 via-indigo-500/35 to-blue-600/35 border-blue-500 border-2 text-blue-950 dark:text-blue-100 shadow-md font-extrabold';
                          break;
                        case 'HTML':
                          colorClasses = 'from-orange-500/35 via-amber-500/35 to-orange-600/35 border-orange-500 border-2 text-orange-950 dark:text-orange-100 shadow-md font-extrabold';
                          break;
                        case 'CSS':
                          colorClasses = 'from-sky-500/35 via-cyan-500/35 to-blue-500/35 border-sky-500 border-2 text-sky-950 dark:text-sky-100 shadow-md font-extrabold';
                          break;
                        case 'JavaScript':
                          colorClasses = 'from-yellow-500/40 via-amber-500/40 to-yellow-600/40 border-amber-500 border-2 text-amber-950 dark:text-yellow-100 shadow-md font-extrabold';
                          break;
                        case 'Streak':
                          colorClasses = 'from-rose-500/35 via-red-500/35 to-pink-500/35 border-rose-500 border-2 text-rose-950 dark:text-rose-100 shadow-md font-extrabold';
                          break;
                        case 'Special':
                          colorClasses = 'from-purple-500/35 via-fuchsia-500/35 to-pink-500/35 border-purple-500 border-2 text-purple-950 dark:text-purple-100 shadow-md font-extrabold';
                          break;
                        default:
                          colorClasses = 'from-emerald-500/35 via-teal-500/35 to-emerald-600/35 border-emerald-500 border-2 text-emerald-950 dark:text-emerald-100 shadow-md font-extrabold';
                      }
                    }

                    return (
                      <div 
                        key={ach.id} 
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                          isUnlocked 
                            ? 'bg-gradient-to-r hover:scale-102 shadow-xs' 
                            : 'text-slate-400 dark:text-slate-600'
                        } ${colorClasses}`}
                      >
                        <div className="text-2xl w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-black/5 dark:border-white/5 flex items-center justify-center shrink-0">
                          {ach.icon || '🏆'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black truncate">{ach.name}</h4>
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/5 opacity-70">
                              {ach.category}
                            </span>
                          </div>
                          <p className="text-[10px] opacity-80 leading-snug mt-0.5 line-clamp-1">{ach.description}</p>
                          <span className="text-[8px] font-mono font-bold mt-1 block tracking-wider text-emerald-600 dark:text-emerald-400">
                            +50 XP REWARD
                          </span>
                        </div>
                        <div>
                          {isUnlocked ? (
                            <span className="bg-emerald-500 text-white p-0.5 rounded-full block border border-white dark:border-slate-900 shadow-sm">
                              <Check className="w-2.5 h-2.5" strokeWidth={4} stroke="currentColor" />
                            </span>
                          ) : (
                            <span className="text-[9.5px] font-black uppercase font-mono tracking-widest opacity-60">
                              Locked
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

          </div>
          
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

            {/* Segmented Tab Swapper */}
            <div className="px-5 pt-3 pb-1 bg-slate-900 border-b border-slate-850 flex gap-2">
              <button
                onClick={() => setQrType('link')}
                className={`flex-1 text-center py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  qrType === 'link'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                Web Profile
              </button>
              <button
                onClick={() => setQrType('vcard')}
                className={`flex-1 text-center py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  qrType === 'vcard'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                vCard Contact
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
                    src={qrType === 'link' ? localQrUrl : vcardQrUrl}
                    alt="Verified QR Code"
                    className="w-24 h-24 select-none"
                  />
                  <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-[0.5px] rounded-xl opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                  </div>
                </div>

                {/* Bottom Watermark */}
                <div className="z-10 mb-1">
                  <span className="text-[7.5px] font-black text-emerald-500 tracking-wider font-mono block uppercase">
                    {qrType === 'link' ? '● SECURE HUB RECORD' : '● SCAN TO SAVE CONTACT'}
                  </span>
                  <span className="text-[6.5px] font-bold text-slate-500 tracking-widest block font-mono mt-0.5">
                    {qrType === 'link' ? 'SCAN TO AUDIT REAL-TIME STATS' : 'DIRECT VCARD INTEGRATION'}
                  </span>
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
