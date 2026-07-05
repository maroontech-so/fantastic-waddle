// Puter.js Cloud Storage Backend & Offline Fallback for </AdvocoDe> Resources

declare global {
  interface Window {
    puter: any;
  }
}

export interface PuterItem {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  updatedAt?: string;
  url?: string;
  category?: string;
  content?: string;
  type?: 'pdf' | 'code' | 'archive' | 'link' | 'doc' | 'folder';
}

const LOCAL_STORAGE_KEY = 'advocode_puter_fs_v1';

// Initial default structure if nothing exists
const getInitialOfflineFS = (): Record<string, PuterItem[]> => ({
  '/': [
    { id: 'dir-1', name: 'Web Development Lab', path: '/Web Development Lab', isDirectory: true, category: 'Folder', updatedAt: '2026-07-04' },
    { id: 'dir-2', name: 'AI & Data Science', path: '/AI & Data Science', isDirectory: true, category: 'Folder', updatedAt: '2026-07-04' },
    { id: 'dir-3', name: 'Exam & Lecture Notes', path: '/Exam & Lecture Notes', isDirectory: true, category: 'Folder', updatedAt: '2026-07-04' },
    { id: 'file-1', name: 'AdvocoDe_Guild_Charter.pdf', path: '/AdvocoDe_Guild_Charter.pdf', isDirectory: false, size: 245000, type: 'pdf', category: 'Guild Doc', updatedAt: '2026-07-04', content: 'Official Student Developer Guild Charter & Code of Conduct.' },
    { id: 'file-2', name: 'Python_ML_Starter_Kit.zip', path: '/Python_ML_Starter_Kit.zip', isDirectory: false, size: 1280000, type: 'archive', category: 'AI Lab', updatedAt: '2026-07-04' }
  ],
  '/Web Development Lab': [
    { id: 'file-3', name: 'Modern_CSS_Flexbox_Cheat_Sheet.pdf', path: '/Web Development Lab/Modern_CSS_Flexbox_Cheat_Sheet.pdf', isDirectory: false, size: 450000, type: 'pdf', category: 'Web Guide', updatedAt: '2026-07-04' },
    { id: 'file-4', name: 'React_Hooks_Patterns.js', path: '/Web Development Lab/React_Hooks_Patterns.js', isDirectory: false, size: 12000, type: 'code', category: 'Code Snippet', updatedAt: '2026-07-04', content: '// Custom React Hooks & Performance Optimization Patterns\n\nimport { useState, useEffect } from "react";\n\nexport function useDebounce(value, delay) {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n  useEffect(() => {\n    const handler = setTimeout(() => setDebouncedValue(value), delay);\n    return () => clearTimeout(handler);\n  }, [value, delay]);\n  return debouncedValue;\n}' }
  ],
  '/AI & Data Science': [
    { id: 'file-5', name: 'Gemini_Prompt_Engineering_Guide.md', path: '/AI & Data Science/Gemini_Prompt_Engineering_Guide.md', isDirectory: false, size: 18000, type: 'doc', category: 'AI Guide', updatedAt: '2026-07-04', content: '# Gemini API Prompt Engineering\n\n1. Use clear role constraints.\n2. Provide structured XML/JSON schemas.\n3. Utilize chain-of-thought instructions for complex reasoning.' }
  ],
  '/Exam & Lecture Notes': [
    { id: 'file-6', name: 'Operating_Systems_Midterm_Review.pdf', path: '/Exam & Lecture Notes/Operating_Systems_Midterm_Review.pdf', isDirectory: false, size: 890000, type: 'pdf', category: 'Lecture Note', updatedAt: '2026-07-04' }
  ]
});

const getLocalFS = (): Record<string, PuterItem[]> => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  const init = getInitialOfflineFS();
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(init));
  return init;
};

const saveLocalFS = (fs: Record<string, PuterItem[]>) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fs));
  } catch (e) {}
};

export const isPuterAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!window.puter && !!window.puter.fs;
};

export const listStorageItems = async (dirPath: string = '/'): Promise<PuterItem[]> => {
  if (isPuterAvailable()) {
    try {
      const items = await window.puter.fs.readdir(dirPath);
      return items.map((item: any) => ({
        id: item.id || item.path || Math.random().toString(),
        name: item.name,
        path: item.path,
        isDirectory: item.isDirectory,
        size: item.size || 0,
        updatedAt: item.modified ? new Date(item.modified).toLocaleDateString() : 'Today',
        url: item.url,
        type: item.isDirectory ? 'folder' : (item.name.endsWith('.pdf') ? 'pdf' : item.name.endsWith('.zip') || item.name.endsWith('.tar') ? 'archive' : item.name.endsWith('.js') || item.name.endsWith('.ts') || item.name.endsWith('.py') || item.name.endsWith('.html') || item.name.endsWith('.css') ? 'code' : 'doc'),
        category: item.isDirectory ? 'Folder' : 'Cloud Resource'
      }));
    } catch (err) {
      console.warn("Puter readdir fallback to local:", err);
    }
  }

  const fs = getLocalFS();
  return fs[dirPath] || [];
};

export const createStorageDirectory = async (parentPath: string, dirName: string): Promise<PuterItem> => {
  const fullPath = parentPath === '/' ? `/${dirName}` : `${parentPath}/${dirName}`;
  
  if (isPuterAvailable()) {
    try {
      await window.puter.fs.mkdir(fullPath);
    } catch (err) {
      console.warn("Puter mkdir fallback:", err);
    }
  }

  const fs = getLocalFS();
  if (!fs[fullPath]) fs[fullPath] = [];
  
  const newItem: PuterItem = {
    id: `dir-${Date.now()}`,
    name: dirName,
    path: fullPath,
    isDirectory: true,
    category: 'Folder',
    updatedAt: new Date().toLocaleDateString(),
    type: 'folder'
  };

  const parentList = fs[parentPath] || [];
  if (!parentList.some(i => i.path === fullPath)) {
    parentList.push(newItem);
    fs[parentPath] = parentList;
    saveLocalFS(fs);
  }

  return newItem;
};

export const createStorageMaterial = async (parentPath: string, fileName: string, content: string): Promise<PuterItem> => {
  const fullPath = parentPath === '/' ? `/${fileName}` : `${parentPath}/${fileName}`;
  
  if (isPuterAvailable()) {
    try {
      await window.puter.fs.write(fullPath, content);
    } catch (err) {
      console.warn("Puter write fallback:", err);
    }
  }

  const fs = getLocalFS();
  const newItem: PuterItem = {
    id: `file-${Date.now()}`,
    name: fileName,
    path: fullPath,
    isDirectory: false,
    size: content.length,
    updatedAt: new Date().toLocaleDateString(),
    content: content,
    type: fileName.endsWith('.js') || fileName.endsWith('.ts') || fileName.endsWith('.py') || fileName.endsWith('.html') || fileName.endsWith('.css') ? 'code' : 'doc',
    category: 'Created Material'
  };

  const parentList = fs[parentPath] || [];
  const existingIdx = parentList.findIndex(i => i.path === fullPath);
  if (existingIdx !== -1) {
    parentList[existingIdx] = newItem;
  } else {
    parentList.push(newItem);
  }
  fs[parentPath] = parentList;
  saveLocalFS(fs);

  return newItem;
};

export const uploadStorageFile = async (parentPath: string, file: File): Promise<PuterItem> => {
  const fullPath = parentPath === '/' ? `/${file.name}` : `${parentPath}/${file.name}`;
  
  if (isPuterAvailable()) {
    try {
      await window.puter.fs.write(fullPath, file);
    } catch (err) {
      console.warn("Puter upload fallback:", err);
    }
  }

  // For local fallback, store text content if small text/code/md file, otherwise metadata
  let contentStr = `[Uploaded File: ${file.name} (${Math.round(file.size / 1024)} KB)]`;
  try {
    if (file.size < 500000 && (file.type.includes('text') || file.name.endsWith('.md') || file.name.endsWith('.js') || file.name.endsWith('.json') || file.name.endsWith('.ts') || file.name.endsWith('.html'))) {
      contentStr = await file.text();
    }
  } catch (e) {}

  const fs = getLocalFS();
  const newItem: PuterItem = {
    id: `file-${Date.now()}`,
    name: file.name,
    path: fullPath,
    isDirectory: false,
    size: file.size,
    updatedAt: new Date().toLocaleDateString(),
    content: contentStr,
    type: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.zip') || file.name.endsWith('.tar') ? 'archive' : file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.py') || file.name.endsWith('.html') ? 'code' : 'doc',
    category: 'Uploaded File'
  };

  const parentList = fs[parentPath] || [];
  const existingIdx = parentList.findIndex(i => i.path === fullPath);
  if (existingIdx !== -1) {
    parentList[existingIdx] = newItem;
  } else {
    parentList.push(newItem);
  }
  fs[parentPath] = parentList;
  saveLocalFS(fs);

  return newItem;
};

export const deleteStorageItem = async (parentPath: string, item: PuterItem): Promise<boolean> => {
  if (isPuterAvailable()) {
    try {
      await window.puter.fs.delete(item.path);
    } catch (err) {
      console.warn("Puter delete fallback:", err);
    }
  }

  const fs = getLocalFS();
  const parentList = fs[parentPath] || [];
  fs[parentPath] = parentList.filter(i => i.path !== item.path && i.id !== item.id);
  
  if (item.isDirectory) {
    delete fs[item.path];
  }
  
  saveLocalFS(fs);
  return true;
};
