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
  Video,
  Phone,
  Info,
  MoreVertical,
  Camera,
  Paperclip,
  CheckCheck,
  Loader2,
  AtSign
} from 'lucide-react';
import { MemberBioModal, MemberProfile } from './MemberBioModal';
import { db, auth, rtdb } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { ref, onValue, push } from 'firebase/database';
import { User as AppUser } from '../types';
import { uploadToImgBB } from '../utils/imgUpload';

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
}

export const renderWithMentions = (text: string, onToast?: (msg: string) => void) => {
  if (!text) return null;
  const parts = text.split(/(@[a-zA-Z0-9_/.-]+)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('@') && part.length > 1) {
      return (
        <span
          key={idx}
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
    return part;
  });
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
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-800 border-2 border-amber-500/60 font-mono font-extrabold text-[11px] shadow-sm select-none shrink-0" title="Live Event Countdown Timer">
      <span className="animate-pulse text-amber-600">⏱️</span>
      <span className="uppercase text-[8.5px] text-amber-600 tracking-wider font-bold">Starts in:</span>
      <span className="text-slate-900 bg-amber-50 px-1 py-0.5 rounded font-extrabold text-[10.5px]">{days}d</span>
      <span className="text-slate-900 bg-amber-50 px-1 py-0.5 rounded font-extrabold text-[10.5px]">{hours}h</span>
      <span className="text-slate-900 bg-amber-50 px-1 py-0.5 rounded font-extrabold text-[10.5px]">{minutes}m</span>
      <span className="text-amber-950 bg-amber-200 px-1 py-0.5 rounded font-extrabold text-[10.5px] text-amber-900 animate-none">{seconds}s</span>
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
}

const DEFAULT_POSTS: EngagementPost[] = [
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
      { id: 'c2', authorName: 'Sarah T.', text: 'Extremely clean code, Mike! Perfect use of lazy initialization.', time: '1 hr ago', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' }
    ],
    time: '3 hours ago'
  },
  {
    id: 'post_2',
    title: 'iOS Form Input Sizing UX Best Practices?',
    content: 'Working on the upcoming Hackathon registration mobile layouts. Should form inputs default to 16px font-size on iOS to prevent auto-zooming, or stick to 14px with responsive scale? What are your thoughts on modern touch guidelines?',
    type: 'question',
    author: {
      name: 'Sarah T.',
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
    content: 'ATTENTION ALL IT CLUB MEMBERS: Mount Kenya University Annual Web Development Hackathon has been officially scheduled! Registration is now open on the portal. Student groups must design a responsive workspace utilizing clean states and optimized layout workflows. All are welcome to participate!',
    type: 'announcement',
    author: {
      name: 'Prof. J. Ndegwa',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      regNumber: 'BIT/Patron/101',
      specialty: 'IT Department Patron',
      bio: 'Advising Mount Kenya University IT Club projects and hackathon setups',
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
      { id: 'ca2', authorName: 'Sarah T.', text: 'Is registration open to Year 1 students? I would love to mentor them.', time: '8 hrs ago' }
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
    comments: [
      { id: 'ce1', authorName: 'Sarah T.', text: 'Count me in! I will bring the UX wireframe diagrams.', time: '1 day ago' }
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

  // Mention autocomplete state
  const [mentionFilter, setMentionFilter] = useState<string | null>(null);
  const [mentionTarget, setMentionTarget] = useState<'post' | 'dm' | 'comment' | null>(null);

  const handlePostImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPostImage(true);
      onToast('⏳ Uploading image to ImgBB cloud storage...');
      const url = await uploadToImgBB(file);
      setComposeImageUrl(url);
      onToast('✓ Image attached via ImgBB!');
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
  const [dmSearchText, setDmSearchText] = useState('');
  const [activeDMInput, setActiveDMInput] = useState('');
  const [showAddContactDropdown, setShowAddContactDropdown] = useState(false);

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
      name: 'Sarah T.',
      username: '@sarah_ux',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      online: true,
      messages: [
        { id: '1', sender: 'them', text: 'Hey there! Did you check out the new tutorials in the learning center?', time: '10:14 AM', hearted: false, reactions: [] },
        { id: '2', sender: 'me', text: 'Hey Sarah! Yes, just loaded the HTML Basics. It is super clean!', time: '10:16 AM', hearted: true, reactions: ['❤️'] },
        { id: '3', sender: 'them', text: 'Awesome! Let me know if you want to collaborate on the landing page layout.', time: '10:18 AM', hearted: false, reactions: [] }
      ]
    }
  ];

  const sanitizeRtdbKey = (str?: string) => {
    return (str || 'default').toLowerCase().replace(/[.#$[\]/]/g, '_').replace(/\s+/g, '_');
  };

  const handleAddOrOpenChat = (member: { name: string; username: string; avatarUrl: string; online: boolean; messages: any[] }) => {
    const existing = dmChats.find(c => c.memberName === member.name);
    if (!existing) {
      setDmChats(prev => [
        ...prev,
        {
          id: sanitizeRtdbKey(member.name),
          memberName: member.name,
          username: member.username,
          avatarUrl: member.avatarUrl,
          online: member.online,
          messages: member.messages
        }
      ]);
    }
    setActiveDMMember(member.name);
    setShowAddContactDropdown(false);
    onToast(`Started a chat with ${member.name}!`);
  };
  
  // Custom pre-populated chats with real forum members
  const [dmChats, setDmChats] = useState<{
    id: string;
    memberName: string;
    username: string;
    avatarUrl: string;
    online: boolean;
    typing?: boolean;
    messages: { id: string; sender: 'me' | 'them'; text: string; time: string; hearted?: boolean; reactions?: string[] }[];
  }[]>(FORUM_MEMBERS.map(m => ({
    id: sanitizeRtdbKey(m.name),
    memberName: m.name,
    username: m.username,
    avatarUrl: m.avatarUrl,
    online: m.online,
    messages: m.messages
  })));

  // Sync dmChats with real authenticated users from Firestore
  useEffect(() => {
    if (allUsers && allUsers.length > 0) {
      const realMemberChats = allUsers.map(u => ({
        id: sanitizeRtdbKey(u.uid || u.email || u.name),
        memberName: u.name,
        username: '@' + sanitizeRtdbKey(u.email?.split('@')[0] || u.name),
        avatarUrl: u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=2563EB&color=fff`,
        online: true,
        messages: []
      }));
      setDmChats(realMemberChats);
    }
  }, [allUsers]);

  // Realtime Database (RTDB) live messages listener for Active Chat / DM
  const [rtdbMessages, setRtdbMessages] = useState<any[]>([]);
  useEffect(() => {
    if (!activeDMMember) {
      setRtdbMessages([]);
      return;
    }
    const myId = sanitizeRtdbKey(currentUser?.email || currentUser?.name || auth.currentUser?.email || 'guest');
    const targetId = sanitizeRtdbKey(activeDMMember);
    const chatId = [myId, targetId].sort().join('_');

    const chatRef = ref(rtdb, `chats/${chatId}`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const msgList = Object.entries(val).map(([key, data]: [string, any]) => ({
          id: key,
          ...data
        }));
        setRtdbMessages(msgList);
      } else {
        setRtdbMessages([]);
      }
    }, (err) => {
      console.error("RTDB Error:", err);
    });

    return () => unsubscribe();
  }, [activeDMMember, currentUser]);

  const handleSendDM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDMInput.trim() || !activeDMMember) return;

    const userMsgText = activeDMInput.trim();
    setActiveDMInput('');

    const myId = sanitizeRtdbKey(currentUser?.email || currentUser?.name || auth.currentUser?.email || 'guest');
    const targetId = sanitizeRtdbKey(activeDMMember);
    const chatId = [myId, targetId].sort().join('_');

    // 1. Push user message to Firebase RTDB!
    push(ref(rtdb, `chats/${chatId}`), {
      sender: 'me',
      senderName: currentUser?.name || auth.currentUser?.displayName || 'Me',
      text: userMsgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      hearted: false,
      reactions: []
    });

    // Reward engagement XP
    if (onRewardXP) {
      onRewardXP(5, 'engagement', 'Sending a Direct Message');
    }
  };

  const handleToggleHeart = (chatId: string, messageId: string) => {
    setDmChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === messageId) {
              const newHearted = !m.hearted;
              if (newHearted) {
                onToast('💖 Message double-tapped! +5 XP');
                if (onRewardXP) onRewardXP(5, 'engagement', 'Liking a Direct Message');
              }
              return { ...m, hearted: newHearted };
            }
            return m;
          })
        };
      }
      return c;
    }));
  };

  const handleAddReaction = (chatId: string, messageId: string, emoji: string) => {
    setDmChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === messageId) {
              const currentReactions = m.reactions || [];
              const hasReaction = currentReactions.includes(emoji);
              const nextReactions = hasReaction
                ? currentReactions.filter(r => r !== emoji)
                : [...currentReactions, emoji];
              
              if (!hasReaction) {
                onToast(`Reacted with ${emoji}! +5 XP`);
                if (onRewardXP) onRewardXP(5, 'engagement', `Reacting with ${emoji}`);
              }
              return { ...m, reactions: nextReactions };
            }
            return m;
          })
        };
      }
      return c;
    }));
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
      snapshot.forEach((docSnap) => {
        loadedPosts.push({ id: docSnap.id, ...docSnap.data() } as EngagementPost);
      });
      setPosts(loadedPosts);
    }, (err) => {
      console.error("Error loading posts from Firestore:", err);
    });
    return () => unsubscribe();
  }, []);

  const seedInitialPostsToFirestore = async () => {
    try {
      for (const p of DEFAULT_POSTS) {
        const { id, ...postData } = p;
        await addDoc(collection(db, "posts"), {
          ...postData,
          timeMs: Date.now() - Math.floor(Math.random() * 3600000)
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
      time: 'Just now',
      timeMs: Date.now()
    };

    if (showCodeForm && composeCode.trim()) {
      newPostData.code = composeCode.trim();
      newPostData.language = composeLanguage;
    }

    if (composeImageUrl) {
      newPostData.imageUrl = composeImageUrl;
    }

    try {
      await addDoc(collection(db, "posts"), newPostData);
      setComposeText('');
      setComposeTitle('');
      setComposeCode('');
      setComposeImageUrl('');
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
      time: 'Just now',
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
  const getProfileByName = (name: string): MemberProfile => {
    const defaultAuthor: MemberProfile = {
      name,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10B981&color=fff`,
      regNumber: 'BIT/2024/002',
      specialty: 'Student Member',
      bio: 'Mount Kenya University IT Club active student member.',
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
    if (name.includes('Sarah')) {
      return {
        name: 'Sarah T.',
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
    setBioProfile(profile);
    setIsBioOpen(true);
  };

  const handleStartDMFromProfile = (memberName: string) => {
    setIsBioOpen(false);
    
    // Check if the conversation already exists
    const existing = dmChats.find(c => c.memberName.toLowerCase() === memberName.toLowerCase());
    if (existing) {
      setActiveDMMember(existing.memberName);
    } else {
      // Create a brand new active conversation!
      const newId = `chat_${Date.now()}`;
      const newChat = {
        id: newId,
        memberName: memberName,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=3B82F6&color=fff`,
        online: true,
        messages: [
          { id: 'welcome', sender: 'them', text: `Hi there! I am ${memberName}. Nice to connect with you on MKU Connect.`, time: 'Just now' }
        ]
      };
      setDmChats(prev => [newChat, ...prev]);
      setActiveDMMember(memberName);
    }
    
    setIsDMWidgetExpanded(true);
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

  // Pin announcements to the top regardless of when they were posted
  const filteredPosts = [...rawFiltered].sort((a, b) => {
    const aAnn = a.type === 'announcement';
    const bAnn = b.type === 'announcement';
    if (aAnn && !bAnn) return -1;
    if (!aAnn && bAnn) return 1;
    return 0; // maintain relative chronological order for others
  });

  const currentUserAvatar = currentUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'Alex')}&background=2563EB&color=fff`;

  return (
    <div className="flex w-full h-[calc(100vh-64px)] md:h-[calc(100vh-73px)] overflow-hidden bg-white relative animate-fade-in font-sans">
      
      {/* CENTRAL TIMELINE PANEL (X-Style Feed) */}
      <div 
        ref={timelineRef}
        className="flex-1 max-w-2xl w-full border-r border-slate-200/60 bg-white flex flex-col h-full overflow-y-auto no-scrollbar relative shrink-0"
      >
        
        {/* X-Style Header Row (Sticky) */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 flex flex-col shrink-0 px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* On mobile: profile image that slide-out sidebar drawer */}
              <button 
                onClick={onOpenMobileDrawer}
                className="md:hidden w-8 h-8 rounded-full overflow-hidden border border-slate-200 active:scale-95 transition-transform cursor-pointer shrink-0"
                title="Open Sidebar Menu"
              >
                <img 
                  src={currentUserAvatar} 
                  alt="User menu" 
                  className="w-full h-full object-cover"
                />
              </button>
              
              <div className="flex flex-col">
                <h1 className="font-extrabold text-xs md:text-sm tracking-tight text-slate-900 font-display uppercase">
                  Live Chat Rooms
                </h1>
                <p className="text-[9px] text-slate-400 font-extrabold tracking-wider uppercase">
                  mount kenya university network
                </p>
              </div>
            </div>

            {/* Minimalistic clean X-style search filter & message button */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative w-full sm:w-44">
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
                  const newState = !isDMWidgetExpanded;
                  setIsDMWidgetExpanded(newState);
                  if (newState && !activeDMMember) {
                    setActiveDMMember('Sarah T.'); // Auto-load first chat
                  }
                  onToast(newState ? 'Opening dedicated social messaging platform...' : 'Direct messages collapsed');
                }}
                className={`relative p-2 rounded-full border transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0 ${
                  isDMWidgetExpanded 
                    ? 'bg-[#008069] border-[#008069] text-white shadow-md shadow-emerald-500/10' 
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                title="Open Direct Messages (WhatsApp / Telegram / Instagram Styles)"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white animate-bounce">
                  3
                </span>
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

            <div className="relative">
              <textarea
                value={composeText}
                onChange={(e) => {
                  const val = e.target.value;
                  setComposeText(val);
                  checkMentionTrigger(val, 'post');
                }}
                placeholder={composeCategory === 'announcement' ? "Describe the announcement details..." : composeCategory === 'event' ? "Describe the event schedule and venue details..." : "What's happening in MKU IT?"}
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
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading image to ImgBB cloud...
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
            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
              <div className="flex items-center gap-1 text-blue-500">
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
                <button
                  type="button"
                  onClick={() => {
                    setComposeText((prev) => `${prev} 🚀`);
                    onToast('Inserted emoji 🚀');
                  }}
                  className="p-2 rounded-full hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
                  title="Insert emoji quick tag"
                >
                  <Smile className="w-4 h-4 text-amber-500" />
                </button>

                <label
                  htmlFor="post-image-upload"
                  className="p-2 rounded-full hover:bg-blue-50 active:scale-95 transition-all cursor-pointer text-emerald-600 flex items-center justify-center"
                  title="Attach image (ImgBB)"
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
                  className="bg-transparent border-0 text-[10px] text-slate-500 font-bold ml-1 cursor-pointer focus:outline-none focus:ring-0"
                >
                  <option value="code_share">#CodeShare</option>
                  <option value="question">#Question</option>
                  <option value="collaboration">#Collab</option>
                  <option value="announcement">#Announcement 📢</option>
                  <option value="event">#Event 📅</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
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

              return (
                <div 
                  key={post.id} 
                  className={`transition-all ${
                    post.type === 'announcement' 
                      ? 'border-l-4 border-rose-600 bg-rose-50/10 hover:bg-rose-50/15 shadow-md shadow-rose-500/5 my-3 mx-2 rounded-2xl border border-rose-200/50 p-1' 
                      : post.type === 'event' 
                      ? 'border-l-4 border-amber-500 bg-amber-50/10 hover:bg-amber-50/15 shadow-sm my-3 mx-2 rounded-2xl border border-amber-200/50 p-1' 
                      : 'border-transparent border-b border-slate-100 hover:bg-slate-50/40'
                  }`}
                >
                  <article className="p-4 flex gap-3 relative">
                    
                    {/* Left Column: Avatar */}
                    <div 
                      onClick={(e) => handleOpenBio(post.author.name, e)}
                      className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shrink-0 cursor-pointer hover:opacity-90"
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
                        <div className="mb-2 bg-rose-600/15 text-rose-700 font-extrabold text-[10px] px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 uppercase tracking-wider border border-rose-600/20 w-max shadow-sm animate-pulse">
                          <Megaphone className="w-3 h-3" />
                          OFFICIAL PINNED ANNOUNCEMENT
                        </div>
                      )}

                      {/* Author Header line */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-baseline min-w-0 flex-wrap sm:flex-nowrap">
                          <span 
                            onClick={(e) => handleOpenBio(post.author.name, e)}
                            className="font-bold text-slate-900 text-[14px] hover:underline cursor-pointer truncate"
                          >
                            {post.author.name}
                          </span>
                          <span 
                            onClick={(e) => handleOpenBio(post.author.name, e)}
                            className="text-slate-400 font-medium text-xs ml-1.5 cursor-pointer truncate"
                          >
                            @{post.author.regNumber.replace(/\//g, '')}
                          </span>
                          <span className="text-slate-300 mx-1.5 text-xs font-normal">•</span>
                          <span className="text-slate-400 text-xs font-normal shrink-0">
                            {post.time}
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
                            post.type === 'announcement' ? 'bg-red-50 text-red-700 border border-red-100' :
                            post.type === 'event' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            'bg-indigo-50 text-indigo-700 border border-indigo-150'
                          }`}>
                            {post.type === 'announcement' ? <Megaphone className="w-2.5 h-2.5" /> :
                             post.type === 'event' ? <Calendar className="w-2.5 h-2.5" /> : null}
                            #{post.type.replace('_', ' ')}
                          </span>

                          {post.title && (
                            <span className={`text-[10px] font-extrabold tracking-tight ${post.type === 'announcement' ? 'text-rose-950 font-black text-xs' : 'text-slate-700'}`}>
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

                      {/* Post Content text */}
                      <p className={`mt-1.5 leading-relaxed whitespace-pre-wrap font-sans ${
                        post.type === 'announcement' 
                          ? 'text-[15px] font-black text-rose-950 tracking-normal' 
                          : 'text-[14px] text-slate-800 font-medium'
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
                          
                          <pre className="p-3 overflow-x-auto text-slate-200 leading-normal scrollbar-thin max-h-56">
                            <code>{post.code}</code>
                          </pre>
                        </div>
                      )}

                      {/* Bottom Action Icon Bar */}
                      <div className="flex items-center justify-between max-w-md mt-4 text-slate-400 text-xs">
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

      {/* RIGHT SIDEBAR PANEL (Desktop X-Style "Who to follow" & "Trends") */}
      <div className="hidden lg:flex w-80 p-5 flex-col gap-4 overflow-y-auto shrink-0 bg-slate-50/50 border-r border-slate-100">
        
        {/* Search widget */}
        <div className="bg-slate-100/90 rounded-full flex items-center px-4 py-2 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all shadow-sm">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search IT Hub feed..."
            onClick={() => onToast('Global searching timeline activated!')}
            className="bg-transparent text-xs w-full focus:outline-none placeholder-slate-400 text-slate-800 font-bold"
          />
        </div>

        {/* Trends Box */}
        <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-500" /> Trends for you
            </h2>
          </div>

          <div className="space-y-3.5">
            {[
              { tag: '#MKUHackathon2026', desc: 'Trending in Science & Tech', count: '1.2K Posts' },
              { tag: 'Sarah T.', desc: 'Trending in UI/UX Design', count: '841 Posts' },
              { tag: '@google/genai', desc: 'Trending in AI Developer Kit', count: '312 Posts' },
              { tag: '#TailwindCSSTips', desc: 'Trending in Web Design', count: '554 Posts' },
            ].map((trend) => (
              <div 
                key={trend.tag} 
                onClick={() => {
                  setComposeText((prev) => `${prev} ${trend.tag}`);
                  onToast(`Injected ${trend.tag} hashtag into compose!`);
                }}
                className="group cursor-pointer min-w-0"
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{trend.desc}</p>
                <h3 className="text-xs font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors mt-0.5">{trend.tag}</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{trend.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Who to Follow Box - Loaded from real authenticated Firestore users */}
        <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
          <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">
            Who to follow (Real Members)
          </h2>

          <div className="space-y-3.5">
            {allUsers && allUsers.length > 0 ? (
              allUsers.slice(0, 5).map((person) => {
                const [following, setFollowing] = useState(false);
                return (
                  <div key={person.uid || person.email || person.name} className="flex items-center justify-between gap-2.5">
                    <div 
                      onClick={(e) => handleOpenBio(person.name, e)}
                      className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 min-w-0"
                      title={`View ${person.name}'s bio portfolio`}
                    >
                      <img src={person.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} alt={person.name} className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 hover:underline truncate">{person.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold truncate">{person.bio || person.regNumber}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setFollowing(!following);
                        onToast(following ? `Unfollowed ${person.name}` : `Following ${person.name}!`);
                      }}
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer ${
                        following 
                          ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' 
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {following ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 font-medium">No other authenticated members yet. Invite your classmates!</p>
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

      {/* BACKDROP FOR SOCIAL CHAT OVERLAY */}
      {isDMWidgetExpanded && (
        <div 
          onClick={() => setIsDMWidgetExpanded(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity duration-300"
        />
      )}

      {/* HIGH-FIDELITY DEDICATED SOCIAL MESSAGING PANEL OVERLAY */}
      <div 
        id="dm-social-panel"
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isDMWidgetExpanded ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Dynamic Social-themed Header / Inbox Selector */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
          {activeDMMember ? (
            /* ACTIVE CONVERSATION FLOW (Custom themed based on dmSocialStyle) */
            (() => {
              const activeChat = dmChats.find(c => c.memberName === activeDMMember);
              
              // OmniChat Combo Theme styling: Deep slate and subtle neon hues
              const headerStyles = 'bg-slate-950 text-white border-b border-slate-800 py-3.5 px-4 shadow-md';
              const chatBg = 'bg-[#f4f7f9] bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:20px_20px]';

              return (
                <div className={`flex-1 flex flex-col min-h-0 ${chatBg}`}>
                  {/* Styled Header */}
                  <div className={`flex items-center justify-between shrink-0 ${headerStyles}`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button 
                        onClick={() => setActiveDMMember(null)}
                        className="p-1.5 hover:bg-white/10 rounded-full transition-all text-white shrink-0 cursor-pointer"
                        title="Back to conversations list"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      
                      <div className="relative shrink-0">
                        <img 
                          src={activeChat?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeDMMember)}`} 
                          alt={activeDMMember} 
                          className="w-9 h-9 rounded-full object-cover border border-white/25 shadow-md" 
                        />
                        {activeChat?.online && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse"></span>
                        )}
                      </div>

                      <div className="min-w-0 flex flex-col">
                        <div className="flex items-center gap-1">
                          <h4 className="font-extrabold text-xs sm:text-sm truncate tracking-tight text-white">{activeDMMember}</h4>
                          <span className="text-[9px] text-slate-400 font-medium">{activeChat?.username}</span>
                        </div>
                        <span className="text-[10px] text-blue-400 font-extrabold tracking-wide uppercase">
                          {activeChat?.typing ? (
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                              typing...
                            </span>
                          ) : activeChat?.online ? 'online' : 'offline (last seen recently)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Conversation Body (Scrollable messages) */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col no-scrollbar">
                    {(rtdbMessages.length > 0 ? rtdbMessages : activeChat?.messages || []).map((m: any) => {
                      const isMe = m.sender === 'me';
                      
                      // Theme-based bubble styles: Blue for me, White for them
                      const bubbleStyle = isMe 
                        ? 'bg-blue-600 text-white self-end rounded-2xl rounded-tr-none shadow-sm shadow-blue-500/10' 
                        : 'bg-white border border-slate-200 text-slate-800 self-start rounded-2xl rounded-tl-none shadow-sm';

                      return (
                        <div 
                          key={m.id}
                          onDoubleClick={() => handleToggleHeart(activeChat.id, m.id)}
                          className={`max-w-[85%] relative px-4 py-2.5 text-[12px] font-semibold leading-relaxed transition-all duration-200 select-none cursor-pointer group ${bubbleStyle}`}
                          title="Double-tap to heart message!"
                        >
                          {/* Floating Micro reaction selector on hover */}
                          <div className={`absolute -top-7 ${isMe ? 'right-0' : 'left-0'} hidden group-hover:flex items-center gap-1 bg-white border border-slate-200/80 p-1 rounded-full shadow-lg z-10 animate-fade-in`}>
                            {['👍', '🔥', '😂', '❤️', '😮', '👏'].map(emoji => (
                              <button 
                                key={emoji}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddReaction(activeChat.id, m.id, emoji);
                                }}
                                className="hover:scale-125 transition-transform p-0.5"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>

                          <p>{renderWithMentions(m.text, onToast)}</p>
                          
                          {/* Active reaction badges row if any */}
                          {m.reactions && m.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {m.reactions.map((emoji, idx) => (
                                <span key={idx} className="bg-slate-100/95 text-[10px] px-1.5 py-0.5 rounded-full shadow-xs border border-slate-200/30 text-slate-800 flex items-center justify-center">
                                  {emoji}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Double-tapped Heart overlay */}
                          {m.hearted && (
                            <div className={`absolute -bottom-2 ${isMe ? '-left-2' : '-right-2'} bg-white border border-rose-100 rounded-full p-1 shadow-md animate-pulse flex items-center justify-center`}>
                              <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-1 mt-1 text-[8.5px] font-bold text-slate-400">
                            <span className={isMe ? 'text-white/70' : 'text-slate-400'}>{m.time}</span>
                            {isMe && (
                              <CheckCheck className="w-3.5 h-3.5 text-sky-400 inline shrink-0" />
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing status indicator */}
                    {activeChat?.typing && (
                      <div className="bg-white/90 border border-slate-200/50 text-slate-500 self-start rounded-2xl rounded-bl-xs px-3.5 py-2 text-[10.5px] font-black tracking-wide italic animate-pulse shadow-xs flex items-center gap-1.5">
                        <span className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </span>
                        {activeDMMember} is typing...
                      </div>
                    )}
                  </div>

                  {/* Input form - clean text input and send button with no attachments */}
                  <form 
                    onSubmit={handleSendDM}
                    className="p-3 border-t border-slate-200/50 bg-white flex items-center gap-2 shrink-0 shadow-lg"
                  >
                    <input
                      type="text"
                      required
                      placeholder="Type a message... (use @ to mention)"
                      value={activeDMInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setActiveDMInput(val);
                        checkMentionTrigger(val, 'dm');
                      }}
                      className="flex-1 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-slate-300 rounded-full px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-300 text-slate-900 transition-all shadow-inner"
                    />

                    <button 
                      type="submit"
                      className="p-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow flex items-center justify-center cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              );
            })()
          ) : (
            /* DUAL-PANE CONTACT LIST SELECTOR SCREEN */
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50 relative">
              {/* Inbox Header */}
              <div className="p-4 bg-slate-950 text-white border-b border-slate-800 shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs sm:text-sm tracking-widest uppercase">
                    CHAT
                  </h3>
                  <button 
                    onClick={() => setIsDMWidgetExpanded(false)}
                    className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
                    title="Close DM Panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Conversations List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 no-scrollbar p-1">
                {dmChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setActiveDMMember(chat.memberName);
                      onToast(`Opened direct message conversation with ${chat.memberName}`);
                    }}
                    className={`p-3 flex items-center justify-between gap-3 hover:bg-white transition-colors cursor-pointer rounded-xl mx-1 my-1 border ${chat.id === 'saved_messages' ? 'bg-indigo-50/40 border-indigo-100/50' : 'border-slate-100'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img 
                          src={chat.avatarUrl} 
                          alt={chat.memberName} 
                          className="w-10 h-10 rounded-full border border-slate-200 object-cover" 
                        />
                        {chat.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-xs animate-pulse"></span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-bold text-slate-800 truncate">{chat.memberName}</h5>
                          <span className="text-[9.5px] text-slate-400 font-semibold">{chat.username}</span>
                          {chat.id === 'saved_messages' && (
                            <span className="bg-indigo-100 text-indigo-700 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">Saved</span>
                          )}
                        </div>
                        <p className="text-[10.5px] text-slate-400 font-medium truncate mt-0.5">
                          {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : 'No messages'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {chat.online ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          online
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 border border-slate-250 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          offline (last seen)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating + button to select anyone in the forum arranged alphabetically */}
              <div className="absolute bottom-6 right-6 z-30">
                <button
                  type="button"
                  onClick={() => setShowAddContactDropdown(!showAddContactDropdown)}
                  className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
                  title="Select member to chat"
                >
                  <Plus className="w-6 h-6" />
                </button>

                {showAddContactDropdown && (
                  <div className="absolute bottom-14 right-0 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-45 animate-scale-in">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Select Club Member</span>
                      <button 
                        onClick={() => setShowAddContactDropdown(false)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto no-scrollbar">
                      {FORUM_MEMBERS.map((member) => (
                        <button
                          key={member.name}
                          onClick={() => handleAddOrOpenChat(member)}
                          className="w-full text-left p-2 hover:bg-slate-50 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <img 
                            src={member.avatarUrl} 
                            alt={member.name} 
                            className="w-7 h-7 rounded-full object-cover border border-slate-150" 
                          />
                          <div className="min-w-0">
                            <h6 className="text-xs font-bold text-slate-800 truncate">{member.name}</h6>
                            <p className="text-[9px] text-slate-400 font-medium truncate">
                              {member.username} • {member.online ? 'Online' : 'Offline'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

    </div>
  );
};
