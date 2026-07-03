import React, { useState, useEffect } from 'react';
import { Pencil, User as UserIcon, Bell, Lock, Github, QrCode, ChevronRight, LogOut, Camera, X, Loader2, Moon, Sun } from 'lucide-react';
import { User } from '../types';
import { uploadToImgBB } from '../utils/imgUpload';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';

interface ProfileViewProps {
  user: User;
  onUpdateUser: (updated: User) => void;
  onSignOut: () => void;
  onToast: (msg: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  onSignOut,
  onToast,
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('advocode_dark_mode') === 'true');

  // Edit fields
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [username, setUsername] = useState(user.username || user.regNumber || '@' + (user.email?.split('@')[0] || 'dev_' + Math.floor(Math.random() * 1000)));
  const [skillsString, setSkillsString] = useState(user.skills.join(', '));
  const [customAvatarUrl, setCustomAvatarUrl] = useState(user.avatarUrl || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [customCoverUrl, setCustomCoverUrl] = useState(user.coverUrl || '');

  const toggleDarkMode = () => {
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
                {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
              </div>
              <span className="flex-1 text-sm font-bold text-slate-900">Dark Theme Toggle</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                {isDark ? 'Dark' : 'Light'}
              </span>
            </div>

            <div
              onClick={() => onToast('Notification configurations loading...')}
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="bg-slate-100 p-2.5 rounded-xl text-slate-700">
                <Bell className="w-5 h-5" />
              </div>
              <span className="flex-1 text-sm font-bold text-slate-900">Notifications</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
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
              <div className="bg-slate-100 p-2.5 rounded-xl text-slate-700">
                <QrCode className="w-5 h-5" />
              </div>
              <span className="flex-1 text-sm font-bold text-slate-900">My Event Pass (QR)</span>
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

      {/* QR Event Pass Modal */}
      {isQrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-xs overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Your Event Pass</h3>
              <button
                onClick={() => setIsQrOpen(false)}
                className="text-slate-400 hover:text-slate-900 p-1 rounded-full hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner">
                {/* Simulated QR Code via elegant SVG */}
                <svg className="w-40 h-40 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                  {/* Outer corners */}
                  <path d="M 5,5 h 25 v 25 h -25 z M 10,10 h 15 v 15 h -15 z M 15,15 h 5 v 5 h -5 z" />
                  <path d="M 70,5 h 25 v 25 h -25 z M 75,10 h 15 v 15 h -15 z M 80,15 h 5 v 5 h -5 z" />
                  <path d="M 5,70 h 25 v 25 h -25 z M 10,75 h 15 v 15 h -15 z M 15,80 h 5 v 5 h -5 z" />
                  {/* Mock QR details pattern */}
                  <rect x="40" y="5" width="8" height="8" />
                  <rect x="55" y="5" width="8" height="15" />
                  <rect x="40" y="20" width="15" height="8" />
                  <rect x="45" y="35" width="8" height="8" />
                  <rect x="10" y="45" width="15" height="15" />
                  <rect x="35" y="50" width="20" height="8" />
                  <rect x="65" y="45" width="8" height="25" />
                  <rect x="80" y="45" width="15" height="8" />
                  <rect x="80" y="60" width="8" height="15" />
                  <rect x="50" y="65" width="8" height="20" />
                  <rect x="35" y="75" width="10" height="10" />
                  <rect x="15" y="85" width="15" height="5" />
                  <rect x="75" y="80" width="20" height="15" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">{user.name}</h4>
                <p className="text-xs text-slate-400 font-mono tracking-widest mt-0.5">{user.username || user.regNumber}</p>
                <p className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 font-bold px-3 py-1 rounded-full inline-block mt-3 uppercase tracking-wider">
                  Active Member
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-500 font-medium">Scan at event entrance for entry verification.</p>
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
    </div>
  );
};
