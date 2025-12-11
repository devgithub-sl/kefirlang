import './style.css'
import { KefirInterpreter, type LogEntry } from './interpreter';

const interpreter = new KefirInterpreter();

// --- 100% COMPREHENSIVE SYNTAX GUIDE ---
const syntaxGuide = `
<div class="guide-content">
  <h3>1. Fundamentals</h3>
  <pre>entry _main;          // Mark Entry Point
_main:
  print("Hello Kefir");
  // Comments start with //
:;                    // End Block</pre>

  <h3>2. Variables & Types</h3>
  <pre>mut x :int: = 10;     // Mutable
let y = "text";       // Immutable (Inferred)
const PI = 3.14;      // Constant

// Supported Types:
// :int:, :float:, :bool:, :string:
// :array:, :dict:</pre>
  
  <h3>3. Numbers & Math</h3>
  <pre>a = 10 + 5 * 2;       // Standard Order
b = sqrt(16);         // Native Math
r = random();         // 0.0 to 1.0
c = floor(3.9);       // 3</pre>

  <h3>4. Logic & Control Flow</h3>
  <pre>// IF ELSE
if x > 5:
  print("Big");
else:
  print("Small");
:;

// MATCH
match x:
  case 1: print("One"); :;
  default: print("Other"); :;
:;

// LOOPS
while x > 0:
  x = x - 1;
:;

for i in range(0, 5):
  print(i);
:;</pre>

  <h3>5. Functions</h3>
  <pre>defn add(a :int:, b :int:) -> :int::
  return a + b
:;

// Short Syntax
def greet(name): print("Hi " + name); :;</pre>

  <h3>6. Arrays & Lists</h3>
  <pre>mut list = [1, 2, 3];
push(list, 4);        // Add
val = pop(list);      // Remove Last
len(list);            // Length
rev = reverse(list);  // Reverse</pre>

  <h3>7. Dictionaries (Objects)</h3>
  <pre>mut user = { id: 1, name: "Kefir" };
print(user["name"]);
user["active"] = True;
keys(user);           // ["id", "name", "active"]</pre>

  <h3>8. Structs (OOP)</h3>
  <pre>struct User {
  name :string:,
  age :int:
  
  // Method
  def greet():
      print("I am " + self.name);
  :;
}

// Instantiate
u = User("Alice", 30);
u.greet();</pre>

  <h3>9. Custom Initializer</h3>
  <pre>struct Counter {
  val :int:
  
  #init(start):
      self.val = start;
  :;
}
c = Counter(10);</pre>

  <h3>10. Protocols (Interfaces)</h3>
  <pre>protocol Printable {
  def str() -> :string:
}

struct Point implements Printable {
  x, y
  def str(): return "$x, $y"; :;
}</pre>

  <h3>11. Input & Strings</h3>
  <pre>// User Input
name = input("Enter Name: ");

// String Utils
s = " hello ";
trimmed = trim(s);
upper = upper(s);
contains(s, "ll");    // True
split("a,b", ",");    // ["a", "b"]</pre>

  <h3>12. HTML DSL (Web)</h3>
  <pre>ui = html {
  div {
    h1 { "Welcome" }
    button { "Click Me" }
  }
};</pre>

  <h3>13. Advanced</h3>
  <pre>// Defer: Run at end of block
defer { print("Cleanup"); }

// Fetch API
data = fetch("https://api.example.com/data");

// Sleep
sleep(1000); // 1 second</pre>
</div>
`;

// --- UI INJECTION ---
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <!-- GUIDE MODAL -->
    <div id="guide-modal" class="modal hidden">
      <div class="modal-content">
        <div class="modal-header">
          <h2>📘 Kefir Language Guide</h2>
          <button id="close-guide">Close</button>
        </div>
        <div class="modal-body">${syntaxGuide}</div>
      </div>
    </div>
    
    <!-- INPUT MODAL -->
    <div id="input-modal" class="modal hidden">
      <div class="modal-content">
        <div class="modal-header">
            <h2 id="input-prompt">Input Required</h2>
        </div>
        <div class="modal-body">
            <input type="text" id="custom-input-field" autocomplete="off" placeholder="Type here..." />
            <button id="submit-input">Confirm Input</button>
        </div>
      </div>
    </div>

    <!-- LEFT PANEL: EDITOR -->
    <div class="panel">
      <div class="header-row">
        <h2>🧑‍💻 Source Code</h2>
        <button id="guide-btn" class="secondary-btn">View Syntax</button>
      </div>
      <input type="file" id="kf-input" accept=".kf" />
      <textarea id="code-preview" placeholder="// Write or load your Kefir code here..." spellcheck="false"></textarea>
      <button id="run-btn">▶ Run Code</button>
    </div>
    
    <!-- RIGHT PANEL: TERMINAL -->
    <div class="panel repl-panel">
      <div class="header-row">
        <h2>🚀 Terminal / REPL</h2>
        <button id="clear-btn" class="secondary-btn">Clear</button>
      </div>
      <div id="console-output" class="terminal">
        <div class="log-msg" style="color:var(--text-accent)">Welcome to Kefir v2.0 - Agentic Edition</div>
        <div class="log-msg" style="color:var(--text-muted)">Type 'help' for commands.</div>
      </div>
      <div class="repl-input-container">
        <span id="prompt-label">>>></span>
        <input type="text" id="repl-input" autocomplete="off" spellcheck="false" placeholder="Type command..." />
      </div>
    </div>
  </div>
`

// --- DOM ELEMENTS ---
const fileInput = document.querySelector<HTMLInputElement>('#kf-input');
const codePreview = document.querySelector<HTMLTextAreaElement>('#code-preview');
const runBtn = document.querySelector<HTMLButtonElement>('#run-btn');
const clearBtn = document.querySelector<HTMLButtonElement>('#clear-btn');
const consoleOutput = document.querySelector<HTMLDivElement>('#console-output');
const replInput = document.querySelector<HTMLInputElement>('#repl-input');
const promptLabel = document.querySelector<HTMLSpanElement>('#prompt-label');

const modal = document.querySelector<HTMLDivElement>('#guide-modal');
const guideBtn = document.querySelector<HTMLButtonElement>('#guide-btn');
const closeBtn = document.querySelector<HTMLButtonElement>('#close-guide');

// --- EVENT LISTENERS: MODAL ---
guideBtn?.addEventListener('click', () => modal?.classList.remove('hidden'));
closeBtn?.addEventListener('click', () => modal?.classList.add('hidden'));
modal?.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.add('hidden');
});

// --- CUSTOM INPUT HANDLER ---
const inputModal = document.querySelector<HTMLDivElement>('#input-modal');
const inputPrompt = document.querySelector<HTMLHeadingElement>('#input-prompt');
const inputField = document.querySelector<HTMLInputElement>('#custom-input-field');
const submitInputBtn = document.querySelector<HTMLButtonElement>('#submit-input');

async function handleInput(text: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (inputPrompt) inputPrompt.innerText = text || "Input Value:";
    inputModal?.classList.remove('hidden');
    inputField?.focus();

    const submit = () => {
      const val = inputField?.value || "";
      if (inputField) inputField.value = '';
      inputModal?.classList.add('hidden');
      cleanup();
      resolve(val);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') submit();
    };

    const cleanup = () => {
      submitInputBtn?.removeEventListener('click', submit);
      inputField?.removeEventListener('keydown', onKey);
    };

    submitInputBtn?.addEventListener('click', submit);
    inputField?.addEventListener('keydown', onKey);
  });
}
interpreter.setInputHandler(handleInput);

// --- LOGGING ---
function logToScreen(log: LogEntry, isRepl = false) {
  if (!consoleOutput) return;
  const p = document.createElement('div');
  p.className = log.type === 'error' ? 'log-error' : 'log-msg';

  if (log.type === 'error') {
    p.innerText = `🛑 Line ${log.line || '?'}: ${log.message}`;
  } else {
    p.innerText = isRepl ? `=> ${log.message}` : log.message;
  }

  consoleOutput.appendChild(p);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// --- FILE LOAD ---
fileInput?.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file || !file.name.endsWith('.kf')) { alert('Please upload a .kf file'); return; }
  const reader = new FileReader();
  reader.onload = (evt) => {
    if (codePreview && evt.target?.result) codePreview.value = evt.target.result as string;
  };
  reader.readAsText(file);
});

// --- RUN BUTTON ---
runBtn?.addEventListener('click', async () => {
  const code = codePreview?.value || "";
  if (!code.trim()) return;

  if (consoleOutput) {
    const sep = document.createElement('div');
    sep.className = 'log-msg';
    sep.style.color = 'var(--text-accent)';
    sep.style.marginTop = '1rem';
    sep.innerText = '--- Executing ---';
    consoleOutput.appendChild(sep);
  }

  if (runBtn) { runBtn.textContent = 'Running...'; runBtn.disabled = true; }

  // Yield to UI slightly
  setTimeout(async () => {
    await interpreter.evaluate(code, (log) => logToScreen(log), false);
    if (runBtn) { runBtn.textContent = '▶ Run Code'; runBtn.disabled = false; }
  }, 50);
});

// --- CLEAR BUTTON ---
clearBtn?.addEventListener('click', () => {
  if (consoleOutput) consoleOutput.innerHTML = '';
});

// --- REPL LOGIC ---
// Restore history from LocalStorage
const savedHistory = localStorage.getItem('kefir_history');
const commandHistory: string[] = savedHistory ? JSON.parse(savedHistory) : [];
let historyIndex = -1;
let multilineBuffer = '';
let indentLevel = 0;

replInput?.addEventListener('keydown', async (e) => {
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      replInput.value = commandHistory[commandHistory.length - 1 - historyIndex];
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      replInput.value = commandHistory[commandHistory.length - 1 - historyIndex];
    } else if (historyIndex === 0) {
      historyIndex = -1;
      replInput.value = '';
    }
  } else if (e.key === 'Enter') {
    const line = replInput.value;
    const trimmedLine = line.trim();

    if (!trimmedLine && multilineBuffer === '') return;

    const echo = document.createElement('div');
    echo.className = 'log-input';
    echo.innerText = (multilineBuffer ? '... ' : '>>> ') + line;
    consoleOutput?.appendChild(echo);
    consoleOutput!.scrollTop = consoleOutput!.scrollHeight;

    replInput.value = '';

    if (trimmedLine === 'clear' || trimmedLine === 'cls') {
      if (consoleOutput) consoleOutput.innerHTML = '';
      multilineBuffer = '';
      indentLevel = 0;
      if (promptLabel) promptLabel.innerText = '>>>';
      return;
    }

    if (trimmedLine === 'help') {
      logToScreen({ type: 'output', message: "available commands:" });
      logToScreen({ type: 'output', message: "  help        : show this help message" });
      logToScreen({ type: 'output', message: "  clear / cls : clear the terminal" });
      logToScreen({ type: 'output', message: "  print(...)  : print values" });
      logToScreen({ type: 'output', message: "  entry _main : define entry point (for full files)" });
      return;
    }

    if (multilineBuffer) {
      multilineBuffer += '\n' + line;
    } else {
      multilineBuffer = line;
    }

    if (trimmedLine.endsWith(':') || trimmedLine.endsWith('{')) {
      indentLevel++;
    }
    if (trimmedLine === ':;' || trimmedLine === '}') {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    if (indentLevel > 0) {
      if (promptLabel) promptLabel.innerText = '...';
    } else {
      if (trimmedLine !== '') {
        commandHistory.push(multilineBuffer.trim());
        if (commandHistory.length > 50) commandHistory.shift();
        localStorage.setItem('kefir_history', JSON.stringify(commandHistory));

        historyIndex = -1;
        replInput.disabled = true;
        // Run async
        setTimeout(async () => {
          await interpreter.evaluate(multilineBuffer, (log) => logToScreen(log, true), true);
          replInput.disabled = false;
          replInput.focus();
        }, 10);
      }
      multilineBuffer = '';
      indentLevel = 0;
      if (promptLabel) promptLabel.innerText = '>>>';
    }
  }
});

// Focus REPL on panel click
document.querySelector('.repl-panel')?.addEventListener('click', (e) => {
  // Don't focus if clicking buttons
  if ((e.target as HTMLElement).tagName !== 'BUTTON') {
    replInput?.focus();
  }
});