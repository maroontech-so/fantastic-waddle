import React, { useState, useEffect } from 'react';
import { Bell, Search, Code2, ArrowRight, Loader2, Menu, AlertTriangle, Copy, Check, Info } from 'lucide-react';
import { User, Notice, ClubEvent, LibraryFolder, LibraryFile, Channel, ChatMessage } from './types';
import { Sidebar, BottomNav, AndroidDrawer } from './components/Navigation';
import { LibraryView } from './components/LibraryView';
import { ChatView } from './components/ChatView';
import { ProfileView } from './components/ProfileView';
import { EditorView } from './components/EditorView';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, onSnapshot, query } from 'firebase/firestore';
import { cleanForFirestore } from './utils/clean';

import {
  INITIAL_NOTICES,
  INITIAL_EVENTS,
  INITIAL_FOLDERS,
  INITIAL_FILES,
  INITIAL_CHANNELS,
  INITIAL_CHAT_HISTORY,
} from './data';

interface ToastItem {
  id: string;
  message: string;
}

export default function App() {
  // Application states
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem('advocode_user') || sessionStorage.getItem('mku_it_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [currentView, setCurrentView] = useState<string>(() => {
    return sessionStorage.getItem('advocode_current_view') || 'chat';
  });
  useEffect(() => {
    sessionStorage.setItem('advocode_current_view', currentView);
  }, [currentView]);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [events, setEvents] = useState<ClubEvent[]>(INITIAL_EVENTS);
  const [folders, setFolders] = useState<LibraryFolder[]>(INITIAL_FOLDERS);
  const [files, setFiles] = useState<LibraryFile[]>(INITIAL_FILES);
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>(INITIAL_CHAT_HISTORY);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  // UI states
  const [splashActive, setSplashActive] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [authLoading, setAuthLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [editorInitialCode, setEditorInitialCode] = useState<{ html: string; css: string; js: string; title: string } | null>(null);
  const [showDomainHelp, setShowDomainHelp] = useState(true);
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);

  const handleCopyDomain = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDomain(text);
    triggerToast(`Copied ${text} to clipboard!`);
    setTimeout(() => setCopiedDomain(null), 3000);
  };

  // Auth form states
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRegNumber, setAuthRegNumber] = useState('');

  // Toast Notification Trigger
  const triggerToast = (message: string) => {
    const id = `toast_${Date.now()}`;
    setToasts((prev) => [...prev, { id, message }]);
    
    // Auto-dismiss in 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Check for active session and subscribe to Firebase Auth and Firestore Users
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = { uid: firebaseUser.uid, ...docSnap.data() } as User;
            setUser(userData);
            sessionStorage.setItem('advocode_user', JSON.stringify(userData));
          } else {
            const defaultUser: User = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'AdvocoDe Member',
              email: firebaseUser.email || '',
              username: '@' + (firebaseUser.email?.split('@')[0] || 'dev_' + firebaseUser.uid.substring(0, 4).toLowerCase()),
              regNumber: 'ADV/' + firebaseUser.uid.substring(0, 4).toUpperCase(),
              bio: 'Developer • </AdvocoDe> Network',
              skills: ['React', 'TypeScript', 'Tailwind CSS', 'Firebase'],
              avatarUrl: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || 'User')}&background=2563EB&color=fff`,
              xp: 50,
              level: 1,
              streak: 1,
              lastCheckIn: new Date().toISOString().split('T')[0],
              contributions: 1,
              learningCount: 1,
              engagementCount: 1,
            };
            await setDoc(docRef, cleanForFirestore(defaultUser), { merge: true });
            setUser(defaultUser);
            sessionStorage.setItem('advocode_user', JSON.stringify(defaultUser));
          }
        } catch (err) {
          console.error("Error fetching user profile from Firestore:", err);
        }
      } else {
        setUser(null);
        sessionStorage.removeItem('advocode_user');
        sessionStorage.removeItem('mku_it_user');
      }
    });

    const usersQuery = query(collection(db, "users"));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const loadedUsers: User[] = [];
      snapshot.forEach((docSnap) => {
        loadedUsers.push({ uid: docSnap.id, ...docSnap.data() } as User);
      });
      setAllUsers(loadedUsers);
    }, (err) => {
      console.error("Error loading users from Firestore:", err);
    });

    // Dismiss splash screen after 1.5s
    const timer = setTimeout(() => {
      setSplashActive(false);
    }, 1500);

    return () => {
      unsubscribeAuth();
      unsubscribeUsers();
      clearTimeout(timer);
    };
  }, []);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      setAuthLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const docRef = doc(db, "users", fbUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = { uid: fbUser.uid, ...docSnap.data() } as User;
        setUser(userData);
        triggerToast(`Welcome back, ${userData.name}!`);
      } else {
        const newUserProfile: User = {
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'AdvocoDe Member',
          email: fbUser.email || '',
          username: '@' + (fbUser.email?.split('@')[0] || 'dev_' + fbUser.uid.substring(0, 4).toLowerCase()),
          regNumber: 'ADV/' + fbUser.uid.substring(0, 4).toUpperCase(),
          bio: 'Developer • </AdvocoDe> Network',
          skills: ['React', 'TypeScript', 'Tailwind CSS', 'Firebase', 'Google Cloud'],
          avatarUrl: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'User')}&background=2563EB&color=fff`,
          xp: 75,
          level: 1,
          streak: 1,
          lastCheckIn: new Date().toISOString().split('T')[0],
          contributions: 1,
          learningCount: 1,
          engagementCount: 1,
        };
        await setDoc(docRef, cleanForFirestore(newUserProfile), { merge: true });
        setUser(newUserProfile);
        triggerToast(`Welcome to </AdvocoDe>, ${newUserProfile.name}! +75 XP!`);
      }
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      const isDomainErr = err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain') || String(err).includes('unauthorized-domain');
      if (isDomainErr) {
        setShowDomainHelp(true);
        triggerToast('⚠️ Domain Not Whitelisted in Firebase Console! See instructions below.');
      } else {
        triggerToast(`Google Auth Error: ${err.message || 'Sign in failed'}`);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Authentication submit (Email & Password)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      triggerToast('Please provide valid credentials.');
      return;
    }

    setAuthLoading(true);
    try {
      if (isLoginMode) {
        const userCredential = await signInWithEmailAndPassword(auth, authEmail, authPassword);
        const fbUser = userCredential.user;
        const docRef = doc(db, "users", fbUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = { uid: fbUser.uid, ...docSnap.data() } as User;
          setUser(userData);
          triggerToast(`Welcome back, ${userData.name}!`);
        } else {
          const fallbackProfile: User = {
            uid: fbUser.uid,
            name: fbUser.displayName || authEmail.split('@')[0] || 'AdvocoDe Member',
            email: authEmail,
            username: '@' + (authEmail.split('@')[0] || 'dev_' + fbUser.uid.substring(0, 4).toLowerCase()),
            regNumber: 'ADV/' + fbUser.uid.substring(0, 4).toUpperCase(),
            bio: 'Developer • </AdvocoDe> Network',
            skills: ['React', 'TypeScript', 'Tailwind CSS', 'Firebase'],
            avatarUrl: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'User')}&background=2563EB&color=fff`,
            xp: 50,
            level: 1,
            streak: 1,
            lastCheckIn: new Date().toISOString().split('T')[0],
            contributions: 1,
            learningCount: 1,
            engagementCount: 1,
          };
          await setDoc(docRef, cleanForFirestore(fallbackProfile), { merge: true });
          setUser(fallbackProfile);
          triggerToast(`Welcome back!`);
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        const fbUser = userCredential.user;
        if (authName.trim()) {
          await updateProfile(fbUser, { displayName: authName.trim() });
        }
        const newUserProfile: User = {
          uid: fbUser.uid,
          name: authName.trim() || authEmail.split('@')[0] || 'AdvocoDe Member',
          email: authEmail,
          username: authRegNumber.trim().startsWith('@') ? authRegNumber.trim() : '@' + (authRegNumber.trim() || authEmail.split('@')[0] || 'dev'),
          regNumber: 'ADV/' + fbUser.uid.substring(0, 4).toUpperCase(),
          bio: 'Developer • </AdvocoDe> Network',
          skills: ['React', 'TypeScript', 'Tailwind CSS', 'Firebase'],
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(authName.trim() || 'User')}&background=2563EB&color=fff`,
          xp: 50,
          level: 1,
          streak: 1,
          lastCheckIn: new Date().toISOString().split('T')[0],
          contributions: 1,
          learningCount: 1,
          engagementCount: 1,
        };
        await setDoc(doc(db, "users", fbUser.uid), cleanForFirestore(newUserProfile), { merge: true });
        setUser(newUserProfile);
        triggerToast(`Welcome to </AdvocoDe>, ${newUserProfile.name}! +50 XP!`);
      }
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
      setAuthRegNumber('');
    } catch (err: any) {
      console.error("Auth Error:", err);
      triggerToast(`Auth Error: ${err.message || 'Authentication failed'}`);
    } finally {
      setAuthLoading(false);
    }
  };

  // Gamification XP Reward Handler
  const handleRewardXP = (amount: number, type: 'checkin' | 'engagement' | 'learning' | 'contribution', description: string) => {
    setUser(prev => {
      if (!prev) return null;
      
      const currentXP = prev.xp || 0;
      const nextXP = currentXP + amount;
      
      const currentLevel = prev.level || 1;
      const nextLevel = Math.floor(nextXP / 100) + 1;
      
      const isLevelUp = nextLevel > currentLevel;
      
      const contributions = prev.contributions || 0;
      const learningCount = prev.learningCount || 0;
      const engagementCount = prev.engagementCount || 0;
      
      const updated: User = {
        ...prev,
        xp: nextXP,
        level: nextLevel,
        streak: prev.streak || 1,
        contributions: type === 'contribution' ? contributions + 1 : contributions,
        learningCount: type === 'learning' ? learningCount + 1 : learningCount,
        engagementCount: type === 'engagement' ? engagementCount + 1 : engagementCount,
      };
      
      sessionStorage.setItem('advocode_user', JSON.stringify(updated));
      if (updated.uid || auth.currentUser?.uid) {
        setDoc(doc(db, "users", updated.uid || auth.currentUser!.uid), cleanForFirestore(updated), { merge: true }).catch(err => console.error(err));
      }
      
      if (isLevelUp) {
        setTimeout(() => {
          triggerToast(`🎉 LEVEL UP! You reached Level ${nextLevel}! Keep it up!`);
        }, 600);
      }
      
      return updated;
    });
  };

  // Sign out user
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      sessionStorage.removeItem('advocode_user');
      sessionStorage.removeItem('mku_it_user');
      setUser(null);
      setCurrentView('chat');
      triggerToast('Logged out successfully.');
    } catch (err) {
      console.error(err);
    }
  };

  // Register / cancel Hackathon team registration
  const handleRegisterEvent = (eventId: string) => {
    setEvents((prevEvents) =>
      prevEvents.map((evt) =>
        evt.id === eventId ? { ...evt, teamRegistered: !evt.teamRegistered } : evt
      )
    );
  };

  // Add library file and auto-increment matching folder itemsCount
  const handleAddFile = (newFile: LibraryFile) => {
    setFiles((prev) => [newFile, ...prev]);
    setFolders((prevFolders) =>
      prevFolders.map((f) =>
        f.name === newFile.category ? { ...f, itemsCount: f.itemsCount + 1 } : f
      )
    );
  };

  // Send Chat message and append to channel history
  const handleSendMessage = (channelId: string, text: string) => {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      channelId,
      sender: user?.name || 'You',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      self: true,
    };

    setChatHistory((prev) => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), newMessage],
    }));
  };

  // Update Profile details
  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    sessionStorage.setItem('advocode_user', JSON.stringify(updatedUser));
    if (updatedUser.uid || auth.currentUser?.uid) {
      setDoc(doc(db, "users", updatedUser.uid || auth.currentUser!.uid), cleanForFirestore(updatedUser), { merge: true }).catch(err => console.error(err));
    }
  };

  // Determine current active page title
  const getPageTitle = () => {
    switch (currentView) {
      case 'chat':
        return 'Hub';
      case 'library':
        return 'Resources';
      case 'editor':
        return 'Code Playground';
      case 'profile':
        return 'Profile';
      default:
        return 'Hub';
    }
  };

  return (
    <div className="antialiased text-slate-900 flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      
      {/* 1. SPLASH SCREEN (Mounts if splashActive is true) */}
      {splashActive && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-center items-center bg-slate-900 transition-opacity duration-300">
          <div className="w-24 h-24 bg-blue-600 rounded-3xl shadow-lg flex items-center justify-center mb-6 animate-pulse">
            <Code2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white font-mono">&lt;/AdvocoDe&gt;</h1>
          <p className="text-blue-400 mt-3 font-bold text-base tracking-wide font-mono uppercase">Defend. Develop. Dominate.</p>
        </div>
      )}

      {/* 2. AUTH SCREEN (Mounts if user is not authenticated and splash is done) */}
      {!user && !splashActive && (
        <div className="fixed inset-0 z-[90] bg-slate-50 overflow-y-auto">
          <div className="flex flex-col justify-center min-h-screen px-6 sm:px-12 md:max-w-md md:mx-auto py-8">
            <div className="mb-10 text-center md:text-left mt-4">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl shadow-md flex items-center justify-center mb-6 mx-auto md:mx-0">
                <Code2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold mb-2 text-slate-900 tracking-tight font-display">
                {isLoginMode ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-slate-600 font-medium">
                {isLoginMode ? 'Sign in to access your developer network.' : 'Join </AdvocoDe> developer network.'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200">
              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full bg-white text-slate-700 font-bold py-3.5 px-4 rounded-xl border border-slate-300 shadow-sm hover:bg-slate-50 transition-all active:scale-95 flex justify-center items-center gap-3 mb-2 cursor-pointer disabled:opacity-70"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.3 8.9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.3-1.5-.3-2.3s.1-1.5.3-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.8z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.2L1.6 15.9C3.5 19.7 7.4 23 12 23z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
              
              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] text-slate-400 font-bold uppercase tracking-wider absolute">OR EMAIL</span>
              </div>

              {/* Sign up details */}
              {!isLoginMode && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Full Name</label>
                    <input
                      required
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Alex M."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Unique Username</label>
                    <input
                      required
                      type="text"
                      value={authRegNumber}
                      onChange={(e) => setAuthRegNumber(e.target.value)}
                      placeholder="@developer"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Standard email/pass */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Email Address</label>
                <input
                  required
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="developer@advocode.io"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Password</label>
                <input
                  required
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl mt-6 shadow-md hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>{isLoginMode ? 'Sign In' : 'Sign Up'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-600 mt-8 mb-8">
              <span>{isLoginMode ? 'Not a member?' : 'Already a member?'}</span>
              <button
                type="button"
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-blue-600 font-bold ml-1.5 hover:text-blue-700 hover:underline transition-all cursor-pointer"
              >
                {isLoginMode ? 'Join the club' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* 3. MAIN APPLICATION APPLET */}
      {user && !splashActive && (
        <>
          {/* Android Navigation Drawer */}
          <AndroidDrawer
            isOpen={isMobileDrawerOpen}
            onClose={() => setIsMobileDrawerOpen(false)}
            currentView={currentView}
            onNavigate={setCurrentView}
            user={user}
            onSignOut={handleSignOut}
            onToast={triggerToast}
          />

          {/* Desktop Navigation Drawer Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={setCurrentView}
            user={user}
            onSignOut={handleSignOut}
            onToast={triggerToast}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-50">
            
            {/* Header: Mobile layout (Top) is removed completely as per user request */}

            {/* Header: Desktop layout (Top) */}
            {currentView !== 'chat' && currentView !== 'editor' && (
              <header className="hidden md:flex sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-8 py-4.5 justify-between items-center shrink-0">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 font-display">
                  {getPageTitle()}
                </h2>
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search resources globally..."
                      onClick={() => {
                        if (currentView !== 'library') {
                          setCurrentView('library');
                          triggerToast('Searched globally. Resources filter opened!');
                        }
                      }}
                      className="w-64 bg-slate-50 pl-10 pr-4 py-2 rounded-full border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
                    />
                  </div>

                  <button
                    onClick={() => triggerToast('No new announcements')}
                    className="relative p-2 bg-white rounded-full shadow-sm border border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <Bell className="w-5 h-5 text-slate-900" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                  </button>
                </div>
              </header>
            )}

            {/* Active Content Screens */}
            <div className="flex-1 overflow-y-auto relative no-scrollbar pb-24 md:pb-6">

              {currentView === 'library' && (
                <LibraryView
                  folders={folders}
                  files={files}
                  onAddFile={handleAddFile}
                  onToast={triggerToast}
                  onTryCode={(code) => {
                    setEditorInitialCode(code);
                    setCurrentView('editor');
                  }}
                />
              )}

              {currentView === 'chat' && (
                <ChatView
                  channels={channels}
                  chatHistory={chatHistory}
                  onSendMessage={handleSendMessage}
                  onToast={triggerToast}
                  onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
                  onRewardXP={handleRewardXP}
                  allUsers={allUsers}
                  currentUser={user}
                />
              )}

              {currentView === 'editor' && (
                <EditorView
                  onToast={triggerToast}
                  initialCode={editorInitialCode}
                  onClearInitialCode={() => setEditorInitialCode(null)}
                />
              )}

              {currentView === 'profile' && (
                <ProfileView
                  user={user}
                  onUpdateUser={handleUpdateUser}
                  onSignOut={handleSignOut}
                  onToast={triggerToast}
                />
              )}
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <BottomNav
              currentView={currentView}
              onNavigate={setCurrentView}
              user={user}
              onSignOut={handleSignOut}
              onToast={triggerToast}
            />
          </div>
        </>
      )}

      {/* 4. ANIMATED FLOATING TOASTS NOTIFICATIONS */}
      {toasts.length > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 max-w-[90%] md:max-w-md w-full pointer-events-none px-4">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="bg-slate-900 text-white border border-slate-800 text-xs font-semibold py-3 px-5 rounded-xl shadow-xl flex items-center justify-between pointer-events-auto animate-slide-up"
            >
              <span>{toast.message}</span>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="ml-3 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
