import './style.css'
import { KefirInterpreter, type LogEntry } from './interpreter';

const interpreter = new KefirInterpreter();

// --- EXPANDED SYNTAX GUIDE ---
const syntaxGuide = `
<div class="guide-content">
  <h3>1. Basics</h3>
  <pre>entry _main;          // Entry point
_main:
  print("Hello Kefir");
:;</pre>

  <h3>2. Variables (Typed)</h3>
  <pre>x = 10;               // Immutable (Constant)
mut y :int: = 20;     // Mutable with Type
y = 25;               // OK
let z = "text";       // Shadowing</pre>

  <h3>3. Functions (Typed)</h3>
  <pre>defn add(a :int:, b :int:) -> :int::
  return a + b

// Usage
result = add(5, 10);</pre>

  <h3>4. Structs</h3>
  <pre>struct User {
  name :string:,
  age :int:
}
mut u = User("Kefir", 25);
print(u.name);</pre>

  <h3>5. Data Structures</h3>
  <pre>// Arrays
mut arr = [1, 2, 3];
push(arr, 4);
print(arr[0]);

// Dictionaries
mut dict = { id: 1, type: "Admin" };
print(dict["type"]);</pre>

  <h3>6. Control Flow</h3>
  <pre>if x > 10: print("Big"); :;
match x:
  case 10: print("Ten"); :;
  default: print("Other"); :;
:;
while x > 0: x = x - 1; :;
for i in range(0, 5): print(i); :;</pre>

  <h3>7. Advanced</h3>
  <pre>// String Interpolation
print("Value: $x");

// HTML DSL
view = html {
  div { h1 "Title" }
};

// Defer
defer print("Cleanup");</pre>
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
    <div id="input-modal" class="modal hidden">
      <div class="modal-content">
        <h3 id="input-prompt">Input Required</h3>
        <input type="text" id="custom-input-field" autocomplete="off" />
        <button id="submit-input">Submit</button>
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
    
    <div class="panel repl-panel">
      <h2>2. Interactive REPL</h2>
      <div id="console-output" class="terminal">
        <div class="log-msg" style="color:#646cff">Welcome to Kefir v1.1. Type 'clear' to clean.</div>
      </div>
      <div class="repl-input-container">
        <span id="prompt-label">&gt;&gt;&gt;</span>
        <input type="text" id="repl-input" autocomplete="off" spellcheck="false" />
      </div>
    </div>
  </div>
`

// ... (Rest of UI Logic handles toggle, file reading, and REPL input history)
const fileInput = document.querySelector<HTMLInputElement>('#kf-input');
const codePreview = document.querySelector<HTMLTextAreaElement>('#code-preview');
const runBtn = document.querySelector<HTMLButtonElement>('#run-btn');
const consoleOutput = document.querySelector<HTMLDivElement>('#console-output');
const replInput = document.querySelector<HTMLInputElement>('#repl-input');
const promptLabel = document.querySelector<HTMLSpanElement>('#prompt-label');

const modal = document.querySelector<HTMLDivElement>('#guide-modal');
const guideBtn = document.querySelector<HTMLButtonElement>('#guide-btn');
const closeBtn = document.querySelector<HTMLButtonElement>('#close-guide');

guideBtn?.addEventListener('click', () => modal?.classList.remove('hidden'));
closeBtn?.addEventListener('click', () => modal?.classList.add('hidden'));

// --- CUSTOM INPUT HANDLING ---
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

let currentFileCode = '';
// Restore history from LocalStorage
const savedHistory = localStorage.getItem('kefir_history');
const commandHistory: string[] = savedHistory ? JSON.parse(savedHistory) : [];
let historyIndex = -1;
let multilineBuffer = '';
let indentLevel = 0;

function logToScreen(log: LogEntry, isRepl = false) {
  if (!consoleOutput) return;
  const p = document.createElement('div');
  p.className = log.type === 'error' ? 'log-error' : 'log-msg';
  if (log.type === 'error') p.innerText = `🛑 ${log.message}`;
  else p.innerText = isRepl ? `${log.message}` : log.message;
  consoleOutput.appendChild(p);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

fileInput?.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file || !file.name.endsWith('.kf')) { alert('Please upload a .kf file'); return; }
  const reader = new FileReader();
  reader.onload = (evt) => {
    currentFileCode = evt.target?.result as string;
    if (codePreview) codePreview.value = currentFileCode;
  };
  reader.readAsText(file);
});

runBtn?.addEventListener('click', async () => {
  if (!currentFileCode) return;
  if (consoleOutput) consoleOutput.innerHTML = '<div class="log-msg">--- Running File ---</div>';
  if (runBtn) { runBtn.textContent = 'Running...'; runBtn.disabled = true; }
  await interpreter.evaluate(currentFileCode, (log) => logToScreen(log), false);
  if (runBtn) { runBtn.textContent = 'Run File'; runBtn.disabled = false; }
});

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
        // Save history to LocalStorage
        if (commandHistory.length > 50) commandHistory.shift(); // Limit size
        localStorage.setItem('kefir_history', JSON.stringify(commandHistory));

        historyIndex = -1;
        replInput.disabled = true;
        await interpreter.evaluate(multilineBuffer, (log) => logToScreen(log, true), true);
        replInput.disabled = false;
      }
      multilineBuffer = '';
      indentLevel = 0;
      if (promptLabel) promptLabel.innerText = '>>>';
    }
    replInput.focus();
  }
});

document.querySelector('.repl-panel')?.addEventListener('click', () => {
  replInput?.focus();
});