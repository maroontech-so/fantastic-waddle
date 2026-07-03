import React, { useState, useMemo } from 'react';
import { Search, Home, ChevronRight, Folder, MoreVertical, LayoutGrid, List, FileText, Link as LinkIcon, Archive, FileCode, Download, ExternalLink, Plus, UploadCloud, X, Github, GraduationCap, BookOpen, Sparkles, Code2, ArrowRight, Award, Compass, BookOpenCheck, Copy } from 'lucide-react';
import { LibraryFolder, LibraryFile, FileType } from '../types';
import tutorialData from '../tutorial.json';
import { getTemplateForTopic, getTemplateForProject, getAllLessonsFromTutorial, TutorialTopicItem } from '../utils/tutorialSandbox';

interface LibraryViewProps {
  folders: LibraryFolder[];
  files: LibraryFile[];
  onAddFile: (file: LibraryFile) => void;
  onToast: (msg: string) => void;
  onTryCode?: (code: { html: string; css: string; js: string; title: string }) => void;
  onRewardXP?: (amount: number, type: 'checkin' | 'engagement' | 'learning' | 'contribution', description: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  folders,
  files,
  onAddFile,
  onToast,
  onTryCode,
  onRewardXP,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'files' | 'tutorials'>('files');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Dynamic tutorial states
  const [selectedPartIndex, setSelectedPartIndex] = useState<number>(0);
  const [expandedChapterIndex, setExpandedChapterIndex] = useState<number | null>(0);
  const [expandedTopicTitle, setExpandedTopicTitle] = useState<string | null>(null);
  const [syllabusSearch, setSyllabusSearch] = useState<string>('');
  const [masteredLessons, setMasteredLessons] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('mku_mastered_lessons') || '[]');
    } catch (e) {
      return [];
    }
  });

  const allSyllabusLessons = useMemo(() => getAllLessonsFromTutorial(tutorialData), []);
  const matchingSearchLessons = useMemo(() => {
    if (!syllabusSearch.trim()) return [];
    const q = syllabusSearch.toLowerCase();
    return allSyllabusLessons.filter(l =>
      l.topic.toLowerCase().includes(q) ||
      l.explanation.toLowerCase().includes(q) ||
      l.use_case.toLowerCase().includes(q) ||
      l.partTitle.toLowerCase().includes(q) ||
      l.chapterTitle.toLowerCase().includes(q)
    );
  }, [syllabusSearch, allSyllabusLessons]);

  const handleToggleMastered = (topicName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (masteredLessons.includes(topicName)) {
      updated = masteredLessons.filter(name => name !== topicName);
      onToast(`Unmarked lesson: ${topicName}`);
    } else {
      updated = [...masteredLessons, topicName];
      if (onRewardXP) {
        onRewardXP(25, 'learning', `Mastered curriculum topic: ${topicName}`);
      }
      onToast(`🎉 Lesson Mastered! +25 XP awarded for "${topicName}"`);
    }
    setMasteredLessons(updated);
    localStorage.setItem('mku_mastered_lessons', JSON.stringify(updated));
  };

  // Upload Form State
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<FileType>('pdf');
  const [fileCategory, setFileCategory] = useState('Web Development');
  const [fileSize, setFileSize] = useState('1.2 MB');

  const filteredFiles = files.filter((file) => {
    const matchesCategory = selectedCategory ? file.category === selectedCategory : true;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) {
      onToast('Enter a valid file name');
      return;
    }

    const newFile: LibraryFile = {
      id: `file_${Date.now()}`,
      name: fileName.includes('.') ? fileName : `${fileName}.${fileType === 'link' ? 'url' : fileType}`,
      size: fileType === 'link' ? 'Link' : fileSize,
      type: fileType,
      uploader: 'You',
      time: 'Just now',
      category: fileCategory,
    };

    onAddFile(newFile);
    setIsUploadOpen(false);
    onToast(`Uploaded ${newFile.name}`);
    
    setFileName('');
    setFileType('pdf');
    setFileSize('1.2 MB');
  };

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'pdf':
        return (
          <div className="bg-red-50 p-2 rounded-lg shrink-0 border border-red-100">
            <FileText className="w-5 h-5 text-red-500" />
          </div>
        );
      case 'link':
        return (
          <div className="bg-blue-50 p-2 rounded-lg shrink-0 border border-blue-100">
            <LinkIcon className="w-5 h-5 text-blue-600" />
          </div>
        );
      case 'zip':
        return (
          <div className="bg-emerald-50 p-2 rounded-lg shrink-0 border border-emerald-100">
            <Archive className="w-5 h-5 text-emerald-600" />
          </div>
        );
      case 'code':
        return (
          <div className="bg-amber-50 p-2 rounded-lg shrink-0 border border-amber-100">
            <FileCode className="w-5 h-5 text-amber-500" />
          </div>
        );
      default:
        return (
          <div className="bg-slate-100 p-2 rounded-lg shrink-0">
            <FileText className="w-5 h-5 text-slate-500" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 px-4 md:px-8 pt-6 pb-24 relative max-w-5xl mx-auto">
      {/* Official IT Club Github Repo Card (At the top) */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 md:p-5 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="p-3 bg-white/10 rounded-xl shrink-0 flex items-center justify-center">
            <Github className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5 justify-center sm:justify-start">
              Official MKU IT Club Repo <span className="bg-blue-500/20 text-blue-400 font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">GitHub</span>
            </h4>
            <p className="text-slate-400 text-[10.5px] mt-1 font-semibold leading-relaxed">
              Explore our open-source student-built code repositories, check lecture slide projects, and submit pull requests.
            </p>
          </div>
        </div>
        <a
          href="https://github.com/mku-it-club"
          target="_blank"
          rel="noreferrer"
          className="bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-[11px] px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer w-full sm:w-auto justify-center"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Visit Club GitHub
        </a>
      </div>

      {/* Modern High-fidelity tab-bar to switch between resources and interactive tutorials */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
        <button
          onClick={() => {
            setActiveSubTab('files');
            onToast('Navigated to shared folder directory');
          }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'files' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Folder className="w-4 h-4 text-blue-500" /> Resource Files Directory
        </button>
        <button
          onClick={() => {
            setActiveSubTab('tutorials');
            onToast('Navigated to interactive tutorials');
          }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'tutorials' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4.5 h-4.5 text-indigo-500" /> Interactive Coding Lessons
        </button>
      </div>

      {activeSubTab === 'files' ? (
        <>
          {/* Search Input for Mobile */}
          <div className="md:hidden relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search global files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/70 backdrop-blur-md pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Clean Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <button
              onClick={() => setSelectedCategory(null)}
              className="hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Root Directory</span>
            </button>
            {selectedCategory && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded font-extrabold uppercase text-[9px] tracking-wider">
                  {selectedCategory}
                </span>
              </>
            )}
          </div>

      {/* Collection Cards Grid */}
      <div>
        <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-400 mb-3">Folders</h3>
        <div id="folder-grid" className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {folders.map((folder) => {
            const isSelected = selectedCategory === folder.name;
            return (
              <div
                key={folder.id}
                onClick={() => {
                  setSelectedCategory(isSelected ? null : folder.name);
                  onToast(`Filtered: ${folder.name}`);
                }}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer apple-active flex flex-col justify-between h-28 ${
                  isSelected
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                    : 'glass-card text-slate-900 hover:border-blue-400'
                }`}
              >
                <div className="flex justify-between items-start">
                  <Folder
                    className={`w-6 h-6 ${
                      isSelected ? 'text-white fill-white/20' : 'text-blue-500 fill-blue-50'
                    }`}
                  />
                  <MoreVertical className={`w-3.5 h-3.5 ${isSelected ? 'text-white/70' : 'text-slate-300'}`} />
                </div>
                <div>
                  <h4 className="font-bold text-xs tracking-tight truncate">
                    {folder.name}
                  </h4>
                  <p className={`text-[9px] font-semibold mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    {folder.itemsCount} elements
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Files List Title */}
      <div className="flex justify-between items-center pt-2">
        <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-400">
          {selectedCategory ? `${selectedCategory}` : 'Recent Shared Files'}
          <span className="ml-1.5 text-[9px] text-slate-400 font-extrabold bg-slate-100 px-1.5 py-0.5 rounded-full">
            {filteredFiles.length}
          </span>
        </h3>
        
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
              viewMode === 'grid' ? 'bg-slate-200 border-slate-300 text-slate-900' : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
              viewMode === 'list' ? 'bg-slate-200 border-slate-300 text-slate-900' : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Shared Resource Files */}
      {filteredFiles.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center text-slate-400">
          <Folder className="w-10 h-10 text-slate-300 mx-auto mb-2 opacity-55" />
          <p className="text-xs font-semibold text-slate-700">No resources available</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white/80 backdrop-blur rounded-xl border border-slate-200/60 shadow-sm overflow-hidden divide-y divide-slate-100">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => {
                onToast(`Downloading: ${file.name}`);
              }}
              className="flex items-center gap-3 p-3 hover:bg-slate-50/70 transition-all cursor-pointer group"
            >
              {getFileIcon(file.type)}
              
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                  {file.name}
                </h5>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium flex items-center gap-1 flex-wrap">
                  <span className="bg-slate-100 text-slate-600 px-1 py-0.1 rounded text-[8px] uppercase font-bold">
                    {file.category}
                  </span>
                  <span>• {file.size}</span>
                  <span>• Shared by {file.uploader}</span>
                </p>
              </div>

              <div className="shrink-0">
                <button className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors border border-slate-200 shadow-sm flex items-center justify-center">
                  {file.type === 'link' ? <ExternalLink className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => {
                onToast(`Downloading: ${file.name}`);
              }}
              className="glass-card p-4 rounded-xl hover:border-blue-400 hover:bg-white transition-all group flex flex-col justify-between h-32 cursor-pointer apple-active"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  {getFileIcon(file.type)}
                  <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[8px] uppercase font-extrabold tracking-wider border border-slate-150">
                    {file.category}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {file.name}
                </h5>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-semibold">
                <span>{file.size} • {file.uploader}</span>
                {file.type === 'link' ? <ExternalLink className="w-3.5 h-3.5 text-slate-400" /> : <Download className="w-3.5 h-3.5 text-slate-400" />}
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Dynamic Course Header Card with Mastered Progress */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-5 md:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-400">
                  <GraduationCap className="w-5 h-5 animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">Dynamic Student Curriculum</span>
                </div>
                <h3 className="text-base md:text-lg font-black tracking-tight">{tutorialData.course.title}</h3>
                <p className="text-slate-300 text-[11px] font-semibold leading-relaxed max-w-3xl">
                  {tutorialData.course.subtitle}
                </p>
              </div>

              {/* Mastered Progress Bar */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Curriculum Mastery: <strong className="text-white font-black">{masteredLessons.length}</strong> of {allSyllabusLessons.length} topics ({Math.round((masteredLessons.length / (allSyllabusLessons.length || 1)) * 100)}%)</span>
                </div>
                <div className="w-full sm:w-48 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                  <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full transition-all duration-500" style={{ width: `${Math.min(100, (masteredLessons.length / (allSyllabusLessons.length || 1)) * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Syllabus Global Search & Filter Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="🔍 Search across all 10 parts & 100+ topics (e.g., 'flexbox', 'table', 'localStorage', 'doctype', 'form')..."
              value={syllabusSearch}
              onChange={(e) => setSyllabusSearch(e.target.value)}
              className="w-full bg-white pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
            />
            {syllabusSearch && (
              <button
                onClick={() => setSyllabusSearch('')}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Conditional Display: Search Results OR Standard Syllabus Accordion */}
          {syllabusSearch.trim() ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                <span>Found {matchingSearchLessons.length} matching topics for "{syllabusSearch}"</span>
                <button onClick={() => setSyllabusSearch('')} className="text-blue-600 hover:underline">Clear Search</button>
              </div>
              {matchingSearchLessons.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 font-semibold text-xs">
                  No syllabus topics matched your query. Try a keyword like "HTML", "CSS", "flex", or "button".
                </div>
              ) : (
                matchingSearchLessons.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3 hover:border-slate-300 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-extrabold text-indigo-500 uppercase tracking-widest block">
                          Part {item.partNumber} • Chapter {item.chapterNumber}: {item.chapterTitle}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-800 mt-0.5 flex items-center gap-2">
                          {item.topic}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleToggleMastered(item.topic, e)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                            masteredLessons.includes(item.topic)
                              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <BookOpenCheck className="w-3 h-3" />
                          {masteredLessons.includes(item.topic) ? '✓ Mastered' : 'Mark Mastered'}
                        </button>
                        <button
                          onClick={() => {
                            const template = getTemplateForTopic(item, item.partNumber);
                            if (onTryCode) {
                              onTryCode({
                                title: item.topic,
                                html: template.html,
                                css: template.css,
                                js: template.js,
                              });
                              if (onRewardXP) {
                                onRewardXP(15, 'learning', `Started interactive coding sandbox: ${item.topic}`);
                              }
                              onToast(`Loaded "${item.topic}" into live playground! +15 XP`);
                            }
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
                        >
                          Try in Playground <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-600 text-xs font-semibold">{item.explanation}</p>
                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 relative">
                      <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono font-bold mb-1">
                        <span>Code Example</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(item.example);
                            onToast(`✓ Copied snippet for "${item.topic}"`);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded cursor-pointer"
                        >
                          Copy
                        </button>
                      </div>
                      <pre className="text-slate-300 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap">{item.example}</pre>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {/* Parts Quick Navigation Horizontal Slider */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-[10px] uppercase tracking-widest text-slate-400">Course Journey Navigation</h4>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
                  {tutorialData.course.parts.map((part: any, index: number) => {
                    const isSelected = selectedPartIndex === index;
                    const isCap = part.part_title.toLowerCase().includes('capstone');
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedPartIndex(index);
                          setExpandedChapterIndex(0); // auto-expand first chapter on shift
                          setExpandedTopicTitle(null);
                          onToast(`Switched to: ${part.part_title}`);
                        }}
                        className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all shrink-0 cursor-pointer border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10 scale-[1.02]'
                            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300'
                        }`}
                      >
                        {isCap ? (
                          <>
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span>Graduation Exams</span>
                          </>
                        ) : (
                          <>
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></span>
                            <span>Part {part.part_number}: {part.part_title}</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Part Meta Details & Chapters Accordion */}
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Part Overview</span>
                  <p className="text-slate-600 text-xs font-bold leading-relaxed mt-1">
                    {tutorialData.course.parts[selectedPartIndex].description}
                  </p>
                </div>

                {/* Render Chapters or Capstone Projects */}
                {(() => {
                  const currentPart = tutorialData.course.parts[selectedPartIndex] as any;
                  const isCapstone = currentPart.part_title.toLowerCase().includes('capstone') || !currentPart.chapters;

                  if (isCapstone) {
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {currentPart.projects?.map((project: any, pIdx: number) => (
                          <div
                            key={pIdx}
                            className="bg-white rounded-2xl border-2 border-amber-200/60 p-4 md:p-5 shadow-sm hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="bg-amber-100 text-amber-800 text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-200">
                                  Exams
                                </span>
                                <Award className="w-5 h-5 text-amber-500" />
                              </div>
                              <div>
                                <h5 className="font-extrabold text-xs text-slate-800 leading-tight">
                                  {project.name}
                                </h5>
                                <p className="text-slate-500 text-[10.5px] leading-relaxed font-semibold mt-1.5">
                                  {project.description}
                                </p>
                              </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-100 space-y-3.5">
                              <div className="flex flex-wrap gap-1.5">
                                {project.tech_stack.split(',').map((tech: string, tIdx: number) => (
                                  <span key={tIdx} className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-200">
                                    {tech.trim()}
                                  </span>
                                ))}
                              </div>
                              <button
                                onClick={() => {
                                  const template = getTemplateForProject(project.name);
                                  if (onTryCode) {
                                    onTryCode({
                                      title: project.name,
                                      html: template.html,
                                      css: template.css,
                                      js: template.js,
                                    });
                                    if (onRewardXP) {
                                      onRewardXP(25, 'learning', `Started Graduation Project: ${project.name}`);
                                    }
                                    onToast(`Started ${project.name} live coding playground! +25 XP 🚀`);
                                  }
                                }}
                                className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Code2 className="w-4 h-4" /> Start Graduation Project
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  // Otherwise render standard Syllabus Chapters accordion
                  return (
                    <div className="space-y-3">
                      {currentPart.chapters.map((chapter: any, chapIdx: number) => {
                        const isChapterExpanded = expandedChapterIndex === chapIdx;
                        return (
                          <div
                            key={chapIdx}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all hover:border-slate-300"
                          >
                            {/* Chapter Expandable Header */}
                            <div
                              onClick={() => setExpandedChapterIndex(isChapterExpanded ? null : chapIdx)}
                              className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100/50 shrink-0">
                                  <BookOpen className="w-4.5 h-4.5" />
                                </div>
                                <div>
                                  <span className="text-[8.5px] font-extrabold text-indigo-500 uppercase tracking-widest block">
                                    Chapter {chapter.chapter_number}
                                  </span>
                                  <h4 className="font-extrabold text-xs text-slate-800 mt-0.5">
                                    {chapter.chapter_title}
                                  </h4>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                  {chapter.topics.length} topics
                                </span>
                                <span className="text-xs font-extrabold text-blue-600">
                                  {isChapterExpanded ? 'Hide' : 'Expand'}
                                </span>
                              </div>
                            </div>

                            {/* Chapter Topics Accordion Inside */}
                            {isChapterExpanded && (
                              <div className="p-4 border-t border-slate-100 bg-slate-50/20 space-y-3">
                                {chapter.topics.map((topic: any, topIdx: number) => {
                                  const isTopicExpanded = expandedTopicTitle === topic.topic;
                                  const isMastered = masteredLessons.includes(topic.topic);
                                  return (
                                    <div
                                      key={topIdx}
                                      className="border border-slate-200/80 rounded-xl bg-white overflow-hidden shadow-xs"
                                    >
                                      {/* Topic Title Row */}
                                      <div
                                        onClick={() => setExpandedTopicTitle(isTopicExpanded ? null : topic.topic)}
                                        className="p-3 flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-50/40 transition-colors"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className={`w-2 h-2 rounded-full ${isMastered ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                                          <h5 className={`font-extrabold text-xs ${isMastered ? 'text-emerald-800' : 'text-slate-800'}`}>
                                            {topic.topic}
                                          </h5>
                                          {isMastered && <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded">✓ Mastered</span>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={(e) => handleToggleMastered(topic.topic, e)}
                                            className={`px-2 py-0.5 rounded text-[9px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                                              isMastered
                                                ? 'bg-emerald-500 text-white shadow-xs'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                            }`}
                                          >
                                            <BookOpenCheck className="w-3 h-3" />
                                            {isMastered ? 'Mastered' : 'Mark'}
                                          </button>
                                          <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider shrink-0">
                                            {isTopicExpanded ? 'Close Detail' : 'Read Topic'}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Topic Extended Body Details */}
                                      {isTopicExpanded && (
                                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-4">
                                          {/* Explanation */}
                                          <div className="space-y-1.5">
                                            <span className="text-[8.5px] font-black text-indigo-500 uppercase tracking-widest block">
                                              Explanation
                                            </span>
                                            <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                                              {topic.explanation}
                                            </p>
                                          </div>

                                          {/* Analogy Use Case */}
                                          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-indigo-700">
                                              <Compass className="w-3.5 h-3.5" />
                                              <span className="text-[8.5px] font-black uppercase tracking-widest">
                                                Real-World Analogy & Use Case
                                              </span>
                                            </div>
                                            <p className="text-indigo-950 text-xs font-bold leading-relaxed">
                                              {topic.use_case}
                                            </p>
                                          </div>

                                          {/* Step-by-Step Example / Sandbox experiment instruction */}
                                          <div className="border border-slate-200 bg-slate-900 rounded-xl p-3.5 space-y-1.5">
                                            <div className="flex items-center justify-between text-emerald-400">
                                              <div className="flex items-center gap-1.5">
                                                <Code2 className="w-3.5 h-3.5" />
                                                <span className="text-[8.5px] font-black uppercase tracking-widest font-mono">
                                                  Interactive Lab Example
                                                </span>
                                              </div>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  navigator.clipboard.writeText(topic.example);
                                                  onToast(`✓ Copied example code for "${topic.topic}"`);
                                                }}
                                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-extrabold px-2 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1"
                                              >
                                                <Copy className="w-2.5 h-2.5" /> Copy Code
                                              </button>
                                            </div>
                                            <div className="text-slate-300 font-mono text-[10px] whitespace-pre-wrap leading-relaxed max-w-full overflow-x-auto">
                                              {topic.example}
                                            </div>
                                          </div>

                                          {/* Try Code Sandbox button */}
                                          <div className="flex justify-end pt-1">
                                            <button
                                              onClick={() => {
                                                const template = getTemplateForTopic(topic, currentPart.part_number);
                                                if (onTryCode) {
                                                  onTryCode({
                                                    title: topic.topic,
                                                    html: template.html,
                                                    css: template.css,
                                                    js: template.js,
                                                  });
                                                  if (onRewardXP) {
                                                    onRewardXP(15, 'learning', `Started interactive coding sandbox: ${topic.topic}`);
                                                  }
                                                  onToast(`Loaded "${topic.topic}" into live playground! +15 XP`);
                                                }
                                              }}
                                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                                            >
                                              Try in Playground <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </>
          )}
        </div>
      )}

      {/* Apple Floating Upload Button */}
      <button
        onClick={() => setIsUploadOpen(true)}
        className="fixed bottom-24 right-5 md:bottom-10 md:right-10 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 z-40 cursor-pointer border border-white/10"
      >
        <Plus className="w-5.5 h-5.5" />
      </button>

      {/* Clean Premium Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in border border-slate-100">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">Add Resource</h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-4 space-y-3.5">
              {/* Simple Drag & Drop Zone */}
              <div
                onClick={() => onToast('Native file system triggered')}
                className="border border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="bg-blue-50 p-2 rounded-full mb-1 group-hover:bg-blue-100 transition-colors">
                  <UploadCloud className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-[10px] font-bold text-slate-800">Select file to shared space</p>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Name / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kotlin_CheatSheet"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-900 font-semibold"
                />
              </div>

              {/* Grid selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    File Type
                  </label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value as FileType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-900 font-bold"
                  >
                    <option value="pdf">PDF Doc</option>
                    <option value="link">Web Url</option>
                    <option value="zip">ZIP File</option>
                    <option value="code">Source</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={fileCategory}
                    onChange={(e) => setFileCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-900 font-bold"
                  >
                    <option value="Web Development">Web Dev</option>
                    <option value="Mobile Apps">Mobile Apps</option>
                    <option value="AI & Data Science">AI & Data</option>
                    <option value="Past Papers">Past Papers</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition-all text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition-all text-center shadow-md active:scale-95 cursor-pointer"
                >
                  Add Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

