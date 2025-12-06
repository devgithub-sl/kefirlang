import './style.css'
import { KefirInterpreter, type LogEntry } from './interpreter';

const interpreter = new KefirInterpreter();

// --- DOCUMENTATION CONTENT ---
const syntaxGuide = `
<div class="guide-content">
  <h3>1. Basics</h3>
  <pre>entry _main;          // Required entry point
_main:
  print("Hello World"); // Standard output
:;</pre>

  <h3>2. Variables</h3>
  <pre>x = 10;               // Immutable (Constant)
mut y = 20;           // Mutable
y = 25;               // OK
// x = 11;            // Error!
let z = 5;            // Shadowing/Redeclaration</pre>

  <h3>3. Data Structures</h3>
  <pre>// Arrays
mut arr = [1, 2, 3];
push(arr, 4);
print(arr[0]);

// Dictionaries
mut dict = { name: "Kefir", id: 1 };
print(dict["name"]);

// Structs
struct Point { x, y }
mut p = Point(10, 20);
print(p.x);</pre>

  <h3>4. Control Flow</h3>
  <pre>// If / Else
if x > 10:
  print("Big");
:; else:
  print("Small");
:;

// Match (Switch)
match x:
  case 10: print("Ten"); :;
  default: print("Other"); :;
:;

// Loops
while x > 0:
  x = x - 1;
:;

for i in range(0, 5):
  print(i);
:;</pre>

  <h3>5. Functions</h3>
  <pre>defn add(a, b):
  return a + b

// Usage
result = add(5, 10);</pre>

  <h3>6. Advanced Features</h3>
  <pre>// String Interpolation
print("Value: $x");

// HTML DSL
view = html {
  div { h1 "Title" }
};

// Defer (Cleanup)
defer print("Runs at end of scope");

// Optionals
val = maybe ?? "Default";
prop = obj?.nested?.val;</pre>
</div>
`;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <div id="guide-modal" class="modal hidden">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Kefir Syntax Guide</h2>
          <button id="close-guide">Close</button>
        </div>
        <div class="modal-body">${syntaxGuide}</div>
      </div>
    </div>

    <div class="panel">
      <div class="header-row">
        <h2>1. Code File</h2>
        <button id="guide-btn" class="secondary-btn">📘 Syntax Guide</button>
      </div>
      <input type="file" id="kf-input" accept=".kf" />
      <textarea id="code-preview" placeholder="Source code..." readonly></textarea>
      <button id="run-btn">Run File</button>
    </div>
    
    <div class="panel">
      <h2>2. Interactive REPL</h2>
      <div id="console-output"></div>
      <div class="repl-input-container">
        <span>&gt;</span>
        <input type="text" id="repl-input" placeholder="Type command (e.g. print(1+1) or x=5)" />
      </div>
    </div>
  </div>
`

// --- UI Logic ---
const fileInput = document.querySelector<HTMLInputElement>('#kf-input');
const codePreview = document.querySelector<HTMLTextAreaElement>('#code-preview');
const runBtn = document.querySelector<HTMLButtonElement>('#run-btn');
const consoleOutput = document.querySelector<HTMLDivElement>('#console-output');
const replInput = document.querySelector<HTMLInputElement>('#repl-input');

// Modal Logic
const modal = document.querySelector<HTMLDivElement>('#guide-modal');
const guideBtn = document.querySelector<HTMLButtonElement>('#guide-btn');
const closeBtn = document.querySelector<HTMLButtonElement>('#close-guide');

guideBtn?.addEventListener('click', () => modal?.classList.remove('hidden'));
closeBtn?.addEventListener('click', () => modal?.classList.add('hidden'));

let currentCode = '';

function logToScreen(log: LogEntry, isRepl = false) {
    if (!consoleOutput) return;
    const p = document.createElement('div');
    p.className = log.type === 'error' ? 'log-error' : 'log-msg';
    
    if (log.type === 'error') p.innerText = `🛑 ${log.message}`;
    else p.innerText = isRepl ? `> ${log.message}` : log.message;
    
    consoleOutput.appendChild(p);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// 1. File Upload
fileInput?.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file || !file.name.endsWith('.kf')) { alert('Please upload a .kf file'); return; }
  const reader = new FileReader();
  reader.onload = (evt) => {
    currentCode = evt.target?.result as string;
    if(codePreview) codePreview.value = currentCode;
  };
  reader.readAsText(file);
});

// 2. Run File
runBtn?.addEventListener('click', async () => {
  if (!currentCode) return;
  if(consoleOutput) consoleOutput.innerHTML = '<div class="log-msg">--- Running File ---</div>';
  
  if(runBtn) { runBtn.textContent = 'Running...'; runBtn.disabled = true; }

  // File Mode: Hard Reset (replMode = false)
  await interpreter.evaluate(currentCode, (log) => logToScreen(log), false);
  
  if(runBtn) { runBtn.textContent = 'Run File'; runBtn.disabled = false; }
});

// 3. REPL Input
replInput?.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        const code = replInput.value.trim();
        if (!code) return;
        
        const echo = document.createElement('div');
        echo.className = 'log-msg';
        echo.style.color = '#888';
        echo.innerText = `>>> ${code}`;
        consoleOutput?.appendChild(echo);
        
        replInput.value = '';
        replInput.disabled = true;

        // REPL Mode: Soft Reset (replMode = true)
        await interpreter.evaluate(code, (log) => logToScreen(log, true), true);
        
        replInput.disabled = false;
        replInput.focus();
    }
});