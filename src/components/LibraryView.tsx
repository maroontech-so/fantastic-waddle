import React, { useState, useMemo, useEffect } from 'react';
import { Search, Home, ChevronRight, ChevronLeft, Folder, MoreVertical, LayoutGrid, List, FileText, Link as LinkIcon, Archive, FileCode, Download, ExternalLink, Plus, UploadCloud, X, Github, GraduationCap, BookOpen, Sparkles, Code2, ArrowRight, Award, Compass, BookOpenCheck, Copy, ArrowLeft, Minus, Trash2, FolderPlus, FilePlus, RefreshCw, FileText as FileTextIcon } from 'lucide-react';
import { LibraryFolder, LibraryFile, FileType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import tutorialData from '../tutorial.json';
import { getTemplateForTopic, getTemplateForProject, getAllLessonsFromTutorial, TutorialTopicItem } from '../utils/tutorialSandbox';
import { listStorageItems, createStorageDirectory, createStorageMaterial, uploadStorageFile, deleteStorageItem, PuterItem, isPuterAvailable } from '../utils/puterStorage';

interface LibraryViewProps {
  folders: LibraryFolder[];
  files: LibraryFile[];
  onAddFile: (file: LibraryFile) => void;
  onToast: (msg: string) => void;
  onTryCode?: (code: { html: string; css: string; js: string; title: string }) => void;
  onRewardXP?: (amount: number, type: 'checkin' | 'engagement' | 'learning' | 'contribution', description: string) => void;
  initialTab?: 'files' | 'tutorials';
  onViewingDocumentChange?: (isViewing: boolean) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  folders,
  files,
  onAddFile,
  onToast,
  onTryCode,
  onRewardXP,
  initialTab = 'files',
  onViewingDocumentChange,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'files' | 'tutorials'>(initialTab);
  
  useEffect(() => {
    if (initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [initialTab]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null);

  // Puter Storage Backend States
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [puterItems, setPuterItems] = useState<PuterItem[]>([]);
  const [isLoadingStorage, setIsLoadingStorage] = useState<boolean>(false);
  const [isNewDirModalOpen, setIsNewDirModalOpen] = useState<boolean>(false);
  const [newDirName, setNewDirName] = useState<string>('');
  const [isNewMaterialModalOpen, setIsNewMaterialModalOpen] = useState<boolean>(false);
  const [newMatName, setNewMatName] = useState<string>('');
  const [newMatContent, setNewMatContent] = useState<string>('');
  const [isTocModalOpen, setIsTocModalOpen] = useState<boolean>(false);

  // Dynamic tutorial states with local progress saving
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('advocode_tutorial_last_stop');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch (e) {
      return 0;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('advocode_tutorial_last_stop', String(activeLessonIndex));
    } catch (e) {}
  }, [activeLessonIndex]);

  const [isViewingCapstone, setIsViewingCapstone] = useState<boolean>(false);
  const [selectedPartIndex, setSelectedPartIndex] = useState<number>(0);
  const [isViewingDocument, setIsViewingDocument] = useState<boolean>(true);
  const [pdfZoom, setPdfZoom] = useState<number>(100);
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

  const refreshStorage = async () => {
    setIsLoadingStorage(true);
    try {
      const cached = localStorage.getItem(`advocode_puter_cache_${currentPath}`);
      if (cached && puterItems.length === 0) {
        setPuterItems(JSON.parse(cached));
      }
    } catch (e) {}
    try {
      const items = await listStorageItems(currentPath);
      setPuterItems(items);
      localStorage.setItem(`advocode_puter_cache_${currentPath}`, JSON.stringify(items));
    } catch (e) {
      console.log("Offline or error loading storage, using cached directory contents.");
    } finally {
      setIsLoadingStorage(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'files') {
      refreshStorage();
    }
  }, [currentPath, activeSubTab]);

  useEffect(() => {
    if (activeSubTab === 'tutorials') {
      onViewingDocumentChange?.(isViewingDocument);
    } else {
      onViewingDocumentChange?.(false);
    }
  }, [isViewingDocument, activeSubTab, onViewingDocumentChange]);

  const allSyllabusLessons = useMemo(() => getAllLessonsFromTutorial(tutorialData), []);

  // Keyboard navigation for turning book pages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeSubTab !== 'tutorials' || syllabusSearch.trim() || isViewingCapstone) return;
      if (e.key === 'ArrowRight') {
        setActiveLessonIndex((prev) => Math.min(allSyllabusLessons.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveLessonIndex((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSubTab, allSyllabusLessons.length, syllabusSearch, isViewingCapstone]);

  // Synchronize Part index and Expanded Chapter when activeBookLesson changes
  useEffect(() => {
    if (activeSubTab === 'tutorials' && allSyllabusLessons[activeLessonIndex]) {
      const current = allSyllabusLessons[activeLessonIndex];
      // Find matching Part index
      const pIdx = tutorialData.course.parts.findIndex(
        (part: any) => part.part_title === current.partTitle
      );
      if (pIdx !== -1) {
        setSelectedPartIndex(pIdx);
        setIsViewingCapstone(false);

        // Find chapter index in that Part
        const partObj = tutorialData.course.parts[pIdx];
        if (partObj.chapters) {
          const cIdx = partObj.chapters.findIndex(
            (chap: any) => chap.chapter_number === current.chapterNumber
          );
          if (cIdx !== -1) {
            setExpandedChapterIndex(cIdx);
          }
        }
      }
    }
  }, [activeLessonIndex, allSyllabusLessons, activeSubTab]);
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

  const handleNextLessonWithAutoMark = () => {
    const currentTopic = allSyllabusLessons[activeLessonIndex]?.topic;
    if (currentTopic && !masteredLessons.includes(currentTopic)) {
      const nextMastered = [...masteredLessons, currentTopic];
      setMasteredLessons(nextMastered);
      try {
        localStorage.setItem('mku_mastered_lessons', JSON.stringify(nextMastered));
      } catch (e) {}
      onRewardXP?.(15, 'learning', `Mastered lesson: ${currentTopic}`);
    }
    setActiveLessonIndex((prev) => Math.min(allSyllabusLessons.length - 1, prev + 1));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) {
      onToast('Enter a valid file name');
      return;
    }

    if (selectedFileObj) {
      await uploadStorageFile(currentPath, selectedFileObj);
    } else {
      await createStorageMaterial(currentPath, fileName.includes('.') ? fileName : `${fileName}.${fileType === 'link' ? 'url' : fileType}`, `[Resource added in category: ${fileCategory}]`);
    }
    await refreshStorage();

    const newFile: LibraryFile = {
      id: `file_${Date.now()}`,
      name: fileName.includes('.') ? fileName : `${fileName}.${fileType === 'link' ? 'url' : fileType}`,
      size: selectedFileObj ? `${Math.round(selectedFileObj.size / 1024)} KB` : (fileType === 'link' ? 'Link' : fileSize),
      type: fileType,
      uploader: 'You',
      time: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      category: fileCategory,
    };

    onAddFile(newFile);
    setIsUploadOpen(false);
    setSelectedFileObj(null);
    onToast(`☁️ Saved resource to Puter.js cloud storage: ${newFile.name}`);
    
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

  const renderPdfReader = () => {
    const current = allSyllabusLessons[activeLessonIndex];
    
    return (
      <div className="flex flex-col bg-slate-100 dark:bg-slate-950 md:rounded-2xl md:border md:border-slate-200 dark:md:border-slate-800 md:shadow-xl overflow-hidden min-h-screen md:min-h-[85vh] animate-scale-in w-full">
        {/* Floating Top Centre Home / Table of Contents Icon for Mobile */}
        <div className="md:hidden fixed top-3 left-1/2 -translate-x-1/2 z-[100]">
          <button
            onClick={() => setIsViewingDocument(false)}
            className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white hover:bg-blue-600 font-extrabold text-xs px-4 py-2 rounded-full shadow-2xl border border-slate-700/80 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4 text-indigo-400" />
            <span>Table of Contents</span>
          </button>
        </div>

        {/* Unified Curriculum Mastery & Linear Horizontal Flex Reader Toolbar */}
        <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-4 py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 shrink-0 select-none shadow-xs">
          {/* Left: Mastery Stats & TOC button */}
          <div className="flex items-center justify-between md:justify-start gap-3 shrink-0">
            <button
              onClick={() => setIsTocModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-blue-700 dark:text-slate-200 font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-xs border border-blue-200 dark:border-slate-700"
            >
              <BookOpen className="w-4 h-4 text-indigo-500 group-hover:text-white" />
              <span>Table of Contents</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300">
              <Award className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Mastery: <strong className="text-blue-600 dark:text-blue-400 font-black">{masteredLessons.length}</strong>/{allSyllabusLessons.length}</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[150px] hidden lg:inline">
              {isViewingCapstone ? 'Graduation Capstone' : current?.topic || 'Lesson'}
            </span>
          </div>

          {/* Right: Linear Horizontal Flex Toolbar (Prev, Page X of Y, Next, Download, Mark Mastered) */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 overflow-x-auto no-scrollbar py-0.5">
            <button
              disabled={isViewingCapstone ? false : activeLessonIndex === 0}
              onClick={() => {
                if (isViewingCapstone) {
                  setIsViewingCapstone(false);
                  setActiveLessonIndex(allSyllabusLessons.length - 1);
                } else {
                  setActiveLessonIndex(prev => Math.max(0, prev - 1));
                }
              }}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold disabled:opacity-40 rounded-xl transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              title="Previous Lesson"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <span className="text-xs font-mono font-bold px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 shrink-0 text-center">
              {isViewingCapstone ? `Final/${allSyllabusLessons.length}` : `${activeLessonIndex + 1} of ${allSyllabusLessons.length}`}
            </span>

            <button
              disabled={isViewingCapstone}
              onClick={() => {
                if (activeLessonIndex === allSyllabusLessons.length - 1) {
                  setIsViewingCapstone(true);
                  onToast("🎓 Entered Capstone Projects Graduation Area!");
                } else {
                  handleNextLessonWithAutoMark();
                }
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold disabled:opacity-40 rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-xs shrink-0"
              title="Next Lesson (Auto-marks as read)"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                if (isViewingCapstone) {
                  onToast('Download Started: AdvocoDe_Capstone_Certificate.pdf');
                } else {
                  onToast(`Download Started: Lesson_${activeLessonIndex + 1}_Documentation.pdf`);
                }
              }}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold shrink-0"
              title="Download Lesson Doc"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">DL</span>
            </button>

            {!isViewingCapstone && (
              <button
                onClick={(e) => handleToggleMastered(current?.topic, e)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  masteredLessons.includes(current?.topic)
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <BookOpenCheck className="w-3.5 h-3.5" />
                <span>
                  {masteredLessons.includes(current?.topic) ? 'Mastered ✓' : 'Master'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* PDF Document Canvas (Scrollable space) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950 scrollbar-thin select-text">
          {/* Document Sheet */}
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm md:shadow-xl rounded-xl md:rounded-2xl p-6 sm:p-10 md:p-14 mx-auto border border-slate-200 dark:border-slate-800 select-text relative">
            {/* Watermark / Logo background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none select-none">
              <img src="/logo.svg" className="w-96 h-96" alt="" />
            </div>

            {isViewingCapstone ? (
              // Graduation Exam Layout
              <div className="space-y-6">
                {/* Exam header */}
                <div className="border-b-4 border-amber-500 pb-4 flex flex-wrap justify-between items-end gap-3 select-none">
                  <div>
                    <h1 className="text-2xl font-serif font-black tracking-tight text-amber-600">
                      GRADUATION EXAM PORTAL
                    </h1>
                    <p className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest mt-1">
                      ADVOCODE ACADEMY OF ADVANCED SOFTWARE ENGINEERING
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold px-2 py-1 rounded-full uppercase">
                      FINAL CAPSTONE
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-semibold leading-relaxed border-l-2 border-slate-300 pl-3">
                  This capstone section represents your culminating milestone at AdvocoDe. Below are the primary production assignments. Submit your graduation files to earn your Club Certificate.
                </p>

                <div className="space-y-8 pt-4">
                  {tutorialData.course.parts[selectedPartIndex]?.projects?.map((project: any, pIdx: number) => (
                    <div key={pIdx} className="border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                      <div className="flex justify-between items-center select-none">
                        <span className="bg-slate-100 text-slate-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded border">
                          PART_PROJECT_0{pIdx + 1}
                        </span>
                        <Award className="w-5 h-5 text-amber-500" />
                      </div>
                      
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                        {project.name}
                      </h3>

                      <p className="text-slate-655 text-xs font-semibold leading-relaxed">
                        {project.description}
                      </p>

                      <div className="pt-3 mt-3 border-t border-slate-100 space-y-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider select-none">
                            Technical Requirements:
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {project.tech_stack.split(',').map((tech: string, tIdx: number) => (
                              <span key={tIdx} className="bg-slate-50 border text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded">
                                {tech.trim()}
                              </span>
                            ))}
                          </div>
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
                            }
                          }}
                          className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer select-none"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Bootstrap Exam Template in Sandbox</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Standard Lesson Page Document Layout
              <div className="space-y-6">
                {/* Document Header */}
                <div className="border-b border-slate-200 pb-4 flex justify-between items-end select-none">
                  <div>
                    <span className="text-[9px] font-mono text-indigo-600 font-bold tracking-widest uppercase block">
                      Course Document • Chapter {current?.chapterNumber}
                    </span>
                    <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-slate-900 mt-1">
                      {current?.topic}
                    </h1>
                  </div>
                  <div className="text-right font-mono text-[9px] text-slate-400 font-bold uppercase select-none">
                    PART {current?.partNumber} • LESSON {activeLessonIndex + 1}
                  </div>
                </div>

                {/* Subtitle / Details */}
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg flex gap-3 items-start select-none">
                  <div className="bg-indigo-100 text-indigo-700 p-1.5 rounded-md shrink-0">
                    <BookOpen className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-450 uppercase tracking-wider">
                      Module Title
                    </h5>
                    <p className="text-xs font-bold text-slate-800">
                      {current?.chapterTitle}
                    </p>
                  </div>
                </div>

                {/* Explanation text */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 select-none">
                    1. Conceptual Overview
                  </h3>
                  <p className="text-slate-750 text-xs leading-relaxed font-serif pl-1">
                    {current?.explanation}
                  </p>
                </div>

                {/* Use Case */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 select-none">
                    2. Core Application & Use Case
                  </h3>
                  <div className="bg-blue-50/50 border border-blue-100/60 p-4 rounded-xl leading-relaxed text-xs text-blue-900 font-serif">
                    {current?.use_case}
                  </div>
                </div>

                {/* Implementation Code */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1 select-none">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      3. Sandbox Source Code
                    </h3>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(current?.example);
                        onToast('✓ Copied code example to clipboard');
                      }}
                      className="text-[10px] text-indigo-600 hover:text-indigo-850 font-bold px-2 py-0.5 rounded hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      Copy Snippet
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-200 overflow-hidden font-mono text-[11px] bg-slate-900 text-slate-200 p-5 leading-relaxed relative animate-fade-in">
                    <pre className="overflow-x-auto whitespace-pre-wrap break-all">{current?.example}</pre>
                  </div>
                </div>

                {/* Bottom interactive action */}
                <div className="pt-6 border-t border-slate-100 select-none flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {masteredLessons.includes(current?.topic) 
                      ? '✓ You have mastered this lesson!' 
                      : 'Complete this lesson to advance your skills.'
                    }
                  </div>

                  <button
                    onClick={() => {
                      if (onTryCode) {
                        onTryCode({
                          title: current?.topic,
                          html: current?.example.includes('<html>') || !current?.example.includes('function') ? current?.example : '<!-- HTML -->',
                          css: '/* CSS styling */',
                          js: current?.example.includes('function') || current?.example.includes('console.log') ? current?.example : '// JS logic',
                        });
                        onToast(`💻 Loaded "${current?.topic}" into the Sandbox Editor!`);
                      }
                    }}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-750 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-md hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4.5 h-4.5" />
                    <span>Run Example in Sandbox Editor</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={isViewingDocument && activeSubTab === 'tutorials' ? "w-full h-full flex flex-col max-w-6xl mx-auto md:px-6 md:py-4" : "space-y-6 px-4 md:px-8 pt-6 pb-24 relative max-w-5xl mx-auto"}>
      {activeSubTab === 'files' ? (
        <>
          {/* Official IT Club Github Repo Card (Only on Resources page) */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 md:p-5 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="p-3 bg-white/10 rounded-xl shrink-0 flex items-center justify-center">
                <Github className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5 justify-center sm:justify-start">
                  Official &lt;/AdvocoDe&gt; Network Repo <span className="bg-blue-500/20 text-blue-400 font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">GitHub</span>
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

          {/* Puter Cloud Storage Toolbar & Breadcrumb */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setCurrentPath('/')}
                  className="hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Home className="w-4 h-4 text-blue-500" />
                  <span>Cloud Storage Root</span>
                </button>
                {currentPath !== '/' && currentPath.split('/').filter(Boolean).map((seg, idx, arr) => {
                  const subPath = '/' + arr.slice(0, idx + 1).join('/');
                  return (
                    <React.Fragment key={subPath}>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <button
                        onClick={() => setCurrentPath(subPath)}
                        className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded font-extrabold text-[10px] uppercase tracking-wider hover:bg-blue-100 transition-colors cursor-pointer shrink-0"
                      >
                        {seg}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Action Buttons & Status */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <span className="text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {isPuterAvailable() ? 'Puter.js Cloud Active' : 'Offline Storage Active'}
                </span>

                <button
                  onClick={() => refreshStorage()}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Refresh Storage"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStorage ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={() => setIsNewDirModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-blue-500" />
                  <span>New Folder</span>
                </button>

                <button
                  onClick={() => setIsNewMaterialModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <FilePlus className="w-3.5 h-3.5 text-amber-500" />
                  <span>Create Material</span>
                </button>

                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
              </div>
            </div>
          </div>

          {/* Puter Items Grid/List */}
          {isLoadingStorage ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-xs font-bold">Loading cloud storage filesystem...</p>
            </div>
          ) : puterItems.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
              <Folder className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto opacity-60" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No resources found in this directory</p>
              <p className="text-[11px]">Click &quot;Upload File&quot; or &quot;Create Material&quot; to add resources to cloud storage.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
              {puterItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.isDirectory) {
                      setCurrentPath(item.path);
                    } else {
                      if (item.url) {
                        window.open(item.url, '_blank');
                      } else if (item.content) {
                        onToast(`Opened material: "${item.name}"`);
                        if (onTryCode && (item.name.endsWith('.js') || item.name.endsWith('.ts') || item.name.endsWith('.html'))) {
                          onTryCode({ title: item.name, html: '<!-- HTML -->', css: '', js: item.content });
                          onToast(`💻 Loaded "${item.name}" into Sandbox!`);
                        }
                      } else {
                        onToast(`📥 Downloading cloud resource: ${item.name}`);
                      }
                    }
                  }}
                  className="flex items-center gap-3 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer group"
                >
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shrink-0">
                    {item.isDirectory ? <Folder className="w-5 h-5 fill-blue-500/20" /> : getFileIcon(item.type || 'doc')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                      <span>{item.name}</span>
                      {item.isDirectory && (
                        <span className="text-[9px] font-black bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-wider border border-blue-500/20">
                          Directory
                        </span>
                      )}
                    </h5>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold flex items-center gap-2">
                      <span>{item.category || (item.isDirectory ? 'Folder' : 'File')}</span>
                      <span>•</span>
                      <span>{item.updatedAt || 'Today'}</span>
                      {!item.isDirectory && item.size ? <><span>•</span><span>{Math.round(item.size / 1024) || 1} KB</span></> : null}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {!item.isDirectory && (
                      <button
                        onClick={() => {
                          if (item.content && onTryCode && (item.name.endsWith('.js') || item.name.endsWith('.html') || item.name.endsWith('.ts'))) {
                            onTryCode({ title: item.name, html: '<!-- HTML -->', css: '', js: item.content });
                            onToast(`💻 Loaded "${item.name}" into Sandbox!`);
                          } else if (item.url) {
                            window.open(item.url, '_blank');
                          } else {
                            onToast(`📥 Downloaded: ${item.name}`);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-blue-600 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors cursor-pointer"
                        title="Download / Open"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        await deleteStorageItem(currentPath, item);
                        onToast(`🗑️ Deleted ${item.name}`);
                        refreshStorage();
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : isViewingDocument ? (
        renderPdfReader()
      ) : (
        <div className="space-y-4 animate-fade-in">
          {/* Simple Curriculum Mastery Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-slate-900 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
              <span>Curriculum Mastery: <strong className="text-blue-600 dark:text-blue-400 font-black">{masteredLessons.length}</strong> of {allSyllabusLessons.length} topics ({Math.round((masteredLessons.length / (allSyllabusLessons.length || 1)) * 100)}%)</span>
            </div>
            
          </div>

          {/* Syllabus Global Search & Filter Bar */}
         

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
                matchingSearchLessons.map((item, idx) => {
                  const lessonIdx = allSyllabusLessons.findIndex(
                    (l) => l.topic === item.topic && l.chapterNumber === item.chapterNumber
                  );
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (lessonIdx !== -1) {
                          setActiveLessonIndex(lessonIdx);
                          setIsViewingCapstone(false);
                          setSyllabusSearch('');
                          setIsViewingDocument(true);
                          onToast(`📖 Switched book to Page ${lessonIdx + 1}: ${item.topic}`);
                        }
                      }}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-[9px] font-extrabold text-indigo-500 uppercase tracking-widest block">
                            Part {item.partNumber} • Chapter {item.chapterNumber}: {item.chapterTitle}
                          </span>
                          <h4 className="font-extrabold text-sm text-slate-800 mt-0.5 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                            {item.topic}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
                        </div>
                      </div>
                      <p className="text-slate-600 text-xs font-semibold">{item.explanation}</p>
                      <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 relative" onClick={(e) => e.stopPropagation()}>
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
                        <pre className="text-slate-300 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap break-words">{item.example}</pre>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 items-stretch min-h-[70vh]">
              {/* Left Column: Table of Contents Sidebar */}
              <div className="w-full lg:w-72 shrink-0 flex flex-col bg-white/70 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden h-[70vh]">
        

                {/* ToC List (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
                  {tutorialData.course.parts.map((part: any, pIdx: number) => {
                    const isPartActive = selectedPartIndex === pIdx && !isViewingCapstone;
                    const isCapstone = part.part_title.toLowerCase().includes('capstone') || !part.chapters;

                    if (isCapstone) {
                      return (
                        <div key={pIdx} className="space-y-1">
                          <button
                            onClick={() => {
                              setSelectedPartIndex(pIdx);
                              setIsViewingCapstone(true);
                              setIsViewingDocument(true);
                              onToast("🎓 Opened Graduation Exams & Capstone Projects");
                            }}
                            className={`w-full text-left p-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-between border ${
                              isViewingCapstone && selectedPartIndex === pIdx
                                ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-sm'
                                : 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-200/40 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 hover:bg-amber-100/50'
                            }`}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <Award className="w-3.5 h-3.5" />
                              <span className="truncate">Graduation Exams</span>
                            </span>
                            <span className="text-[8px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-300 font-black px-1.5 py-0.5 rounded uppercase shrink-0">
                              Exams
                            </span>
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div key={pIdx} className="space-y-1">
                        {/* Part Header (Collapsible) */}
                        <button
                          onClick={() => {
                            setSelectedPartIndex(pIdx);
                            setIsViewingCapstone(false);
                            // Set book reader to first topic of this part
                            const firstLessonOfPart = allSyllabusLessons.findIndex(
                              (l) => l.partTitle === part.part_title
                            );
                            if (firstLessonOfPart !== -1) {
                              setActiveLessonIndex(firstLessonOfPart);
                            }
                            setIsViewingDocument(true);
                            onToast(`Switched to Part ${part.part_number}: ${part.part_title}`);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                            isPartActive
                              ? 'bg-blue-600 border-blue-500 text-white shadow-sm font-extrabold'
                              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/80'
                          }`}
                        >
                          <span className="truncate mr-1">
                            Part {part.part_number}: {part.part_title}
                          </span>
                          <ChevronRight
                            className={`w-3 h-3 shrink-0 transition-transform ${
                              selectedPartIndex === pIdx && !isViewingCapstone ? 'rotate-90' : ''
                            }`}
                          />
                        </button>

                        {/* Chapters Inside Part */}
                        {selectedPartIndex === pIdx && !isViewingCapstone && part.chapters && (
                          <div className="pl-2.5 pr-1 py-1 border-l-2 border-blue-100 dark:border-slate-800 space-y-2 mt-1.5 animate-fade-in">
                            {part.chapters.map((chapter: any, cIdx: number) => {
                              const isChapterExpanded = expandedChapterIndex === cIdx;
                              return (
                                <div key={cIdx} className="space-y-1">
                                  <button
                                    onClick={() => setExpandedChapterIndex(isChapterExpanded ? null : cIdx)}
                                    className="w-full text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 py-1 hover:text-slate-900 dark:hover:text-slate-200 flex items-center justify-between transition-colors"
                                  >
                                    <span className="truncate">Ch {chapter.chapter_number}: {chapter.chapter_title}</span>
                                    <span className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded-full shrink-0 scale-90">
                                      {chapter.topics.length}
                                    </span>
                                  </button>

                                  {isChapterExpanded && chapter.topics && (
                                    <div className="pl-1.5 space-y-1 mt-1">
                                      {chapter.topics.map((topic: any, tIdx: number) => {
                                        const globalIdx = allSyllabusLessons.findIndex(
                                          (l) => l.topic === topic.topic && l.chapterNumber === chapter.chapter_number
                                        );
                                        const isCurrent = activeLessonIndex === globalIdx && !isViewingCapstone;
                                        const isMastered = masteredLessons.includes(topic.topic);

                                        return (
                                          <button
                                            key={tIdx}
                                            onClick={() => {
                                              if (globalIdx !== -1) {
                                                setActiveLessonIndex(globalIdx);
                                                setIsViewingCapstone(false);
                                                setIsViewingDocument(true);
                                              }
                                            }}
                                            className={`w-full text-left py-1.5 px-2 rounded-lg text-[10px] font-semibold transition-all flex items-center justify-between gap-1.5 ${
                                              isCurrent
                                                ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30'
                                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                                            }`}
                                          >
                                            <span className="truncate flex items-center gap-1.5">
                                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                isCurrent ? 'bg-blue-500 animate-pulse' : isMastered ? 'bg-emerald-500' : 'bg-slate-300'
                                              }`}></span>
                                              <span className="truncate">{topic.topic}</span>
                                            </span>
                                            {isMastered && (
                                              <span className="text-[8px] text-emerald-500 font-extrabold shrink-0">✓</span>
                                            )}
                                          </button>
                                        );
                                      })}
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
              </div>

              {/* Right Column: Immersive Book Reading Sheet */}
              <div className="flex-1 bg-gradient-to-br from-amber-50/10 via-white to-amber-50/5 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-md p-5 md:p-7 flex flex-col justify-between relative overflow-hidden h-[70vh]">
                {/* Book Bind Shadow Simulation (Depth) */}
                <div className="absolute top-0 left-0 bottom-0 w-5 bg-gradient-to-r from-slate-200/40 via-slate-100/5 to-transparent dark:from-black/20 dark:via-transparent pointer-events-none border-r border-slate-150/10 z-10"></div>
                
                {/* Book header */}
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4 flex justify-between items-center gap-2">
                  {isViewingCapstone ? (
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                        FINAL GRADUATION PORTAL
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-[8.5px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                        Part {allSyllabusLessons[activeLessonIndex]?.partNumber}
                      </span>
                      <ChevronRight className="w-3 h-3 text-slate-300" />
                      <span className="text-slate-500 dark:text-slate-400 font-bold text-[9.5px] uppercase tracking-wider truncate max-w-[200px] md:max-w-xs">
                        Ch {allSyllabusLessons[activeLessonIndex]?.chapterNumber}: {allSyllabusLessons[activeLessonIndex]?.chapterTitle}
                      </span>
                    </div>
                  )}

                  {!isViewingCapstone && (
                    <div className="flex items-center gap-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Page {activeLessonIndex + 1} of {allSyllabusLessons.length}</span>
                    </div>
                  )}
                </div>

                {/* Animated Page Content */}
                <div className="flex-1 overflow-y-auto pr-1">
                  <AnimatePresence mode="wait">
                    {isViewingCapstone ? (
                      <motion.div
                        key="capstone"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-5"
                      >
                        <div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            🎓 {tutorialData.course.parts[selectedPartIndex]?.part_title}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold mt-1">
                            {tutorialData.course.parts[selectedPartIndex]?.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {tutorialData.course.parts[selectedPartIndex]?.projects?.map((project: any, pIdx: number) => (
                            <div
                              key={pIdx}
                              className="bg-white/80 dark:bg-slate-900 rounded-2xl border-2 border-amber-200/40 dark:border-amber-900/30 p-4 shadow-sm hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-200/50">
                                    GRADUATION EXAM
                                  </span>
                                  <Award className="w-4.5 h-4.5 text-amber-500" />
                                </div>
                                <h5 className="font-extrabold text-xs text-slate-800 dark:text-white leading-tight">
                                  {project.name}
                                </h5>
                                <p className="text-slate-500 dark:text-slate-400 text-[10.5px] leading-relaxed font-semibold">
                                  {project.description}
                                </p>
                              </div>

                              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                                <div className="flex flex-wrap gap-1">
                                  {project.tech_stack.split(',').map((tech: string, tIdx: number) => (
                                    <span key={tIdx} className="bg-slate-150 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[8.5px] font-bold px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
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
                                  <Code2 className="w-4 h-4" /> Start Graduation Exam
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={activeLessonIndex}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-4"
                      >
                        <div>
                          <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 font-mono">§</span>
                            {allSyllabusLessons[activeLessonIndex]?.topic}
                          </h2>
                        </div>

                        {/* Explanation Paragraph */}
                        <div className="space-y-1">
                          <h4 className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <BookOpenCheck className="w-3.5 h-3.5 text-blue-500" /> Explanation
                          </h4>
                          <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-semibold">
                            {allSyllabusLessons[activeLessonIndex]?.explanation}
                          </p>
                        </div>

                        {/* Analogy Box */}
                        <div className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/60 dark:border-amber-900/30 rounded-xl p-3.5 relative shadow-xs">
                          <span className="absolute top-0 right-3.5 transform -translate-y-1/2 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 text-[7px] font-black uppercase px-1.5 py-0.2 rounded border border-amber-200">
                            ANALOGY
                          </span>
                          <div className="space-y-1">
                            <h4 className="text-[9px] font-extrabold text-amber-800 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1">
                              <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Mental Model & Analogy
                            </h4>
                            <p className="text-amber-950 dark:text-amber-200 text-[11px] font-semibold leading-relaxed">
                              {allSyllabusLessons[activeLessonIndex]?.use_case}
                            </p>
                          </div>
                        </div>

                        {/* Lab Code Container */}
                        <div className="border border-slate-800 bg-slate-950 rounded-xl p-3 shadow-md space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-emerald-400">
                              <Code2 className="w-3.5 h-3.5 animate-pulse" />
                              <span className="text-[8.5px] font-black uppercase tracking-widest font-mono">Interactive Laboratory</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(allSyllabusLessons[activeLessonIndex]?.example);
                                  onToast(`✓ Copied example code for "${allSyllabusLessons[activeLessonIndex]?.topic}"`);
                                }}
                                className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-[8.5px] font-bold px-2 py-0.5 rounded transition-colors border border-slate-800 flex items-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-2.5 h-2.5" /> Copy
                              </button>
                              <button
                                onClick={() => {
                                  const item = allSyllabusLessons[activeLessonIndex];
                                  const template = getTemplateForTopic(item, item.partNumber);
                                  if (onTryCode) {
                                    onTryCode({
                                      title: item.topic,
                                      html: template.html,
                                      css: template.css,
                                      js: template.js,
                                    });
                                    if (onRewardXP) {
                                      onRewardXP(15, 'learning', `Poured lab code for: ${item.topic}`);
                                    }
                                    onToast(`🚀 Loaded "${item.topic}" lab inside Playground workspace! +15 XP`);
                                  }
                                }}
                                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[9px] font-black px-2.5 py-0.5 rounded transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="w-2.5 h-2.5 text-slate-950" /> Test Code
                              </button>
                            </div>
                          </div>
                          <pre className="text-slate-300 font-mono text-[10px] max-h-32 overflow-y-auto overflow-x-auto whitespace-pre-wrap break-words p-2 rounded bg-slate-900/40 border border-slate-900 scrollbar-thin">
                            {allSyllabusLessons[activeLessonIndex]?.example}
                          </pre>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Book Footer Nav Controls (Back / Progress slider / Next) */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
                  {/* Paging Buttons */}
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                      disabled={activeLessonIndex === 0 && !isViewingCapstone}
                      onClick={() => {
                        if (isViewingCapstone) {
                          setIsViewingCapstone(false);
                          setActiveLessonIndex(allSyllabusLessons.length - 1);
                        } else {
                          setActiveLessonIndex((prev) => Math.max(0, prev - 1));
                        }
                      }}
                      className="flex-1 md:flex-none px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>

                    <button
                      onClick={() => handleToggleMastered(allSyllabusLessons[activeLessonIndex]?.topic, { stopPropagation: () => {} } as any)}
                      className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        masteredLessons.includes(allSyllabusLessons[activeLessonIndex]?.topic)
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
                      }`}
                    >
                      <BookOpenCheck className="w-4 h-4" />
                      {masteredLessons.includes(allSyllabusLessons[activeLessonIndex]?.topic) ? 'Mastered' : 'Mark Lesson'}
                    </button>
                  </div>

                  {/* Horizontal visual slider progression */}
                  {!isViewingCapstone && (
                    <div className="hidden md:flex flex-1 max-w-xs flex-col gap-0.5 px-4">
                      <div className="flex justify-between items-center text-[8.5px] font-extrabold text-slate-400">
                        <span>PAGE PROGRESSION</span>
                        <span>{Math.round(((activeLessonIndex + 1) / allSyllabusLessons.length) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={allSyllabusLessons.length - 1}
                        value={activeLessonIndex}
                        onChange={(e) => {
                          setActiveLessonIndex(parseInt(e.target.value));
                          setIsViewingCapstone(false);
                        }}
                        className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  )}

                  {/* Forward Next paging */}
                  <div className="w-full md:w-auto">
                    {activeLessonIndex === allSyllabusLessons.length - 1 && !isViewingCapstone ? (
                      <button
                        onClick={() => {
                          setIsViewingCapstone(true);
                          setSelectedPartIndex(tutorialData.course.parts.length - 1);
                          onToast("🎓 Entered Capstone Projects Graduation Area!");
                        }}
                        className="w-full md:w-auto px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        Final Exam Portal <ChevronRight className="w-4 h-4 animate-bounce" />
                      </button>
                    ) : (
                      <button
                        disabled={isViewingCapstone}
                        onClick={() => {
                          setActiveLessonIndex((prev) => Math.min(allSyllabusLessons.length - 1, prev + 1));
                        }}
                        className="w-full md:w-auto px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Apple Floating Upload Button */}
      {activeSubTab === 'files' && (
        <button
          onClick={() => setIsUploadOpen(true)}
          className="fixed bottom-24 right-5 md:bottom-10 md:right-10 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 z-40 cursor-pointer border border-white/10"
        >
          <Plus className="w-5.5 h-5.5" />
        </button>
      )}

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
              {/* Simple Drag & Drop Zone with Real File Selector */}
              <label
                className="border border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group relative"
              >
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const file = e.target.files[0];
                      setSelectedFileObj(file);
                      setFileName(file.name);
                      onToast(`Selected file: ${file.name}`);
                    }
                  }}
                />
                <div className="bg-blue-50 p-2 rounded-full mb-1 group-hover:bg-blue-100 transition-colors">
                  <UploadCloud className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-[10px] font-bold text-slate-800">
                  {selectedFileObj ? `✓ ${selectedFileObj.name} (${Math.round(selectedFileObj.size/1024)} KB)` : 'Click or Drag file to upload to cloud'}
                </p>
              </label>

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

      {/* Puter: Create New Directory Modal */}
      {isNewDirModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-blue-500" /> Create New Folder
              </h3>
              <button onClick={() => setIsNewDirModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Folder Name
              </label>
              <input
                type="text"
                placeholder="e.g. Python_Workshops"
                value={newDirName}
                onChange={(e) => setNewDirName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsNewDirModalOpen(false)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold py-2 rounded-xl text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!newDirName.trim()) return;
                  await createStorageDirectory(currentPath, newDirName.trim());
                  onToast(`📁 Created folder: ${newDirName}`);
                  setNewDirName('');
                  setIsNewDirModalOpen(false);
                  refreshStorage();
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-2 rounded-xl text-xs transition-all shadow-xs"
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Puter: Create New Material / Note Modal */}
      {isNewMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <FilePlus className="w-4 h-4 text-amber-500" /> Create Text / Code Material
              </h3>
              <button onClick={() => setIsNewMaterialModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  File Name (with extension, e.g. notes.md or script.js)
                </label>
                <input
                  type="text"
                  placeholder="e.g. guild_rules.md or index.html"
                  value={newMatName}
                  onChange={(e) => setNewMatName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Material Content / Code
                </label>
                <textarea
                  rows={6}
                  placeholder="# Enter markdown notes, study guides, or JavaScript snippets here..."
                  value={newMatContent}
                  onChange={(e) => setNewMatContent(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsNewMaterialModalOpen(false)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold py-2 rounded-xl text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!newMatName.trim() || !newMatContent.trim()) return;
                  await createStorageMaterial(currentPath, newMatName.trim(), newMatContent);
                  onToast(`📝 Created material: ${newMatName}`);
                  setNewMatName('');
                  setNewMatContent('');
                  setIsNewMaterialModalOpen(false);
                  refreshStorage();
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2 rounded-xl text-xs transition-all shadow-xs"
              >
                Save Material
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table of Contents & Search Modal for Tutorials */}
      {isTocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
                  Syllabus Table of Contents (10 Parts)
                </h3>
              </div>
              <button onClick={() => setIsTocModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search 100+ topics by keyword..."
                  value={syllabusSearch}
                  onChange={(e) => setSyllabusSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 pl-9 pr-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {syllabusSearch.trim() ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Search Results:</p>
                  {allSyllabusLessons.filter(l => l.topic.toLowerCase().includes(syllabusSearch.toLowerCase()) || l.explanation.toLowerCase().includes(syllabusSearch.toLowerCase())).map((lesson) => (
                    <div
                      key={lesson.globalIndex}
                      onClick={() => {
                        setActiveLessonIndex(lesson.globalIndex);
                        setIsViewingCapstone(false);
                        setIsTocModalOpen(false);
                      }}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 cursor-pointer flex items-center justify-between group"
                    >
                      <div>
                        <span className="text-[9px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                          Part {lesson.partNumber} • Ch {lesson.chapterNumber}
                        </span>
                        <h5 className="text-xs font-black text-slate-900 dark:text-slate-100 mt-1 group-hover:text-indigo-500">
                          {lesson.topic}
                        </h5>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                    </div>
                  ))}
                </div>
              ) : (
                tutorialData.course.parts.map((part: any, pIdx: number) => (
                  <div key={pIdx} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="font-black text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="bg-indigo-500 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                        0{pIdx + 1}
                      </span>
                      <span>{part.part_title}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2">
                      {part.chapters?.map((chap: any, cIdx: number) => {
                        const idx = allSyllabusLessons.findIndex(l => l.partTitle === part.part_title && l.chapterNumber === chap.chapter_number);
                        const isMastered = masteredLessons.includes(chap.topic);
                        return (
                          <button
                            key={cIdx}
                            onClick={() => {
                              if (idx !== -1) {
                                setActiveLessonIndex(idx);
                                setIsViewingCapstone(false);
                                setIsTocModalOpen(false);
                              }
                            }}
                            className={`text-left p-2 rounded-lg text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                              activeLessonIndex === idx && !isViewingCapstone
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
                            }`}
                          >
                            <span className="truncate pr-2">{chap.topic}</span>
                            {isMastered && <span className="text-[10px] font-black text-emerald-500 shrink-0">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}

              {/* Capstone Button */}
              <button
                onClick={() => {
                  setIsViewingCapstone(true);
                  setIsTocModalOpen(false);
                  onToast('🎓 Opened Capstone Graduation Portal');
                }}
                className="w-full p-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-between shadow-xs mt-4"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>Final Section: Graduation Capstone Projects</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

