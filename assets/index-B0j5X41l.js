(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))l(i);new MutationObserver(i=>{for(const e of i)if(e.type==="childList")for(const r of e.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&l(r)}).observe(document,{childList:!0,subtree:!0});function s(i){const e={};return i.integrity&&(e.integrity=i.integrity),i.referrerPolicy&&(e.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?e.credentials="include":i.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function l(i){if(i.ep)return;i.ep=!0;const e=s(i);fetch(i.href,e)}})();const j=new Set(["entry","def","defn","return","print","if","else","while","for","in","mut","let","const","enum","break","continue","struct","defer","html","match","case","default"]),V=new Set(["True","False"]);function C(f){const t=[];let s=0,l=1;for(;s<f.length;){const i=f[s];if(/\s/.test(i)){i===`
`&&l++,s++;continue}if(i==="/"&&f[s+1]==="/"){for(;s<f.length&&f[s]!==`
`;)s++;continue}if(/[0-9]/.test(i)){let r="";for(;s<f.length&&/[0-9.]/.test(f[s]);)r+=f[s++];t.push({type:"NUMBER",value:r,line:l});continue}if(i==='"'){let r="";s++;let a=!1;for(;s<f.length;){if(f[s]==='"'){a=!0;break}f[s]===`
`&&l++,r+=f[s++]}if(!a)return console.error(`Lexer Warning: Unterminated string at line ${l}`),t.push({type:"STRING",value:r,line:l}),t;s++,t.push({type:"STRING",value:r,line:l});continue}if(i==="'"){let r="";s++,s<f.length&&(f[s]==="'"||(r=f[s],s++,s<f.length&&f[s]==="'"&&s++)),t.push({type:"CHAR",value:r,line:l});continue}if(/[a-zA-Z_]/.test(i)){let r="";for(;s<f.length&&/[a-zA-Z0-9_"]/.test(f[s]);)r+=f[s++];j.has(r)?t.push({type:"KEYWORD",value:r,line:l}):V.has(r)?t.push({type:"BOOLEAN",value:r,line:l}):t.push({type:"IDENTIFIER",value:r,line:l});continue}const e=f.substr(s,2);if([":;","==","!=",">=","<=","&&","||","??","?.","->"].includes(e)){[":;"].includes(e)?t.push({type:"PUNCTUATION",value:e,line:l}):t.push({type:"OPERATOR",value:e,line:l}),s+=2;continue}if(["+","-","*","/",">","<","%"].includes(i)){t.push({type:"OPERATOR",value:i,line:l}),s++;continue}if(["=",";",":","(",")",",",".","[","]","{","}","$","#"].includes(i)){t.push({type:"PUNCTUATION",value:i,line:l}),s++;continue}s++}return t.push({type:"EOF",value:"",line:l}),t}class D{globalVariables=new Map;functions=new Map;structs=new Map;protocols=new Map;nativeFunctions=new Map;scopeStack=[];opCounter=0;YIELD_THRESHOLD=2e4;lastExpressionResult=void 0;inputHandler=null;constructor(){this.initNativeFunctions(),this.scopeStack=[this.globalVariables]}setInputHandler(t){this.inputHandler=t}reset(t=!1){t||(this.globalVariables.clear(),this.functions.clear(),this.structs.clear(),this.protocols.clear(),this.scopeStack=[this.globalVariables]),this.opCounter=0,this.lastExpressionResult=void 0,this.initNativeFunctions()}async maybeYield(){++this.opCounter>=this.YIELD_THRESHOLD&&(this.opCounter=0,await new Promise(t=>setTimeout(t,0)))}initNativeFunctions(){this.nativeFunctions.clear(),this.nativeFunctions.set("fetch",async t=>{try{const l=await(await fetch(t[0])).text();try{return JSON.parse(l)}catch{return l}}catch{return null}}),this.nativeFunctions.set("sleep",async t=>(await new Promise(s=>setTimeout(s,t[0])),!0)),this.nativeFunctions.set("range",t=>{if(t.length<2)return[];const s=t[0],l=t[1],i=[];for(let e=s;e<l;e++)i.push(e);return i}),this.nativeFunctions.set("floor",t=>Math.floor(t[0])),this.nativeFunctions.set("ceil",t=>Math.ceil(t[0])),this.nativeFunctions.set("sqrt",t=>Math.sqrt(t[0])),this.nativeFunctions.set("random",()=>Math.random()),this.nativeFunctions.set("sin",t=>Math.sin(t[0])),this.nativeFunctions.set("cos",t=>Math.cos(t[0])),this.nativeFunctions.set("upper",t=>String(t[0]).toUpperCase()),this.nativeFunctions.set("lower",t=>String(t[0]).toLowerCase()),this.nativeFunctions.set("trim",t=>String(t[0]).trim()),this.nativeFunctions.set("split",t=>String(t[0]).split(t[1])),this.nativeFunctions.set("replace",t=>String(t[0]).replace(new RegExp(t[1],"g"),t[2])),this.nativeFunctions.set("join",t=>Array.isArray(t[0])?t[0].join(t[1]||""):String(t[0])),this.nativeFunctions.set("reverse",t=>Array.isArray(t[0])?[...t[0]].reverse():t[0]),this.nativeFunctions.set("contains",t=>Array.isArray(t[0])||typeof t[0]=="string"?t[0].includes(t[1]):!1),this.nativeFunctions.set("str",t=>String(t[0])),this.nativeFunctions.set("int",t=>parseInt(t[0])),this.nativeFunctions.set("typeof",t=>Array.isArray(t[0])?"array":t[0]===null?"null":typeof t[0]=="object"&&t[0].__struct_type?t[0].__struct_type:typeof t[0]),this.nativeFunctions.set("len",t=>Array.isArray(t[0])||typeof t[0]=="string"?t[0].length:typeof t[0]=="object"&&t[0]!==null?Object.keys(t[0]).length:0),this.nativeFunctions.set("push",t=>Array.isArray(t[0])?(t[0].push(t[1]),t[0]):null),this.nativeFunctions.set("pop",t=>Array.isArray(t[0])?t[0].pop():null),this.nativeFunctions.set("keys",t=>typeof t[0]=="object"&&t[0]!==null?Object.keys(t[0]):[]),this.nativeFunctions.set("input",async t=>{if(this.inputHandler)return await this.inputHandler(t[0]||"");try{if(typeof prompt=="function")return prompt(t[0]||"")}catch{}return"Test Input"})}formatValue(t){if(Array.isArray(t))return`[${t.map(s=>this.formatValue(s)).join(", ")}]`;if(typeof t=="object"&&t!==null){if(t.__struct_type){const s=Object.keys(t).filter(l=>l!=="__struct_type");return`${t.__struct_type} { ${s.map(l=>`${l}: ${this.formatValue(t[l])}`).join(", ")} }`}return JSON.stringify(t)}return String(t)}getVar(t){const s=this.scopeStack.length,l=this.scopeStack[s-1];if(l.has(t))return l.get(t);if(s>1){const i=this.scopeStack[0];if(i.has(t))return i.get(t)}for(let i=s-2;i>0;i--){const e=this.scopeStack[i];if(e.has(t))return e.get(t)}}defineVar(t,s,l,i){this.scopeStack[this.scopeStack.length-1].set(t,{value:s,isMutable:l,type:i})}assignVar(t,s,l,i){const e=this.getVar(t);if(e){if(!e.isMutable){i({type:"error",message:`Runtime Error: Cannot reassign immutable variable '${t}'`,line:l});return}if(e.type&&!this.checkType(s,e.type)){i({type:"error",message:`Type Error: Variable '${t}' expects '${e.type}'`,line:l});return}e.value=s}else this.defineVar(t,s,!1,null)}assignIndex(t,s,l,i,e){const r=this.getVar(t);if(!r||!r.isMutable){e({type:"error",message:`Runtime Error: Cannot mutate '${t}'`,line:i});return}if(Array.isArray(r.value)){if(typeof s!="number"){e({type:"error",message:"Runtime Error: Array index must be a number",line:i});return}if(s<0||s>=r.value.length){e({type:"error",message:`Runtime Error: Index ${s} out of bounds`,line:i});return}r.value[s]=l}else typeof r.value=="object"&&r.value!==null?r.value[s]=l:e({type:"error",message:`Runtime Error: '${t}' is not indexable`,line:i})}checkType(t,s){if(s==="any")return!0;switch(s){case"int":case"float":case"number":return typeof t=="number";case"string":return typeof t=="string";case"bool":case"boolean":return typeof t=="boolean";case"array":return Array.isArray(t);case"object":case"dict":return typeof t=="object"&&t!==null&&!Array.isArray(t);default:return this.structs.has(s)?typeof t=="object"&&t!==null&&t.__struct_type===s:!0}}async executeBlock(t,s){let l=0;const i=[];try{for(;l<t.length;){if(t[l].value==="defer"){l++;let r=[];if(t[l].value==="{"){l++;let a=1;for(;l<t.length&&a>0;)t[l].value==="}"?a--:t[l].value==="{"&&a++,a>0&&r.push(t[l]),l++}else{for(;l<t.length&&t[l].value!==";";)r.push(t[l]),l++;l<t.length&&l++}i.push(r);continue}const e=await this.executeStatement(t,l,s);if(typeof e=="object"&&"type"in e)return e;l=e}}finally{for(;i.length>0;){const e=i.pop();await this.executeBlock(e,s)}}return l}async evaluate(t,s,l=!1){this.reset(l);const i=C(t);let e=0;for(;e<i.length;){const r=i[e];if(r.value==="protocol"){e++;const a=i[e].value;e++,i[e].value==="{"&&e++;const c=[];for(;i[e].value!=="}"&&i[e].type!=="EOF";){if(i[e].value==="def"){e++;const n=i[e].value;e++,i[e].value==="("&&e++;const o=[];for(;i[e].value!==")"&&i[e].type!=="EOF";){if(i[e].value===","){e++;continue}const p=i[e++].value;let h=null;i[e].value===":"&&(e++,h=i[e++].value,i[e].value===":"&&e++),o.push({name:p,type:h})}i[e].value===")"&&e++;let u=null;i[e].value==="->"&&(e++,i[e].value===":"&&e++,u=i[e++].value,i[e].value===":"&&e++),c.push({name:n,params:o,returnType:u})}e++}i[e].value==="}"&&e++,this.protocols.set(a,{name:a,methods:c});continue}if(r.value==="struct"){e++;const a=i[e].value;e++;const c=[];if(i[e].value===":"||i[e].value==="implements")for(e++;i[e].value!=="{";)i[e].type==="IDENTIFIER"&&c.push(i[e].value),e++;i[e].value==="{"&&e++;const n=[],o=new Map;let u=null;for(;i[e]&&i[e].value!=="}"&&i[e].type!=="EOF";)if(i[e].value==="#"){if(e++,i[e].value==="init"){const p="#init";e++,i[e].value==="("&&e++;const h=[];for(;i[e].value!==")"&&i[e].type!=="EOF";){if(i[e].value===","){e++;continue}const y=i[e++].value;let T=null;i[e].value===":"&&(e++,T=i[e++].value,i[e].value===":"&&e++),h.push({name:y,type:T})}i[e].value===")"&&e++,i[e].value===":"&&e++;const v=this.captureBlock(i,e,y=>e=y);i[e]?.value===":;"&&e++,u={name:p,params:h,returnType:null,body:v}}}else if(i[e].value==="def"){e++;const p=i[e].value;e++,i[e].value==="("&&e++;const h=[];for(;i[e].value!==")"&&i[e].type!=="EOF";){if(i[e].value===","){e++;continue}const T=i[e++].value;let _=null;i[e].value===":"&&(e++,_=i[e++].value,i[e].value===":"&&e++),h.push({name:T,type:_})}i[e].value===")"&&e++;let v=null;i[e].value==="->"&&(e++,i[e].value===":"&&e++,v=i[e++].value,i[e].value===":"&&e++),i[e].value===":"&&e++;const y=this.captureBlock(i,e,T=>e=T);i[e]?.value===":;"&&e++,o.set(p,{name:p,params:h,returnType:v,body:y})}else if(i[e].type==="IDENTIFIER"){const p=i[e++].value;let h=null;i[e].value===":"&&(e++,h=i[e++].value,i[e].value===":"&&e++),n.push({name:p,type:h}),i[e].value===","&&e++}else e++;i[e]?.value==="}"&&e++,this.structs.set(a,{name:a,fields:n,methods:o,protocols:c,initializer:u});continue}if(r.value==="def"||r.value==="defn"){e++;const a=i[e].value;e++,i[e].value==="("&&e++;const c=[];for(;i[e].value!==")"&&i[e].type!=="EOF";){if(i[e].value===","){e++;continue}const u=i[e++].value;let p=null;i[e].value===":"&&(e++,p=i[e++].value,i[e].value===":"&&e++),c.push({name:u,type:p})}i[e].value===")"&&e++;let n=null;i[e].value==="->"&&(e++,i[e].value===":"&&e++,n=i[e++].value,i[e].value===":"&&e++),i[e].value===":"&&e++;const o=this.captureBlock(i,e,u=>e=u);i[e]&&i[e].value===":;"&&e++,this.functions.set(a,{name:a,params:c,returnType:n,body:o});continue}e++}if(l)for(e=0;e<i.length;){if(["struct","def","defn"].includes(i[e].value)){for(;i[e].type!=="EOF";){if(i[e].value==="struct"&&i[e].value==="}"){e++;break}if(["def","defn"].includes(i[e].value)&&i[e].value===":;"){e++;break}if(i[e].value===":;"||i[e].value==="}"){e++;break}e++}continue}const r=await this.executeStatement(i,e,s);if(typeof r=="object"){if(r.type!=="expression_result")break;e=i.findIndex((a,c)=>c>=e&&a.value===";")+1}else this.lastExpressionResult!==void 0&&(s({type:"output",message:`=> ${this.formatValue(this.lastExpressionResult)}`}),this.lastExpressionResult=void 0),e=r}else{let r="_main";for(e=0;e<i.length;){if(i[e].value==="entry"){r=i[e+1].value;break}e++}let a=-1;for(let u=0;u<i.length;u++)if(i[u].value===r&&i[u+1]?.value===":"){a=u;break}let c=0;const n=a!==-1?a:i.length;for(;c<n;){if(i[c].value==="entry"){c+=2;continue}const u=await this.executeStatement(i,c,s);u===c?c++:c=u}let o=a!==-1?a+2:-1;for(e=0;e<i.length;){if(i[e].value===r&&i[e+1]?.value===":"){o=e+2;break}e++}if(o!==-1){const u=this.captureBlock(i,o,p=>{});await this.executeBlock(u,s)}else s({type:"error",message:`Entry point '${r}' not found.`})}}async executeStatement(t,s,l){try{let i=s;if(i>=t.length)return i;const e=t[i],r=(n=0)=>t[i+n]||{value:"",type:"EOF"},a=()=>t[i++];if(["struct","def","defn"].includes(e.value)){if(e.value==="struct"){for(;r().value!=="{"&&r().type!=="EOF";)a();if(r().value==="{"){a();let n=1;for(;n>0&&r().type!=="EOF";)r().value==="{"&&n++,r().value==="}"&&n--,a()}}else{for(;r().value!==":;"&&r().type!=="EOF";)a();a()}return i}if(e.value==="mut"||e.value==="let"||e.value==="const"){const n=e.value==="mut";a();const o=a().value;let u=null;r().value===":"&&(a(),u=a().value,r().value===":"&&a()),r().value==="="&&a();const p=await this.parseExpression(t,i,h=>i=h,l);return r().value===";"&&a(),u&&!this.checkType(p,u)&&l({type:"error",message:`Type Error: Variable '${o}' declared as '${u}' but got ${typeof p}`,line:e.line}),this.defineVar(o,p,n,u),this.lastExpressionResult=p,i}if(e.value==="enum"){a();const n=a().value;a(),r().value==="{"&&a();const o={};let u=0;for(;r().value!=="}"&&r().type!=="EOF";)if(r().type==="IDENTIFIER"){const p=a().value;o[p]=u++,r().value===","&&a()}else a();return r().value==="}"&&a(),o.__struct_type="enum",this.defineVar(n,o,!1,"enum"),this.lastExpressionResult=o,i}if(e.type==="IDENTIFIER"&&r(1)?.value==="["){const n=e.value;a(),a();const o=await this.parseExpression(t,i,u=>i=u,l);if(r().value==="]"&&a(),r().value==="="){a();const u=await this.parseExpression(t,i,p=>i=p,l);return r().value===";"&&a(),this.assignIndex(n,o,u,e.line,l),this.lastExpressionResult=u,i}}if(e.type==="IDENTIFIER"&&r(1)?.value==="="){const n=e.value;a(),a();const o=await this.parseExpression(t,i,u=>i=u,l);return r().value===";"&&a(),this.assignVar(n,o,e.line,l),this.lastExpressionResult=o,i}if(e.type==="IDENTIFIER"&&r(1)?.value==="."&&r(2)?.type==="IDENTIFIER"&&r(3)?.value==="="){const n=e.value;a(),a();const o=t[i].value;a(),a();const u=await this.parseExpression(t,i,h=>i=h,l);r().value===";"&&a();const p=this.getVar(n);return p?p.isMutable?typeof p.value=="object"&&p.value!==null?(p.value[o]=u,this.lastExpressionResult=u):(l({type:"error",message:`Runtime Error: '${n}' is not an object`,line:e.line}),this.lastExpressionResult=void 0):l({type:"error",message:`Runtime Error: Cannot mutate immutable variable '${n}'`,line:e.line}):(l({type:"error",message:`Runtime Error: Undefined variable '${n}'`,line:e.line}),this.lastExpressionResult=void 0),i}if(e.value==="html")return a(),r().value==="{"&&a(),await this.parseHtmlBlock(t,i,n=>i=n,l),r().value==="}"&&a(),i;if(e.value==="if"){a();const n=await this.parseExpression(t,i,p=>i=p,l);r().value===":"&&a();const o=this.captureBlock(t,i,p=>i=p);r().value===":;"&&a();let u=null;if(r().value==="else"&&(a(),r().value===":"&&a(),u=this.captureBlock(t,i,p=>i=p),r().value===":;"&&a()),n){const p=await this.executeBlock(o,l);if(typeof p=="object")return p}else if(u){const p=await this.executeBlock(u,l);if(typeof p=="object")return p}return i}if(e.value==="match"){a();const n=await this.parseExpression(t,i,u=>i=u,l);r().value===":"&&a();let o=!1;for(;r().value!==":;"&&r().type!=="EOF";)if(r().value==="case"){a();const u=await this.parseExpression(t,i,h=>i=h,l);r().value===":"&&a();const p=this.captureBlock(t,i,h=>i=h);if(!o&&n===u){o=!0;const h=await this.executeBlock(p,l);if(typeof h=="object")return h}}else if(r().value==="default"){a(),r().value===":"&&a();const u=this.captureBlock(t,i,p=>i=p);if(!o){o=!0;const p=await this.executeBlock(u,l);if(typeof p=="object")return p}}else i++;return r().value===":;"&&a(),i}if(e.value==="while"){a();const n=i;await this.parseExpression(t,i,p=>i=p,l),r().value===":"&&a();const o=this.captureBlock(t,i,p=>i=p);r().value===":;"&&a();const u=i;for(;;){let p=n;if(!await this.parseExpression(t,p,y=>p=y,l))break;const v=await this.executeBlock(o,l);if(typeof v=="object"){if(v.type==="break")break;if(v.type==="return")return v}await this.maybeYield()}return u}if(e.value==="for"){a();const n=a().value;a(),r().value==="in"&&a();const o=await this.parseExpression(t,i,p=>i=p,l);r().value===":"&&a();const u=this.captureBlock(t,i,p=>i=p);if(r().value===":;"&&a(),Array.isArray(o)||typeof o=="string")for(const p of o){const h=new Map;h.set(n,{value:p,isMutable:!1,type:null}),this.scopeStack.push(h);const v=await this.executeBlock(u,l);if(this.scopeStack.pop(),typeof v=="object"){if(v.type==="break")break;if(v.type==="return")return v}await this.maybeYield()}return i}if(e.value==="print"){a(),a();const n=[];for(;r().value!==")"&&r().type!=="EOF";){if(r().value===","){a();continue}n.push(await this.parseExpression(t,i,u=>i=u,l))}r().value===")"&&a(),r().value===";"&&a();const o=u=>{if(Array.isArray(u))return`[${u.map(o).join(", ")}]`;if(typeof u=="object"&&u!==null){if(u.__struct_type){const p=Object.keys(u).filter(h=>h!=="__struct_type");return`${u.__struct_type} { ${p.map(h=>`${h}: ${o(u[h])}`).join(", ")} }`}return JSON.stringify(u)}return String(u)};return l({type:"output",message:n.map(o).join(" ")}),i}if(e.value==="return"){a();const n=[];for(;r().type!=="EOF"&&!["def","defn","_main",":;"].includes(r().value)&&(n.push(await this.parseExpression(t,i,o=>i=o,l)),r().value===",");)a();return{type:"return",value:n.length===1?n[0]:n}}if(e.value==="break")return a(),r().value===";"&&a(),{type:"break"};if(e.value==="continue")return a(),r().value===";"&&a(),{type:"continue"};const c=await this.parseExpression(t,i,n=>i=n,l);return r().value===";"&&a(),c!=null&&(this.lastExpressionResult=c),i}catch(i){return l({type:"error",message:`Statement Error: ${i.message}`,line:t[s]?.line}),s+1}}async parseHtmlBlock(t,s,l,i){let e=s;const r=(n=0)=>t[e+n]||{value:"",type:"EOF"},a=async()=>{if(r().type!=="IDENTIFIER")return"";const n=t[e].value;e++;let o="";if(r().value==="{"){for(e++;r().value!=="}"&&r().type!=="EOF";)if(r().type==="STRING")o+=t[e].value,e++;else if(r().type==="IDENTIFIER")o+=await a();else if(r().value==="$"){e++;const u=await this.parseExpression(t,e,p=>e=p,i);o+=String(u)}else e++;r().value==="}"&&e++}else if(r().type==="STRING")o=t[e].value,e++;else if(r().value==="$"){e++;const u=await this.parseExpression(t,e,p=>e=p,i);o=String(u)}return`<${n}>${o}</${n}>`};let c="";for(;r().value!=="}"&&r().type!=="EOF";)c+=await a();return l(e),c}captureBlock(t,s,l){let i=s;const e=(o=0)=>t[i+o]||{value:"",type:"EOF"},r=()=>t[i++],a=[];let c=0;const n=t[i].value==="{";for(n&&(r(),c=1);i<t.length;){if(t[i].value==="}"&&n&&(c--,c===0)){r();break}if(t[i].value==="{"&&n&&c++,t[i].value===":;"&&c===0&&!n)break;t[i].value===":;"&&!n&&c--,t[i].value===":"&&e(1).value!==";"&&!n&&c++,a.push(r())}return l(i),a}async parseExpression(t,s,l,i){let e=s;try{let r=await this.parseTerm(t,e,a=>e=a,i);for(;e<t.length&&(t[e].type==="OPERATOR"||t[e].value==="??");){const a=t[e].value;e++;const c=await this.parseTerm(t,e,o=>e=o,i);if(["-","*","/","%"].includes(a)&&(isNaN(Number(r))||isNaN(Number(c)))){i({type:"error",message:`Runtime Error: Invalid math operation '${r} ${a} ${c}'`}),r=0;continue}if(r&&typeof r=="object"&&r.__struct_type){const o=`${r.__struct_type}__${this.opToName(a)}`;if(this.functions.has(o)){r=await this.callFunction(o,[r,c],t[e]?.line||0,i);continue}}a==="+"?typeof r=="number"&&typeof c=="number"?r+=c:r=String(r)+String(c):a==="-"?r=r-c:a==="*"?r=r*c:a==="/"?c===0?(i({type:"error",message:"Runtime Error: Division by zero"}),r=0):r=r/c:a==="%"?r=r%c:a===">"?r=r>c:a==="<"?r=r<c:a==="=="?r=r===c:a==="!="?r=r!==c:a==="&&"?r=r&&c:a==="||"?r=r||c:a==="??"&&(r=r??c)}return l(e),r}catch(r){return i({type:"error",message:`Expression Error: ${r.message}`}),l(e),null}}opToName(t){return t==="+"?"add":t==="-"?"sub":t==="*"?"mul":t==="/"?"div":t==="=="?"eq":"op"}async parseTerm(t,s,l,i){let e=s;const r=t[e],a=(c,n=1)=>(l(e+n),c);if(r.type==="STRING"){let c=r.value;return c=c.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*)/g,(n,o)=>{const u=o.split(".");let p=this.getVar(u[0])?.value;for(let h=1;h<u.length;h++)if(p&&typeof p=="object")p=p[u[h]];else{p=void 0;break}return p!==void 0?this.formatValue(p):n}),a(c)}if(r.value==="html"){e++,t[e].value==="{"&&e++;const c=await this.parseHtmlBlock(t,e,n=>e=n,i);return t[e]&&t[e].value==="}"&&e++,a(c,0)}if(r.value==="{"){e++;const c={};for(;t[e].value!=="}"&&t[e].type!=="EOF";){const n=t[e].value;e++,t[e].value===":"&&e++,c[n]=await this.parseExpression(t,e,o=>e=o,i),t[e].value===","&&e++}return t[e].value==="}"&&e++,a(c,0)}if(r.value==="["){e++;const c=[];for(;t[e].value!=="]"&&t[e].type!=="EOF";){if(t[e].value===","){e++;continue}c.push(await this.parseExpression(t,e,n=>e=n,i))}return t[e].value==="]"&&e++,a(c,0)}if(r.type==="NUMBER")return a(parseFloat(r.value));if(r.type==="CHAR")return a(r.value);if(r.type==="BOOLEAN")return a(r.value==="True");if(r.type==="IDENTIFIER"&&r.value==="null")return a(null);if(r.type==="IDENTIFIER"){const c=t[e+1];if(this.structs.has(r.value)&&c&&c.value==="("){const n=r.value,o=this.structs.get(n);e+=2;const u=[];for(;t[e].value!==")"&&t[e].type!=="EOF";){if(t[e].value===","){e++;continue}u.push(await this.parseExpression(t,e,h=>e=h,i))}e++;const p={__struct_type:n};if(o.initializer?(u.length!==o.initializer.params.length&&i({type:"error",message:`Constructor for '${n}' expects ${o.initializer.params.length} arguments, got ${u.length}`,line:r.line}),await this.callMethod(o.initializer,p,u,r.line,i)):(u.length!==o.fields.length&&i({type:"error",message:`Struct '${n}' expects ${o.fields.length} arguments, got ${u.length}`,line:r.line}),o.fields.forEach((h,v)=>{h.type&&!this.checkType(u[v],h.type)&&i({type:"error",message:`Type Error: Struct '${n}' field '${h.name}' expects '${h.type}'`,line:r.line}),p[h.name]=u[v]})),o.protocols)for(const h of o.protocols){const v=this.protocols.get(h);if(v)for(const y of v.methods)o.methods.has(y.name)||i({type:"error",message:`Struct '${n}' does not implement protocol method '${y.name}'`,line:r.line})}return a(p,0)}if(c&&c.value==="("){const n=r.value;e+=2;const o=[];for(;t[e].value!==")"&&t[e].type!=="EOF";){if(t[e].value===","){e++;continue}o.push(await this.parseExpression(t,e,u=>e=u,i))}return e++,a(await this.callFunction(n,o,r.line,i),0)}if(c&&c.value==="?."){let n=this.getVar(r.value)?.value;for(e+=2;;){if(n==null){for(;t[e]&&(t[e].type==="IDENTIFIER"||t[e].value==="."||t[e].value==="?.");)e++;return a(null,0)}const o=t[e].value;if(e++,n=n[o],t[e]&&t[e].value!=="?.")break;e++}return a(n,0)}if(c&&(c.value==="["||c.value===".")){let n=this.getVar(r.value)?.value;for(e++;e<t.length;)if(t[e].value==="["){e++;const o=await this.parseExpression(t,e,u=>e=u,i);t[e].value==="]"&&e++,n=n?.[o]}else if(t[e].value===".")if(e++,t[e].value==="len")e++,t[e].value==="("&&(e+=2),n=Array.isArray(n)||typeof n=="string"?n.length:0;else{const o=t[e].value;if(n&&n.__struct_type&&t[e+1]?.value==="("){const u=this.structs.get(n.__struct_type);if(u&&u.methods.has(o)){e++,e++;const p=[];for(;t[e].value!==")"&&t[e].type!=="EOF";){if(t[e].value===","){e++;continue}p.push(await this.parseExpression(t,e,h=>e=h,i))}t[e].value===")"&&e++,n=await this.callMethod(u.methods.get(o),n,p,r.line,i);continue}}e++,n=n?.[o]}else break;return a(n,0)}return a(this.getVar(r.value)?.value)}return a(null)}async callFunction(t,s,l,i){if(this.nativeFunctions.has(t))return this.nativeFunctions.get(t)(s);if(this.structs.has(t)){const r=this.structs.get(t),a={__struct_type:t};return r.fields.forEach(c=>{a[c.name]=null}),r.initializer&&await this.executeFunction(r.initializer,s,l,i,a),a}const e=this.functions.get(t);return e?this.executeFunction(e,s,l,i):(i({type:"error",message:`Undefined function '${t}'`,line:l}),null)}async callMethod(t,s,l,i,e){return this.executeFunction(t,l,i,e,s)}async executeFunction(t,s,l,i,e=null){if(s.length!==t.params.length)return i({type:"error",message:`Function '${t.name}' expects ${t.params.length} arguments, got ${s.length}`,line:l}),null;const r=new Map;e&&r.set("self",{value:e,isMutable:!0,type:null}),t.params.forEach((c,n)=>{c.type&&(this.checkType(s[n],c.type)||i({type:"error",message:`Type Error: Argument '${c.name}' expects type '${c.type}'`,line:l})),r.set(c.name,{value:s[n],isMutable:!1,type:c.type})}),this.scopeStack.push(r);const a=await this.executeBlock(t.body,i);return this.scopeStack.pop(),typeof a=="object"&&a.type==="return"?(t.returnType&&!this.checkType(a.value,t.returnType)&&i({type:"error",message:`Type Error: Function '${t.name}' returned '${typeof a.value}' but expected '${t.returnType}'`,line:l}),a.value):null}}const R=new D,P=`
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
`;document.querySelector("#app").innerHTML=`
  <div class="container">
    <!-- GUIDE MODAL -->
    <div id="guide-modal" class="modal hidden">
      <div class="modal-content">
        <div class="modal-header">
          <h2>📘 Kefir Language Guide</h2>
          <button id="close-guide">Close</button>
        </div>
        <div class="modal-body">${P}</div>
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
`;const H=document.querySelector("#kf-input"),O=document.querySelector("#code-preview"),g=document.querySelector("#run-btn"),q=document.querySelector("#clear-btn"),d=document.querySelector("#console-output"),m=document.querySelector("#repl-input"),S=document.querySelector("#prompt-label"),N=document.querySelector("#guide-modal"),U=document.querySelector("#guide-btn"),z=document.querySelector("#close-guide");U?.addEventListener("click",()=>N?.classList.remove("hidden"));z?.addEventListener("click",()=>N?.classList.add("hidden"));N?.addEventListener("click",f=>{f.target===N&&N.classList.add("hidden")});const $=document.querySelector("#input-modal"),A=document.querySelector("#input-prompt"),F=document.querySelector("#custom-input-field"),B=document.querySelector("#submit-input");async function K(f){return new Promise(t=>{A&&(A.innerText=f||"Input Value:"),$?.classList.remove("hidden"),F?.focus();const s=()=>{const e=F?.value||"";F&&(F.value=""),$?.classList.add("hidden"),i(),t(e)},l=e=>{e.key==="Enter"&&s()},i=()=>{B?.removeEventListener("click",s),F?.removeEventListener("keydown",l)};B?.addEventListener("click",s),F?.addEventListener("keydown",l)})}R.setInputHandler(K);function x(f,t=!1){if(!d)return;const s=document.createElement("div");s.className=f.type==="error"?"log-error":"log-msg",f.type==="error"?s.innerText=`🛑 Line ${f.line||"?"}: ${f.message}`:s.innerText=t?`=> ${f.message}`:f.message,d.appendChild(s),d.scrollTop=d.scrollHeight}H?.addEventListener("change",f=>{const t=f.target.files?.[0];if(!t||!t.name.endsWith(".kf")){alert("Please upload a .kf file");return}const s=new FileReader;s.onload=l=>{O&&l.target?.result&&(O.value=l.target.result)},s.readAsText(t)});g?.addEventListener("click",async()=>{const f=O?.value||"";if(f.trim()){if(d){const t=document.createElement("div");t.className="log-msg",t.style.color="var(--text-accent)",t.style.marginTop="1rem",t.innerText="--- Executing ---",d.appendChild(t)}g&&(g.textContent="Running...",g.disabled=!0),setTimeout(async()=>{await R.evaluate(f,t=>x(t),!1),g&&(g.textContent="▶ Run Code",g.disabled=!1)},50)}});q?.addEventListener("click",()=>{d&&(d.innerHTML="")});const M=localStorage.getItem("kefir_history"),b=M?JSON.parse(M):[];let E=-1,w="",I=0;m?.addEventListener("keydown",async f=>{if(f.key==="ArrowUp")f.preventDefault(),E<b.length-1&&(E++,m.value=b[b.length-1-E]);else if(f.key==="ArrowDown")f.preventDefault(),E>0?(E--,m.value=b[b.length-1-E]):E===0&&(E=-1,m.value="");else if(f.key==="Enter"){const t=m.value,s=t.trim();if(!s&&w==="")return;const l=document.createElement("div");if(l.className="log-input",l.innerText=(w?"... ":">>> ")+t,d?.appendChild(l),d.scrollTop=d.scrollHeight,m.value="",s==="clear"||s==="cls"){d&&(d.innerHTML=""),w="",I=0,S&&(S.innerText=">>>");return}if(s==="help"){x({type:"output",message:"available commands:"}),x({type:"output",message:"  help        : show this help message"}),x({type:"output",message:"  clear / cls : clear the terminal"}),x({type:"output",message:"  print(...)  : print values"}),x({type:"output",message:"  entry _main : define entry point (for full files)"});return}w?w+=`
`+t:w=t,(s.endsWith(":")||s.endsWith("{"))&&I++,(s===":;"||s==="}")&&(I=Math.max(0,I-1)),I>0?S&&(S.innerText="..."):(s!==""&&(b.push(w.trim()),b.length>50&&b.shift(),localStorage.setItem("kefir_history",JSON.stringify(b)),E=-1,m.disabled=!0,setTimeout(async()=>{await R.evaluate(w,i=>x(i,!0),!0),m.disabled=!1,m.focus()},10)),w="",I=0,S&&(S.innerText=">>>"))}});document.querySelector(".repl-panel")?.addEventListener("click",f=>{f.target.tagName!=="BUTTON"&&m?.focus()});
