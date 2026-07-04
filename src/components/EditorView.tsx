import React, { useState, useEffect, useRef } from 'react';
import CodeMirror, { EditorView as CMEditorView } from '@uiw/react-codemirror';
import { html, htmlLanguage } from '@codemirror/lang-html';
import { css, cssLanguage } from '@codemirror/lang-css';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import JSZip from 'jszip';
import { 
  Terminal, 
  Play, 
  RotateCcw, 
  Share2, 
  Download, 
  Copy, 
  Clipboard, 
  Check, 
  XCircle, 
  Sparkles, 
  ArrowLeft,
  FileCode,
  FolderGit,
  Maximize2,
  Wand2,
  Lock,
  Compass,
  BookOpen,
  Search,
  X,
  ChevronRight,
  Award,
  Layers
} from 'lucide-react';
import tutorialData from '../tutorial.json';
import { getTemplateForTopic, getAllLessonsFromTutorial } from '../utils/tutorialSandbox';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { cleanForFirestore } from '../utils/clean';


interface SavedSnippet {
  id: string;
  title: string;
  html: string;
  css: string;
  js: string;
  updatedAt: string;
}

interface EditorViewProps {
  onToast: (msg: string) => void;
  initialCode?: { html: string; css: string; js: string; title: string } | null;
  onClearInitialCode?: () => void;
}

const TEMPLATES = [
  {
    title: 'Hello World',
    html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Hello World</title>\n</head>\n<body>\n  <div class="container">\n    <h1>Hello, World!</h1>\n    <p>Welcome to &lt;/AdvocoDe&gt; Playground. Update and customize your code here!</p>\n    <button id="btn">Click Me!</button>\n  </div>\n</body>\n</html>`,
    css: `body {\n  margin: 0;\n  background: #0f172a;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;\n}\n.container {\n  background: #1e293b;\n  color: white;\n  border: 1px solid #334155;\n  padding: 32px 48px;\n  border-radius: 20px;\n  text-align: center;\n  box-shadow: 0 10px 30px rgba(0,0,0,0.3);\n  max-width: 400px;\n}\nh1 {\n  margin: 0 0 10px 0;\n  font-size: 28px;\n  color: #38bdf8;\n}\np {\n  color: #94a3b8;\n  font-size: 14px;\n  line-height: 1.5;\n  margin: 0 0 24px 0;\n}\n#btn {\n  background: linear-gradient(135deg, #3b82f6, #6366f1);\n  color: white;\n  border: none;\n  padding: 12px 28px;\n  font-size: 14px;\n  font-weight: bold;\n  border-radius: 12px;\n  cursor: pointer;\n  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);\n  transition: all 0.2s;\n}\n#btn:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);\n}`,
    js: `document.getElementById('btn').addEventListener('click', () => {\n  alert('Hello World! Welcome to <AdvocoDe> interactive IDE.');\n});`
  },
  {
    title: 'Pulse Button',
    html: `<div class="container">\n  <button class="apple-btn">Tap Me</button>\n</div>`,
    css: `body {\n  margin: 0;\n  background: #0f172a;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  font-family: -apple-system, BlinkMacSystemFont, sans-serif;\n}\n.apple-btn {\n  background: linear-gradient(135deg, #3b82f6, #6366f1);\n  color: white;\n  border: none;\n  padding: 12px 30px;\n  font-size: 14px;\n  font-weight: 600;\n  border-radius: 12px;\n  cursor: pointer;\n  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);\n  transition: all 0.2s;\n  animation: pulse 2s infinite;\n}\n@keyframes pulse {\n  0% { transform: scale(1); }\n  50% { transform: scale(1.05); }\n  100% { transform: scale(1); }\n}`,
    js: `document.querySelector('.apple-btn').addEventListener('click', () => {\n  alert('Hello from MKU IT Club Playground! 🚀');\n});`
  },
  {
    title: 'Neon Time Tracker',
    html: `<div class="card">\n  <h1 id="time">00:00:00</h1>\n  <p>Live Workspace</p>\n</div>`,
    css: `body {\n  margin: 0;\n  background: #090d16;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  font-family: monospace;\n}\n.card {\n  background: rgba(255,255,255,0.03);\n  border: 1px solid rgba(255,255,255,0.08);\n  padding: 30px;\n  border-radius: 20px;\n  text-align: center;\n  box-shadow: 0 8px 32px rgba(0,0,0,0.4);\n}\n#time {\n  color: #38bdf8;\n  text-shadow: 0 0 10px rgba(56,189,248,0.5);\n  margin: 0;\n  font-size: 32px;\n}\np {\n  color: #64748b;\n  margin: 8px 0 0 0;\n  font-size: 11px;\n  text-transform: uppercase;\n  letter-spacing: 2px;\n}`,
    js: `function update() {\n  const now = new Date();\n  document.getElementById('time').innerText = now.toTimeString().split(' ')[0];\n}\nsetInterval(update, 1000);\nupdate();`
  },
  {
    title: 'Semantic HTML5 Card',
    html: `<article class="profile-card">\n  <header class="card-header">\n    <span class="badge">PRO STUDENT</span>\n    <h2>Alex M.</h2>\n  </header>\n  <p class="bio">Passionate frontend developer & cloud enthusiast building interactive apps at &lt;/AdvocoDe&gt;.</p>\n  <footer class="card-footer">\n    <button id="like-btn">❤️ Like <span id="count">14</span></button>\n  </footer>\n</article>`,
    css: `body {\n  margin: 0;\n  background: #f8fafc;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  font-family: 'Inter', system-ui, -apple-system, sans-serif;\n}\n.profile-card {\n  background: white;\n  border: 1px solid #e2e8f0;\n  border-radius: 20px;\n  padding: 24px;\n  max-width: 320px;\n  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);\n}\n.card-header {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  margin-bottom: 12px;\n}\n.badge {\n  align-self: flex-start;\n  background: #eff6ff;\n  color: #2563eb;\n  font-size: 10px;\n  font-weight: 800;\n  padding: 4px 10px;\n  border-radius: 99px;\n  letter-spacing: 1px;\n}\nh2 {\n  margin: 0;\n  color: #0f172a;\n  font-size: 20px;\n}\n.bio {\n  color: #64748b;\n  font-size: 13.5px;\n  line-height: 1.5;\n  margin: 0 0 20px 0;\n}\n#like-btn {\n  background: #f1f5f9;\n  border: none;\n  padding: 10px 16px;\n  border-radius: 12px;\n  font-weight: 700;\n  color: #334155;\n  cursor: pointer;\n  transition: all 0.2s;\n  width: 100%;\n}\n#like-btn:hover {\n  background: #e2e8f0;\n  transform: translateY(-1px);\n}`,
    js: `let count = 14;\nconst btn = document.getElementById('like-btn');\nconst display = document.getElementById('count');\n\nbtn.addEventListener('click', () => {\n  count++;\n  display.textContent = count;\n  btn.style.background = '#fee2e2';\n  btn.style.color = '#dc2626';\n  setTimeout(() => {\n    btn.style.background = '#f1f5f9';\n    btn.style.color = '#334155';\n  }, 300);\n});`
  },
  {
    title: 'CSS Grid Bento Box',
    html: `<div class="bento-grid">\n  <div class="box box-main">\n    <h3>🚀 Web Dev Course</h3>\n    <p>10 Complete Parts mastered.</p>\n  </div>\n  <div class="box box-stat">\n    <span class="num">1,250</span>\n    <span class="lbl">Total XP Earned</span>\n  </div>\n  <div class="box box-stat">\n    <span class="num">85%</span>\n    <span class="lbl">Syllabus Complete</span>\n  </div>\n</div>`,
    css: `body {\n  margin: 0;\n  background: #0f172a;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  font-family: system-ui, sans-serif;\n  padding: 20px;\n}\n.bento-grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 16px;\n  max-width: 480px;\n  width: 100%;\n}\n.box {\n  background: #1e293b;\n  border: 1px solid #334155;\n  border-radius: 20px;\n  padding: 20px;\n  color: white;\n}\n.box-main {\n  grid-column: span 2;\n  background: linear-gradient(135deg, #1e293b, #312e81);\n  border-color: #4f46e5;\n}\nh3 {\n  margin: 0 0 8px 0;\n  font-size: 18px;\n}\np {\n  margin: 0;\n  color: #94a3b8;\n  font-size: 13px;\n}\n.num {\n  display: block;\n  font-size: 26px;\n  font-weight: 800;\n  color: #38bdf8;\n  margin-bottom: 4px;\n}\n.lbl {\n  font-size: 11px;\n  color: #64748b;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}`,
    js: `console.log('Bento grid layout rendered successfully with CSS Grid!');`
  },
  {
    title: 'Interactive DOM Counter',
    html: `<div class="counter-box">\n  <div id="display">0</div>\n  <div class="controls">\n    <button id="dec">-1</button>\n    <button id="reset">Reset</button>\n    <button id="inc">+1</button>\n  </div>\n</div>`,
    css: `body {\n  margin: 0;\n  background: #090d16;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  font-family: monospace;\n}\n.counter-box {\n  background: #111827;\n  border: 1px solid #374151;\n  padding: 32px;\n  border-radius: 24px;\n  text-align: center;\n  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);\n}\n#display {\n  font-size: 64px;\n  font-weight: bold;\n  color: #10b981;\n  margin-bottom: 24px;\n  transition: color 0.2s;\n}\n.controls {\n  display: flex;\n  gap: 12px;\n}\nbutton {\n  background: #1f2937;\n  border: 1px solid #4b5563;\n  color: white;\n  padding: 12px 20px;\n  border-radius: 12px;\n  font-size: 16px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.15s;\n}\nbutton:hover {\n  background: #374151;\n  transform: translateY(-2px);\n}\n#inc { background: #065f46; border-color: #059669; }\n#dec { background: #7f1d1d; border-color: #dc2626; }`,
    js: `let count = 0;\nconst display = document.getElementById('display');\n\nfunction updateDisplay() {\n  display.textContent = count;\n  if (count > 0) display.style.color = '#10b981';\n  else if (count < 0) display.style.color = '#ef4444';\n  else display.style.color = '#9ca3af';\n}\n\ndocument.getElementById('inc').addEventListener('click', () => { count++; updateDisplay(); });\ndocument.getElementById('dec').addEventListener('click', () => { count--; updateDisplay(); });\ndocument.getElementById('reset').addEventListener('click', () => { count = 0; updateDisplay(); });`
  }
];

// Custom Emmett and general VS Code completion rules for CodeMirror 6
const htmlCompletions = (context: CompletionContext): CompletionResult | null => {
  const word = context.matchBefore(/[#.\w]*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;

  const text = word.text;
  
  // !!! -> HTML5 Boilerplate Template
  if (text === '!!!') {
    return {
      from: word.from,
      options: [
        {
          label: '!!!',
          type: 'keyword',
          detail: 'HTML5 Template Boilerplate',
          apply: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LM IDE App</title>
</head>
<body>
  
</body>
</html>`
        }
      ]
    };
  }

  // Emmet class shortcut (.container -> <div class="container">)
  if (text.startsWith('.')) {
    const className = text.slice(1);
    if (className) {
      return {
        from: word.from,
        options: [
          {
            label: text,
            type: 'class',
            detail: 'Emmet Div with Class',
            apply: `<div class="${className}">\n  \n</div>`
          }
        ]
      };
    }
  }

  // Emmet ID shortcut (#main -> <div id="main">)
  if (text.startsWith('#')) {
    const idName = text.slice(1);
    if (idName) {
      return {
        from: word.from,
        options: [
          {
            label: text,
            type: 'variable',
            detail: 'Emmet Div with ID',
            apply: `<div id="${idName}">\n  \n</div>`
          }
        ]
      };
    }
  }

  // General tag templates
  const tags = [
    { label: 'div', type: 'tag', detail: 'HTML Divider Block', apply: '<div>\n  \n</div>' },
    { label: 'span', type: 'tag', detail: 'Inline Span' },
    { label: 'button', type: 'tag', detail: 'Sleek Button', apply: '<button class="apple-btn"></button>' },
    { label: 'section', type: 'tag', detail: 'Semantic Block' },
    { label: 'input', type: 'tag', detail: 'Input Field', apply: '<input type="text" class="input" placeholder="Type here..." />' },
    { label: 'img', type: 'tag', detail: 'Image Element', apply: '<img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300" alt="Workspace" />' },
    { label: 'a', type: 'tag', detail: 'Hyperlink Anchor', apply: '<a href="#">Click link</a>' },
    { label: 'ul', type: 'tag', detail: 'Unordered List', apply: '<ul>\n  <li></li>\n</ul>' },
    { label: 'li', type: 'tag', detail: 'List Element' },
    { label: 'h1', type: 'tag', detail: 'Heading Title' },
    { label: 'p', type: 'tag', detail: 'Paragraph Description' },
  ];

  return {
    from: word.from,
    options: tags.filter(t => t.label.startsWith(text))
  };
};

const cssCompletions = (context: CompletionContext): CompletionResult | null => {
  const word = context.matchBefore(/[\w-]*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;

  const text = word.text;
  const properties = [
    { label: 'display: flex;', type: 'property', detail: 'Flexbox container layout' },
    { label: 'justify-content: center;', type: 'property', detail: 'Center horizontally' },
    { label: 'align-items: center;', type: 'property', detail: 'Center vertically' },
    { label: 'flex-direction: column;', type: 'property', detail: 'Column stack flex' },
    { label: 'background: linear-gradient(135deg, #1e293b, #0f172a);', type: 'property', detail: 'Premium Dark Slate Gradient' },
    { label: 'border-radius: 12px;', type: 'property', detail: 'Rounded corners' },
    { label: 'box-shadow: 0 4px 15px rgba(0,0,0,0.1);', type: 'property', detail: 'Drop shadow bloom' },
    { label: 'transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);', type: 'property', detail: 'Apple Smooth cubic-bezier' },
    { label: 'font-family: -apple-system, BlinkMacSystemFont, sans-serif;', type: 'property', detail: 'Apple typography' },
    { label: 'animation: pulse 2s infinite;', type: 'property', detail: 'Pulse layout effect' },
    { label: 'color: #3b82f6;', type: 'property', detail: 'Tailwind blue tone' },
  ];

  return {
    from: word.from,
    options: properties.filter(p => p.label.startsWith(text))
  };
};

const jsCompletions = (context: CompletionContext): CompletionResult | null => {
  const word = context.matchBefore(/[\w.]*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;

  const text = word.text;
  const methods = [
    { label: 'document.querySelector', type: 'function', detail: 'Query element selector', apply: 'document.querySelector("")' },
    { label: 'document.getElementById', type: 'function', detail: 'Query element ID', apply: 'document.getElementById("")' },
    { label: 'addEventListener', type: 'function', detail: 'Register DOM listener', apply: 'addEventListener("click", (e) => {\n  \n})' },
    { label: 'console.log', type: 'function', detail: 'Log variables to sandbox console', apply: 'console.log()' },
    { label: 'setInterval', type: 'function', detail: 'Interval loop ticker', apply: 'setInterval(() => {\n  \n}, 1000)' },
    { label: 'setTimeout', type: 'function', detail: 'Timeout delay callback', apply: 'setTimeout(() => {\n  \n}, 1000)' },
    { label: 'fetch', type: 'function', detail: 'Fetch REST API endpoints', apply: 'fetch("")\n  .then(res => res.json())\n  .then(data => console.log(data))' },
  ];

  return {
    from: word.from,
    options: methods.filter(m => m.label.startsWith(text))
  };
};

const customHtml = htmlLanguage.data.of({ autocomplete: htmlCompletions });
const customCss = cssLanguage.data.of({ autocomplete: cssCompletions });
const customJs = javascriptLanguage.data.of({ autocomplete: jsCompletions });

export const EditorView: React.FC<EditorViewProps> = ({ onToast, initialCode, onClearInitialCode }) => {
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [htmlCode, setHtmlCode] = useState(() => {
    const saved = localStorage.getItem('advocode_ide_progress');
    if (saved) { try { return JSON.parse(saved).html || TEMPLATES[0].html; } catch(e){} }
    return TEMPLATES[0].html;
  });
  const [cssCode, setCssCode] = useState(() => {
    const saved = localStorage.getItem('advocode_ide_progress');
    if (saved) { try { return JSON.parse(saved).css || TEMPLATES[0].css; } catch(e){} }
    return TEMPLATES[0].css;
  });
  const [jsCode, setJsCode] = useState(() => {
    const saved = localStorage.getItem('advocode_ide_progress');
    if (saved) { try { return JSON.parse(saved).js || TEMPLATES[0].js; } catch(e){} }
    return TEMPLATES[0].js;
  });
  const [title, setTitle] = useState(() => {
    const saved = localStorage.getItem('advocode_ide_progress');
    if (saved) { try { return JSON.parse(saved).title || TEMPLATES[0].title; } catch(e){} }
    return TEMPLATES[0].title;
  });
  const [savedSnippets, setSavedSnippets] = useState<SavedSnippet[]>([]);
  const [activeTemplateIdx, setActiveTemplateIdx] = useState(0);

  // Mobile optimization view state
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  // Share Modal states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareText, setShareText] = useState('');

  // Syllabus & Starter Labs Drawer State
  const [isSyllabusDrawerOpen, setIsSyllabusDrawerOpen] = useState(false);
  const [syllabusSearch, setSyllabusSearch] = useState('');
  const [selectedPartIndex, setSelectedPartIndex] = useState(0);

  // Clipboard Copied visual tickers
  const [copiedActiveFile, setCopiedActiveFile] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Watch for incoming interactive tutorial codes
  useEffect(() => {
    if (initialCode) {
      setTitle(initialCode.title);
      setHtmlCode(initialCode.html);
      setCssCode(initialCode.css);
      setJsCode(initialCode.js);
      setActiveTab('html');
      onToast(`✓ Tutorial loaded: "${initialCode.title}" in playground!`);
      if (onClearInitialCode) {
        onClearInitialCode();
      }
    }
  }, [initialCode, onClearInitialCode]);

  // Load Saved Snippets
  useEffect(() => {
    const data = localStorage.getItem('mku_snippets');
    if (data) {
      try {
        setSavedSnippets(JSON.parse(data));
      } catch (e) {}
    }
  }, []);

  // Update sandbox iframe
  const updatePreview = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const documentContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            ${cssCode}
          </style>
        </head>
        <body>
          ${htmlCode}
          <script>
            // Intercept standard alert inside simulator safely
            window.alert = function(msg) {
              const div = document.createElement('div');
              div.style.position = 'fixed';
              div.style.top = '10px';
              div.style.left = '50%';
              div.style.transform = 'translateX(-50%)';
              div.style.background = 'rgba(15, 23, 42, 0.95)';
              div.style.color = '#fff';
              div.style.padding = '10px 16px';
              div.style.borderRadius = '10px';
              div.style.fontFamily = '-apple-system, sans-serif';
              div.style.fontSize = '12px';
              div.style.fontWeight = 'bold';
              div.style.zIndex = '999999';
              div.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              div.style.border = '1px solid rgba(255,255,255,0.1)';
              div.innerText = msg;
              document.body.appendChild(div);
              setTimeout(() => div.remove(), 2500);
            };

            try {
              ${jsCode}
            } catch (err) {
              console.error(err);
              document.body.innerHTML += '<div style="color:#ef4444; background:#fef2f2; padding:12px; font-size:11px; margin:12px; border-radius:10px; border: 1px solid #fecaca; font-family:monospace;"><b>Runtime Error:</b> ' + err.message + '</div>';
            }
          </script>
        </body>
      </html>
    `;

    const blob = new Blob([documentContent], { type: 'text/html' });
    iframe.src = URL.createObjectURL(blob);
  };

  // Run automatically on load or manual triggers
  useEffect(() => {
    const timeout = setTimeout(() => {
      updatePreview();
      localStorage.setItem('advocode_ide_progress', JSON.stringify({ html: htmlCode, css: cssCode, js: jsCode, title }));
    }, 800);
    return () => clearTimeout(timeout);
  }, [htmlCode, cssCode, jsCode, title]);

  const handleSave = () => {
    if (!title.trim()) {
      onToast('Provide a project title first');
      return;
    }

    const newSnippet: SavedSnippet = {
      id: `snip_${Date.now()}`,
      title: title.trim(),
      html: htmlCode,
      css: cssCode,
      js: jsCode,
      updatedAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    const updated = [newSnippet, ...savedSnippets.filter(s => s.title !== newSnippet.title)];
    setSavedSnippets(updated);
    localStorage.setItem('mku_snippets', JSON.stringify(updated));
    onToast(`✓ "${title}" saved to local Workspace`);
  };

  const handleLoadSnippet = (s: SavedSnippet) => {
    setTitle(s.title);
    setHtmlCode(s.html);
    setCssCode(s.css);
    setJsCode(s.js);
    onToast(`Loaded: ${s.title}`);
  };

  const loadTemplate = (idx: number) => {
    setActiveTemplateIdx(idx);
    setTitle(TEMPLATES[idx].title);
    setHtmlCode(TEMPLATES[idx].html);
    setCssCode(TEMPLATES[idx].css);
    setJsCode(TEMPLATES[idx].js);
    onToast(`✓ Starter applied: ${TEMPLATES[idx].title}`);
    setIsSyllabusDrawerOpen(false);
  };

  const loadTopicLesson = (topicItem: any, partNumber: number) => {
    const template = getTemplateForTopic(topicItem, partNumber);
    setTitle(topicItem.topic);
    setHtmlCode(template.html);
    setCssCode(template.css);
    setJsCode(template.js);
    onToast(`✓ Loaded "${topicItem.topic}" into active workspace!`);
    setIsSyllabusDrawerOpen(false);
  };

  const handleClear = () => {
    if (window.confirm('Clear all code in active buffers?')) {
      setHtmlCode('');
      setCssCode('');
      setJsCode('');
      onToast('Workspace cleared');
    }
  };

  // Copy code of current active file
  const handleCopyCode = () => {
    const activeCode = activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode;
    navigator.clipboard.writeText(activeCode);
    setCopiedActiveFile(true);
    onToast(`✓ Copied active ${activeTab.toUpperCase()} file to clipboard!`);
    setTimeout(() => setCopiedActiveFile(false), 2000);
  };

  // Paste from clipboard to current active file
  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (activeTab === 'html') setHtmlCode(text);
      else if (activeTab === 'css') setCssCode(text);
      else if (activeTab === 'js') setJsCode(text);
      onToast(`✓ Pasted clipboard into ${activeTab.toUpperCase()}`);
    } catch (e) {
      onToast('Clipboard access denied. Please paste manually into the editor.');
    }
  };

  // Download individual file as single file
  const handleDownloadSingle = () => {
    const filename = activeTab === 'html' ? 'index.html' : activeTab === 'css' ? 'style.css' : 'script.js';
    const content = activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onToast(`✓ Downloaded ${filename} successfully!`);
  };

  // Pack working files (index.html, style.css, script.js) as ZIP
  const handleDownloadZip = async () => {
    try {
      const zip = new JSZip();
      zip.file('index.html', htmlCode);
      zip.file('style.css', cssCode);
      zip.file('script.js', jsCode);
      
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.trim().replace(/\s+/g, '_') || 'lm_ide_project'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onToast('✓ All workspace files bundled and downloaded as ZIP!');
    } catch (err) {
      onToast('ZIP packing failed. Download files individually.');
    }
  };

  // Open share overlay
  const handleOpenShareModal = () => {
    setShareText('');
    setIsShareModalOpen(true);
  };

  // Post to timeline
  const handlePublishPost = async () => {
    const postMessage = shareText.trim() || `Check out my awesome project "${title}" in LM IDE! 🚀`;
    
    let user = { name: auth.currentUser?.displayName || 'Alex M.', regNumber: 'BIT/2024/001' };
    const uData = sessionStorage.getItem('advocode_user') || sessionStorage.getItem('mku_it_user');
    if (uData) {
      try { user = JSON.parse(uData); } catch (e) {}
    }

    const newPostData = {
      content: postMessage,
      type: 'code_share',
      language: 'html',
      code: `<!-- index.html -->\n${htmlCode}\n\n/* style.css */\n${cssCode}\n\n// script.js\n${jsCode}`,
      author: {
        name: user.name,
        avatarUrl: auth.currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563EB&color=fff`,
        regNumber: user.regNumber,
        specialty: 'Student Member',
        bio: 'Year 3 Student • IT Hub companion developer',
        techStack: ['React', 'TypeScript', 'Tailwind CSS'],
        streakDays: 1,
        points: 25,
        portfolioItems: []
      },
      upvotes: 1,
      reposts: 0,
      hasUpvoted: true,
      hasReposted: false,
      comments: [],
      time: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timeMs: Date.now()
    };

    try {
      await addDoc(collection(db, "posts"), cleanForFirestore(newPostData));
      onToast('✓ Project successfully published to the Firestore Engagement Hub timeline!');
      setIsShareModalOpen(false);
    } catch (err: any) {
      console.error("Error publishing project:", err);
      onToast(`Error publishing: ${err.message}`);
    }
  };

  // VS Code style auto format functionality
  const handleFormatCode = () => {
    if (activeTab === 'html') {
      let formatted = htmlCode
        .replace(/>\s*</g, '>\n<')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== '')
        .join('\n');
      
      let indent = 0;
      let finalCode = '';
      formatted.split('\n').forEach(line => {
        if (line.match(/^<\/\w+/)) {
          indent = Math.max(0, indent - 1);
        }
        finalCode += '  '.repeat(indent) + line + '\n';
        if (line.match(/^<\w+[^>]*[^/]>$/) && !line.match(/^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)/)) {
          indent += 1;
        }
      });
      setHtmlCode(finalCode.trim());
      onToast('✓ Formatted HTML tags! 🪄');
    } else if (activeTab === 'css') {
      const formatted = cssCode
        .replace(/\s*\{\s*/g, ' {\n  ')
        .replace(/\s*;\s*/g, ';\n  ')
        .replace(/\s*\}\s*/g, '\n}\n\n')
        .replace(/\n\s*\n/g, '\n')
        .replace(/\s*\n\s*\}/g, '\n}')
        .split('\n')
        .map(line => {
          if (line.includes('{') && !line.startsWith('  ')) return line.trim();
          if (line.startsWith('}')) return line.trim();
          return line;
        })
        .join('\n')
        .trim();
      setCssCode(formatted);
      onToast('✓ Formatted CSS style sheet! 🪄');
    } else if (activeTab === 'js') {
      const formatted = jsCode
        .replace(/\s*\{\s*/g, ' {\n  ')
        .replace(/\s*;\s*/g, ';\n  ')
        .replace(/\s*\}\s*/g, '\n}\n')
        .replace(/\s*,\s*/g, ', ')
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        .trim();
      setJsCode(formatted);
      onToast('✓ Formatted JavaScript nodes! 🪄');
    }
  };

  // Run preview trigger on mobile specifically
  const handleMobileRun = () => {
    updatePreview();
    setMobileView('preview');
    onToast('Launching sandboxed simulator preview...');
  };

  // Compute syllabus lessons for drawer
  const allLessons = getAllLessonsFromTutorial(tutorialData);
  const filteredSyllabus = syllabusSearch.trim() === ''
    ? []
    : allLessons.filter(item => 
        item.topic.toLowerCase().includes(syllabusSearch.toLowerCase()) ||
        item.explanation.toLowerCase().includes(syllabusSearch.toLowerCase()) ||
        item.partTitle.toLowerCase().includes(syllabusSearch.toLowerCase())
      );

  return (
    <div className="flex flex-col md:flex-row w-full h-full flex-1 overflow-hidden bg-slate-900 font-sans relative animate-fade-in" id="lm-ide-root">
      
      {/* LEFT IDE WORKSPACE (Visible on mobile if mode is 'editor' OR on desktop always) */}
      <div className={`flex-1 flex flex-col h-full bg-white border-r border-slate-200/80 ${mobileView === 'preview' ? 'hidden md:flex' : 'flex'}`}>
        
        {/* IDE Top Controls Toolbar */}
        <header className="px-4 py-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/10">
              <Terminal className="w-4.5 h-4.5" />
            </div>
            <div>
             
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-bold text-[11px] text-slate-500 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none w-28 hover:text-slate-800 transition-colors"
                placeholder="Name project..."
              />
            </div>
          </div>

          {/* Syllabus Starter Labs Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSyllabusDrawerOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-md shadow-blue-500/15 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="Browse 100+ Syllabus Starter Labs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Syllabus Labs & Starters</span>
            </button>
          </div>

          {/* Global compiler controls */}
          <div className="flex items-center justify-end gap-1.5 shrink-0">
            {/* Run Button (Mobile visible only - Desktop auto-runs or shows Play) */}
            <button
              onClick={handleMobileRun}
              className="md:hidden bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-1.5 text-xs font-bold shadow-md shadow-blue-500/15 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
              title="Execute Code for Preview"
            >
              <Play className="w-3.5 h-3.5 fill-white text-white" /> Run Preview
            </button>

            <button
              onClick={handleSave}
              className="hidden sm:flex bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-3 py-1.5 text-[10.5px] font-extrabold shadow-sm items-center gap-1.5 transition-all cursor-pointer active:scale-95 border border-slate-800"
              title="Save project to workspace"
            >
              Save App
            </button>

            <button
              onClick={handleOpenShareModal}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl p-2 text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer active:scale-95 border border-blue-100/50"
              title="Share project to Hub timeline"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleClear}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl cursor-pointer transition-all"
              title="Reset buffers"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Tab & File Level Controller Icons Row */}
        <div className="flex bg-slate-50 p-1.5 border-b border-slate-200/60 justify-between items-center gap-2 shrink-0">
          
          {/* File selector tabs */}
          <div className="flex gap-1">
            {(['html', 'css', 'js'] as const).map((tab) => {
              const labelMap = { html: 'index.html', css: 'style.css', js: 'script.js' };
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm border-slate-200/80 font-extrabold'
                      : 'text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-100'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 ${
                    tab === 'html' ? 'text-orange-500' : tab === 'css' ? 'text-blue-500' : 'text-amber-500'
                  }`} />
                  <span>{labelMap[tab]}</span>
                </button>
              );
            })}
          </div>

          {/* Action icon shortcuts on file level */}
          <div className="flex items-center gap-1 text-slate-400 bg-white p-1 rounded-xl border border-slate-200/50 shadow-sm">
            
            {/* Format code */}
            <button
              onClick={handleFormatCode}
              className="p-1.5 hover:text-slate-800 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
              title={`Format ${activeTab.toUpperCase()} document 🪄`}
            >
              <Wand2 className="w-3.5 h-3.5" />
            </button>

            {/* Copy Active File content */}
            <button
              onClick={handleCopyCode}
              className="p-1.5 hover:text-slate-800 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
              title={`Copy active ${activeTab.toUpperCase()} code`}
            >
              {copiedActiveFile ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Paste from clipboard */}
            <button
              onClick={handlePasteCode}
              className="p-1.5 hover:text-slate-800 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
              title="Paste from system clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
            </button>

            {/* Download single active file */}
            <button
              onClick={handleDownloadSingle}
              className="p-1.5 hover:text-slate-800 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border-r border-slate-100"
              title="Download active file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Zip download entire workspace */}
            <button
              onClick={handleDownloadZip}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[9px] font-extrabold cursor-pointer flex items-center gap-1 shadow-sm transition-all"
              title="Download full project workspace as ZIP"
            >
              <Download className="w-3 h-3 text-blue-400" /> ZIP
            </button>
          </div>
        </div>

        {/* Dynamic CodeMirror Editor Container */}
        <div className="flex-1 relative bg-[#0d1117] overflow-hidden flex flex-col">
          {activeTab === 'html' && (
            <CodeMirror
              value={htmlCode}
              height="100%"
              theme="dark"
              extensions={[html(), customHtml, CMEditorView.lineWrapping]}
              onChange={(value) => setHtmlCode(value)}
              className="w-full h-full text-xs font-mono overflow-auto"
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                syntaxHighlighting: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                highlightActiveLine: true,
              }}
            />
          )}

          {activeTab === 'css' && (
            <CodeMirror
              value={cssCode}
              height="100%"
              theme="dark"
              extensions={[css(), customCss, CMEditorView.lineWrapping]}
              onChange={(value) => setCssCode(value)}
              className="w-full h-full text-xs font-mono overflow-auto"
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                syntaxHighlighting: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                highlightActiveLine: true,
              }}
            />
          )}

          {activeTab === 'js' && (
            <CodeMirror
              value={jsCode}
              height="100%"
              theme="dark"
              extensions={[javascript(), customJs, CMEditorView.lineWrapping]}
              onChange={(value) => setJsCode(value)}
              className="w-full h-full text-xs font-mono overflow-auto"
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                syntaxHighlighting: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                highlightActiveLine: true,
              }}
            />
          )}

        </div>
      </div>

      {/* RIGHT PREVIEW SIMULATOR (Visible on mobile if mode is 'preview' OR on desktop always) */}
      <div className={`flex-1 flex flex-col h-full bg-white ${mobileView === 'editor' ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Simulator Header controls */}
        <header className="md:hidden px-4 py-3 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            {/* Mobile Back Button (XCircle) to escape preview mode back to Editor */}
            <button
              onClick={() => setMobileView('editor')}
              className="md:hidden p-1.5 hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-lg transition-colors cursor-pointer mr-1.5 border border-slate-200 shadow-sm"
              title="Close Preview & Return to Editor"
            >
              <XCircle className="w-4.5 h-4.5" />
            </button>
            <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700">App Preview</span>
          </div>
        </header>

        {/* Live IFrame viewport - Unconstrained and filling the entire available space */}
        <div className="flex-1 bg-white relative flex flex-col w-full h-full">
          <iframe
            ref={iframeRef}
            title="LM IDE Live Simulator Out"
            className="w-full h-full border-none bg-white flex-1"
          />
        </div>

        {/* Local storage Saved Codes list snippet row */}
        {savedSnippets.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-200 bg-white/80 backdrop-blur shrink-0 hidden md:block">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FolderGit className="w-4 h-4 text-slate-500" /> Saved Club Projects ({savedSnippets.length})
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {savedSnippets.slice(0, 4).map((snip) => (
                <button
                  key={snip.id}
                  onClick={() => handleLoadSnippet(snip)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 border border-slate-200/50 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-sm"
                >
                  <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate max-w-28">{snip.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SHARE PROJECT OVERLAY MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
            
            <header className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Share to Engagement Hub</h3>
              </div>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <XCircle className="w-4.5 h-4.5" />
              </button>
            </header>

            <div className="p-4.5 flex flex-col gap-3.5">
              <p className="text-[11.5px] text-slate-500 font-semibold leading-relaxed">
                Publish your creation as a Code Share post directly onto the club timeline. Other students will be able to run and copy your code snippets!
              </p>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1.5 block">Custom Share Message & Description</label>
                <textarea
                  value={shareText}
                  onChange={(e) => setShareText(e.target.value)}
                  placeholder="Write a custom message or description about what your code does, how to interact with it, or what you learned..."
                  maxLength={500}
                  rows={4}
                  className="w-full bg-slate-50 text-xs text-slate-800 placeholder-slate-400 border border-slate-200/80 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-semibold resize-none"
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-2.5">
                <FileCode className="w-8 h-8 text-blue-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{title}</h4>
                  <p className="text-[9.5px] text-slate-400 font-bold truncate">Includes index.html, style.css, script.js</p>
                </div>
              </div>
            </div>

            <footer className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-2 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePublishPost}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold cursor-pointer shadow-md shadow-blue-500/10 active:scale-95 transition-all"
              >
                Publish Share
              </button>
            </footer>

          </div>
        </div>
      )}

      {/* SYLLABUS & STARTER LABS DRAWER MODAL */}
      {isSyllabusDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            
            {/* Header */}
            <header className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">Syllabus Curriculum & Starter Labs</h3>
                  <p className="text-xs text-slate-400 font-medium">Load any of the 100+ course topics directly into your live code simulator</p>
                </div>
              </div>
              <button
                onClick={() => setIsSyllabusDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 bg-slate-50/50">
              
              {/* Section 1: Quick Starter Templates */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Quick Starter Kits</h4>
                  <span className="text-[10px] font-extrabold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200">Instant Setup</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadTemplate(idx)}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all cursor-pointer ${
                        activeTemplateIdx === idx
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-white border-slate-200 hover:border-blue-400 text-slate-800 hover:shadow-md'
                      }`}
                    >
                      <div className="font-bold text-xs line-clamp-2">{tmpl.title}</div>
                      <div className="flex items-center justify-between text-[10px] font-extrabold mt-2 opacity-80">
                        <span>Starter Kit</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 2: Complete 10-Part Curriculum Syllabus */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">MKU 10-Part Web Dev Course Lessons</h4>
                    <span className="text-[10px] font-extrabold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200">100+ Interactive Labs</span>
                  </div>
                  {/* Search Input */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={syllabusSearch}
                      onChange={(e) => setSyllabusSearch(e.target.value)}
                      placeholder="Search across all lessons..."
                      className="w-full pl-9 pr-4 py-2 bg-white text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    />
                    {syllabusSearch && (
                      <button
                        onClick={() => setSyllabusSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* If searching, show search results */}
                {syllabusSearch.trim() !== '' ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 mb-3">
                      Found {filteredSyllabus.length} lesson(s) matching "{syllabusSearch}"
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                      {filteredSyllabus.map((item, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between gap-3 hover:bg-white transition-all">
                          <div>
                            <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-blue-600 uppercase tracking-wider mb-1">
                              <span>Part {item.partNumber}</span> • <span>{item.chapterTitle}</span>
                            </div>
                            <h5 className="text-xs font-bold text-slate-900">{item.topic}</h5>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{item.explanation}</p>
                          </div>
                          <button
                            onClick={() => loadTopicLesson(item, item.partNumber)}
                            className="w-full py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95 shadow-sm"
                          >
                            <Play className="w-3 h-3 fill-white text-white" /> Load into Playground
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Otherwise show Part Selector Tabs + Chapter/Topic Explorer */
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Left Column: Part selector tabs */}
                    <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-2 flex flex-col gap-1 max-h-96 overflow-y-auto">
                      {(tutorialData.course.parts as any[]).map((part, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedPartIndex(idx)}
                          className={`p-3 rounded-xl text-left flex flex-col gap-1 transition-all cursor-pointer ${
                            selectedPartIndex === idx
                              ? 'bg-blue-50 text-blue-700 border border-blue-200 font-extrabold shadow-sm'
                              : 'hover:bg-slate-50 text-slate-700 font-semibold border border-transparent'
                          }`}
                        >
                          <span className="text-[10px] uppercase font-black tracking-wider opacity-75">Part {part.part_number}</span>
                          <span className="text-xs font-bold line-clamp-1">{part.part_title || part.title || ''}</span>
                        </button>
                      ))}
                    </div>

                    {/* Right Column: Chapters & Topics for selected Part */}
                    <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 max-h-96 overflow-y-auto flex flex-col gap-6">
                      {tutorialData.course.parts[selectedPartIndex] && (
                        <div>
                          <div className="border-b border-slate-100 pb-3 mb-4">
                            <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">Part {tutorialData.course.parts[selectedPartIndex].part_number}</span>
                            <h4 className="text-base font-black text-slate-900 mt-1.5">{tutorialData.course.parts[selectedPartIndex].part_title || (tutorialData.course.parts[selectedPartIndex] as any).title || ''}</h4>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">{tutorialData.course.parts[selectedPartIndex].description}</p>
                          </div>

                          {/* List chapters */}
                          <div className="flex flex-col gap-6">
                            {(tutorialData.course.parts[selectedPartIndex].chapters || []).map((ch: any, chIdx: number) => (
                              <div key={chIdx} className="flex flex-col gap-3">
                                <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
                                  Chapter {ch.chapter_number}: {ch.chapter_title || ch.title || ''}
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1">
                                  {(ch.topics || []).map((tp: any, tpIdx: number) => (
                                    <div key={tpIdx} className="p-3.5 bg-slate-50/70 hover:bg-white rounded-xl border border-slate-200 flex flex-col justify-between gap-3 transition-all hover:shadow-md hover:border-blue-300">
                                      <div>
                                        <div className="flex items-center justify-between gap-2">
                                          <h6 className="text-xs font-bold text-slate-900">{tp.topic}</h6>
                                          <span className="text-[9px] font-extrabold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">+25 XP</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{tp.explanation || tp.description || ''}</p>
                                        <div className="flex flex-wrap gap-1 mt-2.5">
                                          {(tp.code_preview || []).slice(0, 3).map((tag: string, tIdx: number) => (
                                            <span key={tIdx} className="text-[9.5px] font-mono bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                                              `{tag}`
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => loadTopicLesson(tp, Number(tutorialData.course.parts[selectedPartIndex].part_number) || 0)}
                                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm shadow-blue-500/10 mt-1"
                                      >
                                        <Play className="w-3 h-3 fill-white text-white" /> Load into Playground
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <footer className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-slate-400">MKU IT Club Interactive Playground Hub</span>
              <button
                onClick={() => setIsSyllabusDrawerOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
            </footer>

          </div>
        </div>
      )}

    </div>
  );
};
