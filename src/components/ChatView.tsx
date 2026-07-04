import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Repeat,
  Heart,
  Share,
  Code2,
  Sparkles,
  Send,
  Flame,
  Search,
  ArrowLeft,
  X,
  Globe,
  User,
  Plus,
  Check,
  Link,
  Image,
  Smile,
  BarChart2,
  Trash2,
  TrendingUp,
  Bookmark,
  ExternalLink,
  CheckCircle2,
  Send as SendIcon,
  Megaphone,
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  Info,
  MoreVertical,
  Camera,
  Paperclip,
  CheckCheck,
  Loader2,
  AtSign,
  CornerUpLeft,
  Copy
} from 'lucide-react';
import { MemberBioModal, MemberProfile } from './MemberBioModal';
import { db, auth, rtdb } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { cleanForFirestore } from '../utils/clean';
import { ref, onValue, push, set, update, onDisconnect, serverTimestamp } from 'firebase/database';
import { User as AppUser } from '../types';
import { uploadToImgBB } from '../utils/imgUpload';
import CodeMirror, { EditorView as CMEditorView } from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';

export const getRelativeTimeString = (timeMsOrStr: number | string | any): string => {
  if (!timeMsOrStr) return 'Just now';
  let timestamp: number;
  
  if (timeMsOrStr && typeof timeMsOrStr === 'object') {
    if (typeof timeMsOrStr.toDate === 'function') {
      timestamp = timeMsOrStr.toDate().getTime();
    } else if (typeof timeMsOrStr.seconds === 'number') {
      timestamp = timeMsOrStr.seconds * 1000;
    } else if (timeMsOrStr instanceof Date) {
      timestamp = timeMsOrStr.getTime();
    } else {
      return 'Just now';
    }
  } else if (typeof timeMsOrStr === 'number') {
    timestamp = timeMsOrStr;
  } else {
    const str = String(timeMsOrStr).trim();
    if (
      str.includes('ago') || 
      str.toLowerCase() === 'yesterday' || 
      str.toLowerCase() === 'now' || 
      str.toLowerCase() === 'mon' || 
      str.toLowerCase() === 'tue' || 
      str.toLowerCase() === 'wed' || 
      str.toLowerCase() === 'thu' || 
      str.toLowerCase() === 'fri' || 
      str.toLowerCase() === 'sat' || 
      str.toLowerCase() === 'sun' || 
      str.toLowerCase() === 'last week' ||
      str.toLowerCase() === '2 weeks ago'
    ) {
      return str;
    }
    
    timestamp = Date.parse(str);
    if (isNaN(timestamp)) {
      return str;
    }
  }
  
  const now = Date.now();
  const diffMs = now - timestamp;
  if (diffMs < 0) return 'Just now';

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const DYNAMIC_POST_PROMPTS = [
  "Got a bug you're wrestling with?",
  "Wanna ask a coding question?",
  "What's on your mind today, dev?",
  "Working on a cool new project?",
  "Stuck on a tricky algorithm?",
  "What new tech stack are you exploring?",
  "Need code review on your latest PR?",
  "Share a dev tip of the day!",
  "What's your biggest win this week?",
  "Which programming language is your favorite right now?",
  "Anyone want to hack together this weekend?",
  "Discovered any amazing developer tools recently?",
  "What error message has been haunting you?",
  "Looking for study buddies or project collaborators?",
  "What's your current desktop or IDE setup?",
  "How do you organize your workflow and sprints?",
  "Learned anything new in your classes today?",
  "Anyone attending an upcoming tech meetup?",
  "What's your favorite VS Code extension?",
  "Need advice on tech career paths or internships?",
  "Share a code snippet that you're proud of!",
  "What API are you integrating today?",
  "Frontend vs Backend: what are you tackling right now?",
  "Have a question about cloud deployment or Docker?",
  "Anyone playing with AI models or LLMs lately?",
  "What's your favorite database to work with?",
  "How do you handle state management in your apps?",
  "Got any recommendations for coding tutorials or books?",
  "What was your first programming language?",
  "Share a meme or funny dev moment!",
  "What feature should we add to the IT Club app next?",
  "Anyone practicing LeetCode or data structures?",
  "How do you debug when console.log doesn't cut it?",
  "What architecture pattern are you experimenting with?",
  "Looking for feedback on your portfolio website?",
  "What cybersecurity concept fascinated you lately?",
  "Anyone interested in mobile app development?",
  "What's the hardest concept you've mastered recently?",
  "Share your GitHub repo for some stars and love!",
  "What are your coding goals for this month?",
  "How do you stay motivated during long debugging sessions?"
];

export const getUserRtdbKey = (u?: any): string => {
  if (!u) return 'guest';
  if (typeof u === 'string') return u.toLowerCase().replace(/[.#$[\]/]/g, '_').replace(/\s+/g, '_');
  const keyStr = u.id || u.uid || u.email || u.username || u.name || 'guest';
  return keyStr.toLowerCase().replace(/[.#$[\]/]/g, '_').replace(/\s+/g, '_');
};

export const formatLastSeen = (statusObj?: { online?: boolean; lastSeen?: number; state?: string }, fallbackOnline = false) => {
  if (!statusObj) {
    return { text: fallbackOnline ? 'ONLINE' : 'OFFLINE (LAST SEEN RECENTLY)', isOnline: fallbackOnline };
  }
  if (statusObj.online || statusObj.state === 'online') {
    return { text: 'ONLINE', isOnline: true };
  }
  if (!statusObj.lastSeen) {
    return { text: 'OFFLINE (LAST SEEN RECENTLY)', isOnline: false };
  }
  const date = new Date(statusObj.lastSeen);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMin < 1) return { text: 'OFFLINE (LAST SEEN JUST NOW)', isOnline: false };
  if (diffMin < 60) return { text: `OFFLINE (LAST SEEN ${diffMin}M AGO)`, isOnline: false };
  
  const isToday = date.toDateString() === now.toDateString();
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) {
    return { text: `OFFLINE (LAST SEEN TODAY AT ${timeStr})`, isOnline: false };
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return { text: `OFFLINE (LAST SEEN YESTERDAY AT ${timeStr})`, isOnline: false };
  }
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return { text: `OFFLINE (LAST SEEN ${dateStr} AT ${timeStr})`, isOnline: false };
};

export interface EngagementPost {
  id: string;
  title?: string;
  content: string;
  code?: string;
  language?: string;
  imageUrl?: string;
  type: 'code_share' | 'question' | 'collaboration' | 'announcement' | 'event';
  author: MemberProfile;
  upvotes: number;
  reposts: number;
  hasUpvoted?: boolean;
  hasReposted?: boolean;
  comments: { id: string; authorName: string; text: string; time: string; avatarUrl?: string }[];
  time: string;
  eventDate?: string; // Target date for countdowns
  eventTime?: string;
  eventVenue?: string;
}

const CodeSnippet = ({ code, language, onToast }: { code: string; language: string; onToast?: (msg: string) => void; key?: any }) => {
  const [copied, setCopied] = useState(false);

  const getLanguageExtension = (lang: string) => {
    const l = lang.toLowerCase();
    if (l === 'html' || l === 'xml') return [html()];
    if (l === 'css') return [css()];
    return [javascript()]; // default for js, ts, json, etc.
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    if (onToast) onToast('✓ Code snippet copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#0d1117] dark:bg-slate-950/80 overflow-hidden text-left shadow-sm select-text">
      {/* Code Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 select-none">
        <span className="uppercase tracking-wider font-mono">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-500 font-bold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="font-bold">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* CodeMirror Read-only Editor */}
      <div className="text-xs font-mono">
        <CodeMirror
          value={code.trim()}
          theme="dark"
          extensions={[...getLanguageExtension(language), CMEditorView.lineWrapping]}
          editable={false}
          readOnly={true}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            syntaxHighlighting: true,
            bracketMatching: true,
            highlightActiveLine: false,
          }}
        />
      </div>
    </div>
  );
};

export const renderOnlyMentions = (text: string, onToast?: (msg: string) => void) => {
  if (!text) return null;
  const parts = text.split(/(@[a-zA-Z0-9_/.-]+)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('@') && part.length > 1) {
      return (
        <span
          key={`mention-${idx}`}
          onClick={(e) => {
            e.stopPropagation();
            if (onToast) onToast(`Mentioned member: ${part}`);
          }}
          className="text-blue-600 bg-blue-50 hover:bg-blue-100 font-extrabold px-1.5 py-0.5 rounded-md cursor-pointer inline-block mx-0.5 border border-blue-200/60 transition-all shadow-xs"
        >
          {part}
        </span>
      );
    }
    
    // Now handle inline code inside the non-mention part
    if (part.includes('`')) {
      const inlineParts = part.split(/`([^`]+)`/g);
      return inlineParts.map((subPart, subIdx) => {
        if (subIdx % 2 === 1) {
          return (
            <code 
              key={`inline-code-${subIdx}`}
              className="bg-slate-150 dark:bg-slate-900 text-rose-600 dark:text-rose-400 font-mono text-[11px] px-1.5 py-0.5 rounded-md mx-0.5 border border-slate-200 dark:border-slate-800"
            >
              {subPart}
            </code>
          );
        }
        return subPart;
      });
    }
    
    return part;
  });
};

export const renderWithMentions = (text: string, onToast?: (msg: string) => void) => {
  if (!text) return null;
  
  // Split by triple backticks for block code snippet detection
  if (text.includes('```')) {
    const codeParts = text.split(/```/g);
    return codeParts.map((part, index) => {
      const isCodeBlock = index % 2 === 1;
      if (isCodeBlock) {
        let code = part;
        let language = 'code';
        const lines = part.split('\n');
        if (lines.length > 0) {
          const firstLine = lines[0].trim();
          if (firstLine && /^[a-zA-Z0-9+#-]+$/.test(firstLine) && firstLine.length < 15) {
            language = firstLine;
            code = lines.slice(1).join('\n');
          }
        }
        return (
          <CodeSnippet
            key={`code-${index}`}
            code={code}
            language={language}
            onToast={onToast}
          />
        );
      } else {
        return <span key={`text-block-${index}`}>{renderOnlyMentions(part, onToast)}</span>;
      }
    });
  }
  
  return renderOnlyMentions(text, onToast);
};

// Live Event Countdown Timer (Bold and unequivocal)
const EventCountdown: React.FC<{ targetDateStr?: string }> = ({ targetDateStr }) => {
  const getTargetTime = () => {
    if (targetDateStr) {
      const parsed = new Date(targetDateStr).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    // Default fallback: next Wednesday at 2:00 PM EAT
    const now = new Date();
    const target = new Date();
    target.setDate(now.getDate() + ((7 + 3 - now.getDay()) % 7 || 7)); // next Wednesday
    target.setHours(14, 0, 0, 0);
    return target.getTime();
  };

  const targetTime = getTargetTime();
  const [timeLeft, setTimeLeft] = useState(targetTime - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = targetTime - Date.now();
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  if (timeLeft <= 0) {
    return (
      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-extrabold animate-pulse">
        🔴 LIVE / COMPLETED
      </div>
    );
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-800 border-2 border-amber-500/60 font-mono font-extrabold text-[11px] shadow-sm select-none shrink-0" title="Event Countdown Timer">
      <span className="animate-pulse text-amber-600">⏱️</span>
      <span className="uppercase text-[8.5px] text-amber-600 tracking-wider font-bold">Starts in:</span>
      <span className="text-slate-900 bg-amber-50 px-1 py-0.5 rounded font-extrabold text-[10.5px]">{days}d</span>
      <span className="text-slate-900 bg-amber-50 px-1 py-0.5 rounded font-extrabold text-[10.5px]">{hours}h</span>
      <span className="text-slate-900 bg-amber-50 px-1 py-0.5 rounded font-extrabold text-[10.5px]">{minutes}m</span>
      <span className="text-amber-950 bg-amber-200 px-1 py-0.5 rounded font-extrabold text-[10.5px] text-amber-900 animate-none">{seconds}s</span>
    </div>
  );
};

const EventProminentCountdown: React.FC<{ targetDateStr?: string }> = ({ targetDateStr }) => {
  const getTargetTime = () => {
    if (targetDateStr) {
      const parsed = new Date(targetDateStr).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    const now = new Date();
    const target = new Date();
    target.setDate(now.getDate() + ((7 + 3 - now.getDay()) % 7 || 7));
    target.setHours(14, 0, 0, 0);
    return target.getTime();
  };

  const targetTime = getTargetTime();
  const [timeLeft, setTimeLeft] = useState(targetTime - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = targetTime - Date.now();
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  if (timeLeft <= 0) {
    return (
      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-black animate-pulse">
        🔴 EVENT LIVE / IN PROGRESS
      </div>
    );
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="flex items-center gap-2 font-mono font-black text-xs text-slate-100">
      <div className="flex flex-col items-center bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 rounded-lg min-w-[42px]">
        <span className="text-amber-400 text-xs sm:text-sm leading-none">{days}</span>
        <span className="text-[7.5px] text-slate-400 uppercase tracking-widest font-extrabold mt-0.5">Days</span>
      </div>
      <span className="text-amber-500 text-xs sm:text-sm animate-pulse">:</span>
      <div className="flex flex-col items-center bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 rounded-lg min-w-[42px]">
        <span className="text-slate-100 text-xs sm:text-sm leading-none">{hours}</span>
        <span className="text-[7.5px] text-slate-400 uppercase tracking-widest font-extrabold mt-0.5">Hrs</span>
      </div>
      <span className="text-amber-500 text-xs sm:text-sm animate-pulse">:</span>
      <div className="flex flex-col items-center bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 rounded-lg min-w-[42px]">
        <span className="text-slate-100 text-xs sm:text-sm leading-none">{minutes}</span>
        <span className="text-[7.5px] text-slate-400 uppercase tracking-widest font-extrabold mt-0.5">Mins</span>
      </div>
      <span className="text-amber-500 text-xs sm:text-sm animate-pulse">:</span>
      <div className="flex flex-col items-center bg-amber-500/20 border border-amber-500/40 px-2.5 py-1.5 rounded-lg min-w-[42px]">
        <span className="text-amber-400 text-xs sm:text-sm leading-none">{seconds}</span>
        <span className="text-[7.5px] text-amber-400/80 uppercase tracking-widest font-extrabold mt-0.5">Secs</span>
      </div>
    </div>
  );
};

interface ChatViewProps {
  channels: any[];
  chatHistory: Record<string, any[]>;
  onSendMessage: (channelId: string, text: string) => void;
  onToast: (msg: string) => void;
  onOpenMobileDrawer?: () => void;
  onRewardXP?: (amount: number, type: 'checkin' | 'engagement' | 'learning' | 'contribution', customMessage?: string) => void;
  allUsers?: AppUser[];
  currentUser?: AppUser | null;
  initialDMUserUid?: string | null;
  onClearInitialDMUser?: () => void;
  onViewProfile?: (profile: MemberProfile) => void;
  onViewModeChange?: (mode: 'timeline' | 'messages') => void;
}

export const DEFAULT_POSTS: EngagementPost[] = [
  {
    id: 'post_1',
    title: 'Optimizing State in React Custom Hooks',
    content: 'Hey guys, wrote a super clean hook for managing localStorage states safely in React without memory leaks or unnecessary HMR triggers. This avoids double mount flash loads too! Let me know if you run into any dependency loops. 🚀',
    type: 'code_share',
    language: 'typescript',
    code: `// Custom LocalStorage hook in React\nexport function useLocalStorage<T>(key: string, initialValue: T) {\n  const [storedValue, setStoredValue] = useState<T>(() => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item ? JSON.parse(item) : initialValue;\n    } catch (error) {\n      return initialValue;\n    }\n  });\n\n  const setValue = (value: T | ((val: T) => T)) => {\n    try {\n      const valueToStore = value instanceof Function ? value(storedValue) : value;\n      setStoredValue(valueToStore);\n      window.localStorage.setItem(key, JSON.stringify(valueToStore));\n    } catch (error) {\n      console.log(error);\n    }\n  };\n\n  return [storedValue, setValue] as const;\n}`,
    author: {
      name: 'Mike O.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      regNumber: 'BCS/2025/1102',
      specialty: 'Fullstack TypeScript Developer',
      bio: 'TypeScript and Node.js geek 🚀 | Building fast server systems',
      techStack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
      streakDays: 18,
      points: 420,
      portfolioItems: [
        { name: 'Express_Server_Boilerplate.zip', category: 'Web Development' },
        { name: 'SQLite Database Wrapper', category: 'Database Systems' }
      ]
    },
    upvotes: 24,
    reposts: 5,
    hasUpvoted: false,
    hasReposted: false,
    comments: [
      { id: 'c1', authorName: 'Alex M.', text: 'This is brilliant! Solving state flash loads is critical. Using this in my project.', time: '2 hrs ago', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
      { id: 'c2', authorName: 'David K.', text: 'Extremely clean code, Mike! Perfect use of lazy initialization.', time: '1 hr ago', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' }
    ],
    time: '3 hours ago'
  },
  {
    id: 'post_2',
    title: 'iOS Form Input Sizing UX Best Practices?',
    content: 'Working on the upcoming Hackathon registration mobile layouts. Should form inputs default to 16px font-size on iOS to prevent auto-zooming, or stick to 14px with responsive scale? What are your thoughts on modern touch guidelines?',
    type: 'question',
    author: {
      name: 'David K.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      regNumber: 'BIT/2024/4921',
      specialty: 'UI/UX Design Lead',
      bio: 'Designing the future ✨ | Figma expert & iOS design guidelines',
      techStack: ['Figma', 'CSS/Tailwind', 'Mobile UX', 'Wireframing', 'Prototyping'],
      streakDays: 24,
      points: 650,
      portfolioItems: [
        { name: 'Figma UI Kit - Club Assets 2026', category: 'Web Development' },
        { name: 'Mobile UX Design Principles.pdf', category: 'Design Resources' }
      ]
    },
    upvotes: 19,
    reposts: 2,
    hasUpvoted: false,
    hasReposted: false,
    comments: [
      { id: 'c3', authorName: 'Mike O.', text: 'Always use 16px font size on inputs for iOS! Standard iOS Safari behavior zooms in aggressively if it is < 16px, which destroys layout.', time: 'Yesterday', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' }
    ],
    time: 'Yesterday'
  },
  {
    id: 'post_3',
    title: 'Quick Gemini SDK Text Streaming Snippet',
    content: 'Check out how easy it is to stream text using the modern @google/genai SDK in a Node.js backend. Keep keys hidden on the server, utilize lazy SDK clients, and yield clean chunks! ✦',
    type: 'code_share',
    language: 'javascript',
    code: `import { GoogleGenAI } from "@google/genai";\n\nconst ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });\nconst response = await ai.models.generateContentStream({\n  model: 'gemini-2.5-flash',\n  contents: 'Write a club announcement about Hackathon 2026',\n});\nfor await (const chunk of response) {\n  process.stdout.write(chunk.text);\n}`,
    author: {
      name: 'Joy Muthoni',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      regNumber: 'BIT/2025/3091',
      specialty: 'AI Student Coordinator',
      bio: 'Machine Learning enthusiast | Prompt engineer & Python developer',
      techStack: ['Python', 'TensorFlow', 'Gemini API', 'Node.js', 'Google Cloud'],
      streakDays: 14,
      points: 310,
      portfolioItems: [
        { name: 'Intro_to_Python_DataScience.pdf', category: 'AI & Data Science' },
        { name: 'TensorFlow Campus Workshop Lab', category: 'AI & Data Science' }
      ]
    },
    upvotes: 31,
    reposts: 12,
    hasUpvoted: false,
    hasReposted: false,
    comments: [
      { id: 'c4', authorName: 'Prof. J. Ndegwa', text: 'Excellent demonstration, Joy. Modern SDKs are far more efficient than the legacy ones.', time: 'Yesterday', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' }
    ],
    time: 'Yesterday'
  },
  {
    id: 'post_announcement_1',
    title: 'OFFICIAL ANNOUNCEMENT: Annual Web Hackathon 2026',
    content: 'ATTENTION ALL MEMBERS: The </AdvocoDe> Annual Web Development Hackathon has been officially scheduled! Registration is now open on the portal. Student groups must design a responsive workspace utilizing clean states and optimized layout workflows. All are welcome to participate!',
    type: 'announcement',
    author: {
      name: 'Prof. J. Ndegwa',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      regNumber: 'BIT/Patron/101',
      specialty: 'IT Department Patron',
      bio: 'Advising </AdvocoDe> projects and hackathon setups',
      techStack: ['Web Architecture', 'Database Engineering', 'Systems Analysis'],
      streakDays: 100,
      points: 1200,
      portfolioItems: [
        { name: 'Syllabus - BIT 3105 Web Programming.pdf', category: 'Design Resources' }
      ]
    },
    upvotes: 45,
    reposts: 28,
    hasUpvoted: false,
    hasReposted: false,
    comments: [
      { id: 'ca1', authorName: 'Mike O.', text: 'This is huge! My team is already drafting an interactive compiler model.', time: '12 hrs ago' },
      { id: 'ca2', authorName: 'David K.', text: 'Is registration open to Year 1 students? I would love to mentor them.', time: '8 hrs ago' }
    ],
    time: '2 days ago'
  },
  {
    id: 'post_event_1',
    title: 'UPCOMING WORKSHOP: Live CSS Grid & Flexbox Lab',
    content: 'SAVE THE DATE: Next Wednesday at 2:00 PM (EAT) in Tech Lab 4B! We will run an immersive peer coding session where we demonstrate advanced alignment, responsive touch guidelines, and custom interactive components. Bring your laptops and lets code live!',
    type: 'event',
    author: {
      name: 'Joy Muthoni',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      regNumber: 'BIT/2025/3091',
      specialty: 'AI Student Coordinator',
      bio: 'Machine Learning enthusiast | Prompt engineer & Python developer',
      techStack: ['Python', 'TensorFlow', 'Gemini API', 'Node.js', 'Google Cloud'],
      streakDays: 14,
      points: 310,
      portfolioItems: []
    },
    upvotes: 38,
    reposts: 15,
    hasUpvoted: false,
    hasReposted: false,
    eventDate: '2026-07-15',
    eventTime: '14:00 (EAT)',
    eventVenue: 'MKU Tech Lab 4B & Online Stream',
    comments: [
      { id: 'ce1', authorName: 'David K.', text: 'Count me in! I will bring the UX wireframe diagrams.', time: '1 day ago' }
    ],
    time: '3 days ago'
  }
];

export const ChatView: React.FC<ChatViewProps> = ({
  channels,
  chatHistory,
  onSendMessage,
  onToast,
  onOpenMobileDrawer,
  onRewardXP,
  allUsers,
  currentUser: propUser,
  initialDMUserUid,
  onClearInitialDMUser,
  onViewProfile,
  onViewModeChange,
}) => {
  const [posts, setPosts] = useState<EngagementPost[]>([]);
  const [currentUserState, setCurrentUserState] = useState<any>(null);
  const currentUser = propUser || currentUserState;

  // Search filter query state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Compose Post state
  const [composeText, setComposeText] = useState('');
  const [composeTitle, setComposeTitle] = useState('');
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [composeCode, setComposeCode] = useState('');
  const [composeLanguage, setComposeLanguage] = useState('typescript');
  const [composeCategory, setComposeCategory] = useState<'code_share' | 'question' | 'collaboration' | 'announcement' | 'event'>('code_share');
  const [composeImageUrl, setComposeImageUrl] = useState('');
  const [uploadingPostImage, setUploadingPostImage] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventVenue, setEventVenue] = useState('');

  // Mention autocomplete state
  const [mentionFilter, setMentionFilter] = useState<string | null>(null);
  const [mentionTarget, setMentionTarget] = useState<'post' | 'dm' | 'comment' | null>(null);

  const handlePostImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPostImage(true);
      onToast('⏳ Uploading image to cloud storage...');
      const url = await uploadToImgBB(file);
      setComposeImageUrl(url);
      onToast('✓ Image attached via cloud storage!');
    } catch (err: any) {
      console.error(err);
      onToast(`Image upload failed: ${err.message}`);
    } finally {
      setUploadingPostImage(false);
    }
  };

  const checkMentionTrigger = (val: string, target: 'post' | 'dm' | 'comment') => {
    const match = val.match(/@([a-zA-Z0-9_.-]*)$/);
    if (match) {
      setMentionFilter(match[1].toLowerCase());
      setMentionTarget(target);
    } else if (mentionTarget === target) {
      setMentionFilter(null);
      setMentionTarget(null);
    }
  };

  const handleSelectMention = (username: string) => {
    if (mentionTarget === 'post') {
      setComposeText(prev => prev.replace(/@([a-zA-Z0-9_.-]*)$/, `${username} `));
    } else if (mentionTarget === 'dm') {
      setActiveDMInput(prev => prev.replace(/@([a-zA-Z0-9_.-]*)$/, `${username} `));
    } else if (mentionTarget === 'comment') {
      setNewCommentText(prev => prev.replace(/@([a-zA-Z0-9_.-]*)$/, `${username} `));
    }
    setMentionFilter(null);
    setMentionTarget(null);
  };

  // Comment sub-panel expansion state
  const [expandedCommentPostId, setExpandedCommentPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  // Bio Modal trigger states
  const [bioProfile, setBioProfile] = useState<MemberProfile | null>(null);
  const [isBioOpen, setIsBioOpen] = useState(false);

  // Copied states
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  // Direct Message states
  const [activeDMMember, setActiveDMMember] = useState<string | null>(null);
  const [isDMWidgetExpanded, setIsDMWidgetExpanded] = useState(false);
  const [chatViewMode, setChatViewMode] = useState<'timeline' | 'messages'>('timeline');

  // Sync chat view mode with parent listener
  useEffect(() => {
    if (onViewModeChange) {
      onViewModeChange(chatViewMode);
    }
  }, [chatViewMode, onViewModeChange]);
  const dmTextareaRef = useRef<HTMLTextAreaElement>(null);
  const lastKnownMsgIdsRef = useRef<Set<string>>(new Set());
  const isInitialPostsLoaded = useRef(false);
  const loadedPostIdsRef = useRef<Set<string>>(new Set());
  const userCommentsCountRef = useRef<Record<string, number>>({});
  const userUpvotesCountRef = useRef<Record<string, number>>({});
  const [dmSearchText, setDmSearchText] = useState('');
  const [activeDMInput, setActiveDMInput] = useState('');
  const [replyingToMessage, setReplyingToMessage] = useState<any | null>(null);
  const [swipedMessageId, setSwipedMessageId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const [activeContextMenu, setActiveContextMenu] = useState<{ messageId: string, x: number, y: number } | null>(null);

  const touchHoldTimerRef = useRef<any>(null);
  const mouseHoldTimerRef = useRef<any>(null);
  const lastTouchTap = useRef<number>(0);
  const touchStartCoords = useRef<{ x: number, y: number } | null>(null);
  const [showAddContactDropdown, setShowAddContactDropdown] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<Record<string, boolean>>({});
  const [promptIndex, setPromptIndex] = useState(() => Math.floor(Math.random() * DYNAMIC_POST_PROMPTS.length));
  const [explicitChatIds, setExplicitChatIds] = useState<string[]>([]);
  const [userStatuses, setUserStatuses] = useState<Record<string, any>>({});
  const [allRtdbChats, setAllRtdbChats] = useState<{ community: any[]; saved: any[]; direct: Record<string, any[]> }>({ community: [], saved: [], direct: {} });

  // Unread message tracking state and local storage persistence
  const [lastReadTimestamps, setLastReadTimestamps] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('advocode_last_read_times');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Handle auto DM opening from initialDMUserUid (e.g. from scanning Member Verification Badge)
  useEffect(() => {
    if (initialDMUserUid) {
      const targetUserObj = allUsers?.find(u => u.uid === initialDMUserUid);
      if (targetUserObj) {
        const rtdbKey = getUserRtdbKey(targetUserObj);
        setExplicitChatIds(prev => Array.from(new Set([...prev, rtdbKey, targetUserObj.name].filter(Boolean))));
        setActiveDMMember(rtdbKey);
        setChatViewMode('messages');
        setIsDMWidgetExpanded(false);
        onToast(`Opened direct message conversation with ${targetUserObj.name}`);
      } else {
        const fallbackKey = initialDMUserUid.toLowerCase().replace(/[.#$[\]/]/g, '_').replace(/\s+/g, '_');
        setExplicitChatIds(prev => Array.from(new Set([...prev, fallbackKey].filter(Boolean))));
        setActiveDMMember(fallbackKey);
        setChatViewMode('messages');
        setIsDMWidgetExpanded(false);
      }
      if (onClearInitialDMUser) {
        onClearInitialDMUser();
      }
    }
  }, [initialDMUserUid, allUsers, onClearInitialDMUser]);

  // Mark currently active chat as read
  useEffect(() => {
    if (chatViewMode === 'messages' && activeDMMember) {
      setLastReadTimestamps(prev => {
        const next = { ...prev, [activeDMMember]: Date.now() };
        localStorage.setItem('advocode_last_read_times', JSON.stringify(next));
        return next;
      });
    }
  }, [chatViewMode, activeDMMember, allRtdbChats]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIndex(prev => (prev + 1) % DYNAMIC_POST_PROMPTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Alphabetically arranged member list from the forum
  const FORUM_MEMBERS = [
    {
      name: 'Joy Muthoni',
      username: '@joy_m',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      online: true,
      messages: [
        { id: 'j1', sender: 'them', text: 'Hey there! Let me know if you want to test out some Python scripts or Gemini prompt structures.', time: '11:00 AM', hearted: false, reactions: [] }
      ]
    },
    {
      name: 'Mike O.',
      username: '@mike_dev',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      online: true,
      messages: [
        { id: '4', sender: 'them', text: 'Dude, the compiler preview works so fast now! No containers or sandboxes lagging it.', time: 'Yesterday', hearted: false, reactions: [] },
        { id: '5', sender: 'me', text: 'Yeah, we removed the padding. Now it is full screen!', time: 'Yesterday', hearted: true, reactions: ['🔥', '👏'] }
      ]
    },
    {
      name: 'Prof. J. Ndegwa',
      username: '@ndegwa_patron',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      online: false,
      messages: [
        { id: '6', sender: 'them', text: 'Hello, please submit your final web lab report before Friday midnight.', time: '2 days ago', hearted: false, reactions: [] }
      ]
    },
    {
      name: 'David K.',
      username: '@david_ux',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      online: true,
      messages: [
        { id: '1', sender: 'them', text: 'Hey there! Did you check out the new tutorials in the learning center?', time: '10:14 AM', hearted: false, reactions: [] },
        { id: '2', sender: 'me', text: 'Hey David! Yes, just loaded the HTML Basics. It is super clean!', time: '10:16 AM', hearted: true, reactions: ['❤️'] },
        { id: '3', sender: 'them', text: 'Awesome! Let me know if you want to collaborate on the landing page layout.', time: '10:18 AM', hearted: false, reactions: [] }
      ]
    }
  ];

  const sanitizeRtdbKey = (str?: string) => getUserRtdbKey(str);
  const myId = getUserRtdbKey(currentUser || auth.currentUser);

  // 1. Presence & Status Tracking
  useEffect(() => {
    if (!myId || myId === 'guest') return;
    const myStatusRef = ref(rtdb, `/status/${myId}`);
    const connectedRef = ref(rtdb, ".info/connected");
    const unsubConnected = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        onDisconnect(myStatusRef).set({
          online: false,
          lastSeen: Date.now(),
          state: 'offline'
        }).then(() => {
          set(myStatusRef, {
            online: true,
            lastSeen: Date.now(),
            state: 'online'
          });
        });
      }
    });

    const statusRef = ref(rtdb, `/status`);
    const unsubStatus = onValue(statusRef, (snap) => {
      setUserStatuses(snap.val() || {});
    });

    return () => {
      unsubConnected();
      unsubStatus();
    };
  }, [myId]);

  const triggerNotificationChime = () => {
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
    } catch (e) {
      console.warn("Audio chime context blocked by browser autoplay policy", e);
    }
  };

  // 2. Global RTDB messages listener
  useEffect(() => {
    const chatsRef = ref(rtdb, 'chats');
    const unsubscribeChats = onValue(chatsRef, (snapshot) => {
      const allVal = snapshot.val() || {};
      const directMap: Record<string, any[]> = {};
      let communityMsgs: any[] = [];
      let savedMsgs: any[] = [];

      Object.entries(allVal).forEach(([roomKey, roomData]: [string, any]) => {
        if (!roomData || typeof roomData !== 'object') return;
        const msgList = Object.entries(roomData).map(([k, v]: [string, any]) => {
          const isMe = v.senderId ? (v.senderId === myId) : (v.sender === 'me' || v.senderName === currentUser?.name);
          
          // Track for working live notification channel
          if (k && typeof k === 'string') {
            const isNew = !lastKnownMsgIdsRef.current.has(k);
            lastKnownMsgIdsRef.current.add(k);
            
            const isRealtime = (Date.now() - (v.timestamp || 0)) < 15000;
            if (isNew && isRealtime && !isMe) {
              const notifChatsEnabled = localStorage.getItem('advocode_notif_chats') !== 'false';
              if (notifChatsEnabled) {
                triggerNotificationChime();
                const senderLabel = v.senderName || 'Club Member';
                const bodyLabel = v.text || '';
                const preview = bodyLabel.length > 45 ? bodyLabel.substring(0, 45) + '...' : bodyLabel;
                onToast(`💬 New Chat from ${senderLabel}: "${preview}"`);
              }
            }
          }

          return {
            id: k,
            ...v,
            sender: isMe ? 'me' : 'them'
          };
        }).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

        if (roomKey === 'community_chat') {
          communityMsgs = msgList;
          return;
        }
        if (roomKey === `saved_messages_${myId}` || roomKey === 'saved_messages') {
          savedMsgs = msgList;
          return;
        }

        const partsTriple = roomKey.split('___');
        const partsSingle = roomKey.split('_');
        let otherId: string | null = null;
        let otherName: string | null = null;

        if (partsTriple.length === 2 && partsTriple.includes(myId)) {
          otherId = partsTriple[0] === myId ? partsTriple[1] : partsTriple[0];
        } else if (partsSingle.length >= 2) {
          const involveMe = msgList.some(m => m.senderId === myId || m.receiverId === myId || m.senderName === currentUser?.name || m.receiverName === currentUser?.name);
          if (involveMe) {
            const firstOtherMsg = msgList.find(m => m.senderId && m.senderId !== myId) || msgList.find(m => m.receiverId && m.receiverId !== myId);
            if (firstOtherMsg) {
              otherId = firstOtherMsg.senderId === myId ? firstOtherMsg.receiverId : firstOtherMsg.senderId;
              otherName = firstOtherMsg.senderId === myId ? firstOtherMsg.receiverName : firstOtherMsg.senderName;
            } else if (partsSingle.includes(myId)) {
              otherId = partsSingle.find(p => p !== myId) || null;
            }
          }
        }

        if (otherId) {
          directMap[otherId] = msgList;
          if (otherName) {
            directMap[`name_${otherName.toLowerCase()}`] = msgList;
          }
        }
      });

      setAllRtdbChats({
        community: communityMsgs,
        saved: savedMsgs,
        direct: directMap
      });
    });

    return () => unsubscribeChats();
  }, [myId, currentUser?.name]);

  // Combined available members list for '+' dropdown
  const allAvailableMembers = React.useMemo(() => {
    const map: Record<string, any> = {};
    FORUM_MEMBERS.forEach(m => {
      const key = getUserRtdbKey(m.name);
      const st = userStatuses[key] || userStatuses[getUserRtdbKey(m.name)];
      const { text, isOnline } = formatLastSeen(st, m.online);
      map[key] = {
        id: key,
        memberName: m.name,
        name: m.name,
        username: m.username,
        avatarUrl: m.avatarUrl,
        online: isOnline,
        statusText: text,
        defaultMessages: m.messages || []
      };
    });
    if (allUsers) {
      allUsers.forEach(u => {
        const key = getUserRtdbKey(u);
        if (key === myId && myId !== 'guest') return;
        const st = userStatuses[key] || userStatuses[getUserRtdbKey(u.name)];
        const { text, isOnline } = formatLastSeen(st, true);
        map[key] = {
          id: key,
          memberName: u.name,
          name: u.name,
          username: u.username || ('@' + getUserRtdbKey(u.email?.split('@')[0] || u.name)),
          avatarUrl: u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=2563EB&color=fff`,
          online: isOnline,
          statusText: text,
          defaultMessages: []
        };
      });
    }
    return Object.values(map);
  }, [allUsers, userStatuses, myId]);

  // Compute established chats for Chat Home
  const dmChats = React.useMemo(() => {
    const communityChat = {
      id: 'community_chat',
      memberName: '🌐 </AdvocoDe> Community Chat',
      username: '@everyone • Public Club Channel',
      avatarUrl: 'https://ui-avatars.com/api/?name=Community+Chat&background=008069&color=fff',
      online: true,
      statusText: 'ALL MEMBERS ONLINE',
      messages: allRtdbChats.community.length > 0 ? allRtdbChats.community : [
        { id: 'c_welcome', sender: 'them', senderName: 'AdvocoDe Bot', text: 'Welcome to the </AdvocoDe> Community Chat! All club members can contribute and talk here.', time: 'Now' }
      ]
    };

    const savedChat = {
      id: 'saved_messages',
      memberName: 'Saved Messages (Notes)',
      username: '@me • Personal Scratchpad',
      avatarUrl: 'https://ui-avatars.com/api/?name=Saved+Messages&background=6366F1&color=fff',
      online: true,
      statusText: 'PERSONAL NOTES',
      messages: allRtdbChats.saved
    };

    const established: any[] = [];
    allAvailableMembers.forEach(m => {
      const msgs = allRtdbChats.direct[m.id] || allRtdbChats.direct[`name_${m.name.toLowerCase()}`] || [];
      const hasRealMsgs = msgs.length > 0;
      const isExplicit = explicitChatIds.includes(m.id) || explicitChatIds.includes(m.name);
      if (hasRealMsgs || isExplicit || (m.defaultMessages.length > 0 && isExplicit)) {
        established.push({
          id: m.id,
          memberName: m.name,
          username: m.username,
          avatarUrl: m.avatarUrl,
          online: m.online,
          statusText: m.statusText,
          messages: hasRealMsgs ? msgs : m.defaultMessages
        });
      }
    });

    established.sort((a, b) => {
      const timeA = a.messages.length > 0 ? (a.messages[a.messages.length - 1].timestamp || 0) : 0;
      const timeB = b.messages.length > 0 ? (b.messages[b.messages.length - 1].timestamp || 0) : 0;
      return timeB - timeA;
    });

    return [communityChat, savedChat, ...established];
  }, [allAvailableMembers, allRtdbChats, explicitChatIds]);

  const totalUnreadCount = React.useMemo(() => {
    let count = 0;
    dmChats.forEach(chat => {
      if (chatViewMode === 'messages' && activeDMMember === chat.id) return;
      const lastRead = lastReadTimestamps[chat.id] || 0;
      const chatMsgs = chat.messages || [];
      const unreadInChat = chatMsgs.filter((m: any) => {
        if (m.sender === 'me' || m.senderId === myId) return false;
        const msgTs = m.timestamp || 0;
        return msgTs > lastRead;
      }).length;
      count += unreadInChat;
    });
    return count;
  }, [dmChats, lastReadTimestamps, chatViewMode, activeDMMember, myId]);

  const handleAddOrOpenChat = (member: any) => {
    setExplicitChatIds(prev => Array.from(new Set([...prev, member.id, member.name, member.memberName].filter(Boolean))));
    setActiveDMMember(member.id);
    setShowAddContactDropdown(false);
    onToast(`Started a chat with ${member.name || member.memberName}!`);
  };

  const rtdbMessages = React.useMemo(() => {
    if (!activeDMMember) return [];
    if (activeDMMember === 'community_chat') return allRtdbChats.community;
    if (activeDMMember === 'saved_messages') return allRtdbChats.saved;
    const activeChat = dmChats.find(c => c.id === activeDMMember || c.memberName === activeDMMember || c.memberName.toLowerCase() === (activeDMMember || '').toLowerCase());
    return allRtdbChats.direct[activeChat?.id || getUserRtdbKey(activeDMMember)] || allRtdbChats.direct[`name_${(activeDMMember || '').toLowerCase()}`] || activeChat?.messages || [];
  }, [activeDMMember, allRtdbChats, dmChats]);

  // Mark incoming messages as read when active chat is open
  useEffect(() => {
    if (chatViewMode === 'messages' && activeDMMember && rtdbMessages && rtdbMessages.length > 0) {
      const activeChat = dmChats.find(c => c.id === activeDMMember || c.memberName === activeDMMember || c.memberName.toLowerCase() === (activeDMMember || '').toLowerCase());
      const chatIdToUse = activeChat?.id || activeDMMember || '';
      const roomKey = getRtdbRoomKey(chatIdToUse);

      rtdbMessages.forEach((m: any) => {
        if (m.sender === 'them' && m.status !== 'read') {
          const msgStatusRef = ref(rtdb, `chats/${roomKey}/${m.id}/status`);
          set(msgStatusRef, 'read').catch(() => {});
        }
      });
    }
  }, [chatViewMode, activeDMMember, rtdbMessages, dmChats, myId]);

  const handleSendDM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDMInput.trim() || !activeDMMember) return;

    const userMsgText = activeDMInput.trim();
    setActiveDMInput('');
    if (dmTextareaRef.current) {
      dmTextareaRef.current.style.height = '38px';
    }
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowTs = Date.now();

    const replyContext = replyingToMessage ? {
      senderName: replyingToMessage.senderName || 'Member',
      text: replyingToMessage.text,
      id: replyingToMessage.id
    } : null;

    setReplyingToMessage(null);

    if (activeDMMember === 'community_chat') {
      push(ref(rtdb, `chats/community_chat`), {
        sender: 'me',
        senderId: myId,
        senderName: currentUser?.name || auth.currentUser?.displayName || 'Me',
        senderAvatar: currentUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'Alex')}&background=2563EB&color=fff`,
        text: userMsgText,
        time: nowTime,
        timestamp: nowTs,
        hearted: false,
        reactions: [],
        status: 'read',
        replyTo: replyContext
      });
      if (onRewardXP) onRewardXP(5, 'engagement', 'Posting in Community Chat');
      return;
    }

    if (activeDMMember === 'saved_messages') {
      push(ref(rtdb, `chats/saved_messages_${myId}`), {
        sender: 'me',
        senderId: myId,
        senderName: 'Me',
        text: userMsgText,
        time: nowTime,
        timestamp: nowTs,
        hearted: false,
        reactions: [],
        status: 'read',
        replyTo: replyContext
      });
      return;
    }

    const activeChat = dmChats.find(c => c.id === activeDMMember || c.memberName === activeDMMember || c.memberName.toLowerCase() === (activeDMMember || '').toLowerCase());
    const targetId = activeChat ? activeChat.id : getUserRtdbKey(activeDMMember);
    const targetName = activeChat ? activeChat.memberName : activeDMMember;
    const chatId = [myId, targetId].sort().join('___');

    const newMsgRef = push(ref(rtdb, `chats/${chatId}`), {
      sender: 'me',
      senderId: myId,
      senderName: currentUser?.name || auth.currentUser?.displayName || 'Me',
      senderAvatar: currentUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'Alex')}&background=2563EB&color=fff`,
      receiverId: targetId,
      receiverName: targetName,
      text: userMsgText,
      time: nowTime,
      timestamp: nowTs,
      hearted: false,
      reactions: [],
      status: 'sent',
      replyTo: replyContext
    });

    const msgKey = newMsgRef.key;
    if (msgKey) {
      setTimeout(() => {
        const statusRef = ref(rtdb, `chats/${chatId}/${msgKey}/status`);
        set(statusRef, 'delivered').catch(() => {});
        
        setTimeout(() => {
          set(statusRef, 'read').catch(() => {});
        }, 1500);
      }, 800);
    }

    if (onRewardXP) {
      onRewardXP(5, 'engagement', 'Sending a Direct Message');
    }
  };

  const getRtdbRoomKey = (cId: string) => {
    if (cId === 'community_chat') return 'community_chat';
    if (cId === 'saved_messages') return `saved_messages_${myId}`;
    return [myId, cId].sort().join('___');
  };



  const handleAddReaction = (chatId: string, messageId: string, emoji: string) => {
    const roomKey = getRtdbRoomKey(chatId);
    const msgRef = ref(rtdb, `chats/${roomKey}/${messageId}`);
    const legacyRoomKey = [myId, chatId].sort().join('_');
    const legacyRef = ref(rtdb, `chats/${legacyRoomKey}/${messageId}`);

    const currentMsg = rtdbMessages.find(m => m.id === messageId);
    if (!currentMsg) return;

    const currentReactionUsers = currentMsg.reactionUsers || {};
    const existingEmoji = currentReactionUsers[myId];

    const nextReactionUsers = { ...currentReactionUsers };
    if (existingEmoji === emoji) {
      delete nextReactionUsers[myId];
    } else {
      nextReactionUsers[myId] = emoji;
    }

    const nextReactions = Array.from(new Set(Object.values(nextReactionUsers))) as string[];

    update(msgRef, {
      reactionUsers: nextReactionUsers,
      reactions: nextReactions
    }).catch(() => {});

    if (roomKey !== legacyRoomKey) {
      update(legacyRef, {
        reactionUsers: nextReactionUsers,
        reactions: nextReactions
      }).catch(() => {});
    }

    if (existingEmoji !== emoji) {
      onToast(`Reacted with ${emoji}! +5 XP`);
      if (onRewardXP) onRewardXP(5, 'engagement', `Reacting with ${emoji}`);
    } else {
      onToast(`Removed reaction`);
    }
  };

  const handleDeleteMessage = (chatId: string, messageId: string) => {
    const roomKey = getRtdbRoomKey(chatId);
    const msgRef = ref(rtdb, `chats/${roomKey}/${messageId}`);
    const legacyRoomKey = [myId, chatId].sort().join('_');
    const legacyRef = ref(rtdb, `chats/${legacyRoomKey}/${messageId}`);

    set(msgRef, null)
      .then(() => {
        onToast('Message deleted successfully');
      })
      .catch((err) => {
        onToast(`Failed to delete message: ${err.message}`);
      });

    if (roomKey !== legacyRoomKey) {
      set(legacyRef, null).catch(() => {});
    }
  };

  // Keyboard navigation reference
  const timelineRef = useRef<HTMLDivElement>(null);

  // Load user & posts
  useEffect(() => {
    // Current user loaded from auth or sessionStorage
    const uData = sessionStorage.getItem('mku_it_user');
    if (uData) {
      try {
        setCurrentUserState(JSON.parse(uData));
      } catch (e) {}
    } else if (auth.currentUser) {
      setCurrentUserState({
        name: auth.currentUser.displayName || 'Alex M.',
        avatarUrl: auth.currentUser.photoURL,
        regNumber: 'BIT/2024/001',
        bio: 'Student Member • Year 3 | React & Tailwind developer',
        skills: ['React', 'TypeScript', 'Tailwind CSS']
      });
    } else {
      // Fallback
      setCurrentUserState({
        name: 'Alex M.',
        regNumber: 'BIT/2024/001',
        bio: 'Student Member • Year 3 | React & Tailwind developer',
        skills: ['React', 'TypeScript', 'Tailwind CSS']
      });
    }

    // Posts loaded from Firestore DB
    const postsQuery = query(collection(db, "posts"), orderBy("timeMs", "desc"));
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const loadedPosts: EngagementPost[] = [];
      let newPostDetected: EngagementPost | null = null;
      
      const storedUser = sessionStorage.getItem('advocode_user');
      const myName = storedUser ? JSON.parse(storedUser).name : 'Alex M.';

      snapshot.forEach((docSnap) => {
        const postItem = { id: docSnap.id, ...docSnap.data() } as EngagementPost;
        loadedPosts.push(postItem);

        const isMyPost = postItem.author?.name && postItem.author.name.toLowerCase() === myName.toLowerCase();

        if (isInitialPostsLoaded.current) {
          if (!loadedPostIdsRef.current.has(docSnap.id)) {
            const authorName = postItem.author?.name || '';
            if (authorName && authorName.toLowerCase() !== myName.toLowerCase()) {
              newPostDetected = postItem;
            }
          } else if (isMyPost) {
            // Check for new comments/replies
            const prevCommentCount = userCommentsCountRef.current[postItem.id];
            const currentCommentCount = postItem.comments ? postItem.comments.length : 0;
            if (prevCommentCount !== undefined && currentCommentCount > prevCommentCount) {
              const lastComment = postItem.comments[postItem.comments.length - 1];
              if (lastComment && lastComment.authorName.toLowerCase() !== myName.toLowerCase()) {
                triggerNotificationChime();
                onToast(`💬 ${lastComment.authorName} replied on your post: "${lastComment.text.substring(0, 30)}..."`);
              }
            }

            // Check for new upvotes
            const prevUpvoteCount = userUpvotesCountRef.current[postItem.id];
            const currentUpvoteCount = postItem.upvotes || 0;
            if (prevUpvoteCount !== undefined && currentUpvoteCount > prevUpvoteCount) {
              triggerNotificationChime();
              onToast(`💖 Someone liked your post: "${postItem.title || postItem.content.substring(0, 30)}..."`);
            }
          }
        }
        loadedPostIdsRef.current.add(docSnap.id);
        
        // Cache counts for comparison
        userCommentsCountRef.current[postItem.id] = postItem.comments ? postItem.comments.length : 0;
        userUpvotesCountRef.current[postItem.id] = postItem.upvotes || 0;
      });

      setPosts(loadedPosts);
      isInitialPostsLoaded.current = true;

      if (newPostDetected) {
        triggerNotificationChime();
        const categoryLabel = newPostDetected.type === 'event' 
          ? '📅 New Event' 
          : newPostDetected.type === 'announcement' 
          ? '📢 New Announcement' 
          : '📝 New Post';
        onToast(`🔔 ${categoryLabel} from ${newPostDetected.author.name}: "${newPostDetected.title || newPostDetected.content.substring(0, 35)}..."`);
      }
    }, (err) => {
      console.error("Error loading posts from Firestore:", err);
    });
    return () => unsubscribe();
  }, []);

  const seedInitialPostsToFirestore = async () => {
    try {
      for (const p of DEFAULT_POSTS) {
        const { id, ...postData } = p;
        let timeOffset = 0;
        if (p.time.includes('3 hours')) {
          timeOffset = 3 * 3600000;
        } else if (p.time.toLowerCase().includes('yesterday')) {
          timeOffset = 24 * 3600000;
        } else if (p.time.toLowerCase().includes('2 days')) {
          timeOffset = 48 * 3600000;
        } else if (p.time.toLowerCase().includes('3 days')) {
          timeOffset = 72 * 3600000;
        } else {
          timeOffset = Math.floor(Math.random() * 3600000);
        }
        await addDoc(collection(db, "posts"), {
          ...postData,
          timeMs: Date.now() - timeOffset
        });
      }
      onToast("Seeded sample community posts to Firestore!");
    } catch (err: any) {
      console.error(err);
      onToast(`Error seeding posts: ${err.message}`);
    }
  };

  const savePostsToStorage = (updated: EngagementPost[]) => {
    setPosts(updated);
  };

  // Compose submit
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeText.trim()) return;

    const authorProfile: MemberProfile = {
      name: currentUser?.name || 'Alex M.',
      avatarUrl: currentUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'Alex')}&background=2563EB&color=fff`,
      regNumber: currentUser?.regNumber || 'BIT/2024/001',
      specialty: 'Student Member',
      bio: currentUser?.bio || 'Year 3 Student • IT Hub companion developer',
      techStack: currentUser?.skills || ['React', 'TypeScript', 'Tailwind CSS'],
      streakDays: 1,
      points: 10,
      portfolioItems: []
    };

    const newPostData: any = {
      title: composeTitle.trim() ? composeTitle.trim() : null,
      content: composeText.trim(),
      type: composeCategory,
      author: authorProfile,
      upvotes: 0,
      reposts: 0,
      hasUpvoted: false,
      hasReposted: false,
      comments: [],
      time: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timeMs: Date.now()
    };

    if (showCodeForm && composeCode.trim()) {
      newPostData.code = composeCode.trim();
      newPostData.language = composeLanguage;
    }

    if (composeImageUrl) {
      newPostData.imageUrl = composeImageUrl;
    }

    if (composeCategory === 'event') {
      newPostData.eventDate = eventDate ? `${eventDate}${eventTime ? ' ' + eventTime : ''}` : 'Upcoming';
      newPostData.eventTime = eventTime || 'TBA';
      newPostData.eventVenue = eventVenue || 'MKU IT Hub / Online';
    }

    try {
      await addDoc(collection(db, "posts"), cleanForFirestore(newPostData));

      // Dispatch announcement/event broadcast email to all active member emails
      if (composeCategory === 'event' || composeCategory === 'announcement') {
        const emails = allUsers ? allUsers.map(u => u.email).filter(Boolean) : [];
        if (emails.length > 0) {
          try {
            const typeLabel = composeCategory === 'event' ? 'New Event Alert' : 'Important Announcement';
            const header = composeTitle.trim() || 'New Community Update';
            const content = composeText.trim();
            const detailHtml = composeCategory === 'event' 
              ? `<div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin-top: 16px; border-left: 4px solid #2563eb;">
                  <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>📅 Date:</strong> ${eventDate || 'TBA'}</p>
                  <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>⏰ Time:</strong> ${eventTime || 'TBA'}</p>
                  <p style="margin: 0; font-size: 13px;"><strong>📍 Venue:</strong> ${eventVenue || 'TBA'}</p>
                 </div>` 
              : '';

            fetch('/api/send-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                to: emails,
                subject: `[</AdvocoDe> Network] ${typeLabel}: ${header}`,
                html: `
                  <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #334155; background-color: #f8fafc; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <p style="color: #2563eb; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin: 4px 0 0 0;">Defend. Develop. Dominate.</p>
                    </div>
                    
                    <div style="background-color: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); border: 1px solid #e2e8f0;">
                      <span style="display: inline-block; background-color: ${composeCategory === 'event' ? '#dbeafe' : '#fef3c7'}; color: ${composeCategory === 'event' ? '#1e40af' : '#92400e'}; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 8px; border-radius: 4px; margin-bottom: 12px;">${typeLabel}</span>
                      <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px;">${header}</h1>
                      <p style="font-size: 14px; line-height: 1.6; color: #475569; white-space: pre-line; margin-bottom: 16px;">${content}</p>
                      ${detailHtml}
                      
                      <div style="text-align: center; margin: 32px 0 16px 0;">
                        <a href="https://advocade.studenthubmku.xyz" style="background-color: #2563eb; color: #ffffff; font-weight: 600; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 13px; display: inline-block;">View in Hub Dashboard</a>
                      </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #94a3b8;">
                      <p style="margin: 0 0 8px 0;">AdvocoDe Developer Organization &bull; Mount Kenya University</p>
                      <p style="margin: 0;">You received this as a member of Mount Kenya University IT Club.</p>
                    </div>
                  </div>
                `
              })
            })
            .then(res => res.json())
            .then(data => {
              console.log("Broadcast email dispatch success:", data);
              if (composeCategory !== 'announcement') {
                onToast(`Broadcast notification emailed to ${emails.length} active member(s)!`);
              }
            })
            .catch(err => {
              console.error("Resend broadcast API call failed:", err);
            });
          } catch (broadcastErr) {
            console.error("Resend broadcast processing failed:", broadcastErr);
          }
        }
      }

      setComposeText('');
      setComposeTitle('');
      setComposeCode('');
      setComposeImageUrl('');
      setEventDate('');
      setEventTime('');
      setEventVenue('');
      setShowCodeForm(false);
      onToast('Post published successfully to Firestore DB!');
      if (onRewardXP) {
        onRewardXP(30, 'contribution', 'Sharing a Hub Post');
      }
    } catch (err: any) {
      console.error("Error creating post:", err);
      onToast(`Error posting: ${err.message}`);
    }
  };

  // Like Toggle
  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = posts.find(p => p.id === postId);
    if (!target) return;
    const nextUpvoted = !target.hasUpvoted;
    const nextUpvotes = nextUpvoted ? target.upvotes + 1 : Math.max(0, target.upvotes - 1);
    try {
      await updateDoc(doc(db, "posts", postId), {
        hasUpvoted: nextUpvoted,
        upvotes: nextUpvotes
      });
      if (nextUpvoted) {
        onToast('✓ Post Liked! +5 XP');
        if (onRewardXP) onRewardXP(5, 'engagement', 'Liking a Post');
      } else {
        onToast('Post upvote removed');
      }
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  // Share link
  const handleShare = (post: EngagementPost, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(shareUrl);
    onToast('✓ Post link copied to clipboard!');
  };

  // Copy Code Block
  const handleCopyCode = (postId: string, code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedSnippetId(postId);
    onToast('✓ Code snippet copied!');
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  // Reply Submit
  const handleReplySubmit = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const target = posts.find(p => p.id === postId);
    if (!target) return;

    const newComment = {
      id: `c_${Date.now()}`,
      authorName: currentUser?.name || 'Alex M.',
      text: newCommentText.trim(),
      time: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      avatarUrl: currentUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'Alex')}&background=2563EB&color=fff`
    };

    const updatedComments = [...(target.comments || []), newComment];
    try {
      await updateDoc(doc(db, "posts", postId), {
        comments: updatedComments
      });
      setNewCommentText('');
      onToast('Reply posted to Firestore! +10 XP');
      if (onRewardXP) {
        onRewardXP(10, 'engagement', 'Commenting on a Post');
      }
    } catch (err) {
      console.error("Error replying:", err);
    }
  };

  // Delete Post
  const handleDeletePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this timeline post?')) {
      try {
        await deleteDoc(doc(db, "posts", postId));
        onToast('Post removed from Firestore timeline');
      } catch (err) {
        console.error("Error deleting post:", err);
      }
    }
  };

  // AI Polish Post Feature (simulated)
  const handleAIPolish = () => {
    if (!composeText.trim()) {
      onToast('Write some content first to use AI Polish! ⚡');
      return;
    }
    const polished = `${composeText.trim()} ✨\n\n#MKUITClub #MountKenyaUniversity #DeveloperLife`;
    setComposeText(polished);
    onToast('⚡ Post polished with hashtags by HubAI assistant!');
  };

  // Handle Bio modal actions
  const getAuthorUsername = (authorName: string): string => {
    if (allUsers) {
      const matched = allUsers.find(u => u.name?.toLowerCase() === authorName.toLowerCase());
      if (matched && matched.username) {
        return matched.username;
      }
    }
    // Fallback to stylized name username
    return '@' + authorName.toLowerCase().replace(/\s+/g, '_');
  };

  const getProfileByName = (name: string): MemberProfile => {
    // Check real Firestore users in allUsers first
    if (allUsers && allUsers.length > 0) {
      const matched = allUsers.find(u => u.name?.toLowerCase() === name.toLowerCase());
      if (matched) {
        return {
          name: matched.name,
          avatarUrl: matched.avatarUrl,
          regNumber: matched.regNumber || 'BIT/2026/001',
          specialty: matched.bio?.split('•')?.[0]?.trim() || 'Student Member',
          bio: matched.bio || 'Active member of </AdvocoDe>.',
          techStack: matched.skills || ['React', 'TypeScript', 'Tailwind CSS'],
          streakDays: matched.streak || 1,
          points: matched.xp || 50,
          portfolioItems: []
        };
      }
    }

    const defaultAuthor: MemberProfile = {
      name,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10B981&color=fff`,
      regNumber: 'BIT/2024/002',
      specialty: 'Student Member',
      bio: 'Active member of </AdvocoDe>.',
      techStack: ['React', 'JavaScript', 'Tailwind CSS'],
      streakDays: 4,
      points: 110,
      portfolioItems: []
    };

    if (name.includes('Mike')) {
      return {
        name: 'Mike O.',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        regNumber: 'BCS/2025/1102',
        specialty: 'Fullstack TypeScript Developer',
        bio: 'TypeScript and Node.js geek 🚀 | Building fast server systems',
        techStack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
        streakDays: 18,
        points: 420,
        portfolioItems: [
          { name: 'Express_Server_Boilerplate.zip', category: 'Web Development' },
          { name: 'SQLite Database Wrapper', category: 'Database Systems' }
        ]
      };
    }
    if (name.includes('Gemini') || name.includes('AI Tutor') || name.includes('Tutor')) {
      return {
        name: 'Gemini AI Tutor ⚡',
        avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
        regNumber: 'AI/2026/GEMINI',
        specialty: '24/7 Course Assistant & Code Tutor',
        bio: 'Interactive AI Tutor trained on the MKU 10-Part Zero-to-Expert Web Development Curriculum (tutorial.json). Ask me for code examples, debugging advice, or concept breakdowns!',
        techStack: ['@google/genai', 'tutorial.json', 'HTML5/CSS/JS', 'Code Analysis', 'Live Debugging'],
        streakDays: 365,
        points: 9999,
        portfolioItems: [
          { name: '10-Part Web Dev Syllabus Lab Engine', category: 'Courseware' },
          { name: 'Interactive Code Sandbox Boilerplates', category: 'Development Tools' }
        ]
      };
    }
    if (name.includes('David')) {
      return {
        name: 'David K.',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        regNumber: 'BIT/2024/4921',
        specialty: 'UI/UX Design Lead',
        bio: 'Designing the future ✨ | Figma expert & iOS design guidelines',
        techStack: ['Figma', 'CSS/Tailwind', 'Mobile UX', 'Wireframing', 'Prototyping'],
        streakDays: 24,
        points: 650,
        portfolioItems: [
          { name: 'Figma UI Kit - Club Assets 2026', category: 'Web Development' },
          { name: 'Mobile UX Design Principles.pdf', category: 'Design Resources' }
        ]
      };
    }
    if (name.includes('Joy') || name.includes('Muthoni')) {
      return {
        name: 'Joy Muthoni',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        regNumber: 'BIT/2025/3091',
        specialty: 'AI Student Coordinator',
        bio: 'Machine Learning enthusiast | Prompt engineer & Python developer',
        techStack: ['Python', 'TensorFlow', 'Gemini API', 'Node.js', 'Google Cloud'],
        streakDays: 14,
        points: 310,
        portfolioItems: [
          { name: 'Intro_to_Python_DataScience.pdf', category: 'AI & Data Science' },
          { name: 'TensorFlow Campus Workshop Lab', category: 'AI & Data Science' }
        ]
      };
    }
    if (name.includes('Ndegwa')) {
      return {
        name: 'Prof. J. Ndegwa',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        regNumber: 'FACULTY-IT-02',
        specialty: 'IT Department Patron',
        bio: 'MKU IT Department Patron | Research Advisor & Distributed Systems enthusiast',
        techStack: ['Java', 'C++', 'Python', 'Algorithms', 'Distributed Architectures'],
        streakDays: 5,
        points: 950,
        portfolioItems: [
          { name: 'BIT_3104_DatabaseSystems_PastPaper_2025.pdf', category: 'Past Papers' }
        ]
      };
    }
    return defaultAuthor;
  };

  const handleOpenBio = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const profile = getProfileByName(name);
    if (onViewProfile) {
      onViewProfile(profile);
    } else {
      setBioProfile(profile);
      setIsBioOpen(true);
    }
  };

  const handleStartDMFromProfile = (memberName: string) => {
    setIsBioOpen(false);
    const mem = allAvailableMembers.find(m => m.memberName.toLowerCase() === memberName.toLowerCase() || m.id === memberName) || {
      id: getUserRtdbKey(memberName),
      memberName: memberName
    };
    setExplicitChatIds(prev => Array.from(new Set([...prev, mem.id, mem.memberName].filter(Boolean))));
    setActiveDMMember(mem.id);
    setChatViewMode('messages');
    setIsDMWidgetExpanded(false);
    onToast(`Opened direct message conversation with ${memberName}`);
  };

  // Filtered posts based on search filter input
  const rawFiltered = searchQuery.trim() === ''
    ? posts
    : posts.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Announcements should flow chronologically rather than being pinned at the top
  const filteredPosts = [...rawFiltered];

  const currentUserAvatar = currentUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'Alex')}&background=2563EB&color=fff`;

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-slate-50 relative animate-fade-in font-sans">
      
      {/* VIEW PANEL ROUTER */}
      {/* On PC screen (lg:flex), we display BOTH the feed and messages side-by-side, replacing the right sidebar. */}
      {/* On mobile/tablet (< lg), we conditionally render them based on chatViewMode. */}
      <div className="flex-1 flex overflow-hidden min-h-0 bg-white dark:bg-slate-900">
        
        {/* CENTRAL TIMELINE PANEL (X-Style Feed) */}
        <div 
          ref={timelineRef}
          className={`flex-1 max-w-2xl w-full border-r border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full overflow-y-auto no-scrollbar relative shrink-0 ${
            chatViewMode === 'timeline' ? 'flex' : 'hidden lg:flex'
          }`}
        >
        
        {/* X-Style Header Row (Sticky) */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 flex flex-col shrink-0 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* On mobile: profile image that slide-out sidebar drawer */}
              <button 
                onClick={onOpenMobileDrawer}
                className="md:hidden w-8 h-8 rounded-full overflow-hidden border border-slate-200 active:scale-95 transition-transform cursor-pointer shrink-0"
                title="Open Sidebar Menu"
              >
                <img 
                  src={currentUserAvatar} 
                  alt="Menu" 
                  className="w-full h-full object-cover"
                />
              </button>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-800">AdvocoDe Feed</h2>
            </div>

            {/* Minimalistic clean X-style search filter & message button */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative w-36 sm:w-44">
                <Search className="absolute left-2.5 top-1.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-full pl-8 pr-6 py-1 text-[11px] font-semibold border border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1.5 text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* DEDICATED SOCIAL MESSAGES TOGGLE BUTTON */}
              <button
                onClick={() => {
                  setChatViewMode('messages');
                  onToast('Opening direct messaging platform...');
                }}
                className="lg:hidden relative p-2 rounded-full border bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
                title="Open Direct Messages"
              >
                <MessageSquare className="w-4 h-4" />
                {totalUnreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center border border-white shadow-xs animate-pulse">
                    {totalUnreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* X-Style Compose Tweet area */}
        <div className="p-4 border-b border-slate-100 flex gap-3 bg-white">
          <div 
            onClick={(e) => handleOpenBio(currentUser?.name || 'Alex M.', e)}
            className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shrink-0 cursor-pointer hover:opacity-90"
            title="Click to view your bio"
          >
            <img src={currentUserAvatar} alt="My avatar" className="w-full h-full object-cover" />
          </div>

          <form onSubmit={handlePostSubmit} className="flex-1 flex flex-col gap-3 min-w-0">
            {/* Conditional Title input for events and announcements */}
            {(composeCategory === 'announcement' || composeCategory === 'event') && (
              <div className="relative border-b border-slate-100 pb-1 animate-slide-up">
                <input
                  type="text"
                  required
                  placeholder={composeCategory === 'announcement' ? "Announcement Header (e.g., Annual Hackathon 2026)" : "Event Header (e.g., Peer Coding Lab 4B)"}
                  value={composeTitle}
                  onChange={(e) => setComposeTitle(e.target.value)}
                  className="w-full bg-transparent text-xs font-extrabold text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
            )}

            {composeCategory === 'event' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 animate-slide-up">
                <div>
                  <label className="block text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Event Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-white text-xs font-bold text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Event Time</label>
                  <input
                    type="time"
                    required
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full bg-white text-xs font-bold text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Venue / Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IT Hub Room 102 or Meet Link"
                    value={eventVenue}
                    onChange={(e) => setEventVenue(e.target.value)}
                    className="w-full bg-white text-xs font-bold text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
                  />
                </div>
              </div>
            )}

            <div className="relative">
              <textarea
                value={composeText}
                onChange={(e) => {
                  const val = e.target.value;
                  setComposeText(val);
                  checkMentionTrigger(val, 'post');
                }}
                placeholder={composeCategory === 'announcement' ? "Describe the announcement details..." : composeCategory === 'event' ? "Describe the event schedule and venue details..." : DYNAMIC_POST_PROMPTS[promptIndex] || "Got a bug? Wanna ask a question? What's in your mind?"}
                maxLength={280}
                rows={Math.max(2, Math.ceil(composeText.length / 60))}
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium resize-none leading-relaxed"
              />
            </div>

            {/* Expansible Code block insertion option */}
            {showCodeForm && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-2.5 animate-slide-up">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5 text-blue-400" /> Share Code Block
                  </span>
                  
                  <select
                    value={composeLanguage}
                    onChange={(e) => setComposeLanguage(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-[10px] text-slate-300 rounded px-1.5 py-0.5 font-bold focus:outline-none"
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="cpp">C++</option>
                    <option value="sql">SQL</option>
                  </select>
                </div>

                <textarea
                  value={composeCode}
                  onChange={(e) => setComposeCode(e.target.value)}
                  placeholder="Paste snippet or file snippet content here..."
                  rows={4}
                  className="w-full bg-slate-900 text-slate-300 placeholder-slate-600 focus:outline-none font-mono text-xs p-2 rounded border border-slate-800 resize-none leading-relaxed"
                />
              </div>
            )}

            {uploadingPostImage && (
              <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-xl border border-blue-200 text-xs text-blue-700 font-bold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading image to cloud...
              </div>
            )}
            {composeImageUrl && (
              <div className="relative inline-block mt-2 rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-900">
                <img src={composeImageUrl} alt="Attachment preview" className="h-48 w-auto object-contain" />
                <button
                  type="button"
                  onClick={() => setComposeImageUrl('')}
                  className="absolute top-2 right-2 bg-slate-900/80 text-white p-1 rounded-full hover:bg-rose-600 transition-all cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Compose Actions row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-50 min-w-0">
              <div className="flex flex-wrap items-center gap-1 text-blue-500 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setShowCodeForm(!showCodeForm)}
                  className={`p-2 rounded-full hover:bg-blue-50 active:scale-95 transition-all cursor-pointer ${showCodeForm ? 'bg-blue-50' : ''}`}
                  title="Attach Code Snippet"
                >
                  <Code2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleAIPolish}
                  className="p-2 rounded-full hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
                  title="AI Polish snippet with tags"
                >
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                </button>
                <label
                  htmlFor="post-image-upload"
                  className="p-2 rounded-full hover:bg-blue-50 active:scale-95 transition-all cursor-pointer text-emerald-600 flex items-center justify-center"
                  title="Attach image"
                >
                  <Image className="w-4 h-4" />
                  <input
                    id="post-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePostImageChange}
                    className="hidden"
                  />
                </label>

                {/* Categories selector */}
                <select
                  value={composeCategory}
                  onChange={(e: any) => setComposeCategory(e.target.value)}
                  className="bg-transparent border-0 text-[10px] text-slate-500 font-bold ml-0.5 cursor-pointer focus:outline-none focus:ring-0 max-w-[105px] sm:max-w-none truncate shrink-0"
                >
                <option value="">None</option>
                  <option value="code_share">#CodeShare</option>
                  <option value="question">#Question</option>
                  <option value="collaboration">#Collab</option>
                  <option value="announcement">#Announcement 📢</option>
                  <option value="event">#Event 📅</option>
                  
                </select>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
                {composeText.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {280 - composeText.length}
                  </span>
                )}
                
                <button
                  type="submit"
                  disabled={!composeText.trim()}
                  className={`flex items-center gap-1.5 px-4.5 py-1.5 rounded-full font-bold text-xs shadow-md shadow-blue-500/10 transition-all ${
                    composeText.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-95'
                      : 'bg-blue-300 text-blue-50/70 cursor-not-allowed shadow-none'
                  }`}
                >
                  <SendIcon className="w-3.5 h-3.5" /> Post
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* TIMELINE TIMELINE FEED */}
        <div className="flex-1 divide-y divide-slate-100">
          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-xs font-bold">No posts in this feed yet</p>
              <p className="text-[10px] mt-1 text-slate-500">Be the first to share an IT snippet!</p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isMyPost = post.author.regNumber === currentUser?.regNumber;
              const hasCode = !!post.code;
              const isRepliesOpen = expandedCommentPostId === post.id;

              if (post.type === 'announcement') {
                return (
                  <div 
                    key={post.id} 
                    className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-900 text-white shadow-lg my-4 mx-3 sm:mx-4 rounded-2xl p-6 border border-blue-400/30 relative overflow-hidden transition-all hover:shadow-xl hover:scale-[1.01] duration-300 animate-fade-in"
                  >
                    {/* Background Graphics */}
                    <div className="absolute right-[-24px] bottom-[-24px] text-white/10 pointer-events-none select-none z-0">
                      <Megaphone className="w-36 h-36 transform rotate-12 stroke-[1.5]" />
                    </div>

                    {/* Subtle Delete Button in top-right if user is author */}
                    {isMyPost && (
                      <button
                        onClick={(e) => handleDeletePost(post.id, e)}
                        className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer z-20"
                        title="Delete announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="relative z-10 space-y-3">
                      <div className="flex items-center gap-1.5 bg-white/15 text-white font-extrabold text-[9px] px-2.5 py-1 rounded-md uppercase tracking-wider border border-white/10 w-max shadow-sm backdrop-blur-xs">
                        <Megaphone className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        Official Announcement
                      </div>

                      {post.title && (
                        <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                          {post.title}
                        </h3>
                      )}
                      
                      <p className="text-[13px] sm:text-[14px] font-medium text-slate-100 leading-relaxed whitespace-pre-wrap font-sans">
                        {renderWithMentions(post.content, onToast)}
                      </p>

                      <div className="flex items-center gap-2 pt-3 border-t border-white/10 mt-2">
                        <img 
                          src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}`} 
                          alt={post.author.name}
                          className="w-5.5 h-5.5 rounded-full object-cover border border-white/20"
                        />
                        <div className="flex items-center gap-1.5 text-[10.5px]">
                          <span className="font-extrabold text-white">{post.author.name}</span>
                          <span className="text-blue-200/60">•</span>
                          <span className="text-blue-200/80">{getRelativeTimeString(post.timeMs || post.time)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              if (post.type === 'event') {
                return (
                  <div 
                    key={post.id} 
                    className="border-2 hover:border-amber-500/50 shadow-md my-4 mx-3 sm:mx-4 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 animate-fade-in flex flex-col gap-4"
                  >
                    {/* Top row: Author profile & delete button */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div 
                          onClick={(e) => handleOpenBio(post.author.name, e)}
                          className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 cursor-pointer hover:opacity-90 animate-none shrink-0"
                          title={`View ${post.author.name}'s bio`}
                        >
                          <img 
                            src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}`} 
                            alt={post.author.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {post.title && (
                        <h2 className="text-base font-black uppercase text-slate-900 tracking-tight leading-tight">
                          {post.title}
                        </h2> 
                      )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold">
                            {getRelativeTimeString(post.timeMs || post.time)}
                          </p>
                        </div>
                      </div>

                      {isMyPost && (
                        <button
                          onClick={(e) => handleDeletePost(post.id, e)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all cursor-pointer z-20 shrink-0"
                          title="Delete event post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Event Title and description */}
                    <div className="space-y-1.5">
                      <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-700 font-semibold leading-relaxed whitespace-pre-wrap font-sans">
                        {renderWithMentions(post.content, onToast)}
                      </p>
                    </div>

                    {/* Prominent Counter with black gradient bg */}
                    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md border border-slate-850">
                      <div className="flex flex-col text-center sm:text-left">
                        <span className="text-[9px] text-amber-400 font-black tracking-widest uppercase mb-0.5">EVENT COUNTDOWN</span>
                         </div>
                      <div className="shrink-0 scale-105">
                        <EventProminentCountdown targetDateStr={post.eventDate} />
                      </div>
                    </div>

                    {/* Attached Image inside Event Card */}
                    {post.imageUrl && (
                      <div className="rounded-xl overflow-hidden border border-slate-250 bg-slate-900 max-h-72 flex items-center justify-center shadow-sm">
                        <img src={post.imageUrl} alt="Event illustration" className="w-full h-auto max-h-72 object-contain" />
                      </div>
                    )}

                    
                  </div>
                );
              }

              return (
                <div 
                  key={post.id} 
                  className={`transition-all ${
                    post.type === 'announcement' 
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-sm my-2 mx-3 sm:mx-4 rounded-2xl border border-blue-500/40 text-xs sm:text-[13px]' 
                      : post.type === 'event' 
                      ? 'border-l-4 border-amber-500 bg-amber-50/10 hover:bg-amber-50/15 shadow-sm my-1 mx-1 sm:mx-1.5 rounded-xl border border-amber-200/50' 
                      : 'border-transparent border-b border-slate-100 hover:bg-slate-50/40'
                  }`}
                >
                  <article className={`flex relative ${post.type === 'announcement' || post.type === 'event' ? 'py-2 px-2.5 sm:px-3 gap-2.5' : 'py-2.5 px-3 sm:px-4 gap-3'}`}>
                    
                    {/* Left Column: Avatar */}
                    <div 
                      onClick={(e) => handleOpenBio(post.author.name, e)}
                      className={`${post.type === 'announcement' ? 'w-8 h-8' : 'w-10 h-10'} rounded-full overflow-hidden border border-slate-200 shrink-0 cursor-pointer hover:opacity-90`}
                      title={`View ${post.author.name}'s detailed profile`}
                    >
                      <img 
                        src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}`} 
                        alt={post.author.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Right Column: Tweet Details */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      
                      {/* Announcement Pinned Banner */}
                      {post.type === 'announcement' && (
                        <div className="mb-1 bg-white/20 text-white font-extrabold text-[9px] px-2 py-0.5 rounded inline-flex items-center gap-1 uppercase tracking-wider border border-white/30 w-max shadow-sm">
                          <Megaphone className="w-3 h-3 text-white" />
                          OFFICIAL ANNOUNCEMENT
                        </div>
                      )}

                      {/* Author Header line */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-baseline min-w-0 flex-wrap sm:flex-nowrap gap-1">
                          <span 
                            onClick={(e) => handleOpenBio(post.author.name, e)}
                            className="font-extrabold text-[13px] text-slate-800 dark:text-slate-200 hover:underline cursor-pointer shrink-0"
                          >
                            {post.author.name}
                          </span>
                          <span 
                            onClick={(e) => handleOpenBio(post.author.name, e)}
                            className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold truncate cursor-pointer hover:underline"
                          >
                            {getAuthorUsername(post.author.name)}
                          </span>
                          <span className={`mx-0.5 text-xs font-normal ${post.type === 'announcement' ? 'text-blue-200' : 'text-slate-300 dark:text-slate-700'}`}>•</span>
                          <span className={`text-xs font-normal shrink-0 ${post.type === 'announcement' ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                            {getRelativeTimeString(post.timeMs || post.time)}
                          </span>
                        </div>

                        {/* Dropdown Menu or delete */}
                        {isMyPost && (
                          <button
                            onClick={(e) => handleDeletePost(post.id, e)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all cursor-pointer"
                            title="Delete timeline post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Topic Badge tags if any + Event Countdown Row */}
                      <div className="mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            post.type === 'code_share' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                            post.type === 'question' ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                            post.type === 'announcement' ? 'bg-white/20 text-white border border-white/30 font-bold' :
                            post.type === 'event' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            'bg-indigo-50 text-indigo-700 border border-indigo-150'
                          }`}>
                            {post.type === 'announcement' ? <Megaphone className="w-2.5 h-2.5" /> :
                             post.type === 'event' ? <Calendar className="w-2.5 h-2.5" /> : null}
                            #{post.type.replace('_', ' ')}
                          </span>

                          {post.title && (
                            <span className={`text-[12px] font-black tracking-tight ${post.type === 'announcement' ? 'text-white font-bold text-xs sm:text-sm' : 'text-slate-700 font-extrabold'}`}>
                              {post.title}
                            </span>
                          )}
                        </div>

                        {/* Event Countdown Timer (starts in... - unequivocal) */}
                        {post.type === 'event' && (
                          <div className="mt-0.5 sm:mt-0">
                            <EventCountdown targetDateStr={post.eventDate} />
                          </div>
                        )}
                      </div>

                      {/* Event Details Badge Box */}
                      {post.type === 'event' && (
                        <div className="mt-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 flex flex-wrap items-center gap-4 text-xs text-amber-900 font-bold shadow-sm">
                          {post.eventDate && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Date: {post.eventDate.split(' ')[0]}</span>
                            </div>
                          )}
                          {post.eventTime && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Time: {post.eventTime}</span>
                            </div>
                          )}
                          {post.eventVenue && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Venue: {post.eventVenue}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Post Content text */}
                      <p className={`mt-1 leading-relaxed whitespace-pre-wrap font-sans ${
                        post.type === 'announcement' 
                          ? 'text-xs sm:text-[13px] font-semibold text-white tracking-normal leading-snug' 
                          : 'text-[13px] sm:text-[14px] text-slate-800 font-medium leading-snug'
                      }`}>
                        {renderWithMentions(post.content, onToast)}
                      </p>

                      {post.imageUrl && (
                        <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-900 max-h-96 flex items-center justify-center shadow-sm">
                          <img src={post.imageUrl} alt="Attachment" className="w-full h-auto max-h-96 object-contain" />
                        </div>
                      )}

                      {/* Optional Code snippet block */}
                      {hasCode && (
                        <div className="mt-3 bg-slate-950 rounded-xl border border-slate-800/60 overflow-hidden flex flex-col font-mono text-xs">
                          <div className="bg-slate-900/90 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-extrabold text-blue-400 uppercase tracking-wider">{post.language || 'code'}</span>
                            
                            <button
                              onClick={(e) => handleCopyCode(post.id, post.code || '', e)}
                              className="bg-slate-800 hover:bg-slate-700 hover:text-white px-2 py-1 rounded text-[9px] font-bold flex items-center gap-1 transition-all"
                            >
                              {copiedSnippetId === post.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" /> Copied!
                                </>
                              ) : (
                                <>
                                  <Code2 className="w-3 h-3" /> Copy Snippet
                                </>
                              )}
                            </button>
                          </div>
                          
                          <pre className="p-3 overflow-x-auto whitespace-pre-wrap break-words text-slate-200 leading-normal scrollbar-thin max-h-56">
                            <code>{post.code}</code>
                          </pre>
                        </div>
                      )}

                      {/* Bottom Action Icon Bar */}
                      <div className={`flex items-center justify-between max-w-md mt-4 text-xs ${post.type === 'announcement' ? 'text-blue-100' : 'text-slate-400'}`}>
                        {/* Comments button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCommentPostId(isRepliesOpen ? null : post.id);
                          }}
                          className={`flex items-center gap-1.5 p-2 rounded-full transition-all group cursor-pointer ${
                            isRepliesOpen ? 'text-blue-500 font-bold bg-blue-50' : 'hover:text-blue-500 hover:bg-blue-50/50'
                          }`}
                          title="Open Discussion Replies"
                        >
                          <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          <span>{post.comments.length}</span>
                        </button>

                        {/* Likes button */}
                        <button
                          onClick={(e) => handleLike(post.id, e)}
                          className={`flex items-center gap-1.5 p-2 rounded-full transition-all group cursor-pointer ${
                            post.hasUpvoted ? 'text-rose-500 font-bold bg-rose-50' : 'hover:text-rose-500 hover:bg-rose-50/50'
                          }`}
                          title="Like Post"
                        >
                          <Heart className={`w-4 h-4 group-hover:scale-125 transition-transform ${post.hasUpvoted ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span>{post.upvotes}</span>
                        </button>
                      </div>

                    </div>
                  </article>

                  {/* Comment replies expansion panel */}
                  {isRepliesOpen && (
                    <div className="bg-slate-50/60 px-6 py-4 border-t border-b border-slate-100 flex flex-col gap-3.5 animate-slide-down">
                      {/* List comments */}
                      {post.comments.length > 0 && (
                        <div className="space-y-3.5">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-2.5 items-start">
                              <div 
                                onClick={(e) => handleOpenBio(comment.authorName, e)}
                                className="w-7 h-7 rounded-full overflow-hidden border border-slate-100 shrink-0 cursor-pointer"
                              >
                                <img 
                                  src={comment.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.authorName)}&background=64748B&color=fff`} 
                                  alt={comment.authorName} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm text-xs">
                                <div className="flex justify-between items-center mb-0.5">
                                  <span 
                                    onClick={(e) => handleOpenBio(comment.authorName, e)}
                                    className="font-bold text-slate-800 hover:underline cursor-pointer"
                                  >
                                    {comment.authorName}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-normal">{comment.time}</span>
                                </div>
                                <p className="text-slate-600 font-semibold leading-relaxed whitespace-pre-wrap">{renderWithMentions(comment.text, onToast)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Form */}
                      <form onSubmit={(e) => handleReplySubmit(post.id, e)} className="flex gap-2.5 items-center">
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-200 shrink-0">
                          <img src={currentUserAvatar} alt="My avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 bg-white border border-slate-200/80 hover:border-blue-400/50 rounded-xl px-3.5 py-1.5 shadow-sm focus-within:ring-1 focus-within:ring-blue-500/25 focus-within:border-blue-500 flex items-center gap-2">
                          <input
                            type="text"
                            value={newCommentText}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewCommentText(val);
                              checkMentionTrigger(val, 'comment');
                            }}
                            placeholder="Post your reply... (use @ to mention)"
                            className="bg-transparent text-xs w-full focus:outline-none placeholder-slate-400 text-slate-800 font-semibold"
                          />
                          <button
                            type="submit"
                            disabled={!newCommentText.trim()}
                            className={`p-1.5 rounded-lg shrink-0 transition-all cursor-pointer ${
                              newCommentText.trim() ? 'bg-blue-600 text-white active:scale-90' : 'text-slate-300'
                            }`}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* CHAT MESSENGER PANEL (WhatsApp style split-pane on PC) */}
      <div className={`flex-1 flex overflow-hidden min-h-0 bg-slate-100 dark:bg-slate-950 ${
        chatViewMode === 'messages' ? 'flex' : 'hidden lg:flex'
      }`}>
          
          {/* LEFT PANEL: Chat rooms list */}
          <div className={`w-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full shrink-0 ${activeDMMember ? 'hidden' : 'flex'}`}>
            {/* Rooms list header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-150 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setChatViewMode('timeline');
                    onToast('Returning to Forum Feed timeline...');
                  }}
                  className="lg:hidden p-1.5 -ml-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 transition-all cursor-pointer flex items-center justify-center shrink-0"
                  title="Back to Feed"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                </button>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 tracking-wide uppercase">Conversations</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowAddContactDropdown(!showAddContactDropdown)}
                  className="p-1.5 hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 transition-all cursor-pointer flex items-center justify-center"
                  title="Start a new chat with anyone"
                >
                  <Plus className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </button>
              </div>
            </div>

            {/* Quick search inside rooms list */}
            <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={dmSearchText}
                  onChange={(e) => setDmSearchText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-950 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-700 rounded-lg pl-9 pr-6 py-1.5 text-xs font-semibold border border-transparent transition-all shadow-inner dark:placeholder-slate-500"
                />
              </div>
            </div>

            {/* Dynamic alphabetically dropdown to start a new chat */}
            {showAddContactDropdown && (
              <div className="bg-slate-50 dark:bg-slate-950 p-3 border-b border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto space-y-1.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Select a Member</span>
                  <button onClick={() => setShowAddContactDropdown(false)} className="text-[10px] text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 font-bold">✕</button>
                </div>
                {allAvailableMembers
                  .filter(m => m.id !== myId && m.memberName.toLowerCase().includes(dmSearchText.toLowerCase()))
                  .sort((a, b) => a.memberName.localeCompare(b.memberName))
                  .map(member => (
                    <div
                      key={member.id}
                      onClick={() => handleAddOrOpenChat(member)}
                      className="flex items-center gap-2.5 p-2 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/60 dark:border-slate-800/80 rounded-xl cursor-pointer transition-colors"
                    >
                      <img src={member.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{member.memberName}</h4>
                      </div>
                      <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.2 rounded-full uppercase">Chat</span>
                    </div>
                  ))}
              </div>
            )}

            {/* Chats list scrolling viewport */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50 p-1 bg-white dark:bg-slate-900/60">
              {dmChats
                .filter(c => c.memberName.toLowerCase().includes(dmSearchText.toLowerCase()))
                .map((chat) => {
                  const isActive = activeDMMember === chat.id;
                  const lastMsg = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
                  
                  const lastRead = lastReadTimestamps[chat.id] || 0;
                  const chatMsgs = chat.messages || [];
                  const unreadInChat = chatMsgs.filter((m: any) => {
                    if (m.sender === 'me' || m.senderId === myId) return false;
                    const msgTs = m.timestamp || 0;
                    return msgTs > lastRead;
                  }).length;
                  
                  return (
                    <div
                      key={chat.id}
                      onClick={() => {
                        setActiveDMMember(chat.id);
                        onToast(`Opened direct message conversation with ${chat.memberName}`);
                      }}
                      className={`p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-all cursor-pointer rounded-xl mx-1.5 my-1 border ${
                        isActive 
                          ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-900/40 shadow-sm' 
                          : chat.id === 'saved_messages' 
                            ? 'bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-100/30 dark:border-indigo-900/20' 
                            : 'border-slate-100/60 dark:border-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img 
                            src={chat.avatarUrl} 
                            alt={chat.memberName} 
                            className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 object-cover" 
                          />
                          {chat.online && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-xs animate-pulse"></span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h5 className={`text-xs font-bold truncate ${unreadInChat > 0 && !isActive ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-800 dark:text-slate-200'}`}>{chat.memberName}</h5>
                            <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-semibold">{chat.username}</span>
                          </div>
                          <p className={`text-[10.5px] truncate mt-0.5 ${unreadInChat > 0 && !isActive ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-400 dark:text-slate-400 font-medium'}`}>
                            {lastMsg ? (
                              <span>
                                <span className={`font-extrabold ${unreadInChat > 0 && !isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>{lastMsg.sender === 'me' ? 'Me: ' : `${lastMsg.senderName || 'Member'}: `}</span>
                                {lastMsg.text}
                              </span>
                            ) : (
                              'No messages yet'
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`text-[8px] font-extrabold ${unreadInChat > 0 && !isActive ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-slate-400 dark:text-slate-500'}`}>
                          {lastMsg ? lastMsg.time : ''}
                        </span>
                        {unreadInChat > 0 && !isActive ? (
                          <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center border border-white dark:border-slate-800 shadow-xs animate-bounce">
                            {unreadInChat}
                          </span>
                        ) : chat.online ? (
                          <span className="text-[8.5px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                            Active
                          </span>
                        ) : (
                          <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/40 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                            Offline
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* RIGHT PANEL: Chat conversation room pane */}
          <div className={`flex-1 bg-[#eae6df] dark:bg-slate-950 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:20px_20px] flex flex-col h-full relative ${!activeDMMember ? 'hidden' : 'flex'}`}>
            {activeDMMember ? (
              (() => {
                const activeChat = dmChats.find(c => c.id === activeDMMember || c.memberName === activeDMMember || c.memberName.toLowerCase() === (activeDMMember || '').toLowerCase());
                const chatIdToUse = activeChat?.id || activeDMMember || '';
                
                return (
                  <div className="flex-1 flex flex-col min-h-0 bg-[#f0f2f5] dark:bg-slate-950 bg-[radial-gradient(#e2e8f0_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#1e293b_1.2px,transparent_1.2px)] [background-size:16px_16px]">
                    
                    {/* Conversation Header */}
                    <div className="bg-[#f0f2f5] dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 py-3 px-4 shadow-sm flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button 
                          type="button"
                          onClick={() => setActiveDMMember(null)}
                          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-all text-slate-700 dark:text-slate-300 shrink-0 cursor-pointer flex items-center justify-center"
                          title="Back to conversations list"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="relative shrink-0">
                          <img 
                            src={activeChat?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeDMMember || 'User')}`} 
                            alt={activeChat?.memberName || activeDMMember || ''} 
                            className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700 shadow-xs" 
                          />
                          {activeChat?.online && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                          )}
                        </div>

                        <div className="min-w-0 flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-xs sm:text-sm truncate tracking-tight text-slate-800 dark:text-slate-100">{activeChat?.memberName || activeDMMember}</h4>
                            {activeChat?.username && <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{activeChat.username}</span>}
                          </div>
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold tracking-wide uppercase">
                            {activeChat?.typing ? (
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></span>
                                typing...
                              </span>
                            ) : activeChat?.statusText || (activeChat?.online ? 'ONLINE' : 'OFFLINE (LAST SEEN RECENTLY)')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Chat Messages Body (WhatsApp-style bubbles on right/left with tail pointers and dark mode) */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col no-scrollbar">
                      {(rtdbMessages.length > 0 ? rtdbMessages : activeChat?.messages || []).map((m: any) => {
                        const isMe = m.sender === 'me';
                        const isSwipingThis = swipedMessageId === m.id;
                        
                        return (
                          <div 
                            key={m.id}
                            className={`flex items-end gap-2.5 max-w-[85%] relative transition-all duration-75 select-none ${
                              isMe ? 'self-end flex-row-reverse' : 'self-start flex-row'
                            }`}
                            onTouchStart={(e) => {
                              const touch = e.touches[0];
                              touchStartCoords.current = { x: touch.clientX, y: touch.clientY };
                              setSwipedMessageId(m.id);
                              setSwipeOffset(0);

                              // Double tap detection
                              const now = Date.now();
                              if (now - lastTouchTap.current < 280) {
                                handleAddReaction(chatIdToUse, m.id, '❤️');
                                if (navigator.vibrate) navigator.vibrate(40);
                              }
                              lastTouchTap.current = now;

                              // Mobile Touch Hold (Long press) timer
                              const timer = setTimeout(() => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setActiveContextMenu({
                                  messageId: m.id,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top + rect.height / 2
                                });
                                if (navigator.vibrate) navigator.vibrate(60);
                              }, 600);
                              touchHoldTimerRef.current = timer;
                            }}
                            onTouchMove={(e) => {
                              if (!touchStartCoords.current) return;
                              const touch = e.touches[0];
                              const diffX = touch.clientX - touchStartCoords.current.x;
                              const diffY = touch.clientY - touchStartCoords.current.y;

                              if (diffX > 0 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
                                setSwipeOffset(Math.min(diffX, 85));
                                if (diffX > 15 && touchHoldTimerRef.current) {
                                  clearTimeout(touchHoldTimerRef.current);
                                  touchHoldTimerRef.current = null;
                                }
                              }
                            }}
                            onTouchEnd={(e) => {
                              if (touchHoldTimerRef.current) {
                                clearTimeout(touchHoldTimerRef.current);
                                touchHoldTimerRef.current = null;
                              }
                              if (swipeOffset > 45) {
                                setReplyingToMessage(m);
                                onToast(`Replying to ${m.senderName || 'Member'}`);
                                if (navigator.vibrate) navigator.vibrate(30);
                              }
                              setSwipeOffset(0);
                              setSwipedMessageId(null);
                              touchStartCoords.current = null;
                            }}
                            onMouseDown={(e) => {
                              if (e.button !== 0) return; // Only left click
                              const startX = e.clientX;
                              const startY = e.clientY;

                              const cancelHold = () => {
                                if (mouseHoldTimerRef.current) {
                                  clearTimeout(mouseHoldTimerRef.current);
                                  mouseHoldTimerRef.current = null;
                                }
                                document.removeEventListener('mousemove', onMouseMove);
                                document.removeEventListener('mouseup', cancelHold);
                              };

                              const onMouseMove = (moveEvt: MouseEvent) => {
                                if (Math.hypot(moveEvt.clientX - startX, moveEvt.clientY - startY) > 8) {
                                  cancelHold();
                                }
                              };

                              document.addEventListener('mousemove', onMouseMove);
                              document.addEventListener('mouseup', cancelHold);

                              const timer = setTimeout(() => {
                                setActiveContextMenu({
                                  messageId: m.id,
                                  x: e.clientX,
                                  y: e.clientY
                                });
                                document.removeEventListener('mousemove', onMouseMove);
                                document.removeEventListener('mouseup', cancelHold);
                              }, 450);
                              mouseHoldTimerRef.current = timer;
                            }}
                          >
                            {/* Sender avatar only for other members */}
                            {!isMe && (
                              <img 
                                src={m.senderAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.senderName || 'Member')}&background=64748B&color=fff`} 
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs shrink-0" 
                                alt="" 
                              />
                            )}

                            {/* Message bubble itself */}
                            <div 
                              className={`relative px-4 py-2.5 text-[12.5px] font-semibold leading-relaxed transition-all duration-75 select-none cursor-pointer group shadow-xs ${
                                isMe 
                                  ? 'bg-blue-600 dark:bg-blue-500 text-white rounded-2xl rounded-br-none' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl rounded-bl-none'
                              }`}
                              style={{
                                transform: isSwipingThis ? `translateX(${swipeOffset}px)` : 'none',
                              }}
                              title="Swipe right to reply, hold for options!"
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleAddReaction(chatIdToUse, m.id, '❤️');
                              }}
                            >
                              {/* Tail Pointer */}
                              {isMe ? (
                                <div className="absolute right-0 bottom-0 w-3 h-3 bg-blue-600 dark:bg-blue-500 translate-x-[3px] [clip-path:polygon(0_0,0_100%,100%_100%)] rounded-br-[4px] pointer-events-none" />
                              ) : (
                                <div className="absolute left-0 bottom-0 w-3 h-3 bg-slate-100 dark:bg-slate-800 -translate-x-[3px] [clip-path:polygon(100%_0,100%_100%,0_100%)] rounded-bl-[4px] pointer-events-none" />
                              )}

                              {/* Floating Micro reactions selector on hover */}
                              <div className={`absolute -top-7 ${isMe ? 'right-0' : 'left-0'} hidden group-hover:flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-full shadow-lg z-10 animate-fade-in`}>
                                {['👍', '🔥', '😂', '❤️', '😮', '👏'].map(emoji => (
                                  <button 
                                    key={emoji}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddReaction(chatIdToUse, m.id, emoji);
                                    }}
                                    className="hover:scale-125 transition-transform p-0.5 text-xs"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>

                              {/* Identified by sender inside threads */}
                              {!isMe && (
                                <div className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 mb-1 tracking-tight">
                                  {m.senderName || 'Member'}
                                </div>
                              )}

                              {/* Replied message block preview */}
                              {m.replyTo && (
                                <div className="mb-2 p-2 bg-black/10 dark:bg-white/10 rounded-r-lg border-l-4 border-blue-500 dark:border-blue-400 text-[11px] leading-snug text-left truncate max-w-xs">
                                  <span className="block font-black text-blue-600 dark:text-blue-300">
                                    {m.replyTo.senderName}
                                  </span>
                                  <span className="opacity-80">
                                    {m.replyTo.text}
                                  </span>
                                </div>
                              )}

                              {/* Content */}
                              <p className="whitespace-pre-wrap">{renderWithMentions(m.text, onToast)}</p>
                              
                              {/* Reaction Badges */}
                              {m.reactions && m.reactions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {(() => {
                                    const counts: Record<string, number> = {};
                                    if (m.reactionUsers) {
                                      Object.values(m.reactionUsers).forEach((val: any) => {
                                        if (val) counts[val] = (counts[val] || 0) + 1;
                                      });
                                    } else {
                                      m.reactions.forEach((r: string) => {
                                        counts[r] = 1;
                                      });
                                    }
                                    return Object.keys(counts).map((emoji) => (
                                      <span key={emoji} className="bg-slate-50 dark:bg-slate-900 text-[10px] px-1.5 py-0.5 rounded-full shadow-xs border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                        <span>{emoji}</span>
                                        <span className="text-[9px] font-black opacity-85">{counts[emoji]}</span>
                                      </span>
                                    ));
                                  })()}
                                </div>
                              )}



                              {/* Footer Timestamp & Checkmarks */}
                              <div className={`flex items-center justify-end gap-1.5 mt-1.5 text-[8.5px] font-bold ${isMe ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                                <span>{m.time}</span>
                                {isMe && (
                                  <span className="flex items-center">
                                    {m.status === 'sent' ? (
                                      <Check className="w-3.5 h-3.5 text-blue-200/60" />
                                    ) : m.status === 'delivered' ? (
                                      <CheckCheck className="w-3.5 h-3.5 text-blue-200/80" />
                                    ) : (
                                      <CheckCheck className="w-3.5 h-3.5 text-sky-200 fill-current" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Reply Preview Banner */}
                    {replyingToMessage && (
                      <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 animate-fade-in shrink-0">
                        <div className="border-l-4 border-blue-500 dark:border-blue-400 pl-3 min-w-0">
                          <span className="block text-[10px] font-black text-blue-600 dark:text-blue-400">
                            Replying to {replyingToMessage.senderName || 'Member'}
                          </span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                            {replyingToMessage.text}
                          </p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setReplyingToMessage(null)}
                          className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-750 cursor-pointer text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* Chat Input Bar */}
                    <form 
                      onSubmit={handleSendDM}
                      className="p-3 border-t border-slate-200 dark:border-slate-800 bg-[#f0f2f5] dark:bg-slate-900 flex items-end gap-2 shrink-0"
                    >
                      <textarea
                        ref={dmTextareaRef}
                        required
                        rows={1}
                        placeholder="Type a message... (use @ to mention)"
                        value={activeDMInput}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            const form = e.currentTarget.form;
                            if (form) {
                              form.requestSubmit();
                            }
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          setActiveDMInput(val);
                          checkMentionTrigger(val, 'dm');
                          
                          // Auto expand logic
                          e.target.style.height = 'auto';
                          e.target.style.height = `${Math.min(120, Math.max(38, e.target.scrollHeight))}px`;
                        }}
                        className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-slate-300 dark:focus:border-slate-700 rounded-lg px-4 py-2.5 text-xs font-semibold focus:outline-none text-slate-900 dark:text-slate-100 transition-all shadow-inner resize-none overflow-y-auto min-h-[38px] max-h-28 leading-[18px]"
                      />

                      <button 
                        type="submit"
                        className="p-2.5 rounded-full text-white bg-blue-600 hover:bg-blue-750 active:scale-95 transition-all shadow-md flex items-center justify-center cursor-pointer shrink-0 mb-0.5"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>

                    {/* Floating Context Option Modal (PC / hold menu) */}
                    {activeContextMenu && (
                      <div 
                        className="fixed inset-0 z-50 overflow-hidden bg-slate-950/25 dark:bg-black/45 backdrop-blur-xs flex items-center justify-center"
                        onClick={() => setActiveContextMenu(null)}
                      >
                        <div 
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xl w-60 animate-scale-in"
                          style={{
                            position: 'fixed',
                            left: `${Math.min(activeContextMenu.x, window.innerWidth - 260)}px`,
                            top: `${Math.min(activeContextMenu.y, window.innerHeight - 300)}px`,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Message Options
                          </div>
                          
                          <div className="p-1 space-y-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                const targetMsg = rtdbMessages.find(m => m.id === activeContextMenu.messageId);
                                if (targetMsg) {
                                  setReplyingToMessage(targetMsg);
                                  onToast(`Replying to ${targetMsg.senderName || 'Member'}`);
                                }
                                setActiveContextMenu(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <CornerUpLeft className="w-4 h-4 text-blue-500" />
                              <span>Reply to Message</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const targetMsg = rtdbMessages.find(m => m.id === activeContextMenu.messageId);
                                if (targetMsg) {
                                  handleAddReaction(chatIdToUse, targetMsg.id, '❤️');
                                }
                                setActiveContextMenu(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                              <span>React with ❤️</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const targetMsg = rtdbMessages.find(m => m.id === activeContextMenu.messageId);
                                if (targetMsg) {
                                  navigator.clipboard.writeText(targetMsg.text);
                                  onToast('✓ Copied message to clipboard!');
                                }
                                setActiveContextMenu(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Copy className="w-4 h-4 text-amber-500" />
                              <span>Copy Text</span>
                            </button>

                            {/* Delete Message if user's own, <= 30 mins, and has no replies */}
                            {(() => {
                              const targetMsg = rtdbMessages.find(m => m.id === activeContextMenu.messageId);
                              if (!targetMsg) return null;
                              
                              const isOwn = targetMsg.senderId === myId || targetMsg.sender === 'me';
                              const isRecent = targetMsg.timestamp && (Date.now() - targetMsg.timestamp) < (30 * 60 * 1000);
                              const hasReplies = rtdbMessages.some(m => m.replyTo && m.replyTo.id === targetMsg.id);
                              
                              if (isOwn && isRecent && !hasReplies) {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleDeleteMessage(chatIdToUse, targetMsg.id);
                                      setActiveContextMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/25 text-xs font-bold text-red-650 dark:text-red-400 flex items-center gap-2 cursor-pointer transition-colors border border-transparent hover:border-red-200/50"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                    <span>Delete Message</span>
                                  </button>
                                );
                              }
                              return null;
                            })()}

                            <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                            {/* Quick Reactions line */}
                            <div className="flex justify-between p-1 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                              {['👍', '🔥', '😂', '❤️', '😮', '👏'].map(emoji => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    handleAddReaction(chatIdToUse, activeContextMenu.messageId, emoji);
                                    setActiveContextMenu(null);
                                  }}
                                  className="hover:scale-125 transition-transform text-sm p-1 cursor-pointer"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              /* EMPTY WELCOME SCREEN */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#f8f9fa] dark:bg-slate-950">
                <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-900 shadow-md">
                  <MessageSquare className="w-10 h-10" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 tracking-tight">AdvocoDe Messenger</h3>
                
                <div className="mt-6 flex items-center gap-1.5 bg-blue-600/10 dark:bg-blue-900/20 border border-blue-600/20 dark:border-blue-800/40 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-ping"></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DETAILED STUDENT BIO MODAL overlay */}
      {bioProfile && (
        <MemberBioModal
          isOpen={isBioOpen}
          onClose={() => setIsBioOpen(false)}
          profile={bioProfile}
          onStartDM={handleStartDMFromProfile}
          onToast={onToast}
        />
      )}

    </div>
  );
};
