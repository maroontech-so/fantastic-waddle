import React, { useState, useEffect } from 'react';
import { Bell, Search, Code2, ArrowRight, Loader2, Menu, AlertTriangle, Copy, Check, Info, Moon, Sun } from 'lucide-react';
import { User, Notice, ClubEvent, LibraryFolder, LibraryFile, Channel, ChatMessage } from './types';
import { Sidebar, BottomNav, AndroidDrawer } from './components/Navigation';
import { LibraryView } from './components/LibraryView';
import { ChatView } from './components/ChatView';
import { ProfileView } from './components/ProfileView';
import { EditorView } from './components/EditorView';
import { ThreeDBackground } from './components/ThreeDBackground';
import { ScannedProfileModal } from './components/ScannedProfileModal';
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
import { getLevel, checkStaticAchievements, checkCodeAchievements } from './data/achievements';


interface ToastItem {
  id: string;
  message: string;
}

export default function App() {
  // Application states with 100% offline-ready persistent storage fallback
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('advocode_user') || localStorage.getItem('mku_it_user') || sessionStorage.getItem('advocode_user') || sessionStorage.getItem('mku_it_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const persistUser = (u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem('advocode_user', JSON.stringify(u));
      sessionStorage.setItem('advocode_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('advocode_user');
      localStorage.removeItem('mku_it_user');
      sessionStorage.removeItem('advocode_user');
      sessionStorage.removeItem('mku_it_user');
    }
  };

  const [currentView, setCurrentView] = useState<string>(() => {
    return localStorage.getItem('advocode_current_view') || sessionStorage.getItem('advocode_current_view') || 'chat';
  });
  useEffect(() => {
    localStorage.setItem('advocode_current_view', currentView);
    sessionStorage.setItem('advocode_current_view', currentView);
  }, [currentView]);

  const [viewedProfile, setViewedProfile] = useState<User | null>(null);
  const [chatViewModeState, setChatViewModeState] = useState<'timeline' | 'messages'>('timeline');

  // Native Mobile Back Navigation: push to history instead of replacing so back button navigates back cleanly
  const handleNavigate = (view: string) => {
    setViewedProfile(null);
    if (view !== currentView) {
      window.history.pushState({ view, isAppNav: true }, '', '#' + view);
    }
    setCurrentView(view);
  };

  const [initialDMUserUid, setInitialDMUserUid] = useState<string | null>(null);
  const [scannedProfileUid, setScannedProfileUid] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const actUid = params.get('uid');
    if (actUid) {
      triggerToast('🎉 Account successfully activated! Welcome to </AdvocoDe> Network.');
      setDoc(doc(db, "users", actUid), { activated: true }, { merge: true })
        .then(() => console.log("User profile updated as activated."))
        .catch(err => console.error("Error activating account:", err));
      
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    const profileUid = params.get('profile');
    if (profileUid) {
      setScannedProfileUid(profileUid);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Automated, real-time working Achievement System and XP rewards
  useEffect(() => {
    if (!user) return;
    
    const currentUnlocks = user.unlockedAchievements || [];
    
    // Get static metric achievements
    const staticUnlocks = checkStaticAchievements(user);
    
    // Get real-time playground code achievements
    let codeUnlocks: string[] = [];
    try {
      const ideSaved = localStorage.getItem('advocode_ide_progress');
      if (ideSaved) {
        const parsed = JSON.parse(ideSaved);
        codeUnlocks = checkCodeAchievements(parsed.html || '', parsed.css || '', parsed.js || '');
      }
    } catch (e) {}
    
    // Merge potential unlocks
    const allEligible = Array.from(new Set([...staticUnlocks, ...codeUnlocks]));
    const newlyUnlocked = allEligible.filter(achName => !currentUnlocks.includes(achName));
    
    if (newlyUnlocked.length > 0) {
      const bonusXP = newlyUnlocked.length * 50;
      const updatedXP = (user.xp || 0) + bonusXP;
      const updatedLevel = getLevel(updatedXP);
      const updatedUnlocks = [...currentUnlocks, ...newlyUnlocked];
      
      const updatedUser: User = {
        ...user,
        xp: updatedXP,
        level: updatedLevel,
        unlockedAchievements: updatedUnlocks
      };
      
      persistUser(updatedUser);
      if (updatedUser.uid || auth.currentUser?.uid) {
        setDoc(doc(db, "users", updatedUser.uid || auth.currentUser!.uid), cleanForFirestore(updatedUser), { merge: true })
          .catch(err => console.error("Firestore achievements sync error:", err));
      }
      
      newlyUnlocked.forEach((ach, index) => {
        setTimeout(() => {
          triggerToast(`🏆 ACHIEVEMENT UNLOCKED: "${ach}"! +50 Bonus XP!`);
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
        }, index * 1200);
      });
    }
  }, [user]);


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

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('advocode_dark_mode') === 'true';
    if (saved) document.documentElement.classList.add('dark');
    return saved;
  });

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('advocode_dark_mode', String(next));
    if (next) {
      document.documentElement.classList.add('dark');
      triggerToast('🌙 Dark theme enabled');
    } else {
      document.documentElement.classList.remove('dark');
      triggerToast('☀️ Light theme enabled');
    }
  };

  const generateRandomUsername = (prefix?: string) => {
    const base = prefix ? prefix.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 5) : 'dev';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `@${base || 'user'}_${randomSuffix}`;
  };

  const handleCopyDomain = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDomain(text);
    triggerToast(`Copied ${text} to clipboard!`);
    setTimeout(() => setCopiedDomain(null), 3000);
  };

  // Auth form states
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRegNumber, setAuthRegNumber] = useState('');
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'larger'>(() => {
    return (localStorage.getItem('advocode_text_size') as any) || 'normal';
  });

  const handleTextSizeChange = (size: 'normal' | 'large' | 'larger') => {
    setTextSize(size);
    localStorage.setItem('advocode_text_size', size);
    triggerToast(`Font scale adjusted to ${size}`);
  };

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
            persistUser(userData);
          } else {
            const defaultUser: User = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'AdvocoDe Member',
              email: firebaseUser.email || '',
              username: generateRandomUsername(firebaseUser.displayName || firebaseUser.email?.split('@')[0]),
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
            persistUser(defaultUser);
          }
        } catch (err) {
          console.error("Error fetching user profile from Firestore:", err);
          const cachedUser = localStorage.getItem('advocode_user') || sessionStorage.getItem('advocode_user');
          if (cachedUser) {
            try { persistUser(JSON.parse(cachedUser)); } catch (e) {}
          }
        }
      } else {
        persistUser(null);
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

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      triggerToast('🟢 Back Online! Offline changes synchronized.');
    };
    const handleOffline = () => {
      setIsOffline(true);
      triggerToast('⚡ Offline Mode active. Full app caching & local storage ready.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Native Mobile Back Navigation Handler
  useEffect(() => {
    // Ensure initial root state exists in history so mobile back button never exits or restarts the app
    const hashView = window.location.hash.replace('#', '').split('/')[0];
    const initialView = ['chat', 'library', 'workspace', 'profile', 'tutorial', 'editor'].includes(hashView) ? hashView : currentView;
    if (initialView !== currentView) {
      setCurrentView(initialView);
    }
    if (!window.history.state || !window.history.state.isAppNav) {
      window.history.replaceState({ view: initialView, isRoot: true, isAppNav: true }, '', '#' + initialView);
    }

    const handlePopState = (event: PopStateEvent) => {
      // Prevent app restart or browser exit when back button is pressed on mobile
      if (isMobileDrawerOpen) {
        setIsMobileDrawerOpen(false);
        return;
      }
      if (viewedProfile) {
        setViewedProfile(null);
        return;
      }
      if (scannedProfileUid) {
        setScannedProfileUid(null);
        return;
      }

      const state = event.state;
      if (state && state.view) {
        setCurrentView(state.view);
        if (state.profileUid) {
          const found = allUsers.find(u => u.uid === state.profileUid);
          if (found) setViewedProfile(found);
        } else {
          setViewedProfile(null);
        }
      } else {
        // If popped to root or empty state, return to base chat view without restarting
        setCurrentView('chat');
        setViewedProfile(null);
        if (!window.history.state || !window.history.state.isAppNav) {
          window.history.pushState({ view: 'chat', isRoot: true, isAppNav: true }, '', '#chat');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isMobileDrawerOpen, viewedProfile, scannedProfileUid, allUsers, currentView]);

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
          username: generateRandomUsername(fbUser.displayName || fbUser.email?.split('@')[0]),
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

    if (!isLoginMode && authPassword !== authConfirmPassword) {
      triggerToast('❌ Passwords do not match! Please check and try again.');
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
          username: authRegNumber.trim().startsWith('@') ? authRegNumber.trim() : (authRegNumber.trim() ? '@' + authRegNumber.trim() : generateRandomUsername(authName.trim() || authEmail.split('@')[0])),
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

        // Send confirmation email via our backend proxy
        const activationLink = `https://advocade.studenthubmku.xyz?uid=${fbUser.uid}`;
        try {
          fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              to: authEmail,
              subject: 'Activate your </AdvocoDe> Account',
              html: `
                <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #334155; background-color: #f8fafc; border-radius: 16px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <div style="display: inline-block; background-color: #2563eb; padding: 12px; border-radius: 12px; margin-bottom: 16px;">
                      <img src="logo.svg" style="width: 48px; height: 48px; filter: brightness(0) invert(1);" alt="AdvocoDe logo" />
                    </div>
                    <h2 style="font-size: 24px; font-weight: 800; color: #1e293b; margin: 0; font-family: monospace;">&lt;/AdvocoDe&gt;</h2>
                    <p style="color: #2563eb; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin: 4px 0 0 0;">Defend. Develop. Dominate.</p>
                  </div>
                  
                  <div style="background-color: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); border: 1px solid #e2e8f0;">
                    <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px;">Welcome to the Developer Network!</h1>
                    <p style="font-size: 14px; line-height: 1.6; margin-bottom: 24px;">Hi ${authName.trim() || authEmail.split('@')[0]},</p>
                    <p style="font-size: 14px; line-height: 1.6; margin-bottom: 24px;">Thank you for requesting to join the <strong>&lt;/AdvocoDe&gt; Network</strong>! We are excited to have you as part of our exclusive elite community of student developers.</p>
                    <p style="font-size: 14px; line-height: 1.6; margin-bottom: 24px;">To finalize your registration and activate your student developer account, please click the verification button below:</p>
                    
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${activationLink}" style="background-color: #2563eb; color: #ffffff; font-weight: 600; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Activate Account</a>
                    </div>
                    
                    <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 0;">If the button doesn't work, copy and paste this link into your browser:<br/><a href="${activationLink}" style="color: #2563eb; text-decoration: underline;">${activationLink}</a></p>
                  </div>
                  
                  <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #94a3b8;">
                    <p style="margin: 0 0 8px 0;">AdvocoDe Developer Organization &bull; Mount Kenya University</p>
                    <p style="margin: 0;">If you didn't request this email, you can safely ignore it.</p>
                  </div>
                </div>
              `
            })
          })
          .then(res => res.json())
          .then(data => {
            console.log("Welcome / activation email sent:", data);
            triggerToast('📧 Activation link sent! Check your email to verify and activate.');
          })
          .catch(err => {
            console.error("Resend welcome email failed:", err);
          });
        } catch (emailErr) {
          console.error("Email API fetch failed:", emailErr);
        }
      }
      setAuthEmail('');
      setAuthPassword('');
      setAuthConfirmPassword('');
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
      
      const currentLevel = getLevel(currentXP);
      const nextLevel = getLevel(nextXP);
      
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

      
      persistUser(updated);
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
      persistUser(null);
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
    persistUser(updatedUser);
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
      case 'tutorials':
        return 'Interactive Tutorials';
      case 'editor':
        return 'Code Playground';
      case 'profile':
        return 'Profile';
      default:
        return 'Hub';
    }
  };

  return (
    <div className={`antialiased text-slate-900 flex h-screen w-full bg-slate-50 overflow-hidden font-sans ${textSize === 'large' ? 'text-scale-large' : textSize === 'larger' ? 'text-scale-larger' : 'text-scale-normal'}`}>
      <ThreeDBackground />
      
      {/* 1. SPLASH SCREEN (Mounts if splashActive is true) */}
      {splashActive && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-center items-center bg-slate-900 transition-opacity duration-300">
          <div className="w-30 h-27 bg-blue-600 rounded-3xl shadow-lg flex items-center justify-center mb-6 animate-pulse">
            <img src="logo.svg" width="24px" className="w-24 h-24 object-contain brightness-0 invert" alt="AdvocoDe logo" />
          </div>
          <h1 className="text-4xl font-light tracking-tight text-white font-mono">&lt;/AdvocoDe&gt;</h1>
          <p className="text-blue-400 mt-3 font-light text-sm tracking-wide font-mono uppercase">Defend. Develop. Dominate.</p>
        </div>
      )}

      {/* 2. AUTH SCREEN (Mounts if user is not authenticated and splash is done) */}
      {!user && !splashActive && (
        <div className="fixed inset-0 z-[90] bg-slate-50 overflow-y-auto">
          <div className="flex flex-col justify-center min-h-screen px-6 sm:px-12 md:max-w-md md:mx-auto py-8">
            
           

            <div className="mb-8 text-center mt-2">
              <div className="w-30 h-26 bg-blue-600 rounded-3xl shadow-md flex items-center justify-center mb-5 mx-auto">
                <img src="logo.svg" className="w-24 h-24 object-contain brightness-0 invert" alt="AdvocoDe logo" />
              </div>
              <h1 className="text-2xl font-light mb-1.5 text-slate-850 tracking-tight font-display">
                {isLoginMode ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-slate-400 font-light text-xs">
                {isLoginMode ? 'Sign in to access your developer network.' : 'Join the </AdvocoDe> developer network.'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full bg-slate-50/30 text-slate-500 font-light py-2.5 px-4 rounded-xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all active:scale-95 flex justify-center items-center gap-3 mb-1 cursor-pointer disabled:opacity-70"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.3 8.9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.3-1.5-.3-2.3s.1-1.5.3-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.8z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.2L1.6 15.9C3.5 19.7 7.4 23 12 23z"/>
                </svg>
                <span className="text-xs">Continue with Google</span>
              </button>
              
              <div className="relative my-3 flex items-center justify-center">
                <div className="border-t border-slate-100 w-full"></div>
                <span className="bg-white px-2 text-[10px] text-slate-300 font-light uppercase tracking-wider absolute">OR EMAIL</span>
              </div>

              {/* Sign up details */}
              {!isLoginMode && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-[11px] font-light text-slate-400 mb-1 uppercase tracking-wider">Full Name</label>
                    <input
                      required
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Alex M."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50/50 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all text-xs font-light text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-light text-slate-400 mb-1 uppercase tracking-wider">Username</label>
                    <input
                      type="text"
                      value={authRegNumber}
                      onChange={(e) => setAuthRegNumber(e.target.value)}
                      placeholder="e.g., @alex_dev"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50/50 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all text-xs font-light font-mono text-slate-600"
                    />
                  </div>
                </div>
              )}

              {/* Standard email/pass */}
              <div>
                <label className="block text-[11px] font-light text-slate-400 mb-1 uppercase tracking-wider">Email Address</label>
                <input
                  required
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="developer@advocode.io"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50/50 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all text-xs font-light text-slate-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-light text-slate-400 mb-1 uppercase tracking-wider">Password</label>
                <input
                  required
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50/50 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all text-xs font-light text-slate-600"
                />
              </div>

              {/* Confirm Password (signup only) */}
              {!isLoginMode && (
                <div className="animate-fade-in">
                  <label className="block text-[11px] font-light text-slate-400 mb-1 uppercase tracking-wider">Confirm Password</label>
                  <input
                    required
                    type="password"
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50/50 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all text-xs font-light text-slate-600"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-light py-2.5 rounded-xl mt-5 shadow-sm transition-all active:scale-95 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-80"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-light">{isLoginMode ? 'Sign In' : 'Sign Up'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-6 mb-6 font-light">
              <span>{isLoginMode ? 'Not a member?' : 'Already a member?'}</span>
              <button
                type="button"
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-blue-500 font-light ml-1 hover:text-blue-600 hover:underline transition-all cursor-pointer"
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
            onNavigate={handleNavigate}
            user={user}
            onSignOut={handleSignOut}
            onToast={triggerToast}
            allUsers={allUsers}
          />

          {/* Desktop Navigation Drawer Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            user={user}
            onSignOut={handleSignOut}
            onToast={triggerToast}
            allUsers={allUsers}
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

                  {currentView !== 'library' && currentView !== 'tutorials' && (
                    <button
                      onClick={toggleDarkMode}
                      className="p-2 bg-white rounded-full shadow-sm border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                    >
                      {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
                    </button>
                  )}
                </div>
              </header>
            )}

            {/* Active Content Screens */}
            <div className={`flex-1 relative no-scrollbar ${currentView === 'editor' || currentView === 'chat' ? 'h-full flex flex-col overflow-hidden pb-16 md:pb-0' : 'overflow-y-auto pb-24 md:pb-6'}`}>

              {(currentView === 'library' || currentView === 'tutorials') && (
                <LibraryView
                  initialTab={currentView === 'tutorials' ? 'tutorials' : 'files'}
                  folders={folders}
                  files={files}
                  onAddFile={handleAddFile}
                  onToast={triggerToast}
                  onRewardXP={handleRewardXP}
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
                  initialDMUserUid={initialDMUserUid}
                  onClearInitialDMUser={() => setInitialDMUserUid(null)}
                  onViewProfile={(profile) => {
                    const targetUser = allUsers.find(u => u.name === profile.name || u.email?.split('@')[0] === profile.name || u.uid === profile.id || u.uid === profile.uid) || {
                      uid: profile.id || profile.name || String(Date.now()),
                      name: profile.name,
                      bio: profile.bio || profile.subtitle || 'MKU Student | Passionate Developer',
                      skills: profile.skills || ['HTML5', 'CSS3', 'JavaScript'],
                      avatarUrl: profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=2563EB&color=fff`,
                      coverUrl: profile.coverUrl || '',
                      level: profile.level || 1,
                      xp: profile.points || profile.xp || 50,
                      streak: profile.streak || 1,
                      regNumber: profile.regNo || '',
                      email: '',
                      role: 'student'
                    };
                    setViewedProfile(targetUser);
                    setCurrentView('profile');
                  }}
                  onViewModeChange={setChatViewModeState}
                />
              )}

              {currentView === 'editor' && (
                <EditorView
                  onToast={triggerToast}
                  initialCode={editorInitialCode}
                  onClearInitialCode={() => setEditorInitialCode(null)}
                  onRewardXP={handleRewardXP}
                />
              )}

              {currentView === 'profile' && (
                <ProfileView
                  user={viewedProfile || user}
                  onUpdateUser={handleUpdateUser}
                  onSignOut={handleSignOut}
                  onToast={triggerToast}
                  isDark={isDark}
                  onToggleTheme={toggleDarkMode}
                  isReadOnly={!!viewedProfile && viewedProfile.uid !== user.uid}
                  onBack={viewedProfile ? () => setViewedProfile(null) : undefined}
                  onStartDM={(uid, name) => {
                    setInitialDMUserUid(uid);
                    setChatViewModeState('messages');
                    setViewedProfile(null);
                    setCurrentView('chat');
                    triggerToast(`Opening direct message conversation with ${name}...`);
                  }}
                />
              )}
            </div>

            {/* Mobile Bottom Navigation Bar */}
            {!(currentView === 'chat' && chatViewModeState === 'messages') && (
              <BottomNav
                currentView={currentView}
                onNavigate={handleNavigate}
                user={user}
                onSignOut={handleSignOut}
                onToast={triggerToast}
              />
            )}
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

      {/* 5. SCANNED PROFILE VERIFIED PASSPORT OVERLAY */}
      {scannedProfileUid && (
        <ScannedProfileModal
          uid={scannedProfileUid}
          onClose={() => setScannedProfileUid(null)}
          onStartDM={(targetUid) => {
            setInitialDMUserUid(targetUid);
            setCurrentView('chat');
          }}
          allUsers={allUsers}
          onToast={triggerToast}
          currentUser={user}
        />
      )}
    </div>
  );
}
