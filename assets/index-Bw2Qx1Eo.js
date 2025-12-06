(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))l(i);new MutationObserver(i=>{for(const e of i)if(e.type==="childList")for(const r of e.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&l(r)}).observe(document,{childList:!0,subtree:!0});function s(i){const e={};return i.integrity&&(e.integrity=i.integrity),i.referrerPolicy&&(e.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?e.credentials="include":i.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function l(i){if(i.ep)return;i.ep=!0;const e=s(i);fetch(i.href,e)}})();const F=new Set(["entry","def","defn","return","print","if","else","while","for","in","input","mut","let","break","continue","struct","defer","html","match","case","default"]),S=new Set(["True","False"]);function N(f){const t=[];let s=0,l=1;for(;s<f.length;){const i=f[s];if(/\s/.test(i)){i===`
`&&l++,s++;continue}if(i==="/"&&f[s+1]==="/"){for(;s<f.length&&f[s]!==`
`;)s++;continue}if(/[0-9]/.test(i)){let r="";for(;s<f.length&&/[0-9.]/.test(f[s]);)r+=f[s++];t.push({type:"NUMBER",value:r,line:l});continue}if(i==='"'){let r="";s++;let a=!1;for(;s<f.length;){if(f[s]==='"'){a=!0;break}f[s]===`
`&&l++,r+=f[s++]}if(!a)return console.error(`Unterminated string at line ${l}`),t.push({type:"STRING",value:r,line:l}),t;s++,t.push({type:"STRING",value:r,line:l});continue}if(i==="'"){let r="";s++,s<f.length&&(r=f[s++]),f[s]==="'"&&s++,t.push({type:"CHAR",value:r,line:l});continue}if(/[a-zA-Z_]/.test(i)){let r="";for(;s<f.length&&/[a-zA-Z0-9_"]/.test(f[s]);)r+=f[s++];F.has(r)?t.push({type:"KEYWORD",value:r,line:l}):S.has(r)?t.push({type:"BOOLEAN",value:r,line:l}):t.push({type:"IDENTIFIER",value:r,line:l});continue}const e=f.substr(s,2);if([":;","==","!=",">=","<=","&&","||","??","?."].includes(e)){[":;"].includes(e)?t.push({type:"PUNCTUATION",value:e,line:l}):t.push({type:"OPERATOR",value:e,line:l}),s+=2;continue}if(["+","-","*","/",">","<","%"].includes(i)){t.push({type:"OPERATOR",value:i,line:l}),s++;continue}if(["=",";",":","(",")",",",".","[","]","{","}","$"].includes(i)){t.push({type:"PUNCTUATION",value:i,line:l}),s++;continue}console.warn(`Unknown character: ${i} at line ${l}`),s++}return t.push({type:"EOF",value:"",line:l}),t}class I{globalVariables=new Map;functions=new Map;structs=new Map;nativeFunctions=new Map;scopeStack=[];constructor(){this.initNativeFunctions(),this.scopeStack=[this.globalVariables]}reset(t=!1){t||(this.globalVariables.clear(),this.functions.clear(),this.structs.clear(),this.scopeStack=[this.globalVariables]),this.initNativeFunctions()}initNativeFunctions(){this.nativeFunctions.clear(),this.nativeFunctions.set("range",t=>{if(t.length<2)return[];const s=t[0],l=t[1],i=[];for(let e=s;e<l;e++)i.push(e);return i}),this.nativeFunctions.set("floor",t=>Math.floor(t[0])),this.nativeFunctions.set("ceil",t=>Math.ceil(t[0])),this.nativeFunctions.set("sqrt",t=>Math.sqrt(t[0])),this.nativeFunctions.set("random",()=>Math.random()),this.nativeFunctions.set("sin",t=>Math.sin(t[0])),this.nativeFunctions.set("cos",t=>Math.cos(t[0])),this.nativeFunctions.set("str",t=>String(t[0])),this.nativeFunctions.set("int",t=>parseInt(t[0])),this.nativeFunctions.set("typeof",t=>Array.isArray(t[0])?"array":t[0]===null?"null":typeof t[0]=="object"&&t[0].__struct_type?t[0].__struct_type:typeof t[0]),this.nativeFunctions.set("len",t=>Array.isArray(t[0])||typeof t[0]=="string"?t[0].length:typeof t[0]=="object"&&t[0]!==null?Object.keys(t[0]).length:0),this.nativeFunctions.set("push",t=>Array.isArray(t[0])?(t[0].push(t[1]),t[0]):null),this.nativeFunctions.set("pop",t=>Array.isArray(t[0])?t[0].pop():null),this.nativeFunctions.set("keys",t=>typeof t[0]=="object"&&t[0]!==null?Object.keys(t[0]):[])}getVar(t){for(let s=this.scopeStack.length-1;s>=0;s--){const l=this.scopeStack[s];if(l.has(t))return l.get(t)}}defineVar(t,s,l){this.scopeStack[this.scopeStack.length-1].set(t,{value:s,isMutable:l})}assignVar(t,s,l,i){const e=this.getVar(t);e?e.isMutable?e.value=s:i({type:"error",message:`Runtime Error: Cannot reassign immutable variable '${t}'`,line:l}):this.defineVar(t,s,!1)}assignIndex(t,s,l,i,e){const r=this.getVar(t);if(!r||!r.isMutable){e({type:"error",message:`Runtime Error: Cannot mutate '${t}'`,line:i});return}if(Array.isArray(r.value)){if(typeof s!="number"){e({type:"error",message:"Runtime Error: Array index must be a number",line:i});return}if(s<0||s>=r.value.length){e({type:"error",message:`Runtime Error: Index ${s} out of bounds`,line:i});return}r.value[s]=l}else typeof r.value=="object"&&r.value!==null?r.value[s]=l:e({type:"error",message:`Runtime Error: '${t}' is not indexable`,line:i})}async executeBlock(t,s){let l=0;const i=[];try{for(;l<t.length;){if(t[l].value==="defer"){l++;let r=[];if(t[l].value==="{"){l++;let a=1;for(;l<t.length&&a>0;)t[l].value==="}"?a--:t[l].value==="{"&&a++,a>0&&r.push(t[l]),l++}else{for(;l<t.length&&t[l].value!==";";)r.push(t[l]),l++;l<t.length&&l++}i.push(r);continue}const e=await this.executeStatement(t,l,s);if(typeof e=="object"&&"type"in e)return e;l=e}}finally{for(;i.length>0;){const e=i.pop();await this.executeBlock(e,s)}}return l}async evaluate(t,s,l=!1){this.reset(l);const i=N(t);let e=0;for(;e<i.length;){const r=i[e];if(r.value==="struct"){e++;const a=i[e].value;e++,i[e].value==="{"&&e++;const n=[];for(;i[e].value!=="}"&&i[e].type!=="EOF";)i[e].type==="IDENTIFIER"&&n.push(i[e].value),e++;i[e].value==="}"&&e++,this.structs.set(a,{name:a,fields:n});continue}if(r.value==="def"||r.value==="defn"){e++;const a=i[e].value;e++,i[e].value==="("&&e++;const n=[];for(;i[e].value!==")"&&i[e].type!=="EOF";)i[e].value===","?e++:n.push(i[e++].value);i[e].value===")"&&e++,i[e].value===":"&&e++;const u=this.captureBlock(i,e,c=>e=c);i[e]&&i[e].value===":;"&&e++,this.functions.set(a,{name:a,params:n,body:u});continue}e++}if(l)for(e=0;e<i.length;){if(["struct","def","defn"].includes(i[e].value)){for(;i[e].type!=="EOF";){if(i[e].value==="struct"&&i[e].value==="}"){e++;break}if(["def","defn"].includes(i[e].value)&&i[e].value===":;"){e++;break}if(i[e].value===":;"||i[e].value==="}"){e++;break}e++}continue}const r=await this.executeStatement(i,e,s);if(typeof r=="object")break;e=r}else{let r="_main";for(e=0;e<i.length;){if(i[e].value==="entry"){r=i[e+1].value;break}e++}let a=-1;for(e=0;e<i.length;){if(i[e].value===r&&i[e+1]?.value===":"){a=e+2;break}e++}if(a!==-1){const n=this.captureBlock(i,a,u=>{});await this.executeBlock(n,s)}else s({type:"error",message:`Entry point '${r}' not found.`})}}async executeStatement(t,s,l){let i=s;if(i>=t.length)return i;const e=t[i],r=(n=0)=>t[i+n]||{value:"",type:"EOF"},a=()=>t[i++];if(["struct","def","defn"].includes(e.value)){if(e.value==="struct"){for(;r().value!=="}"&&r().type!=="EOF";)a();a()}else{for(;r().value!==":;"&&r().type!=="EOF";)a();a()}return i}if(e.value==="mut"||e.value==="let"){const n=e.value==="mut";a();const u=a().value;a();const c=await this.parseExpression(t,i,o=>i=o,l);return r().value===";"&&a(),this.defineVar(u,c,n),i}if(e.type==="IDENTIFIER"&&r(1)?.value==="["){const n=e.value;a(),a();const u=await this.parseExpression(t,i,c=>i=c,l);if(r().value==="]"&&a(),r().value==="="){a();const c=await this.parseExpression(t,i,o=>i=o,l);return r().value===";"&&a(),this.assignIndex(n,u,c,e.line,l),i}}if(e.type==="IDENTIFIER"&&r(1)?.value==="="){const n=e.value;a(),a();const u=await this.parseExpression(t,i,c=>i=c,l);return r().value===";"&&a(),this.assignVar(n,u,e.line,l),i}if(e.value==="html")return a(),r().value==="{"&&a(),await this.parseHtmlBlock(t,i,n=>i=n,l),r().value==="}"&&a(),i;if(e.value==="if"){a();const n=await this.parseExpression(t,i,o=>i=o,l);r().value===":"&&a();const u=this.captureBlock(t,i,o=>i=o);r().value===":;"&&a();let c=null;if(r().value==="else"&&(a(),r().value===":"&&a(),c=this.captureBlock(t,i,o=>i=o),r().value===":;"&&a()),n){const o=await this.executeBlock(u,l);if(typeof o=="object")return o}else if(c){const o=await this.executeBlock(c,l);if(typeof o=="object")return o}return i}if(e.value==="match"){a();const n=await this.parseExpression(t,i,c=>i=c,l);r().value===":"&&a();let u=!1;for(;r().value!==":;"&&r().type!=="EOF";)if(r().value==="case"){a();const c=await this.parseExpression(t,i,p=>i=p,l);r().value===":"&&a();const o=this.captureBlock(t,i,p=>i=p);if(!u&&n===c){u=!0;const p=await this.executeBlock(o,l);if(typeof p=="object")return p}}else if(r().value==="default"){a(),r().value===":"&&a();const c=this.captureBlock(t,i,o=>i=o);if(!u){u=!0;const o=await this.executeBlock(c,l);if(typeof o=="object")return o}}else i++;return r().value===":;"&&a(),i}if(e.value==="while"){a();const n=i;await this.parseExpression(t,i,o=>i=o,l),r().value===":"&&a();const u=this.captureBlock(t,i,o=>i=o);r().value===":;"&&a();const c=i;for(;;){let o=n;if(!await this.parseExpression(t,o,v=>o=v,l))break;const h=await this.executeBlock(u,l);if(typeof h=="object"){if(h.type==="break")break;if(h.type==="return")return h}await new Promise(v=>setTimeout(v,0))}return c}if(e.value==="for"){a();const n=a().value;a(),r().value==="in"&&a();const u=await this.parseExpression(t,i,o=>i=o,l);r().value===":"&&a();const c=this.captureBlock(t,i,o=>i=o);if(r().value===":;"&&a(),Array.isArray(u)||typeof u=="string")for(const o of u){const p=new Map;p.set(n,{value:o,isMutable:!1}),this.scopeStack.push(p);const h=await this.executeBlock(c,l);if(this.scopeStack.pop(),typeof h=="object"){if(h.type==="break")break;if(h.type==="return")return h}await new Promise(v=>setTimeout(v,0))}return i}if(e.value==="print"){a(),a();const n=[];for(;r().value!==")"&&r().type!=="EOF";){if(r().value===","){a();continue}n.push(await this.parseExpression(t,i,c=>i=c,l))}r().value===")"&&a(),r().value===";"&&a();const u=c=>{if(Array.isArray(c))return`[${c.map(u).join(", ")}]`;if(typeof c=="object"&&c!==null){if(c.__struct_type){const o=Object.keys(c).filter(p=>p!=="__struct_type");return`${c.__struct_type} { ${o.map(p=>`${p}: ${u(c[p])}`).join(", ")} }`}return JSON.stringify(c)}return String(c)};return l({type:"output",message:n.map(u).join(" ")}),i}if(e.value==="return"){a();const n=[];for(;r().type!=="EOF"&&!["def","defn","_main",":;"].includes(r().value)&&(n.push(await this.parseExpression(t,i,u=>i=u,l)),r().value===",");)a();return{type:"return",value:n.length===1?n[0]:n}}return e.value==="break"?(a(),r().value===";"&&a(),{type:"break"}):e.value==="continue"?(a(),r().value===";"&&a(),{type:"continue"}):(a(),i)}async parseHtmlBlock(t,s,l,i){let e=s;const r=(u=0)=>t[e+u]||{value:"",type:"EOF"},a=async()=>{if(r().type!=="IDENTIFIER")return"";const u=t[e].value;e++;let c="";if(r().value==="{"){for(e++;r().value!=="}"&&r().type!=="EOF";)if(r().type==="STRING")c+=t[e].value,e++;else if(r().type==="IDENTIFIER")c+=await a();else if(r().value==="$"){e++;const o=await this.parseExpression(t,e,p=>e=p,i);c+=String(o)}else e++;r().value==="}"&&e++}else if(r().type==="STRING")c=t[e].value,e++;else if(r().value==="$"){e++;const o=await this.parseExpression(t,e,p=>e=p,i);c=String(o)}return`<${u}>${c}</${u}>`};let n="";for(;r().value!=="}"&&r().type!=="EOF";)n+=await a();return l(e),n}captureBlock(t,s,l){let i=s;const e=(u=0)=>t[i+u]||{value:"",type:"EOF"},r=()=>t[i++],a=[];let n=0;for(;i<t.length&&!(t[i].value===":;"&&n===0);)t[i].value===":;"&&n--,t[i].value===":"&&e(1).value!==";"&&n++,a.push(r());return l(i),a}async parseExpression(t,s,l,i){let e=s,r=await this.parseTerm(t,e,a=>e=a,i);for(;e<t.length&&(t[e].type==="OPERATOR"||t[e].value==="??");){const a=t[e].value;e++;const n=await this.parseTerm(t,e,c=>e=c,i);if(["-","*","/","%"].includes(a)&&(isNaN(Number(r))||isNaN(Number(n)))&&i({type:"error",message:`Runtime Warning: Invalid math operation '${r} ${a} ${n}' resulted in NaN`,line:t[e]?.line}),r&&typeof r=="object"&&r.__struct_type){const c=`${r.__struct_type}__${this.opToName(a)}`;if(this.functions.has(c)){r=await this.callFunction(c,[r,n],t[e].line,i);continue}}a==="+"?typeof r=="string"||typeof n=="string"?r=String(r)+String(n):r=r+n:a==="-"?r=r-n:a==="*"?r=r*n:a==="/"?r=r/n:a==="%"?r=r%n:a===">"?r=r>n:a==="<"?r=r<n:a==="=="?r=r===n:a==="!="?r=r!==n:a==="&&"?r=r&&n:a==="||"?r=r||n:a==="??"&&(r=r??n)}return l(e),r}opToName(t){return t==="+"?"add":t==="-"?"sub":t==="*"?"mul":t==="/"?"div":t==="=="?"eq":"op"}async parseTerm(t,s,l,i){let e=s;const r=t[e],a=(n,u=1)=>(l(e+u),n);if(r.type==="STRING"){let n=r.value;return n=n.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g,(u,c)=>{const o=this.getVar(c)?.value;return o!==void 0?String(o):u}),a(n)}if(r.value==="html"){e++,t[e].value==="{"&&e++;const n=await this.parseHtmlBlock(t,e,u=>e=u,i);return t[e]&&t[e].value==="}"&&e++,a(n,0)}if(r.value==="{"){e++;const n={};for(;t[e].value!=="}"&&t[e].type!=="EOF";){const u=t[e].value;e++,t[e].value===":"&&e++,n[u]=await this.parseExpression(t,e,c=>e=c,i),t[e].value===","&&e++}return t[e].value==="}"&&e++,a(n,0)}if(r.value==="["){e++;const n=[];for(;t[e].value!=="]"&&t[e].type!=="EOF";){if(t[e].value===","){e++;continue}n.push(await this.parseExpression(t,e,u=>e=u,i))}return t[e].value==="]"&&e++,a(n,0)}if(r.type==="NUMBER")return a(parseFloat(r.value));if(r.type==="CHAR")return a(r.value);if(r.type==="BOOLEAN")return a(r.value==="True");if(r.type==="IDENTIFIER"&&r.value==="null")return a(null);if(r.value==="input"){const n=t[e+1];if(n&&n.value==="("){e+=2;let u="";t[e].type==="STRING"&&(u=t[e].value,e++),t[e].value===")"&&e++,await new Promise(p=>setTimeout(p,50));const c=prompt(u),o=parseFloat(c||"");return a(isNaN(o)?c:o,0)}}if(r.type==="IDENTIFIER"){const n=t[e+1];if(this.structs.has(r.value)&&n&&n.value==="("){const u=r.value,c=this.structs.get(u);e+=2;const o=[];for(;t[e].value!==")"&&t[e].type!=="EOF";){if(t[e].value===","){e++;continue}o.push(await this.parseExpression(t,e,h=>e=h,i))}e++,o.length!==c.fields.length&&i({type:"error",message:`Struct '${u}' expects ${c.fields.length} arguments, got ${o.length}`,line:r.line});const p={__struct_type:u};return c.fields.forEach((h,v)=>p[h]=o[v]),a(p,0)}if(n&&n.value==="("){const u=r.value;e+=2;const c=[];for(;t[e].value!==")"&&t[e].type!=="EOF";){if(t[e].value===","){e++;continue}c.push(await this.parseExpression(t,e,o=>e=o,i))}return e++,a(await this.callFunction(u,c,r.line,i),0)}if(n&&n.value==="?."){let u=this.getVar(r.value)?.value;for(e+=2;;){if(u==null){for(;t[e]&&(t[e].type==="IDENTIFIER"||t[e].value==="."||t[e].value==="?.");)e++;return a(null,0)}const c=t[e].value;if(e++,u=u[c],t[e]&&t[e].value!=="?.")break;e++}return a(u,0)}if(n&&(n.value==="["||n.value===".")){let u=this.getVar(r.value)?.value;for(e++;e<t.length;)if(t[e].value==="["){e++;const c=await this.parseExpression(t,e,o=>e=o,i);t[e].value==="]"&&e++,u=u?.[c]}else if(t[e].value===".")if(e++,t[e].value==="len")e++,t[e].value==="("&&(e+=2),u=Array.isArray(u)||typeof u=="string"?u.length:0;else{const c=t[e].value;e++,u=u?.[c]}else break;return a(u,0)}return a(this.getVar(r.value)?.value)}return a(null)}async callFunction(t,s,l,i){if(this.nativeFunctions.has(t))return this.nativeFunctions.get(t)(s);const e=this.functions.get(t);if(!e)return i({type:"error",message:`Undefined function '${t}'`,line:l}),null;s.length!==e.params.length&&i({type:"error",message:`Function '${t}' expects ${e.params.length} arguments, got ${s.length}`,line:l}),t.startsWith("is")&&(t.includes("True")&&typeof s[0]!="boolean"&&i({type:"error",message:`Type Error: '${t}' expects Boolean`,line:l}),t.includes('"string"')&&typeof s[0]!="string"&&i({type:"error",message:`Type Error: '${t}' expects String`,line:l}));const r=new Map;e.params.forEach((n,u)=>r.set(n,{value:s[u],isMutable:!1})),this.scopeStack.push(r);const a=await this.executeBlock(e.body,i);return this.scopeStack.pop(),typeof a=="object"&&a.type==="return"?a.value:null}}const E=new I,T=`
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
`;document.querySelector("#app").innerHTML=`
  <div class="container">
    <div id="guide-modal" class="modal hidden">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Kefir Syntax Guide</h2>
          <button id="close-guide">Close</button>
        </div>
        <div class="modal-body">${T}</div>
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
`;const O=document.querySelector("#kf-input"),b=document.querySelector("#code-preview"),d=document.querySelector("#run-btn"),y=document.querySelector("#console-output"),m=document.querySelector("#repl-input"),g=document.querySelector("#guide-modal"),R=document.querySelector("#guide-btn"),B=document.querySelector("#close-guide");R?.addEventListener("click",()=>g?.classList.remove("hidden"));B?.addEventListener("click",()=>g?.classList.add("hidden"));let w="";function x(f,t=!1){if(!y)return;const s=document.createElement("div");s.className=f.type==="error"?"log-error":"log-msg",f.type==="error"?s.innerText=`🛑 ${f.message}`:s.innerText=t?`> ${f.message}`:f.message,y.appendChild(s),y.scrollTop=y.scrollHeight}O?.addEventListener("change",f=>{const t=f.target.files?.[0];if(!t||!t.name.endsWith(".kf")){alert("Please upload a .kf file");return}const s=new FileReader;s.onload=l=>{w=l.target?.result,b&&(b.value=w)},s.readAsText(t)});d?.addEventListener("click",async()=>{w&&(y&&(y.innerHTML='<div class="log-msg">--- Running File ---</div>'),d&&(d.textContent="Running...",d.disabled=!0),await E.evaluate(w,f=>x(f),!1),d&&(d.textContent="Run File",d.disabled=!1))});m?.addEventListener("keydown",async f=>{if(f.key==="Enter"){const t=m.value.trim();if(!t)return;const s=document.createElement("div");s.className="log-msg",s.style.color="#888",s.innerText=`>>> ${t}`,y?.appendChild(s),m.value="",m.disabled=!0,await E.evaluate(t,l=>x(l,!0),!0),m.disabled=!1,m.focus()}});
