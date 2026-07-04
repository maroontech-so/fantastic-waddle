export interface Achievement {
  id: number;
  category: string;
  name: string;
  description: string;
  icon: string; // Emoji
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 1, category: "Onboarding", name: "First Check-In", description: "Registered your profile and completed basic security setup.", icon: "🎓" },
  { id: 2, category: "Onboarding", name: "Pixel Pioneer", description: "Opened VS Code and created your very first `index.html` file.", icon: "🚀" },
  { id: 3, category: "Onboarding", name: "Live Server Launch", description: "Installed Live Server and saw your HTML refresh automatically on save.", icon: "⚡" },
  { id: 4, category: "Onboarding", name: "Pathfinder", description: "Successfully linked a CSS and JS file using relative file paths without breaking.", icon: "📂" },
  { id: 5, category: "Onboarding", name: "The Handshake", description: "Demonstrated understanding of how HTML, CSS, and JS collaborate on the same DOM.", icon: "🤝" },
  { id: 6, category: "Onboarding", name: "Inspect Element Initiate", description: "Opened Chrome DevTools and identified the structure of a live webpage.", icon: "🔍" },
  { id: 7, category: "Onboarding", name: "DevTools Detective", description: "Changed live CSS values in DevTools to preview styles without saving a file.", icon: "🕵️" },
  { id: 8, category: "Onboarding", name: "Console Commander", description: "Executed your first `console.log('Hello World')` in the browser console.", icon: "📟" },
  { id: 9, category: "Onboarding", name: "Emmet Enthusiast", description: "Used Emmet shortcuts (`!` + Tab) to generate a full HTML boilerplate instantly.", icon: "⚡" },
  { id: 10, category: "Onboarding", name: "File System Sherpa", description: "Organized a project with `/css`, `/js`, and `/assets/images` folders properly.", icon: "📁" },

  { id: 11, category: "HTML - Structure", name: "Doctype Whisperer", description: "Correctly declared `<!DOCTYPE html>` to banish Quirks Mode forever.", icon: "📄" },
  { id: 12, category: "HTML - Structure", name: "Linguist", description: "Set the `lang` attribute on the HTML tag for proper screen reader pronunciation.", icon: "🌐" },
  { id: 13, category: "HTML - Structure", name: "Metadata Mogul", description: "Mastered the `<head>` with `<title>` and viewport `<meta>` tags.", icon: "👑" },
  { id: 14, category: "HTML - Structure", name: "The Commentator", description: "Commented your HTML code professionally to explain complex sections.", icon: "💬" },
  { id: 15, category: "HTML - Text", name: "Heading Hierarch", description: "Correctly used `<h1>` to `<h6>` for a perfect content outline.", icon: "📝" },
  { id: 16, category: "HTML - Text", name: "Paragraph Pro", description: "Structured text using `<p>` and controlled spacing with `<br>` and `<hr>`.", icon: "✍️" },
  { id: 17, category: "HTML - Text", name: "Stress Master", description: "Used `<strong>` and `<em>` correctly for semantic importance vs. just bolding text.", icon: "💪" },
  { id: 18, category: "HTML - Text", name: "Strikethrough Stylist", description: "Displayed discounts using `<del>` and `<ins>` for original vs. sale prices.", icon: "🏷️" },
  { id: 19, category: "HTML - Text", name: "Citation Sage", description: "Properly quoted sources with `<blockquote>` and cited references with `<cite>`.", icon: "💬" },
  { id: 20, category: "HTML - Navigation", name: "Hyperlink Hero", description: "Built your first navigation menu using absolute and relative `<a>` tags.", icon: "🔗" },
  { id: 21, category: "HTML - Navigation", name: "Security Sentinel", description: "Always added `target='_blank'` with `rel='noopener'` for external links.", icon: "🛡️" },
  { id: 22, category: "HTML - Navigation", name: "Anchor Engineer", description: "Created smooth internal page navigation using `#id` fragments.", icon: "⚓" },
  { id: 23, category: "HTML - Navigation", name: "Mail Courier", description: "Implemented `mailto:` and `tel:` protocols for contact links.", icon: "✉️" },
  { id: 24, category: "HTML - Media", name: "Alt-Text Advocate", description: "Never wrote an `<img>` without a descriptive and accessible `alt` attribute.", icon: "🖼️" },
  { id: 25, category: "HTML - Media", name: "WebP Wizard", description: "Optimized images by choosing WebP format over legacy JPEG/PNG.", icon: "🗜️" },
  { id: 26, category: "HTML - Media", name: "Art Direction Master", description: "Used the `<picture>` element with `srcset` for responsive art direction.", icon: "🎞️" },
  { id: 27, category: "HTML - Media", name: "Audio Engineer", description: "Embedded an `<audio>` player with controls and multiple format sources.", icon: "🎧" },
  { id: 28, category: "HTML - Media", name: "Video Producer", description: "Embedded a `<video>` tag with a custom `poster` thumbnail and fallback message.", icon: "📹" },
  { id: 29, category: "HTML - Media", name: "Map Inlayer", description: "Embedded a Google Maps location using an `<iframe>` securely.", icon: "📍" },
  { id: 30, category: "HTML - Lists", name: "Ordered Organizer", description: "Created ranked lists using `<ol>` with Roman numeral styling.", icon: "🔢" },
  { id: 31, category: "HTML - Lists", name: "Unordered Maven", description: "Built bullet-point feature lists for product pages using `<ul>`.", icon: "📋" },
  { id: 32, category: "HTML - Lists", name: "Nested Navigator", description: "Constructed a fully working multi-level dropdown menu using nested lists.", icon: "🔽" },
  { id: 33, category: "HTML - Lists", name: "Definition Dictionarian", description: "Built glossaries and metadata using `<dl>`, `<dt>`, and `<dd>`.", icon: "📖" },
  { id: 34, category: "HTML - Tables", name: "Table Trimmer", description: "Built a semantically correct `<table>` with `<thead>`, `<tbody>`, and `<tfoot>`.", icon: "📊" },
  { id: 35, category: "HTML - Tables", name: "Merger & Acquirer", description: "Used `colspan` and `rowspan` to merge cells in complex table grids.", icon: "🔲" },
  { id: 36, category: "HTML - Forms", name: "Form Foundationer", description: "Created your first `<form>` with `action` and `method='POST'`.", icon: "📝" },
  { id: 37, category: "HTML - Forms", name: "Label Loyalist", description: "Associated every input with a `<label>` using the `for` attribute for accessibility.", icon: "🏷️" },
  { id: 38, category: "HTML - Forms", name: "Input Impresario", description: "Mastered all input types: `text`, `password`, `email`, `number`, `tel`, and `url`.", icon: "⌨️" },
  { id: 39, category: "HTML - Forms", name: "Validation Virtuoso", description: "Applied `required`, `minlength`, `maxlength`, and `pattern` (regex) validations.", icon: "✅" },
  { id: 40, category: "HTML - Forms", name: "Selector & Radio Operator", description: "Built grouped radio buttons and independent checkboxes.", icon: "🔘" },
  { id: 41, category: "HTML - Forms", name: "Dropdown Designer", description: "Crafted advanced `<select>` dropdowns with `<optgroup>` labels.", icon: "🔽" },
  { id: 42, category: "HTML - Forms", name: "Textarea Tycoon", description: "Built multi-line feedback fields using `<textarea>` with `maxlength`.", icon: "💬" },
  { id: 43, category: "HTML - Forms", name: "Datalist Dreamer", description: "Implemented an autocomplete `<datalist>` for an input field.", icon: "🔍" },
  { id: 44, category: "HTML - Forms", name: "File Uploader", description: "Built a file picker that accepts specific `.jpg`, `.png` types.", icon: "📤" },
  { id: 45, category: "HTML - Semantics", name: "Screen Reader Savior", description: "Mastered semantic tags for perfect screen reader announcements.", icon: "♿" },
  { id: 46, category: "HTML - Semantics", name: "SEO Architect", description: "Structured a page with `<header>`, `<main>`, `<article>`, `<aside>`, and `<footer>`.", icon: "🏗️" },
  { id: 47, category: "CSS - Attaching", name: "Stylesheet Strategist", description: "Used external CSS for production, internal for prototyping.", icon: "🎨" },
  { id: 48, category: "CSS - Cascade", name: "Cascade Crusher", description: "Debugged conflicting CSS rules using the browser's specificity calculator.", icon: "📐" },
  { id: 49, category: "CSS - Cascade", name: "Specificity Sniper", description: "Overrode a class style using an ID selector intentionally (and fixed it later).", icon: "🎯" },
  { id: 50, category: "CSS - Cascade", name: "Sledgehammer Avoider", description: "Refused to use `!important` and fixed the selector specificity chain instead.", icon: "🔨" },
  { id: 51, category: "CSS - Selectors", name: "Universal Resetter", description: "Applied a clean slate using `* { margin: 0; padding: 0; box-sizing: border-box; }`.", icon: "🧹" },
  { id: 52, category: "CSS - Selectors", name: "Class Connoisseur", description: "Built a reusable component library using pure class selectors.", icon: "⬜" },
  { id: 53, category: "CSS - Selectors", name: "Combinator Champ", description: "Used child (`>`), adjacent (`+`), and sibling (`~`) combinators effectively.", icon: "🌿" },
  { id: 54, category: "CSS - Selectors", name: "Attribute Admiral", description: "Styled elements using attribute selectors like `[type='submit']` and `[href^='https']`.", icon: "🏷️" },
  { id: 55, category: "CSS - Colors", name: "Hex Hunter", description: "Picked the exact brand hex color from an image using DevTools color picker.", icon: "🎨" },
  { id: 56, category: "CSS - Colors", name: "Alpha Alchemist", description: "Used RGBA and HSLA to create transparent overlays on hero images.", icon: "🔘" },
  { id: 57, category: "CSS - Colors", name: "Gradient Guru", description: "Crafted vibrant multi-stop linear and radial gradients without image files.", icon: "🌈" },
  { id: 58, category: "CSS - Typography", name: "Font Importer", description: "Imported Google Fonts (Roboto, Open Sans) with `display=swap`.", icon: "🔤" },
  { id: 59, category: "CSS - Typography", name: "Rem Revolutionary", description: "Used only `rem` units for fonts to ensure browser zoom accessibility.", icon: "📐" },
  { id: 60, category: "CSS - Typography", name: "Spacing Stylist", description: "Set perfect `letter-spacing` and `line-height` for readability.", icon: "📏" },
  { id: 61, category: "CSS - Typography", name: "Ellipsis Expert", description: "Truncated overflowing text with `white-space: nowrap` and `text-overflow: ellipsis`.", icon: "💬" },
  { id: 62, category: "CSS - Box Model", name: "Box Model Builder", description: "Correctly calculated total widths considering padding and border.", icon: "📦" },
  { id: 63, category: "CSS - Box Model", name: "Border Radius Master", description: "Created perfect circles (`50%`), pill buttons (`999px`), and smooth cards.", icon: "⭕" },
  { id: 64, category: "CSS - Box Model", name: "Margin Collapse Tamer", description: "Prevented unwanted spacing by understanding vertical margin collapse.", icon: "📐" },
  { id: 65, category: "CSS - Positioning", name: "Relative Rockstar", description: "Used `position: relative` to nudge elements without breaking document flow.", icon: "📍" },
  { id: 66, category: "CSS - Positioning", name: "Absolute Authority", description: "Positioned a badge overlay perfectly in the top-right corner of a card.", icon: "🎯" },
  { id: 67, category: "CSS - Positioning", name: "Fixed Fidelity", description: "Built a sticky navbar that stays at the top during scroll using `position: fixed`.", icon: "📌" },
  { id: 68, category: "CSS - Positioning", name: "Sticky Sorcerer", description: "Created a table header that sticks to the top inside a scrolling div.", icon: "📎" },
  { id: 69, category: "CSS - Positioning", name: "Z-Index Overlord", description: "Managed stacking order to keep a modal popup above everything else.", icon: "⬆️" },
  { id: 70, category: "CSS - Flexbox", name: "Flexible Director", description: "Aligned navigation links using `justify-content: space-between`.", icon: "↕️" },
  { id: 71, category: "CSS - Flexbox", name: "Centering Champion", description: "Perfectly centered a div inside a flex container (both axes).", icon: "🎯" },
  { id: 72, category: "CSS - Flexbox", name: "Wrap Warrior", description: "Used `flex-wrap: wrap` with `gap` to create a responsive card grid.", icon: "🔁" },
  { id: 73, category: "CSS - Flexbox", name: "Grow & Shrink Pro", description: "Made a sidebar fixed width (`flex: 0 0 200px`) and main content take the rest (`flex: 1`).", icon: "➡️" },
  { id: 74, category: "CSS - Grid", name: "Grid Layout Lord", description: "Built the holy grail layout (Header, Sidebar, Main, Footer) using `grid-template-areas`.", icon: "🔲" },
  { id: 75, category: "CSS - Grid", name: "FR Unit Fanatic", description: "Used `1fr 2fr` to create a two-column layout where the main content is twice the sidebar.", icon: "➗" },
  { id: 76, category: "CSS - Grid", name: "Auto-Fit Architect", description: "Built a fully responsive grid using `repeat(auto-fit, minmax(200px, 1fr))`.", icon: "↔️" },
  { id: 77, category: "CSS - Responsiveness", name: "Viewport Visionary", description: "Used `vh` for full-page hero backgrounds and `vw` for responsive typography.", icon: "🖥️" },
  { id: 78, category: "CSS - Responsiveness", name: "Mobile-First Maverick", description: "Wrote CSS for mobile first and used `min-width` breakpoints for desktops.", icon: "📱" },
  { id: 79, category: "CSS - Responsiveness", name: "Breakpoint Breaker", description: "Set custom breakpoints at 768px and 1024px to hide/show a hamburger menu.", icon: "📐" },
  { id: 80, category: "CSS - Responsiveness", name: "Container Query Cadet", description: "Styled a component based on its parent container width using `@container`.", icon: "📦" },
  { id: 81, category: "CSS - Pseudo", name: "Hover Handler", description: "Styled interactive states for links: `:hover`, `:visited`, `:active`.", icon: "🖱️" },
  { id: 82, category: "CSS - Pseudo", name: "Focus Guardian", description: "Ensured `:focus` states are visible for keyboard navigation (accessibility).", icon: "⌨️" },
  { id: 83, category: "CSS - Pseudo", name: "Nth-Child Numerologist", description: "Zebra-striped tables using `tr:nth-child(even) { background: #f2f2f2; }`.", icon: "🦓" },
  { id: 84, category: "CSS - Pseudo", name: "Negation Navigator", description: "Used `:not(:first-child)` to style all paragraphs except the first.", icon: "🚫" },
  { id: 85, category: "CSS - Pseudo", name: "Before & After Artist", description: "Added decorative quotes and icons using `::before` and `::after` (with `content`).", icon: "✏️" },
  { id: 86, category: "CSS - Transforms", name: "Scale Shifter", description: "Made buttons grow on hover using `transform: scale(1.05)`.", icon: "🔍" },
  { id: 87, category: "CSS - Transforms", name: "Rotation Renegade", description: "Rotated a loading spinner indefinitely using `transform: rotate(360deg)`.", icon: "🔄" },
  { id: 88, category: "CSS - Transforms", name: "3D Visionary", description: "Created a 3D flipping card using `perspective` and `rotateY()`.", icon: "🧊" },
  { id: 89, category: "CSS - Animations", name: "Transition Trooper", description: "Added smooth 0.3s transitions to button colors and box-shadows.", icon: "🕒" },
  { id: 90, category: "CSS - Animations", name: "Keyframe Composer", description: "Defined a custom `@keyframes` bounce animation with 0%, 50%, 100% steps.", icon: "✏️" },
  { id: 91, category: "CSS - Animations", name: "Infinite Loop Master", description: "Ran a continuous pulse animation using `animation-iteration-count: infinite`.", icon: "♾️" },
  { id: 92, category: "CSS - Animations", name: "Fill Mode Forwarder", description: "Used `animation-fill-mode: forwards` to keep an element in its final state.", icon: "➡️" },
  { id: 93, category: "JavaScript - Setup", name: "Script Injector", description: "Connected an external `app.js` file to your HTML using `defer`.", icon: "🔌" },
  { id: 94, category: "JavaScript - Setup", name: "Console Logger Supreme", description: "Debugged a variable value using `console.log` to find a bug.", icon: "🐛" },
  { id: 95, category: "JavaScript - Variables", name: "Const Crusader", description: "Used `const` for all immutable values and `let` only when necessary.", icon: "📦" },
  { id: 96, category: "JavaScript - Variables", name: "CamelCase Convert", description: "Named all variables using proper `camelCase` convention.", icon: "🔤" },
  { id: 97, category: "JavaScript - Types", name: "String Stitcher", description: "Concatenated strings using template literals `${variable}`.", icon: "🧵" },
  { id: 98, category: "JavaScript - Types", name: "Number Cruncher", description: "Performed mathematical operations and handled `NaN` correctly.", icon: "🔢" },
  { id: 99, category: "JavaScript - Types", name: "Boolean Bouncer", description: "Used strict equality `===` to avoid type coercion bugs.", icon: "🔘" },
  { id: 100, category: "JavaScript - Operators", name: "Ternary Titan", description: "Replaced an `if...else` with a clean ternary operator for conditional assignment.", icon: "❓" },
  { id: 101, category: "JavaScript - Operators", name: "Nullish Knight", description: "Used the Nullish Coalescing (`??`) to provide fallback values for undefined variables.", icon: "💎" },
  { id: 102, category: "JavaScript - Loops", name: "For-Loop Sentinel", description: "Looping through an array using a classic `for(let i=0; i<arr.length; i++)`.", icon: "🔁" },
  { id: 103, category: "JavaScript - Loops", name: "For-Of Adventurer", description: "Iterated over a NodeList using `for...of` to apply styles to each element.", icon: "➡️" },
  { id: 104, category: "JavaScript - Functions", name: "Function Declarator", description: "Created a reusable function declaration to calculate tax on a product price.", icon: "📦" },
  { id: 105, category: "JavaScript - Functions", name: "Arrow Ace", description: "Used modern arrow functions with implicit return in an array `map()` method.", icon: "↔️" },
  { id: 106, category: "JavaScript - Functions", name: "Scope Scavenger", description: "Understood global vs block scope, avoiding `var` entirely.", icon: "🍃" },
  { id: 107, category: "JavaScript - Functions", name: "Closure Craftsman", description: "Built a private counter using a closure (factory function).", icon: "🔒" },
  { id: 108, category: "JavaScript - Arrays", name: "Array Allocator", description: "Stored a list of product names in an array and accessed them by index.", icon: "📋" },
  { id: 109, category: "JavaScript - Arrays", name: "Push & Pop Performer", description: "Manipulated a stack using `push()` and `pop()` for a simple undo feature.", icon: "⬆️" },
  { id: 110, category: "JavaScript - Arrays", name: "Map Transformer", description: "Used `map()` to transform an array of prices into an array of strings with a `$` sign.", icon: "🔄" },
  { id: 111, category: "JavaScript - Arrays", name: "Filter Finesse", description: "Filtered an array of products to only show those with a price > $50.", icon: "🧹" },
  { id: 112, category: "JavaScript - Arrays", name: "Reducer Guru", description: "Calculated the total sum of a shopping cart using `reduce()`.", icon: "➕" },
  { id: 113, category: "JavaScript - Arrays", name: "Find Finder", description: "Found a specific user object in an array using the `find()` method.", icon: "🔍" },
  { id: 114, category: "JavaScript - Arrays", name: "Spread Operator Star", description: "Merged two arrays and copied an array using the spread (`...`) operator.", icon: "🔀" },
  { id: 115, category: "JavaScript - Objects", name: "Object Orienter", description: "Created a `user` object with properties (name, age, email).", icon: "👤" },
  { id: 116, category: "JavaScript - Objects", name: "Dot vs Bracket Scholar", description: "Used bracket notation to dynamically access an object property using a variable.", icon: "🔲" },
  { id: 117, category: "JavaScript - Objects", name: "Method Maker", description: "Attached a `greet()` function to an object that uses the `this` keyword.", icon: "⚙️" },
  { id: 118, category: "JavaScript - Objects", name: "Destructuring Doyen", description: "Extracted object properties using destructuring in a function parameter.", icon: "🔓" },
  { id: 119, category: "JavaScript - Objects", name: "JSON Juggler", description: "Converted an object to JSON (`stringify`) and back (`parse`).", icon: "💻" },
  { id: 120, category: "JavaScript - DOM", name: "Query Selector Pro", description: "Grabbed the first `.card` element using `document.querySelector()`.", icon: "🎯" },
  { id: 121, category: "JavaScript - DOM", name: "Query All Master", description: "Selected all `.btn` elements and looped through them to add an event listener.", icon: "📦" },
  { id: 122, category: "JavaScript - DOM", name: "Traversal Trekker", description: "Used `.parentElement` and `.closest()` to navigate to a specific container.", icon: "⬆️" },
  { id: 123, category: "JavaScript - DOM", name: "Text Content Titan", description: "Updated user profile text dynamically using `element.textContent = 'New Name'`.", icon: "📝" },
  { id: 124, category: "JavaScript - DOM", name: "Class List Commander", description: "Toggled a dark mode class on the `<body>` using `classList.toggle()`.", icon: "📋" },
  { id: 125, category: "JavaScript - DOM", name: "Style Changer", description: "Changed the background color of an element using `element.style.backgroundColor`.", icon: "🎨" },
  { id: 126, category: "JavaScript - DOM", name: "Element Creator", description: "Created a new `<li>` using `document.createElement()` and appended it to a list.", icon: "➕" },
  { id: 127, category: "JavaScript - DOM", name: "Removal Ranger", description: "Removed a clicked item from the DOM using `element.remove()`.", icon: "🗑️" },
  { id: 128, category: "JavaScript - DOM", name: "Clone Commando", description: "Cloned an existing template card using `cloneNode(true)` and customized it.", icon: "👥" },
  { id: 129, category: "JavaScript - Events", name: "Click Captain", description: "Added a `click` event listener to a button that triggers a function.", icon: "🖱️" },
  { id: 130, category: "JavaScript - Events", name: "Event Object Explorer", description: "Extracted `e.target` to find which specific child was clicked in a list.", icon: "🎯" },
  { id: 131, category: "JavaScript - Events", name: "Keyboard King", description: "Detected the `Enter` key on an input to trigger a search function.", icon: "⌨️" },
  { id: 132, category: "JavaScript - Events", name: "Form Submission Savior", description: "Used `e.preventDefault()` to stop a form from reloading the page.", icon: "🚫" },
  { id: 133, category: "JavaScript - Events", name: "Input Live Logger", description: "Used the `input` event to log each keystroke to the console.", icon: "✏️" },
  { id: 134, category: "JavaScript - Events", name: "Bubbling Stopper", description: "Used `e.stopPropagation()` to prevent a parent's click handler from firing.", icon: "🌊" },
  { id: 135, category: "JavaScript - Events", name: "Delegation Diplomat", description: "Attached one click listener to a `<ul>` to handle clicks on all dynamically added `<li>` items.", icon: "👥" },
  { id: 136, category: "JavaScript - Storage", name: "Local Storage Logger", description: "Saved a user's theme preference to `localStorage`.", icon: "💾" },
  { id: 137, category: "JavaScript - Storage", name: "Session Saver", description: "Stored a temporary shopping cart in `sessionStorage` for a guest user.", icon: "💾" },
  { id: 138, category: "JavaScript - Storage", name: "State Hydrator", description: "Retrieved saved data from `localStorage` on page load to restore the UI state.", icon: "🔄" },
  { id: 139, category: "JavaScript - Timers", name: "Timeout Tactician", description: "Set a `setTimeout()` to hide a success notification after 3 seconds.", icon: "⏳" },
  { id: 140, category: "JavaScript - Timers", name: "Interval Installer", description: "Built a live digital clock using `setInterval()` updating every second.", icon: "🕒" },
  { id: 141, category: "JavaScript - Errors", name: "Try-Catch Titan", description: "Wrapped a `JSON.parse()` in a `try...catch` to handle malformed data.", icon: "🐛" },
  { id: 142, category: "JavaScript - Errors", name: "Custom Error Caster", description: "Threw a custom `new Error('Invalid input')` in an input validation function.", icon: "⚠️" },
  { id: 143, category: "JavaScript - Async", name: "Promise Pioneer", description: "Chained a `.then()` and `.catch()` to handle an API response.", icon: "🔗" },
  { id: 144, category: "JavaScript - Async", name: "Async Await Avenger", description: "Wrote an `async` function with `await` to fetch data without callback hell.", icon: "🪄" },
  { id: 145, category: "JavaScript - Async", name: "Fetch Feeder", description: "Retrieved data from a public API using the `fetch()` method.", icon: "📥" },
  { id: 146, category: "JavaScript - Async", name: "POST Pathfinder", description: "Sent JSON data to a server using `fetch` with `method: 'POST'`.", icon: "📤" },
  { id: 147, category: "JavaScript - Async", name: "API Error Handler", description: "Checked `res.ok` and threw errors for 404/500 statuses in a user-friendly way.", icon: "⚠️" },
  { id: 148, category: "JavaScript - OOP", name: "Class Constructor", description: "Defined an ES6 `class` with a `constructor` to create reusable blueprint objects.", icon: "🧱" },
  { id: 149, category: "JavaScript - OOP", name: "Instance Initializer", description: "Created multiple instances of a `User` class using the `new` keyword.", icon: "➕" },
  { id: 150, category: "JavaScript - OOP", name: "Getter Setter Guru", description: "Used `get` and `set` to validate a property value before changing it.", icon: "🎛️" },
  { id: 151, category: "JavaScript - OOP", name: "Inheritance Inheritor", description: "Extended a `Vehicle` class to a `Car` class using `extends` and `super()`.", icon: "⬆️" },
  { id: 152, category: "Performance", name: "Minification Maven", description: "Minified CSS and JS to reduce production bundle size.", icon: "🗜️" },
  { id: 153, category: "Performance", name: "Lazy Loader", description: "Added `loading='lazy'` to all off-screen images to boost initial load speed.", icon: "🖼️" },
  { id: 154, category: "Performance", name: "Network Ninja", description: "Used DevTools Network tab to audit and identify slow-loading resources.", icon: "📶" },
  { id: 155, category: "Performance", name: "Throttling Technician", description: "Debounced a search input event to prevent excessive API calls.", icon: "🚫" },
  { id: 156, category: "Accessibility", name: "ARIA Advocate", description: "Added `aria-label` to icon-only buttons for screen reader support.", icon: "👁️" },
  { id: 157, category: "Accessibility", name: "Focus Formatter", description: "Replaced the default outline with a custom high-contrast focus style.", icon: "⌨️" },
  { id: 158, category: "Accessibility", name: "Contrast Checker", description: "Ensured all text maintained a 4.5:1 contrast ratio against its background.", icon: "🌓" },
  { id: 159, category: "Accessibility", name: "Screen Reader Simulator", description: "Tested your site using a screen reader (e.g., NVDA/VoiceOver) to ensure semantics work.", icon: "👂" },
  { id: 160, category: "SEO & Deployment", name: "Meta Description Magician", description: "Wrote a 160-character meta description to boost search click-through rates.", icon: "📈" },
  { id: 161, category: "SEO & Deployment", name: "Open Graph Architect", description: "Set `og:title`, `og:image`, and `og:description` for rich social sharing.", icon: "🔗" },
  { id: 162, category: "SEO & Deployment", name: "Module Exporter", description: "Created an ES6 module and exported functions using `export default`.", icon: "📤" },
  { id: 163, category: "SEO & Deployment", name: "Module Importer", description: "Imported a module into your main `app.js` using `import` syntax.", icon: "📥" },
  { id: 164, category: "SEO & Deployment", name: "Git Committer", description: "Initialized a Git repository and made your first `commit` with a proper message.", icon: "🌿" },
  { id: 165, category: "SEO & Deployment", name: "GitHub Pusher", description: "Pushed your local repository to a remote GitHub repository.", icon: "🐙" },
  { id: 166, category: "SEO & Deployment", name: "Netlify Deployer", description: "Deployed a static site to Netlify via drag-and-drop or GitHub connection.", icon: "🌐" },
  { id: 167, category: "SEO & Deployment", name: "Vercel Vanguard", description: "Deployed a project to Vercel with automatic preview deployments.", icon: "☁️" },
  { id: 168, category: "SEO & Deployment", name: "Custom Domain Owner", description: "Pointed a custom domain (e.g., `yourapp.com`) to your hosting provider.", icon: "💰" },
  { id: 169, category: "Community", name: "Forum Freshman", description: "Created your first post in the community discussion forum.", icon: "💬" },
  { id: 170, category: "Community", name: "Thread Theorist", description: "Started a complex discussion thread about CSS Grid vs Flexbox.", icon: "🗣️" },
  { id: 171, category: "Community", name: "Helpful Hero", description: "Answered another student's question and solved their coding error.", icon: "🤝" },
  { id: 172, category: "Community", name: "Snippet Sharer", description: "Shared a useful JavaScript snippet in the community channels.", icon: "💻" },
  { id: 173, category: "Community", name: "Social Connector", description: "Linked your account and interacted with other learners in the chat.", icon: "➕" },
  { id: 174, category: "Community", name: "Feedback Giver", description: "Reviewed and provided constructive feedback on a peer's project.", icon: "📝" },
  { id: 175, category: "Capstone Projects", name: "Portfolio Builder", description: "Completed the Personal Portfolio project with dark mode and animations.", icon: "💼" },
  { id: 176, category: "Capstone Projects", name: "Cart Constructor", description: "Built the fully functional E-Commerce Product Cart with filtering and sorting.", icon: "🛒" },
  { id: 177, category: "Capstone Projects", name: "Weather Wizard", description: "Integrated a live Weather API into a beautiful dashboard with loading states.", icon: "🌦️" },
  { id: 178, category: "Capstone Projects", name: "Full Stack Sentinel", description: "Integrated all 3 capstone projects into a single portfolio app.", icon: "🗃️" },

  { id: 179, category: "Streak & Milestones", name: "First Check-In Badge", description: "Registered your profile and completed security setup.", icon: "📍" },
  { id: 180, category: "Streak & Milestones", name: "Part 0 Pioneer", description: "Completed all chapters in Part 0: The Workshop.", icon: "🏁" },
  { id: 181, category: "Streak & Milestones", name: "Part 1 Structuralist", description: "Completed all HTML chapters (Part 1).", icon: "🗳️" },
  { id: 182, category: "Streak & Milestones", name: "Part 2 Stylist", description: "Completed all CSS styling chapters (Part 2).", icon: "🎨" },
  { id: 183, category: "Streak & Milestones", name: "Part 3 Layout Lord", description: "Completed all CSS layout chapters (Part 3).", icon: "🔲" },
  { id: 184, category: "Streak & Milestones", name: "Part 4 Animator", description: "Completed all CSS motion and animation chapters (Part 4).", icon: "🎬" },
  { id: 185, category: "Streak & Milestones", name: "Part 5 Logic Learner", description: "Completed all JavaScript core chapters (Part 5).", icon: "🧠" },
  { id: 186, category: "Streak & Milestones", name: "Part 6 DOM Dominator", description: "Completed all DOM and event chapters (Part 6).", icon: "🕸️" },
  { id: 187, category: "Streak & Milestones", name: "Part 7 Async Agent", description: "Completed all advanced JS, storage, and async chapters (Part 7).", icon: "🤖" },
  { id: 188, category: "Streak & Milestones", name: "Part 8 Polisher", description: "Completed all optimization, accessibility, and deployment chapters (Part 8).", icon: "🌟" },
  { id: 189, category: "Streak & Milestones", name: "Course Completionist", description: "Finished all 43 chapters of the ultimate web development course.", icon: "🏆" },
  { id: 190, category: "Streak & Milestones", name: "Halfway Habit", description: "Reached the 50% milestone mark of the entire curriculum.", icon: "🌓" },
  { id: 191, category: "Streak & Milestones", name: "The 100 Badge Collector", description: "Unlocked 100 unique badges.", icon: "🌟" },
  { id: 192, category: "Streak & Milestones", name: "The 200 Club", description: "Unlocked 200 unique badges (Ultimate badge hunter).", icon: "👑" },
  
  { id: 193, category: "Daily Streak", name: "Day 1 - First Spark", description: "Logged in for the first day.", icon: "☀️" },
  { id: 194, category: "Daily Streak", name: "Day 3 - Spark Adept", description: "Maintained a 3+ day consecutive active streak.", icon: "🔥" },
  { id: 195, category: "Daily Streak", name: "Day 7 - Weekly Warrior", description: "Maintained a 7-day streak (1 full week).", icon: "📅" },
  { id: 196, category: "Daily Streak", name: "Day 30 - Monthly Monarch", description: "Maintained a 30-day streak.", icon: "🗓️" },
  { id: 197, category: "Daily Streak", name: "Day 100 - Century Sentinel", description: "Logged in for 100 consecutive days.", icon: "💎" },
  { id: 198, category: "Daily Streak", name: "Early Riser", description: "Completed a coding session before 8:00 AM.", icon: "🌅" },
  { id: 199, category: "Daily Streak", name: "Night Owl", description: "Completed a coding session after 11:00 PM.", icon: "🌃" },
  { id: 200, category: "Daily Streak", name: "Weekend Builder", description: "Completed a session on both Saturday and Sunday.", icon: "📆" },

  { id: 201, category: "Soft Skills", name: "Rubber Duck Debugger", description: "Explained your code out loud to find a bug (classic programmer ritual).", icon: "🦆" },
  { id: 202, category: "Soft Skills", name: "Stack Overflow Seeker", description: "Searched for an error message effectively and found a solution.", icon: "🔍" },
  { id: 203, category: "Soft Skills", name: "Documentation Reader", description: "Read the official MDN documentation for a specific method.", icon: "📖" },
  { id: 204, category: "Soft Skills", name: "Code Refactorer", description: "Went back to an old function and made it cleaner (DRY principle).", icon: "🧹" },
  { id: 205, category: "Soft Skills", name: "Pixel Perfectionist", description: "Spent more than 30 minutes aligning a design to match the mockup perfectly.", icon: "📐" },
  { id: 206, category: "Soft Skills", name: "The Builder", description: "Built a complete app from scratch without any copy-pasting.", icon: "💎" },
  { id: 207, category: "Soft Skills", name: "The Teacher", description: "Taught a fellow layman how to add a CSS class.", icon: "👨‍🏫" },
  { id: 208, category: "Tools", name: "VS Code Extender", description: "Installed Prettier, ESLint, and Live Server in VS Code.", icon: "🧩" },
  { id: 209, category: "Tools", name: "Prettier Pro", description: "Configured Prettier to auto-format code on every save.", icon: "🪄" },
  { id: 210, category: "Tools", name: "ESLint Enforcer", description: "Fixed all linting errors highlighted by ESLint.", icon: "📋" },
  { id: 211, category: "Tools", name: "Git Ignorer", description: "Created a `.gitignore` file to exclude `node_modules` and `.env`.", icon: "🚫" },
  { id: 212, category: "Advanced CSS", name: "Custom Property Caster", description: "Used CSS Variables (`var(--primary-color)`) for theming.", icon: "💰" },
  { id: 213, category: "Advanced CSS", name: "Filter Filter", description: "Used CSS filters (`brightness`, `blur`, `grayscale`) for image effects.", icon: "🎛️" },
  { id: 214, category: "Advanced JS", name: "Intersection Observer", description: "Implemented lazy loading or scroll animations using `IntersectionObserver`.", icon: "👁️" },
  { id: 215, category: "Advanced JS", name: "Promise All Executor", description: "Used `Promise.all` to wait for multiple API calls to finish.", icon: "↔️" },
  { id: 216, category: "Advanced JS", name: "LocalStorage JSON Master", description: "Stored and retrieved complex nested objects/arrays in localStorage.", icon: "💾" },
  { id: 217, category: "HTML", name: "Accessible Form Builder", description: "Built a form with fieldsets, legends, and proper ARIA labels.", icon: "📋" },
  { id: 218, category: "CSS", name: "Responsive Hero Architect", description: "Built a full-viewport hero with overlapping content and responsive typography.", icon: "🖼️" },
  { id: 219, category: "JavaScript", name: "Debounce Dynamicist", description: "Implemented a custom debounce function for a search bar.", icon: "🕒" },
  { id: 220, category: "JavaScript", name: "Local Storage Hydrator", description: "Restored a user's saved theme from `localStorage` on load.", icon: "🔄" },

  { id: 221, category: "Special", name: "Syntax Tamer", description: "Wrote 1000 lines of clean, bug-free HTML in one session.", icon: "💻" },
  { id: 222, category: "Special", name: "Styling Sorcerer", description: "Styled a complex responsive page without using a single media query (only flex/grid).", icon: "🪄" },
  { id: 223, category: "Special", name: "Mental Model Master", description: "Explained the Event Loop to someone else perfectly.", icon: "📊" },
  { id: 224, category: "Special", name: "DOM Distiller", description: "Manipulated the DOM to create a fully interactive To-Do list without any framework.", icon: "📋" },
  { id: 225, category: "Special", name: "Async Ace", description: "Wrote an async function that handles `try/catch`, `await`, and `finally` perfectly.", icon: "⭐" },
  { id: 226, category: "Special", name: "Clean Code Devotee", description: "Refactored messy code into small, single-purpose functions.", icon: "🖌️" },
  { id: 227, category: "Special", name: "Chrome DevTools Wizard", description: "Used the Performance tab to profile and fix a memory leak.", icon: "🛠️" },
  { id: 228, category: "Special", name: "Git Conflict Resolver", description: "Merged conflicting branches in Git and fixed the merge conflict manually.", icon: "🌿" },
  { id: 229, category: "Special", name: "Mobile Gesture Guru", description: "Added touch-friendly event listeners for mobile devices.", icon: "🖐️" },
  { id: 230, category: "Special", name: "Gradient Alchemist", description: "Created a complex animated gradient background using keyframes.", icon: "🎨" },
  { id: 231, category: "Special", name: "Semantic Snob", description: "Wrote a complete page without using a single `<div>` (only semantic tags).", icon: "👑" },
  { id: 232, category: "Special", name: "Flexbox Mastermind", description: "Solved a complex layout challenge using only Flexbox alignment properties.", icon: "↕️" },
  { id: 233, category: "Special", name: "Grid Genius", description: "Built a complex magazine-style layout with overlapping grid items.", icon: "🔲" },
  { id: 234, category: "Special", name: "Form Validation Virtuoso", description: "Built a form that validates every field in real-time with JS.", icon: "✅" },
  { id: 235, category: "Special", name: "API Integration Maestro", description: "Integrated a third-party API (like Weather or News) into a live dashboard.", icon: "☁️" },
  { id: 236, category: "Special", name: "OOP Organizer", description: "Built an app entirely using ES6 classes instead of functions.", icon: "🎛️" },
  { id: 237, category: "Special", name: "LocalStorage Legend", description: "Built a fully persisted shopping cart that survives a browser crash.", icon: "💾" },
  { id: 238, category: "Special", name: "Accessibility Ace", description: "Achieved a 100% Lighthouse Accessibility score.", icon: "👁️" },
  { id: 239, category: "Special", name: "Performance Pro", description: "Achieved a 90+ Lighthouse Performance score.", icon: "📈" },
  { id: 240, category: "Special", name: "SEO Strategist", description: "Optimized the site to achieve a 100% Lighthouse SEO score.", icon: "📈" },
  { id: 241, category: "Special", name: "Best Practice Paragon", description: "Scored 100% in all Lighthouse categories (PWA recommended).", icon: "🏆" },
  { id: 242, category: "Special", name: "The Debug Demon", description: "Found and fixed a JavaScript bug in under 1 minute.", icon: "🔬" },
  { id: 243, category: "Special", name: "The Snippet Sorcerer", description: "Saved 10+ useful code snippets for future use.", icon: "📄" },
  { id: 244, category: "Special", name: "The Optimizer", description: "Reduced the page load time by 50% via image optimization and code minification.", icon: "📈" },
  { id: 245, category: "Special", name: "The Creator", description: "Launched a fully functional web application to the public internet.", icon: "🚀" },
  { id: 246, category: "Special", name: "The Mentor", description: "Helped 5 different students solve their coding issues.", icon: "👥" },
  { id: 247, category: "Special", name: "The Mastery Seeker", description: "Completed all 43 chapters, 3 capstones, and 247 badges.", icon: "👑" },
  { id: 248, category: "Special", name: "The Polymath", description: "Demonstrated expert-level knowledge in HTML, CSS, and JavaScript simultaneously.", icon: "🎲" },
  { id: 249, category: "Special", name: "The Architect", description: "Designed and built a component library from scratch without a framework.", icon: "🏠" },
  { id: 250, category: "Special", name: "Ultimate Grandmaster", description: "Unlocked every single badge in the system. You are a true web legend.", icon: "👑" }
];

export const getLevel = (xp: number): number => {
  if (xp <= 0) return 1;
  // Standard continuous RPG curve: Level = floor((1 + sqrt(1 + XP / 12.5)) / 2)
  return Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2);
};

export const getXPForLevel = (level: number): number => {
  if (level <= 1) return 0;
  // Minimum XP for this level: 50 * (L - 1) * L
  return 50 * (level - 1) * level;
};

export const getLevelProgress = (xp: number) => {
  const level = getLevel(xp);
  const minXP = getXPForLevel(level);
  const maxXP = getXPForLevel(level + 1);
  const xpInLevel = xp - minXP;
  const range = maxXP - minXP;
  const progressPercent = range > 0 ? (xpInLevel / range) * 100 : 0;
  const xpRemaining = maxXP - xp;
  return {
    level,
    minXP,
    maxXP,
    xpInLevel,
    range,
    progressPercent,
    xpRemaining
  };
};

export const checkStaticAchievements = (user: {
  xp?: number;
  level?: number;
  streak?: number;
  contributions?: number;
  learningCount?: number;
  engagementCount?: number;
}): string[] => {
  const unlocked: string[] = [];

  const xp = user.xp || 50;
  const level = getLevel(xp);
  const streak = user.streak || 1;
  const contributions = user.contributions || 0;
  const learningCount = user.learningCount || 0;
  const engagementCount = user.engagementCount || 0;

  // Always unlocked
  unlocked.push("First Check-In");
  unlocked.push("First Check-In Badge");
  unlocked.push("Day 1 - First Spark");

  if (contributions > 0) {
    unlocked.push("Forum Freshman");
    unlocked.push("Forum Contributor");
    unlocked.push("Snippet Sharer");
  }
  if (contributions >= 5) {
    unlocked.push("The Teacher");
    unlocked.push("The Mentor");
  }

  if (engagementCount > 0) {
    unlocked.push("Social Networker");
    unlocked.push("Social Connector");
  }
  if (engagementCount >= 5) {
    unlocked.push("Feedback Giver");
  }

  if (learningCount > 0) {
    unlocked.push("Library Scholar");
    unlocked.push("Documentation Reader");
  }
  if (learningCount >= 3) {
    unlocked.push("Documentation Reader");
  }

  if (streak >= 3) {
    unlocked.push("Day 3 - Spark Adept");
    unlocked.push("Streak Adept");
  }
  if (streak >= 7) {
    unlocked.push("Day 7 - Weekly Warrior");
    unlocked.push("Weekend Builder");
  }
  if (streak >= 30) {
    unlocked.push("Day 30 - Monthly Monarch");
  }
  if (streak >= 100) {
    unlocked.push("Day 100 - Century Sentinel");
  }

  if (level >= 3) {
    unlocked.push("Systems Adept");
  }
  if (level >= 5) {
    unlocked.push("The Builder");
  }
  if (level >= 10) {
    unlocked.push("The Mastery Seeker");
    unlocked.push("The Polymath");
  }

  return unlocked;
};

export const checkCodeAchievements = (html: string = '', css: string = '', js: string = ''): string[] => {
  const unlocked: string[] = [];

  const h = html.toLowerCase();
  const c = css.toLowerCase();
  const j = js.toLowerCase();

  // HTML Structure & Text
  if (h.includes('<!doctype html>')) unlocked.push("Doctype Whisperer");
  if (h.includes('lang=')) unlocked.push("Linguist");
  if (h.includes('<meta') && h.includes('viewport')) unlocked.push("Metadata Mogul");
  if (h.includes('<!--')) unlocked.push("The Commentator");
  if (h.includes('<h1>') || h.includes('<h2>') || h.includes('<h3>')) unlocked.push("Heading Hierarch");
  if (h.includes('<p>')) unlocked.push("Paragraph Pro");
  if (h.includes('<strong>') || h.includes('<em>')) unlocked.push("Stress Master");
  if (h.includes('<del>') || h.includes('<ins>')) unlocked.push("Strikethrough Stylist");
  if (h.includes('<blockquote>') || h.includes('<cite>')) unlocked.push("Citation Sage");

  // HTML Navigation & Media
  if (h.includes('<a') && h.includes('href=')) unlocked.push("Hyperlink Hero");
  if (h.includes('target="_blank"') || h.includes("target='_blank'")) unlocked.push("Security Sentinel");
  if (h.includes('href="#') || h.includes("href='#")) unlocked.push("Anchor Engineer");
  if (h.includes('mailto:') || h.includes('tel:')) unlocked.push("Mail Courier");
  if (h.includes('<img') && h.includes('alt=')) unlocked.push("Alt-Text Advocate");
  if (h.includes('.webp')) unlocked.push("WebP Wizard");
  if (h.includes('<picture>') && h.includes('srcset')) unlocked.push("Art Direction Master");
  if (h.includes('<audio') && h.includes('controls')) unlocked.push("Audio Engineer");
  if (h.includes('<video') && h.includes('controls')) unlocked.push("Video Producer");
  if (h.includes('<iframe') && h.includes('maps.google')) unlocked.push("Map Inlayer");

  // HTML Lists & Tables
  if (h.includes('<ol>') && h.includes('<li>')) unlocked.push("Ordered Organizer");
  if (h.includes('<ul>') && h.includes('<li>')) unlocked.push("Unordered Maven");
  if (h.includes('<ul>') && h.includes('<ul>')) unlocked.push("Nested Navigator");
  if (h.includes('<dl>') && h.includes('<dt>')) unlocked.push("Definition Dictionarian");
  if (h.includes('<table>') && h.includes('<thead>')) unlocked.push("Table Trimmer");
  if (h.includes('colspan=') || h.includes('rowspan=')) unlocked.push("Merger & Acquirer");

  // HTML Forms & Semantics
  if (h.includes('<form') && h.includes('method=')) unlocked.push("Form Foundationer");
  if (h.includes('<label') && h.includes('for=')) unlocked.push("Label Loyalist");
  if (h.includes('<input') && h.includes('type=')) unlocked.push("Input Impresario");
  if (h.includes('required')) unlocked.push("Validation Virtuoso");
  if (h.includes('type="radio"') || h.includes('type="checkbox"') || h.includes("type='radio'") || h.includes("type='checkbox'")) unlocked.push("Selector & Radio Operator");
  if (h.includes('<select>') && h.includes('<option>')) unlocked.push("Dropdown Designer");
  if (h.includes('<textarea')) unlocked.push("Textarea Tycoon");
  if (h.includes('<datalist') || h.includes('list=')) unlocked.push("Datalist Dreamer");
  if (h.includes('type="file"') || h.includes("type='file'")) unlocked.push("File Uploader");
  if (h.includes('aria-') || h.includes('role=')) unlocked.push("Screen Reader Savior");
  if (h.includes('<header>') || h.includes('<main>') || h.includes('<footer>') || h.includes('<article>')) unlocked.push("SEO Architect");

  // CSS
  if (h.includes('<link rel="stylesheet"') || h.includes('<link rel=\'stylesheet\'') || h.includes('<style>')) unlocked.push("Stylesheet Strategist");
  if (c.includes('* {') || c.includes('*{')) unlocked.push("Universal Resetter");
  if (c.includes('class=') || c.startsWith('.')) unlocked.push("Class Connoisseur");
  if (c.includes('>') || c.includes('+') || c.includes('~')) unlocked.push("Combinator Champ");
  if (c.includes('[type=') || c.includes('[href=')) unlocked.push("Attribute Admiral");
  if (c.includes('rgba(') || c.includes('hsla(')) unlocked.push("Alpha Alchemist");
  if (c.includes('linear-gradient') || c.includes('radial-gradient')) unlocked.push("Gradient Guru");
  if (c.includes('font-family:')) unlocked.push("Font Importer");
  if (c.includes('rem;')) unlocked.push("Rem Revolutionary");
  if (c.includes('letter-spacing:') || c.includes('line-height:')) unlocked.push("Spacing Stylist");
  if (c.includes('text-overflow: ellipsis')) unlocked.push("Ellipsis Expert");
  if (c.includes('border-radius: 50%') || c.includes('border-radius:50%')) unlocked.push("Border Radius Master");
  if (c.includes('position: relative') || c.includes('position:relative')) unlocked.push("Relative Rockstar");
  if (c.includes('position: absolute') || c.includes('position:absolute')) unlocked.push("Absolute Authority");
  if (c.includes('position: fixed') || c.includes('position:fixed')) unlocked.push("Fixed Fidelity");
  if (c.includes('position: sticky') || c.includes('position:sticky')) unlocked.push("Sticky Sorcerer");
  if (c.includes('z-index:')) unlocked.push("Z-Index Overlord");
  if (c.includes('display: flex') || c.includes('display:flex')) unlocked.push("Flexible Director");
  if (c.includes('justify-content:') && c.includes('align-items:')) unlocked.push("Centering Champion");
  if (c.includes('flex-wrap: wrap') || c.includes('flex-wrap:wrap')) unlocked.push("Wrap Warrior");
  if (c.includes('flex-grow:') || c.includes('flex-shrink:') || c.includes('flex:')) unlocked.push("Grow & Shrink Pro");
  if (c.includes('display: grid') || c.includes('display:grid')) unlocked.push("Grid Layout Lord");
  if (c.includes('fr;')) unlocked.push("FR Unit Fanatic");
  if (c.includes('repeat(auto-fit') || c.includes('repeat(auto-fill')) unlocked.push("Auto-Fit Architect");
  if (c.includes('vh;') || c.includes('vw;')) unlocked.push("Viewport Visionary");
  if (c.includes('@media')) unlocked.push("Mobile-First Maverick");
  if (c.includes(':hover')) unlocked.push("Hover Handler");
  if (c.includes(':focus')) unlocked.push("Focus Guardian");
  if (c.includes('nth-child')) unlocked.push("Nth-Child Numerologist");
  if (c.includes(':not(')) unlocked.push("Negation Navigator");
  if (c.includes('::before') || c.includes('::after')) unlocked.push("Before & After Artist");
  if (c.includes('transform: scale') || c.includes('transform:scale')) unlocked.push("Scale Shifter");
  if (c.includes('transform: rotate') || c.includes('transform:rotate')) unlocked.push("Rotation Renegade");
  if (c.includes('perspective(') || c.includes('rotateY(')) unlocked.push("3D Visionary");
  if (c.includes('transition:')) unlocked.push("Transition Trooper");
  if (c.includes('@keyframes')) unlocked.push("Keyframe Composer");

  // JS
  if (h.includes('<script src') || h.includes('<script defer')) unlocked.push("Script Injector");
  if (j.includes('console.log')) unlocked.push("Console Logger Supreme");
  if (j.includes('const ')) unlocked.push("Const Crusader");
  if (j.includes('let ')) unlocked.push("CamelCase Convert");
  if (j.includes('`') && j.includes('${')) unlocked.push("String Stitcher");
  if (j.includes('===') || j.includes('!==')) unlocked.push("Boolean Bouncer");
  if (j.includes('?') && j.includes(':')) unlocked.push("Ternary Titan");
  if (j.includes('??')) unlocked.push("Nullish Knight");
  if (j.includes('for(') || j.includes('for (') || j.includes('while(')) unlocked.push("For-Loop Sentinel");
  if (j.includes('for (') && j.includes('of ')) unlocked.push("For-Of Adventurer");
  if (j.includes('function ')) unlocked.push("Function Declarator");
  if (j.includes('=>')) unlocked.push("Arrow Ace");
  if (j.includes('push(') || j.includes('pop(')) unlocked.push("Push & Pop Performer");
  if (j.includes('map(')) unlocked.push("Map Transformer");
  if (j.includes('filter(')) unlocked.push("Filter Finesse");
  if (j.includes('reduce(')) unlocked.push("Reducer Guru");
  if (j.includes('find(')) unlocked.push("Find Finder");
  if (j.includes('...')) unlocked.push("Spread Operator Star");
  if (j.includes('document.querySelector(')) unlocked.push("Query Selector Pro");
  if (j.includes('document.querySelectorAll(')) unlocked.push("Query All Master");
  if (j.includes('classList.toggle(')) unlocked.push("Class List Commander");
  if (j.includes('.style.')) unlocked.push("Style Changer");
  if (j.includes('document.createElement(')) unlocked.push("Element Creator");
  if (j.includes('.remove()')) unlocked.push("Removal Ranger");
  if (j.includes('addEventListener(') && j.includes('click')) unlocked.push("Click Captain");
  if (j.includes('e.preventDefault') || j.includes('event.preventDefault')) unlocked.push("Form Submission Savior");
  if (j.includes('localStorage.set') || j.includes('localStorage.get')) unlocked.push("Local Storage Logger");
  if (j.includes('sessionStorage.set') || j.includes('sessionStorage.get')) unlocked.push("Session Saver");
  if (j.includes('setTimeout(')) unlocked.push("Timeout Tactician");
  if (j.includes('setInterval(')) unlocked.push("Interval Installer");
  if (j.includes('try {') || j.includes('try{')) unlocked.push("Try-Catch Titan");
  if (j.includes('fetch(')) unlocked.push("Fetch Feeder");
  if (j.includes('async ') && j.includes('await ')) unlocked.push("Async Await Avenger");
  if (j.includes('class ') && j.includes('constructor')) unlocked.push("Class Constructor");

  return unlocked;
};


