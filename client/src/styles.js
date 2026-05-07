const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root { --sidebar: 256px; --topbar: 64px; }

body {
  font-family: 'DM Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  background: #f8fafc;
  color: #0f172a;
  min-height: 100vh;
  overflow-x: hidden;
}
.dark body, body.dark { background: #020817; color: #f1f5f9; }

/* Dark mode via class on <html> */
.dark { color-scheme: dark; }
.dark body { background: #020817; color: #f1f5f9; }

/* Typography */
h1,h2,h3,h4,h5,h6 { font-family: 'Syne', system-ui, sans-serif; }

/* Animations */
@keyframes fadeUp {
  from { opacity:0; transform:translateY(12px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes slideIn {
  from { transform:translateX(100%); opacity:0; }
  to   { transform:translateX(0);    opacity:1; }
}
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
@keyframes modalIn {
  from { opacity:0; transform:scale(.95) translateY(16px); }
  to   { opacity:1; transform:scale(1)   translateY(0); }
}

.animate-fade-up  { animation: fadeUp 0.28s ease forwards; }
.animate-slide-in { animation: slideIn 0.3s ease forwards; }
.animate-pulse    { animation: pulse 1.4s ease-in-out infinite; }
.animate-spin     { animation: spin 1s linear infinite; }
.animate-modal    { animation: modalIn 0.22s cubic-bezier(.34,1.56,.64,1) forwards; }

/* Scrollbar */
::-webkit-scrollbar { width:5px; height:5px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:99px; }
.dark ::-webkit-scrollbar-thumb { background:#334155; }

/* Chart bars */
.chart-bar { transition: height 0.5s cubic-bezier(.34,1.56,.64,1); }

/* Tailwind-compatible utilities (subset we need) */
.flex { display:flex; }
.inline-flex { display:inline-flex; }
.grid { display:grid; }
.block { display:block; }
.hidden { display:none; }
.relative { position:relative; }
.absolute { position:absolute; }
.fixed { position:fixed; }
.sticky { position:sticky; }
.inset-0 { top:0; right:0; bottom:0; left:0; }
.z-30 { z-index:30; }
.z-40 { z-index:40; }
.z-50 { z-index:50; }
.overflow-hidden { overflow:hidden; }
.overflow-y-auto { overflow-y:auto; }
.overflow-x-auto { overflow-x:auto; }
.w-full { width:100%; }
.h-full { height:100%; }
.min-h-screen { min-height:100vh; }
.flex-1 { flex:1 1 0%; }
.flex-shrink-0 { flex-shrink:0; }
.items-center { align-items:center; }
.items-start { align-items:flex-start; }
.justify-center { justify-content:center; }
.justify-between { justify-content:space-between; }
.justify-end { justify-content:flex-end; }
.flex-col { flex-direction:column; }
.flex-wrap { flex-wrap:wrap; }
.gap-1   { gap:.25rem; }
.gap-1\\.5 { gap:.375rem; }
.gap-2   { gap:.5rem; }
.gap-2\\.5 { gap:.625rem; }
.gap-3   { gap:.75rem; }
.gap-3\\.5 { gap:.875rem; }
.gap-4   { gap:1rem; }
.gap-5   { gap:1.25rem; }
.gap-6   { gap:1.5rem; }
.gap-8   { gap:2rem; }
.grid-cols-1 { grid-template-columns:repeat(1,minmax(0,1fr)); }
.grid-cols-2 { grid-template-columns:repeat(2,minmax(0,1fr)); }
.grid-cols-3 { grid-template-columns:repeat(3,minmax(0,1fr)); }
.grid-cols-4 { grid-template-columns:repeat(4,minmax(0,1fr)); }
.col-span-2 { grid-column:span 2/span 2; }
.cursor-pointer { cursor:pointer; }
.cursor-not-allowed { cursor:not-allowed; }
.select-none { user-select:none; }
.truncate { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.whitespace-nowrap { white-space:nowrap; }
.text-left { text-align:left; }
.text-center { text-align:center; }
.text-right { text-align:right; }
.min-w-0 { min-width:0; }
.max-w-sm  { max-width:24rem; }
.max-w-md  { max-width:28rem; }
.max-w-lg  { max-width:32rem; }
.max-w-xl  { max-width:36rem; }
.max-w-2xl { max-width:42rem; }
.max-w-4xl { max-width:56rem; }
.max-w-5xl { max-width:64rem; }
.max-h-\\[90vh\\] { max-height:90vh; }
.pointer-events-none { pointer-events:none; }
.pointer-events-auto { pointer-events:auto; }

/* Typography */
.text-xs  { font-size:.75rem;  line-height:1rem; }
.text-sm  { font-size:.875rem; line-height:1.25rem; }
.text-base { font-size:1rem;   line-height:1.5rem; }
.text-lg  { font-size:1.125rem; line-height:1.75rem; }
.text-xl  { font-size:1.25rem; line-height:1.75rem; }
.text-2xl { font-size:1.5rem;  line-height:2rem; }
.text-3xl { font-size:1.875rem; line-height:2.25rem; }
.text-5xl { font-size:3rem;    line-height:1; }
.text-7xl { font-size:4.5rem;  line-height:1; }
.font-medium { font-weight:500; }
.font-semibold { font-weight:600; }
.font-bold { font-weight:700; }
.font-extrabold { font-weight:800; }
.font-black { font-weight:900; }
.leading-tight  { line-height:1.25; }
.leading-relaxed { line-height:1.625; }
.leading-none  { line-height:1; }
.tracking-wide { letter-spacing:.025em; }
.tracking-wider { letter-spacing:.05em; }
.tracking-widest { letter-spacing:.1em; }
.uppercase { text-transform:uppercase; }
.line-through { text-decoration:line-through; }
.underline { text-decoration:underline; }
.italic { font-style:italic; }

/* Spacing */
.p-0 { padding:0; }
.p-1 { padding:.25rem; }
.p-2 { padding:.5rem; }
.p-3 { padding:.75rem; }
.p-4 { padding:1rem; }
.p-5 { padding:1.25rem; }
.p-6 { padding:1.5rem; }
.p-8 { padding:2rem; }
.p-10 { padding:2.5rem; }
.px-1   { padding-left:.25rem; padding-right:.25rem; }
.px-1\\.5 { padding-left:.375rem; padding-right:.375rem; }
.px-2   { padding-left:.5rem; padding-right:.5rem; }
.px-2\\.5 { padding-left:.625rem; padding-right:.625rem; }
.px-3   { padding-left:.75rem; padding-right:.75rem; }
.px-3\\.5 { padding-left:.875rem; padding-right:.875rem; }
.px-4   { padding-left:1rem; padding-right:1rem; }
.px-5   { padding-left:1.25rem; padding-right:1.25rem; }
.px-6   { padding-left:1.5rem; padding-right:1.5rem; }
.px-10  { padding-left:2.5rem; padding-right:2.5rem; }
.px-12  { padding-left:3rem; padding-right:3rem; }
.py-0\\.5 { padding-top:.125rem; padding-bottom:.125rem; }
.py-1   { padding-top:.25rem; padding-bottom:.25rem; }
.py-1\\.5 { padding-top:.375rem; padding-bottom:.375rem; }
.py-2   { padding-top:.5rem; padding-bottom:.5rem; }
.py-2\\.5 { padding-top:.625rem; padding-bottom:.625rem; }
.py-3   { padding-top:.75rem; padding-bottom:.75rem; }
.py-3\\.5 { padding-top:.875rem; padding-bottom:.875rem; }
.py-4   { padding-top:1rem; padding-bottom:1rem; }
.py-5   { padding-top:1.25rem; padding-bottom:1.25rem; }
.py-6   { padding-top:1.5rem; padding-bottom:1.5rem; }
.py-8   { padding-top:2rem; padding-bottom:2rem; }
.py-10  { padding-top:2.5rem; padding-bottom:2.5rem; }
.py-14  { padding-top:3.5rem; padding-bottom:3.5rem; }
.py-20  { padding-top:5rem; padding-bottom:5rem; }
.pt-16  { padding-top:4rem; }
.pt-20  { padding-top:5rem; }
.pb-4   { padding-bottom:1rem; }
.pb-16  { padding-bottom:4rem; }
.pb-20  { padding-bottom:5rem; }
.pl-9   { padding-left:2.25rem; }
.pr-9   { padding-right:2.25rem; }
.pt-2   { padding-top:.5rem; }
.pt-4   { padding-top:1rem; }
.pb-2   { padding-bottom:.5rem; }
.mb-0   { margin-bottom:0; }
.mb-0\\.5 { margin-bottom:.125rem; }
.mb-1   { margin-bottom:.25rem; }
.mb-1\\.5 { margin-bottom:.375rem; }
.mb-2   { margin-bottom:.5rem; }
.mb-3   { margin-bottom:.75rem; }
.mb-4   { margin-bottom:1rem; }
.mb-5   { margin-bottom:1.25rem; }
.mb-6   { margin-bottom:1.5rem; }
.mb-7   { margin-bottom:1.75rem; }
.mb-8   { margin-bottom:2rem; }
.mb-10  { margin-bottom:2.5rem; }
.mt-0\\.5 { margin-top:.125rem; }
.mt-1   { margin-top:.25rem; }
.mt-1\\.5 { margin-top:.375rem; }
.mt-2   { margin-top:.5rem; }
.mt-3   { margin-top:.75rem; }
.mt-4   { margin-top:1rem; }
.mt-5   { margin-top:1.25rem; }
.mt-7   { margin-top:1.75rem; }
.mr-auto { margin-right:auto; }
.mx-auto { margin-left:auto; margin-right:auto; }
.-ml-2  { margin-left:-.5rem; }
.-mb-px { margin-bottom:-1px; }

/* Sizing */
.w-4  { width:1rem; }
.w-5  { width:1.25rem; }
.w-6  { width:1.5rem; }
.w-7  { width:1.75rem; }
.w-8  { width:2rem; }
.w-9  { width:2.25rem; }
.w-10 { width:2.5rem; }
.w-11 { width:2.75rem; }
.w-12 { width:3rem; }
.w-16 { width:4rem; }
.w-20 { width:5rem; }
.w-64 { width:16rem; }
.h-2  { height:.5rem; }
.h-4  { height:1rem; }
.h-5  { height:1.25rem; }
.h-6  { height:1.5rem; }
.h-7  { height:1.75rem; }
.h-8  { height:2rem; }
.h-9  { height:2.25rem; }
.h-10 { height:2.5rem; }
.h-11 { height:2.75rem; }
.h-12 { height:3rem; }
.h-16 { height:4rem; }
.h-20 { height:5rem; }
.h-px { height:1px; }
.min-w-\\[18px\\] { min-width:18px; }
.min-w-\\[80px\\] { min-width:80px; }
.min-w-\\[100px\\] { min-width:100px; }
.h-\\[200px\\] { height:200px; }
.h-\\[180px\\] { height:180px; }

/* Border */
.border   { border-width:1px; }
.border-0 { border-width:0; }
.border-2 { border-width:2px; }
.border-b { border-bottom-width:1px; }
.border-b-2 { border-bottom-width:2px; }
.border-t { border-top-width:1px; }
.border-l { border-left-width:1px; }
.border-l-4 { border-left-width:4px; }
.border-r { border-right-width:1px; }
.border-transparent { border-color:transparent; }
.rounded-lg   { border-radius:.5rem; }
.rounded-xl   { border-radius:.75rem; }
.rounded-2xl  { border-radius:1rem; }
.rounded-3xl  { border-radius:1.5rem; }
.rounded-full { border-radius:9999px; }

/* Shadow */
.shadow-sm  { box-shadow:0 1px 2px 0 rgb(0 0 0/.05); }
.shadow     { box-shadow:0 1px 3px 0 rgb(0 0 0/.1),0 1px 2px -1px rgb(0 0 0/.1); }
.shadow-md  { box-shadow:0 4px 6px -1px rgb(0 0 0/.1),0 2px 4px -2px rgb(0 0 0/.1); }
.shadow-lg  { box-shadow:0 10px 15px -3px rgb(0 0 0/.1),0 4px 6px -4px rgb(0 0 0/.1); }
.shadow-xl  { box-shadow:0 20px 25px -5px rgb(0 0 0/.1),0 8px 10px -6px rgb(0 0 0/.1); }
.shadow-2xl { box-shadow:0 25px 50px -12px rgb(0 0 0/.25); }

/* Ring */
.ring-2          { box-shadow:0 0 0 2px; }
.ring-transparent { --ring-color:transparent; }
.ring-offset-1   { --ring-offset:1px; }

/* Object fit */
.object-cover { object-fit:cover; }

/* Colors — light */
.bg-white  { background:#fff; }
.bg-black  { background:#000; }
.bg-slate-50  { background:#f8fafc; }
.bg-slate-100 { background:#f1f5f9; }
.bg-slate-200 { background:#e2e8f0; }
.bg-slate-700 { background:#334155; }
.bg-slate-800 { background:#1e293b; }
.bg-slate-900 { background:#0f172a; }
.bg-slate-950 { background:#020817; }
.bg-emerald-50  { background:#ecfdf5; }
.bg-emerald-100 { background:#d1fae5; }
.bg-emerald-500 { background:#10b981; }
.bg-emerald-600 { background:#059669; }
.bg-red-50   { background:#fff1f2; }
.bg-red-100  { background:#ffe4e6; }
.bg-red-500  { background:#ef4444; }
.bg-amber-100 { background:#fef3c7; }
.bg-blue-100  { background:#dbeafe; }
.bg-purple-100 { background:#f3e8ff; }
.bg-black\\/50 { background:rgb(0 0 0/.5); }

/* Text colors */
.text-white   { color:#fff; }
.text-slate-200 { color:#e2e8f0; }
.text-slate-300 { color:#cbd5e1; }
.text-slate-400 { color:#94a3b8; }
.text-slate-500 { color:#64748b; }
.text-slate-600 { color:#475569; }
.text-slate-700 { color:#334155; }
.text-slate-800 { color:#1e293b; }
.text-slate-900 { color:#0f172a; }
.text-emerald-400 { color:#34d399; }
.text-emerald-500 { color:#10b981; }
.text-emerald-600 { color:#059669; }
.text-emerald-700 { color:#047857; }
.text-red-400  { color:#f87171; }
.text-red-500  { color:#ef4444; }
.text-red-600  { color:#dc2626; }
.text-amber-600 { color:#d97706; }
.text-amber-700 { color:#b45309; }
.text-blue-600  { color:#2563eb; }
.text-blue-700  { color:#1d4ed8; }
.text-purple-700 { color:#7e22ce; }

/* Border colors */
.border-slate-100 { border-color:#f1f5f9; }
.border-slate-200 { border-color:#e2e8f0; }
.border-slate-700 { border-color:#334155; }
.border-slate-800 { border-color:#1e293b; }
.border-emerald-200 { border-color:#a7f3d0; }
.border-emerald-400 { border-color:#34d399; }
.border-emerald-800 { border-color:#065f46; }
.border-red-200  { border-color:#fecaca; }
.border-red-900  { border-color:#7f1d1d; }
.border-b-emerald-500 { border-bottom-color:#10b981; }
.border-b-transparent { border-bottom-color:transparent; }
.border-l-emerald-400 { border-left-color:#34d399; }
.border-l-red-400    { border-left-color:#f87171; }
.border-l-blue-400   { border-left-color:#60a5fa; }
.border-l-amber-400  { border-left-color:#fbbf24; }

/* Transforms */
.translate-x-0  { transform:translateX(0); }
.translate-x-1  { transform:translateX(.25rem); }
.translate-x-6  { transform:translateX(1.5rem); }
.-translate-y-0\\.5 { transform:translateY(-0.125rem); }
.-translate-y-1 { transform:translateY(-.25rem); }
.-translate-x-full { transform:translateX(-100%); }
.scale-95 { transform:scale(.95); }
.duration-150 { transition-duration:150ms; }
.duration-200 { transition-duration:200ms; }
.duration-300 { transition-duration:300ms; }
.transition-all     { transition-property:all; transition-duration:150ms; }
.transition-colors  { transition-property:color,background-color,border-color; transition-duration:150ms; }
.transition-transform { transition-property:transform; transition-duration:150ms; }

/* Opacity */
.opacity-0   { opacity:0; }
.opacity-25  { opacity:.25; }
.opacity-50  { opacity:.5; }
.opacity-60  { opacity:.6; }
.opacity-75  { opacity:.75; }
.disabled\\:opacity-50:disabled { opacity:.5; }

/* Backdrop */
.backdrop-blur-sm { backdrop-filter:blur(4px); }

/* Responsive helpers */
@media (min-width:768px) {
  .md\\:hidden     { display:none; }
  .md\\:block      { display:block; }
  .md\\:flex       { display:flex; }
  .md\\:grid       { display:grid; }
  .md\\:left-64    { left:16rem; }
  .md\\:translate-x-0 { transform:translateX(0); }
  .md\\:grid-cols-2 { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .md\\:grid-cols-3 { grid-template-columns:repeat(3,minmax(0,1fr)); }
  .md\\:ml-64      { margin-left:16rem; }
  .md\\:px-6       { padding-left:1.5rem; padding-right:1.5rem; }
  .md\\:px-12      { padding-left:3rem; padding-right:3rem; }
  .md\\:p-7        { padding:1.75rem; }
}
@media (max-width:767px) {
  .sm\\:hidden { display:none; }
}
@media (min-width:640px) {
  .sm\\:flex  { display:flex; }
  .sm\\:grid-cols-2 { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@media (min-width:1024px) {
  .lg\\:grid-cols-2 { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .lg\\:grid-cols-3 { grid-template-columns:repeat(3,minmax(0,1fr)); }
  .lg\\:grid-cols-4 { grid-template-columns:repeat(4,minmax(0,1fr)); }
  .lg\\:hidden     { display:none; }
}

/* Hover states */
.hover\\:bg-slate-50:hover  { background:#f8fafc; }
.hover\\:bg-slate-100:hover { background:#f1f5f9; }
.hover\\:bg-slate-200:hover { background:#e2e8f0; }
.hover\\:bg-slate-700:hover { background:#334155; }
.hover\\:bg-slate-800:hover { background:#1e293b; }
.hover\\:bg-emerald-600:hover { background:#059669; }
.hover\\:bg-emerald-100:hover { background:#d1fae5; }
.hover\\:bg-red-100:hover  { background:#fee2e2; }
.hover\\:border-slate-300:hover  { border-color:#cbd5e1; }
.hover\\:border-emerald-400:hover { border-color:#34d399; }
.hover\\:text-slate-700:hover  { color:#334155; }
.hover\\:text-slate-300:hover  { color:#cbd5e1; }
.hover\\:text-emerald-500:hover { color:#10b981; }
.hover\\:text-emerald-600:hover { color:#059669; }
.hover\\:text-white\\/70:hover  { color:rgba(255,255,255,.7); }
.hover\\:underline:hover { text-decoration:underline; }
.hover\\:-translate-y-0\\.5:hover { transform:translateY(-.125rem); }
.hover\\:shadow-md:hover { box-shadow:0 4px 6px -1px rgb(0 0 0/.1); }
.hover\\:ring-emerald-400:hover { outline:2px solid #34d399; }
.active\\:scale-\\[\\.97\\]:active { transform:scale(.97); }

/* Dark mode overrides */
.dark .dark\\:bg-slate-700  { background:#334155; }
.dark .dark\\:bg-slate-800  { background:#1e293b; }
.dark .dark\\:bg-slate-800\\/40 { background:rgba(30,41,59,.4); }
.dark .dark\\:bg-slate-800\\/50 { background:rgba(30,41,59,.5); }
.dark .dark\\:bg-slate-800\\/60 { background:rgba(30,41,59,.6); }
.dark .dark\\:bg-slate-800\\/70 { background:rgba(30,41,59,.7); }
.dark .dark\\:bg-slate-900  { background:#0f172a; }
.dark .dark\\:bg-slate-950  { background:#020817; }
.dark .dark\\:text-white    { color:#fff; }
.dark .dark\\:text-slate-100 { color:#f1f5f9; }
.dark .dark\\:text-slate-200 { color:#e2e8f0; }
.dark .dark\\:text-slate-300 { color:#cbd5e1; }
.dark .dark\\:text-slate-400 { color:#94a3b8; }
.dark .dark\\:text-emerald-400 { color:#34d399; }
.dark .dark\\:text-red-400  { color:#f87171; }
.dark .dark\\:border-slate-700 { border-color:#334155; }
.dark .dark\\:border-slate-700\\/60 { border-color:rgba(51,65,85,.6); }
.dark .dark\\:border-slate-800 { border-color:#1e293b; }
.dark .dark\\:hover\\:bg-slate-700:hover { background:#334155; }
.dark .dark\\:hover\\:bg-slate-800:hover { background:#1e293b; }
.dark .dark\\:hover\\:bg-slate-800\\/30:hover { background:rgba(30,41,59,.3); }
.dark .dark\\:border-emerald-800 { border-color:#065f46; }
.dark .dark\\:bg-emerald-900\\/10 { background:rgba(6,78,59,.1); }
.dark .dark\\:bg-emerald-900\\/20 { background:rgba(6,78,59,.2); }
.dark .dark\\:bg-emerald-900\\/40 { background:rgba(6,78,59,.4); }
.dark .dark\\:bg-red-900\\/40 { background:rgba(127,29,29,.4); }
.dark .dark\\:bg-red-950\\/30 { background:rgba(69,10,10,.3); }
.dark .dark\\:bg-amber-900\\/40 { background:rgba(120,53,15,.4); }
.dark .dark\\:bg-blue-900\\/40 { background:rgba(30,58,138,.4); }
.dark .dark\\:bg-purple-900\\/40 { background:rgba(88,28,135,.4); }
.dark .dark\\:text-emerald-300 { color:#6ee7b7; }
.dark .dark\\:text-red-400   { color:#f87171; }
.dark .dark\\:text-amber-400 { color:#fbbf24; }
.dark .dark\\:text-blue-400  { color:#60a5fa; }
.dark .dark\\:text-purple-400 { color:#c084fc; }
.dark .dark\\:placeholder-slate-500::placeholder { color:#64748b; }
.dark .dark\\:ring-slate-900 { --ring-color:#0f172a; }
`

const style = document.createElement('style')
style.textContent = css
document.head.appendChild(style)
