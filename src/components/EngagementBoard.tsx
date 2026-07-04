import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  Share2,
  Plus,
  X,
  Code,
  HelpCircle,
  Users,
  Copy,
  Check,
  Send,
  Flame,
  ChevronDown
} from 'lucide-react';
import { MemberProfile } from './MemberBioModal';
import { getRelativeTimeString, DEFAULT_POSTS } from './ChatView';

export interface EngagementPost {
  id: string;
  title: string;
  content: string;
  code?: string;
  language?: string;
  imageUrl?: string;
  type: 'code_share' | 'question' | 'collaboration';
  author: MemberProfile;
  upvotes: number;
  hasUpvoted?: boolean;
  comments: { id: string; authorName: string; text: string; time: string }[];
  time: string;
  timeMs?: number;
}

interface EngagementBoardProps {
  currentUser: { name: string; regNumber: string; bio: string; skills: string[] } | null;
  onViewMember: (profile: MemberProfile) => void;
  onToast: (msg: string) => void;
}

export const EngagementBoard: React.FC<EngagementBoardProps> = ({
  currentUser,
  onViewMember,
  onToast,
}) => {
  const [posts, setPosts] = useState<EngagementPost[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'code_share' | 'question' | 'collaboration'>('all');
  
  // Create post modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCode, setPostCode] = useState('');
  const [postType, setPostType] = useState<'code_share' | 'question' | 'collaboration'>('code_share');
  
  // Comments management
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  // Local Copy States
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mku_engagement_posts');
    if (saved) {
      try {
        setPosts(JSON.parse(saved));
      } catch (e) {
        setPosts(DEFAULT_POSTS);
      }
    } else {
      setPosts(DEFAULT_POSTS);
      localStorage.setItem('mku_engagement_posts', JSON.stringify(DEFAULT_POSTS));
    }
  }, []);

  const savePosts = (updatedPosts: EngagementPost[]) => {
    setPosts(updatedPosts);
    localStorage.setItem('mku_engagement_posts', JSON.stringify(updatedPosts));
  };

  const handleUpvote = (postId: string) => {
    const updated = posts.map(post => {
      if (post.id === postId) {
        const hasUpvoted = !post.hasUpvoted;
        return {
          ...post,
          hasUpvoted,
          upvotes: hasUpvoted ? post.upvotes + 1 : post.upvotes - 1
        };
      }
      return post;
    });
    savePosts(updated);
    onToast('Post reaction updated');
  };

  const handleCopyCode = (postId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPostId(postId);
    onToast('✓ Code snippet copied to clipboard!');
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      onToast('Please fill out Title and Content');
      return;
    }

    const newPost: EngagementPost = {
      id: `post_${Date.now()}`,
      title: postTitle.trim(),
      content: postContent.trim(),
      type: postType,
      code: postType === 'code_share' && postCode.trim() ? postCode.trim() : undefined,
      language: postType === 'code_share' ? 'typescript' : undefined,
      author: {
        name: currentUser?.name || 'Alex M.',
        regNumber: currentUser?.regNumber || 'BIT/2026/001',
        specialty: currentUser?.skills?.join(' & ') || 'Fullstack Developer',
        bio: currentUser?.bio || 'Passionate member of </AdvocoDe>',
        techStack: currentUser?.skills || ['React', 'TypeScript', 'Tailwind'],
        streakDays: 9,
        points: 150,
        portfolioItems: []
      },
      upvotes: 1,
      hasUpvoted: true,
      comments: [],
      time: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timeMs: Date.now()
    };

    const updated = [newPost, ...posts];
    savePosts(updated);
    setShowCreateModal(false);
    onToast('Posted');

    // Reset Form
    setPostTitle('');
    setPostContent('');
    setPostCode('');
    setPostType('code_share');
  };

  const handleAddComment = (postId: string) => {
    if (!newCommentText.trim()) return;

    const updated = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: `comment_${Date.now()}`,
              authorName: currentUser?.name || 'User',
              text: newCommentText.trim(),
              time: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return post;
    });

    savePosts(updated);
    setNewCommentText('');
    onToast('Comment added');
  };

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'all') return true;
    return post.type === activeFilter;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/60 font-sans pb-24" id="engagement-board-hub">
      
      {/* Dynamic Header & Welcome Area */}
      <div className="px-5 py-6 bg-gradient-to-b from-indigo-50/50 to-slate-50 border-b border-indigo-150 shrink-0">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-500 text-white rounded-lg flex items-center justify-center">
                <Flame className="w-4.5 h-4.5 fill-white" />
              </span>
              <h1 className="text-xl font-black text-slate-800 tracking-tight font-display">Live Engagement Hub</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Check out developer portfolios, copy shared code playground snippets, and troubleshoot campus tech.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Share Code & Q&A
          </button>
        </div>
      </div>

      {/* Filter Segmented Control Bar */}
      <div className="px-5 py-3 border-b border-slate-200 bg-white/70 backdrop-blur-md sticky top-0 z-30 shadow-sm">
        <div className="max-w-3xl mx-auto flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: 'All Activities', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'code_share', label: 'Code Snippets', icon: <Code className="w-3.5 h-3.5" /> },
            { id: 'question', label: 'Q&A Forums', icon: <HelpCircle className="w-3.5 h-3.5" /> },
            { id: 'collaboration', label: 'Collaborations', icon: <Users className="w-3.5 h-3.5" /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeFilter === item.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200/75 text-slate-600'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Engagement Activity Feed */}
      <div className="px-4 py-4 space-y-4 max-w-3xl mx-auto">
        {filteredPosts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
            <Code className="w-10 h-10 text-slate-300 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold">No discussions posted here yet.</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const hasCode = !!post.code;
            return (
              <div key={post.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-200 hover:border-slate-300">
                
                {/* Post Top Card Row */}
                <div className="p-4 sm:p-5 pb-3">
                  <div className="flex justify-between items-start gap-3">
                    
                    {/* Author profile click anchor */}
                    <div
                      onClick={() => onViewMember(post.author)}
                      className="flex gap-3 items-center group cursor-pointer"
                      title="View Member Bio"
                    >
                      {post.author.avatarUrl ? (
                        <img
                          src={post.author.avatarUrl}
                          alt={post.author.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-150 shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-lg flex items-center justify-center border border-indigo-100">
                          {post.author.name.charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                            {post.author.name}
                          </h4>
                          <span className="text-[8px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.2 rounded border border-slate-150 uppercase tracking-wide">
                            {post.author.regNumber.split('/')[0]}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">{post.author.specialty}</p>
                      </div>
                    </div>

                    {/* Tag badge */}
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                      post.type === 'code_share'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : post.type === 'question'
                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                        : 'bg-purple-50 text-purple-700 border-purple-100'
                    }`}>
                      {post.type === 'code_share' ? 'Code Snippet' : post.type === 'question' ? 'Q&A Forum' : 'Collab'}
                    </span>

                  </div>

                  {/* Post Title & Description Content */}
                  <div className="mt-3.5">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug tracking-tight">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1.5 whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>

                  {/* Shared Code Block if Available */}
                  {hasCode && post.code && (
                    <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden bg-slate-900 shadow-inner relative max-h-72 flex flex-col">
                      <div className="px-4 py-2 border-b border-slate-800 bg-slate-950 flex justify-between items-center shrink-0">
                        <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider">
                          {(post.language || 'typescript').toUpperCase()}
                        </span>
                        
                        <button
                          onClick={() => handleCopyCode(post.id, post.code!)}
                          className="text-slate-400 hover:text-white flex items-center gap-1 text-[9px] font-bold py-1 px-2 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
                        >
                          {copiedPostId === post.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy code</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="p-4 overflow-auto whitespace-pre-wrap break-words text-emerald-400 font-mono text-[10px] leading-relaxed text-left flex-1 bg-slate-950 select-text">
                        <code>{post.code}</code>
                      </pre>
                    </div>
                  )}

                  {/* Post Timestamp */}
                  <p className="text-[9px] text-slate-400 font-bold mt-3 uppercase tracking-wider">
                    Published {getRelativeTimeString(post.timeMs || post.time)}
                  </p>

                </div>

                {/* Footer Engagement Controls */}
                <div className="flex border-t border-slate-100 bg-slate-50/50 p-2 justify-between items-center px-4 shrink-0">
                  <div className="flex gap-4">
                    
                    {/* Upvote btn */}
                    <button
                      onClick={() => handleUpvote(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold py-1 px-2.5 rounded-lg transition-all cursor-pointer ${
                        post.hasUpvoted
                          ? 'text-indigo-600 bg-indigo-50 border border-indigo-100'
                          : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${post.hasUpvoted ? 'fill-indigo-500' : ''}`} />
                      <span>{post.upvotes}</span>
                    </button>

                    {/* Comment section expand button */}
                    <button
                      onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold py-1 px-2.5 rounded-lg transition-all cursor-pointer ${
                        activeCommentPostId === post.id
                          ? 'text-indigo-600 bg-indigo-50 border border-indigo-100'
                          : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.comments.length} Comments</span>
                    </button>

                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`mku-it-club://post/${post.id}`);
                      onToast('Shareable activity link copied');
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                    title="Share Activity"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Expanding Comments section */}
                {activeCommentPostId === post.id && (
                  <div className="border-t border-slate-150 bg-indigo-50/15 p-4 space-y-3">
                    
                    {/* Comment items */}
                    {post.comments.length > 0 && (
                      <div className="space-y-2.5">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-2 text-xs items-start bg-white/70 p-2.5 rounded-xl border border-slate-150">
                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold text-slate-800 text-[11px]">{comment.authorName}</span>
                                <span className="text-[8px] text-slate-400 font-medium">{comment.time}</span>
                              </div>
                              <p className="text-slate-600 font-medium mt-0.5 leading-relaxed">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment Input form */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                        placeholder="Write constructive comment..."
                        className="flex-1 bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400 font-medium text-slate-900"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!newCommentText.trim()}
                        className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* CREATE POST MODAL DIALOG */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm transition-opacity" id="create-post-modal">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in border border-slate-100 flex flex-col max-h-[90vh]">
            
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">Publish to Engagement Feed</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="p-5 space-y-4 overflow-y-auto no-scrollbar">
              
              {/* Post Category selection */}
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Feed Segment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'code_share', label: 'Code Snippet' },
                    { id: 'question', label: 'Ask Question' },
                    { id: 'collaboration', label: 'Collaboration' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setPostType(cat.id as any)}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all text-center cursor-pointer ${
                        postType === cat.id
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Post Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memory efficient recursion in JS"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white focus:outline-none text-slate-900 font-semibold"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Description / Context
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Add some details. If asking a question, describe the error. If sharing code, explain what it does!"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white focus:outline-none text-slate-900 font-medium resize-none"
                />
              </div>

              {/* Optional Code Snippet Block */}
              {postType === 'code_share' && (
                <div className="animate-fade-in">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Shared Code Snippet (Optional)
                    </label>
                    <span className="text-[8px] text-slate-400 font-bold uppercase">Mono Font Code</span>
                  </div>
                  <textarea
                    rows={6}
                    placeholder={`// Write your code snippet here...\nfunction calculate() {\n  return 42;\n}`}
                    value={postCode}
                    onChange={(e) => setPostCode(e.target.value)}
                    className="w-full bg-slate-950 text-emerald-400 border border-slate-850 rounded-xl p-3 text-[10px] font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              )}

              {/* Submit triggers */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition-all text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs transition-all text-center shadow-md cursor-pointer"
                >
                  Publish Post
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
