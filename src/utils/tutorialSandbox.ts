export interface TutorialTopicItem {
  partNumber: number;
  partTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  topic: string;
  explanation: string;
  use_case: string;
  example: string;
}

export const getAllLessonsFromTutorial = (tutorialData: any): TutorialTopicItem[] => {
  const items: TutorialTopicItem[] = [];
  if (!tutorialData?.course?.parts) return items;

  tutorialData.course.parts.forEach((part: any) => {
    const partNumber = part.part_number ?? 0;
    const partTitle = part.part_title || '';
    
    if (part.chapters && Array.isArray(part.chapters)) {
      part.chapters.forEach((chapter: any) => {
        const chapterNumber = chapter.chapter_number ?? 0;
        const chapterTitle = chapter.chapter_title || '';

        if (chapter.topics && Array.isArray(chapter.topics)) {
          chapter.topics.forEach((top: any) => {
            items.push({
              partNumber,
              partTitle,
              chapterNumber,
              chapterTitle,
              topic: top.topic || 'Untitled Topic',
              explanation: top.explanation || '',
              use_case: top.use_case || '',
              example: top.example || '',
            });
          });
        }
      });
    }
  });

  return items;
};

export const getTemplateForTopic = (
  topicObj: any,
  partNumber?: number
): { html: string; css: string; js: string; title: string } => {
  const title = typeof topicObj === 'string' ? topicObj : (topicObj.topic || 'Interactive Sandbox');
  const exampleText = typeof topicObj === 'string' ? '' : (topicObj.example || '');
  const useCase = typeof topicObj === 'string' ? '' : (topicObj.use_case || '');
  const explanation = typeof topicObj === 'string' ? '' : (topicObj.explanation || '');
  const nameLower = title.toLowerCase();

  // Part 0: Workspace & Handshake
  if (nameLower.includes('browser') || nameLower.includes('editor') || nameLower.includes('file system') || nameLower.includes('handshake') || partNumber === 0) {
    return {
      title,
      html: `<!-- Lesson: Web Environment & The 3-Language Handshake -->
<div class="welcome-card">
  <span class="badge">ENVIRONMENT LAB</span>
  <h1>Hello MKU Connect Student! 🎓</h1>
  <p>This sandbox illustrates how HTML structure, CSS styling, and JavaScript logic unite seamlessly.</p>
  <div class="status-box" id="status-display">Status: Waiting for interaction...</div>
  <div class="btn-group">
    <button id="alert-btn" class="primary-btn">🤝 Test JS Handshake</button>
    <button id="theme-btn" class="secondary-btn">🎨 Toggle Dark Mode</button>
  </div>
</div>`,
      css: `body {
  font-family: system-ui, -apple-system, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 85vh;
  background: #f8fafc;
  margin: 0;
  transition: background 0.3s, color 0.3s;
}
body.dark-mode {
  background: #0f172a;
  color: #f8fafc;
}
.welcome-card {
  background: white;
  padding: 36px;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
  text-align: center;
  max-width: 440px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s;
}
body.dark-mode .welcome-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
}
.badge {
  background: #e0e7ff;
  color: #4338ca;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
body.dark-mode .badge {
  background: #312e81;
  color: #c7d2fe;
}
h1 { font-size: 20px; margin: 16px 0 8px; }
p { font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 20px; }
body.dark-mode p { color: #94a3b8; }
.status-box {
  background: #f1f5f9;
  padding: 12px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 11px;
  color: #334155;
  margin-bottom: 20px;
  border-left: 4px solid #3b82f6;
}
body.dark-mode .status-box {
  background: #0f172a;
  color: #cbd5e1;
}
.btn-group { display: flex; gap: 10px; justify-content: center; }
button {
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 12px;
  transition: all 0.2s;
}
.primary-btn { background: #2563eb; color: white; }
.primary-btn:hover { background: #1d4ed8; transform: translateY(-1px); }
.secondary-btn { background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; }
body.dark-mode .secondary-btn { background: #334155; color: white; border-color: #475569; }
.secondary-btn:hover { background: #e2e8f0; }`,
      js: `const alertBtn = document.getElementById('alert-btn');
const themeBtn = document.getElementById('theme-btn');
const statusDisplay = document.getElementById('status-display');

alertBtn.addEventListener('click', () => {
  console.log('The browser-HTML-CSS-JS handshake is fully active! 🤝');
  statusDisplay.innerText = 'Status: Handshake confirmed! Check browser console.';
  statusDisplay.style.borderColor = '#10b981';
  alert('🤝 Connected! HTML structure, CSS design, and JS logic are working in sync!');
});

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  statusDisplay.innerText = 'Status: Theme switched to ' + (isDark ? 'Dark Mode 🌙' : 'Light Mode ☀️');
  console.log('Theme toggled to:', isDark ? 'dark' : 'light');
});`
    };
  }

  // Part 2, 3, 4: CSS Styling, Layouts, Animations
  if (partNumber === 2 || partNumber === 3 || partNumber === 4 || nameLower.includes('css') || nameLower.includes('style') || nameLower.includes('selector') || nameLower.includes('flex') || nameLower.includes('grid') || nameLower.includes('color') || nameLower.includes('animation') || nameLower.includes('box model')) {
    // If exampleText contains CSS rules or HTML
    let customCss = `/* Lesson: ${title} */
body {
  font-family: system-ui, -apple-system, sans-serif;
  padding: 30px;
  background: #f8fafc;
  color: #1e293b;
}
.demo-card {
  background: white;
  padding: 24px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 15px rgba(0,0,0,0.04);
  max-width: 600px;
  margin: 0 auto;
}
h2 { color: #0f172a; margin-top: 0; font-size: 18px; }
.desc { color: #64748b; font-size: 13px; margin-bottom: 20px; }
`;
    if (exampleText.includes('{') || exampleText.includes(':')) {
      customCss += `\n/* --- Example Rules from Syllabus --- */\n` + exampleText;
    } else {
      customCss += `\n/* Experiment with CSS styling below */\n.highlight-box {\n  background: linear-gradient(135deg, #3b82f6, #6366f1);\n  color: white;\n  padding: 20px;\n  border-radius: 10px;\n  text-align: center;\n  font-weight: bold;\n  box-shadow: 0 4px 12px rgba(59,130,246,0.3);\n}`;
    }

    let customHtml = `<!-- CSS Exploration Lab: ${title} -->
<div class="demo-card">
  <h2>🎨 ${title}</h2>
  <p class="desc">${explanation ? explanation.slice(0, 120) + '...' : 'Explore cascading styles, layout engines, and visual rules.'}</p>
  
  <div class="playground-area">
    ${exampleText.includes('<') ? exampleText : `<div class="highlight-box">\n      <p>Target element for CSS styling rules!</p>\n      <button class="btn btn-primary" onclick="alert('Styled element clicked!')">Interactive Button</button>\n    </div>`}
  </div>
</div>`;

    return {
      title,
      html: customHtml,
      css: customCss,
      js: `console.log("CSS Lab loaded for: ${title}");\ndocument.querySelectorAll('button').forEach(btn => {\n  btn.addEventListener('click', () => console.log('Button interaction in CSS Lab'));\n});`
    };
  }

  // Part 5, 6, 7: JavaScript Core, DOM, Events, Storage
  if (partNumber === 5 || partNumber === 6 || partNumber === 7 || nameLower.includes('js') || nameLower.includes('javascript') || nameLower.includes('dom') || nameLower.includes('event') || nameLower.includes('storage') || nameLower.includes('localstorage') || nameLower.includes('fetch')) {
    let customJs = `// JavaScript Lab: ${title}\nconsole.log("Welcome to ${title} lab!");\n\n`;
    if (exampleText && !exampleText.includes('<')) {
      customJs += `// Example from syllabus:\n${exampleText}\n\n`;
    }
    customJs += `const labBtn = document.getElementById('run-lab-btn');\nif (labBtn) {\n  labBtn.addEventListener('click', () => {\n    const output = document.getElementById('lab-output');\n    output.innerText = '✓ JS Executed! Check DevTools Console for logs.';\n    output.style.background = '#dcfce7';\n    output.style.color = '#166534';\n    console.log("Interactive JS execution triggered!");\n  });\n}`;

    return {
      title,
      html: `<!-- JavaScript & DOM Lab: ${title} -->
<div class="js-lab-card">
  <span class="badge">JS RUNTIME LAB</span>
  <h2>⚡ ${title}</h2>
  <p class="explanation">${explanation || 'Experiment with JavaScript logic, DOM manipulation, and asynchronous workflows.'}</p>
  
  <div class="interaction-zone">
    ${exampleText.includes('<') ? exampleText : `<button id="run-lab-btn" class="action-btn">🚀 Execute Script Demo</button>\n    <div id="lab-output" class="output-box">Ready to execute script...</div>`}
  </div>
</div>`,
      css: `body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #f1f5f9;
  color: #1e293b;
  padding: 30px;
  display: flex;
  justify-content: center;
}
.js-lab-card {
  background: white;
  padding: 28px;
  border-radius: 16px;
  border: 1px solid #cbd5e1;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  max-width: 500px;
  width: 100%;
}
.badge {
  background: #fef3c7;
  color: #d97706;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 12px;
  text-transform: uppercase;
}
h2 { margin: 12px 0 8px; font-size: 18px; color: #0f172a; }
.explanation { font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 20px; }
.interaction-zone { display: flex; flex-direction: column; gap: 12px; }
.action-btn {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.action-btn:hover { background: #4338ca; }
.output-box {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  padding: 14px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  color: #475569;
}`,
      js: customJs
    };
  }

  // Part 1 or General HTML Topics (Headings, Lists, Forms, Tables, Media, Links)
  return {
    title,
    html: `<!-- HTML5 Architecture Lab: ${title} -->
<main class="lab-container">
  <header class="lab-header">
    <span class="badge">SEMANTIC HTML5</span>
    <h1>${title}</h1>
    <p class="subtitle">${useCase || 'Build structured, accessible, and standards-compliant web components.'}</p>
  </header>

  <section class="example-showcase">
    ${exampleText ? exampleText : `<p>Standard HTML element demonstration.</p>`}
  </section>

  <footer class="lab-footer">
    <button id="inspect-btn" class="inspect-btn">🔍 Inspect DOM Structure</button>
    <span id="inspect-result"></span>
  </footer>
</main>`,
    css: `body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #f8fafc;
  color: #1e293b;
  margin: 0;
  padding: 30px;
  line-height: 1.6;
}
.lab-container {
  max-width: 680px;
  margin: 0 auto;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.04);
}
.badge {
  background: #e0f2fe;
  color: #0284c7;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 12px;
  text-transform: uppercase;
}
h1 { font-size: 22px; color: #0f172a; margin: 10px 0 6px; }
.subtitle { font-size: 13px; color: #64748b; margin-bottom: 24px; }
.example-showcase {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
}
/* Standard Form styling for form examples */
form { display: flex; flex-direction: column; gap: 12px; }
input, select, textarea {
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;
}
button {
  background: #0284c7;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
button:hover { background: #0369a1; }
/* Table styling for table examples */
table { width: 100%; border-collapse: collapse; margin: 10px 0; }
th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 13px; }
th { background: #f1f5f9; font-weight: bold; }
/* Lists styling */
ul, ol { padding-left: 20px; }
li { margin-bottom: 6px; }
blockquote {
  border-left: 4px solid #3b82f6;
  margin: 16px 0;
  padding: 8px 16px;
  background: #eff6ff;
  font-style: italic;
  border-radius: 0 8px 8px 0;
}
.lab-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}
.inspect-btn { background: #334155; color: white; font-size: 12px; }
.inspect-btn:hover { background: #1e293b; }
#inspect-result { font-size: 12px; font-weight: 600; color: #059669; }`,
    js: `const inspectBtn = document.getElementById('inspect-btn');
if (inspectBtn) {
  inspectBtn.addEventListener('click', () => {
    const showcase = document.querySelector('.example-showcase');
    const childCount = showcase ? showcase.children.length : 0;
    document.getElementById('inspect-result').innerText = \`✓ DOM verified! (\${childCount} root elements active in showcase)\`;
    console.log("Showcase HTML contents:", showcase ? showcase.innerHTML : "None");
  });
}`
  };
};

export const getTemplateForProject = (
  projectName: string,
  projectData?: any
): { html: string; css: string; js: string; title: string } => {
  const name = projectName.toLowerCase();
  
  if (name.includes('portfolio')) {
    return {
      title: projectName,
      html: `<!-- CAPSTONE 1: Portfolio Landing Page Starter -->
<header class="navbar">
  <div class="logo">🚀 Alex M. | Dev</div>
  <nav>
    <a href="#about">About</a>
    <a href="#skills">Skills</a>
    <a href="#projects">Projects</a>
    <a href="#contact">Contact</a>
    <button id="theme-toggle">🌓 Theme</button>
  </nav>
</header>

<section id="about" class="hero">
  <span class="badge">AVAILABLE FOR HIRE</span>
  <h1>Creative Full-Stack Developer</h1>
  <p>Member of &lt;/AdvocoDe&gt;. Passionate about building accessible, performant web applications.</p>
  <div class="cta-buttons">
    <a href="#projects" class="btn btn-primary">View Projects</a>
    <a href="#contact" class="btn btn-outline">Contact Me</a>
  </div>
</section>

<section id="skills" class="section">
  <h2>Technical Arsenal</h2>
  <div class="skills-grid">
    <div class="skill-tag">HTML5 & Semantic Web</div>
    <div class="skill-tag">CSS3 & Tailwind</div>
    <div class="skill-tag">JavaScript (ES6+)</div>
    <div class="skill-tag">React & TypeScript</div>
    <div class="skill-tag">Git & GitHub</div>
    <div class="skill-tag">Responsive UI/UX</div>
  </div>
</section>

<section id="projects" class="section bg-alt">
  <h2>Featured Capstones</h2>
  <div class="grid">
    <div class="card">
      <h3>MKU IT Community Hub</h3>
      <p>A full-stack collaboration platform with real-time chat, coding sandboxes, and file libraries.</p>
      <span class="tech">React • Tailwind • TS</span>
    </div>
    <div class="card">
      <h3>Dynamic Weather Dashboard</h3>
      <p>Real-time meteorological tracker using asynchronous REST APIs and responsive data visualization.</p>
      <span class="tech">JavaScript • Fetch API</span>
    </div>
  </div>
</section>

<footer id="contact" class="footer">
  <p>&copy; 2026 Alex M. • Built with HTML5, CSS3 & JS inside MKU IT Club.</p>
</footer>`,
      css: `body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  color: #1e293b;
  background: #ffffff;
  transition: background 0.3s, color 0.3s;
  scroll-behavior: smooth;
}
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 40px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  border-bottom: 1px solid #e2e8f0;
  z-index: 100;
}
.logo { font-weight: 800; font-size: 18px; color: #2563eb; }
nav { display: flex; gap: 20px; align-items: center; }
nav a { text-decoration: none; color: #475569; font-weight: 600; font-size: 13px; transition: color 0.2s; }
nav a:hover { color: #2563eb; }
#theme-toggle {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
}
.hero {
  text-align: center;
  padding: 80px 20px;
  max-width: 700px;
  margin: 0 auto;
}
.badge {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}
h1 { font-size: 38px; margin: 16px 0 12px; color: #0f172a; line-height: 1.2; }
.hero p { font-size: 16px; color: #64748b; line-height: 1.6; margin-bottom: 28px; }
.cta-buttons { display: flex; gap: 12px; justify-content: center; }
.btn {
  padding: 12px 24px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.2s;
}
.btn-primary { background: #2563eb; color: white; }
.btn-primary:hover { background: #1d4ed8; }
.btn-outline { border: 2px solid #cbd5e1; color: #334155; }
.btn-outline:hover { background: #f8fafc; border-color: #94a3b8; }
.section { padding: 60px 40px; max-width: 900px; margin: 0 auto; }
.bg-alt { background: #f8fafc; max-width: 100%; padding-left: 10%; padding-right: 10%; }
h2 { font-size: 24px; color: #0f172a; margin-bottom: 24px; text-align: center; }
.skills-grid { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
.skill-tag {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
  color: #334155;
}
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
.card {
  background: white;
  padding: 28px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  transition: transform 0.2s;
}
.card:hover { transform: translateY(-4px); border-color: #3b82f6; }
.card h3 { margin: 0 0 10px; font-size: 18px; color: #0f172a; }
.card p { color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 16px; }
.tech { font-size: 11px; font-weight: 800; color: #2563eb; text-transform: uppercase; }
.footer { text-align: center; padding: 40px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
/* Dark Theme */
body.dark { background: #0f172a; color: #f8fafc; }
body.dark .navbar { background: rgba(15, 23, 42, 0.85); border-color: #1e293b; }
body.dark nav a { color: #cbd5e1; }
body.dark h1, body.dark h2, body.dark .card h3 { color: white; }
body.dark .bg-alt { background: #1e293b; }
body.dark .card { background: #0f172a; border-color: #334155; }
body.dark .skill-tag { background: #1e293b; border-color: #334155; color: #e2e8f0; }
body.dark #theme-toggle { background: #334155; color: white; border-color: #475569; }`,
      js: `// Implement custom LocalStorage-backed Dark Mode toggle
const btn = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme');

if (currentTheme === 'dark') {
  document.body.classList.add('dark');
}

btn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
  console.log("Theme switched to:", theme);
});`
    };
  }

  if (name.includes('cart') || name.includes('commerce')) {
    return {
      title: projectName,
      html: `<!-- CAPSTONE 2: E-Commerce Cart Starter -->
<div class="store-container">
  <header>
    <div>
      <h2>MKU Club Store 🛒</h2>
      <p class="subtitle">Official IT Club Merchandise & Learning Books</p>
    </div>
    <div class="cart-badge">Items in Cart: <span id="cart-count">0</span></div>
  </header>

  <div class="catalog">
    <div class="product-item">
      <div class="product-icon">☕</div>
      <h3>Premium MKU Mug</h3>
      <p class="price">KSh 800</p>
      <button onclick="addToCart('MKU Mug', 800)">Add to Cart</button>
    </div>
    <div class="product-item">
      <div class="product-icon">🧥</div>
      <h3>IT Club Hoodie</h3>
      <p class="price">KSh 2,500</p>
      <button onclick="addToCart('IT Club Hoodie', 2500)">Add to Cart</button>
    </div>
    <div class="product-item">
      <div class="product-icon">📚</div>
      <h3>HTML5 & CSS3 Manual</h3>
      <p class="price">KSh 1,200</p>
      <button onclick="addToCart('HTML5 Manual', 1200)">Add to Cart</button>
    </div>
    <div class="product-item">
      <div class="product-icon">💻</div>
      <h3>Club Dev Sticker Pack</h3>
      <p class="price">KSh 350</p>
      <button onclick="addToCart('Sticker Pack', 350)">Add to Cart</button>
    </div>
  </div>

  <div class="cart-section">
    <h3>Your Shopping Cart</h3>
    <ul id="cart-items" class="cart-list"></ul>
    <div class="cart-footer">
      <div class="total-price">Total Amount: <span>KSh <span id="cart-total">0</span></span></div>
      <div>
        <button id="clear-btn" class="btn-clear" onclick="clearCart()">Clear Cart</button>
        <button id="checkout-btn" class="btn-checkout" onclick="checkout()">Checkout Order</button>
      </div>
    </div>
  </div>
</div>`,
      css: `body {
  font-family: system-ui, -apple-system, sans-serif;
  padding: 24px;
  background: #f8fafc;
  color: #1e293b;
  margin: 0;
}
.store-container {
  max-width: 850px;
  margin: 0 auto;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 16px;
  margin-bottom: 24px;
}
h2 { margin: 0; color: #0f172a; font-size: 24px; }
.subtitle { margin: 4px 0 0; color: #64748b; font-size: 13px; }
.cart-badge {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 800;
  font-size: 13px;
}
.catalog {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin: 24px 0;
}
.product-item {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 20px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
  transition: transform 0.2s;
}
.product-item:hover { transform: translateY(-3px); border-color: #3b82f6; }
.product-icon { font-size: 32px; margin-bottom: 8px; }
.product-item h3 { font-size: 15px; margin: 0 0 6px; color: #0f172a; }
.price { font-weight: 800; color: #059669; margin: 0 0 16px; font-size: 14px; }
button {
  background: #0284c7;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 12px;
  width: 100%;
  transition: background 0.2s;
}
button:hover { background: #0369a1; }
.cart-section {
  background: white;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #cbd5e1;
  box-shadow: 0 4px 15px rgba(0,0,0,0.04);
}
.cart-list { list-style: none; padding: 0; margin: 16px 0; max-height: 200px; overflow-y: auto; }
.cart-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
  font-weight: 600;
}
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 2px solid #e2e8f0;
  padding-top: 16px;
  margin-top: 16px;
}
.total-price { font-size: 16px; font-weight: 800; color: #0f172a; }
.total-price span { color: #2563eb; }
.btn-clear { background: #ef4444; width: auto; padding: 8px 14px; margin-right: 8px; }
.btn-clear:hover { background: #dc2626; }
.btn-checkout { background: #10b981; width: auto; padding: 8px 18px; }
.btn-checkout:hover { background: #059669; }`,
      js: `let cart = JSON.parse(localStorage.getItem('saved_cart')) || [];

function updateUI() {
  const list = document.getElementById('cart-items');
  list.innerHTML = '';
  let total = 0;
  
  if (cart.length === 0) {
    list.innerHTML = '<li style="color:#94a3b8; justify-content:center; font-style:italic;">Your cart is empty</li>';
  } else {
    cart.forEach((item, idx) => {
      const li = document.createElement('li');
      li.innerHTML = \`<span>\${item.name}</span> <span>KSh \${item.price} <button onclick="removeItem(\${idx})" style="padding: 4px 8px; font-size: 10px; background: #ef4444; width:auto; margin-left: 12px; border-radius: 4px;">Remove</button></span>\`;
      list.appendChild(li);
      total += item.price;
    });
  }
  
  document.getElementById('cart-count').innerText = cart.length;
  document.getElementById('cart-total').innerText = total;
  localStorage.setItem('saved_cart', JSON.stringify(cart));
}

window.addToCart = function(name, price) {
  cart.push({ name, price });
  updateUI();
};

window.removeItem = function(idx) {
  cart.splice(idx, 1);
  updateUI();
};

window.clearCart = function() {
  if (confirm('Empty shopping cart?')) {
    cart = [];
    updateUI();
  }
};

window.checkout = function() {
  if (cart.length === 0) {
    alert('Your cart is empty! Add items first.');
    return;
  }
  alert('🎉 Order placed successfully! Total: KSh ' + document.getElementById('cart-total').innerText);
  cart = [];
  updateUI();
};

updateUI();`
    };
  }

  // Capstone 3 or fallback: Live Weather Dashboard
  return {
    title: projectName,
    html: `<!-- CAPSTONE 3: Live Weather Dashboard Starter -->
<div class="weather-box">
  <div class="weather-header">
    <span class="badge">LIVE API FETCH</span>
    <h2>Nairobi Weather Dashboard 🌦️</h2>
  </div>
  <p class="desc">Using asynchronous REST APIs with JavaScript fetch() to stream real-time weather metrics.</p>
  <button id="fetch-btn" class="fetch-btn">🔄 Fetch Live Meteorological Data</button>
  
  <div id="weather-result" class="result-card hidden">
    <div class="main-temp" id="temp">--°C</div>
    <div class="metrics">
      <div class="metric-item"><span class="label">Windspeed</span><span id="wind">-- km/h</span></div>
      <div class="metric-item"><span class="label">Elevation</span><span id="elev">1,795 m</span></div>
      <div class="metric-item"><span class="label">Last Updated</span><span id="time">--:--</span></div>
    </div>
  </div>
</div>`,
    css: `body {
  background: #0f172a;
  color: #f8fafc;
  font-family: system-ui, -apple-system, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 85vh;
  margin: 0;
  padding: 20px;
}
.weather-box {
  background: #1e293b;
  padding: 32px;
  border-radius: 20px;
  text-align: center;
  border: 1px solid #334155;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.badge {
  background: #1e1b4b;
  color: #818cf8;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
h2 { font-size: 20px; margin: 12px 0 6px; color: #ffffff; }
.desc { color: #94a3b8; font-size: 13px; line-height: 1.5; margin-bottom: 24px; }
.fetch-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
  transition: all 0.2s;
  width: 100%;
}
.fetch-btn:hover { background: #2563eb; transform: translateY(-1px); }
.result-card {
  margin-top: 24px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}
.hidden { display: none; }
.main-temp { font-size: 42px; font-weight: 800; color: #38bdf8; margin-bottom: 16px; }
.metrics { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; border-top: 1px solid #1e293b; pt: 16px; }
.metric-item { display: flex; flex-direction: column; gap: 4px; font-size: 12px; font-weight: 700; color: #cbd5e1; }
.label { font-size: 10px; color: #64748b; text-transform: uppercase; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`,
    js: `const btn = document.getElementById('fetch-btn');
const result = document.getElementById('weather-result');

btn.addEventListener('click', async () => {
  btn.innerText = '⏳ Connecting to Open-Meteo API...';
  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-1.2833&longitude=36.8167&current_weather=true');
    const data = await response.json();
    
    document.getElementById('temp').innerText = data.current_weather.temperature + '°C';
    document.getElementById('wind').innerText = data.current_weather.windspeed + ' km/h';
    document.getElementById('time').innerText = data.current_weather.time.split('T')[1] || 'Live';
    
    result.classList.remove('hidden');
    console.log("Successfully retrieved Nairobi weather API metrics!", data);
  } catch (err) {
    alert('Failed to connect to Weather API.');
    console.error(err);
  } finally {
    btn.innerText = '🔄 Refresh Meteorological Data';
  }
});`
  };
};
