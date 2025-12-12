(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))l(i);new MutationObserver(i=>{for(const e of i)if(e.type==="childList")for(const r of e.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&l(r)}).observe(document,{childList:!0,subtree:!0});function a(i){const e={};return i.integrity&&(e.integrity=i.integrity),i.referrerPolicy&&(e.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?e.credentials="include":i.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function l(i){if(i.ep)return;i.ep=!0;const e=a(i);fetch(i.href,e)}})();const D=new Set(["entry","def","defn","return","print","if","else","while","for","in","mut","let","const","enum","break","continue","struct","defer","html","match","case","default"]),V=new Set(["True","False","true","false"]);function C(h){const t=[];let a=0,l=1;for(;a<h.length;){const i=h[a];if(/\s/.test(i)){i===`
`&&l++,a++;continue}if(i==="/"&&h[a+1]==="/"){for(;a<h.length&&h[a]!==`
`;)a++;continue}if(/[0-9]/.test(i)){let r="";for(;a<h.length&&/[0-9.]/.test(h[a]);)r+=h[a++];t.push({type:"NUMBER",value:r,line:l});continue}if(i==='"'){let r="";a++;let s=!1;for(;a<h.length;){if(h[a]==='"'){s=!0;break}h[a]===`
`&&l++,r+=h[a++]}if(!s)return console.error(`Lexer Warning: Unterminated string at line ${l}`),t.push({type:"STRING",value:r,line:l}),t;a++,t.push({type:"STRING",value:r,line:l});continue}if(i==="'"){let r="";a++,a<h.length&&(h[a]==="'"||(r=h[a],a++,a<h.length&&h[a]==="'"&&a++)),t.push({type:"CHAR",value:r,line:l});continue}if(/[a-zA-Z_]/.test(i)){let r="";for(;a<h.length&&/[a-zA-Z0-9_"]/.test(h[a]);)r+=h[a++];D.has(r)?t.push({type:"KEYWORD",value:r,line:l}):V.has(r)?t.push({type:"BOOLEAN",value:r,line:l}):t.push({type:"IDENTIFIER",value:r,line:l});continue}const e=h.substr(a,2);if([":;","==","!=",">=","<=","&&","||","??","?.","->"].includes(e)){[":;"].includes(e)?t.push({type:"PUNCTUATION",value:e,line:l}):t.push({type:"OPERATOR",value:e,line:l}),a+=2;continue}if(["+","-","*","/",">","<","%"].includes(i)){t.push({type:"OPERATOR",value:i,line:l}),a++;continue}if(["=",";",":","(",")",",",".","[","]","{","}","$","#"].includes(i)){t.push({type:"PUNCTUATION",value:i,line:l}),a++;continue}a++}return t.push({type:"EOF",value:"",line:l}),t}class P{globalVariables=new Map;functions=new Map;structs=new Map;protocols=new Map;nativeFunctions=new Map;scopeStack=[];opCounter=0;YIELD_THRESHOLD=2e4;lastExpressionResult=void 0;inputHandler=null;constructor(){this.initNativeFunctions(),this.scopeStack=[this.globalVariables]}setInputHandler(t){this.inputHandler=t}reset(t=!1){t||(this.globalVariables.clear(),this.functions.clear(),this.structs.clear(),this.protocols.clear(),this.scopeStack=[this.globalVariables]),this.opCounter=0,this.lastExpressionResult=void 0,this.initNativeFunctions()}async maybeYield(){++this.opCounter>=this.YIELD_THRESHOLD&&(this.opCounter=0,await new Promise(t=>setTimeout(t,0)))}initNativeFunctions(){this.nativeFunctions.clear(),this.nativeFunctions.set("fetch",async t=>{try{const l=await(await fetch(t[0])).text();try{return JSON.parse(l)}catch{return l}}catch{return null}}),this.nativeFunctions.set("sleep",async t=>(await new Promise(a=>setTimeout(a,t[0])),!0)),this.nativeFunctions.set("range",t=>{if(t.length<2)return[];const a=t[0],l=t[1],i=[];for(let e=a;e<l;e++)i.push(e);return i}),this.nativeFunctions.set("floor",t=>Math.floor(t[0])),this.nativeFunctions.set("ceil",t=>Math.ceil(t[0])),this.nativeFunctions.set("sqrt",t=>Math.sqrt(t[0])),this.nativeFunctions.set("random",()=>Math.random()),this.nativeFunctions.set("sin",t=>Math.sin(t[0])),this.nativeFunctions.set("cos",t=>Math.cos(t[0])),this.nativeFunctions.set("upper",t=>String(t[0]).toUpperCase()),this.nativeFunctions.set("lower",t=>String(t[0]).toLowerCase()),this.nativeFunctions.set("trim",t=>String(t[0]).trim()),this.nativeFunctions.set("split",t=>String(t[0]).split(t[1])),this.nativeFunctions.set("replace",t=>String(t[0]).replace(new RegExp(t[1],"g"),t[2])),this.nativeFunctions.set("join",t=>Array.isArray(t[0])?t[0].join(t[1]||""):String(t[0])),this.nativeFunctions.set("reverse",t=>Array.isArray(t[0])?[...t[0]].reverse():t[0]),this.nativeFunctions.set("contains",t=>Array.isArray(t[0])||typeof t[0]=="string"?t[0].includes(t[1]):!1),this.nativeFunctions.set("str",t=>String(t[0])),this.nativeFunctions.set("int",t=>parseInt(t[0])),this.nativeFunctions.set("typeof",t=>Array.isArray(t[0])?"array":t[0]===null?"null":typeof t[0]=="object"&&t[0].__struct_type?t[0].__struct_type:typeof t[0]),this.nativeFunctions.set("len",t=>Array.isArray(t[0])||typeof t[0]=="string"?t[0].length:typeof t[0]=="object"&&t[0]!==null?Object.keys(t[0]).length:0),this.nativeFunctions.set("push",t=>Array.isArray(t[0])?(t[0].push(t[1]),t[0]):null),this.nativeFunctions.set("pop",t=>Array.isArray(t[0])?t[0].pop():null),this.nativeFunctions.set("keys",t=>typeof t[0]=="object"&&t[0]!==null?Object.keys(t[0]):[]),this.nativeFunctions.set("input",async t=>{if(this.inputHandler){const a=await this.inputHandler(t[0]||"");return a===null?null:a==="true"||a==="True"?!0:a==="false"||a==="False"?!1:!isNaN(Number(a))&&a.trim()!==""?Number(a):a}try{if(typeof prompt=="function"){const a=prompt(t[0]||"");return a===null?null:a==="true"||a==="True"?!0:a==="false"||a==="False"?!1:!isNaN(Number(a))&&a.trim()!==""?Number(a):a}}catch{}return"Test Input"})}formatValue(t){if(Array.isArray(t))return`[${t.map(a=>this.formatValue(a)).join(", ")}]`;if(typeof t=="object"&&t!==null){if(t.__struct_type){const a=Object.keys(t).filter(l=>l!=="__struct_type");return`${t.__struct_type} { ${a.map(l=>`${l}: ${this.formatValue(t[l])}`).join(", ")} }`}return JSON.stringify(t)}return String(t)}getVar(t){const a=this.scopeStack.length,l=this.scopeStack[a-1];if(l.has(t))return l.get(t);if(a>1){const i=this.scopeStack[0];if(i.has(t))return i.get(t)}for(let i=a-2;i>0;i--){const e=this.scopeStack[i];if(e.has(t))return e.get(t)}}defineVar(t,a,l,i){this.scopeStack[this.scopeStack.length-1].set(t,{value:a,isMutable:l,type:i})}assignVar(t,a,l,i){const e=this.getVar(t);if(e){if(!e.isMutable){i({type:"error",message:`Runtime Error: Cannot reassign immutable variable '${t}'`,line:l});return}if(e.type&&!this.checkType(a,e.type)){i({type:"error",message:`Type Error: Variable '${t}' expects '${e.type}'`,line:l});return}e.value=a}else this.defineVar(t,a,!1,null)}assignIndex(t,a,l,i,e){const r=this.getVar(t);if(!r||!r.isMutable){e({type:"error",message:`Runtime Error: Cannot mutate '${t}'`,line:i});return}if(Array.isArray(r.value)){if(typeof a!="number"){e({type:"error",message:"Runtime Error: Array index must be a number",line:i});return}if(a<0||a>=r.value.length){e({type:"error",message:`Runtime Error: Index ${a} out of bounds`,line:i});return}r.value[a]=l}else typeof r.value=="object"&&r.value!==null?r.value[a]=l:e({type:"error",message:`Runtime Error: '${t}' is not indexable`,line:i})}checkType(t,a){if(a==="any")return!0;switch(a){case"int":case"float":case"number":return typeof t=="number";case"string":return typeof t=="string";case"bool":case"boolean":return typeof t=="boolean";case"array":return Array.isArray(t);case"object":case"dict":return typeof t=="object"&&t!==null&&!Array.isArray(t);default:return this.structs.has(a)?typeof t=="object"&&t!==null&&t.__struct_type===a:!0}}inferType(t){return t===null?"any":Array.isArray(t)?"array":typeof t=="number"?"number":typeof t=="string"?"string":typeof t=="boolean"?"boolean":typeof t=="object"?t.__struct_type?t.__struct_type:"object":"any"}async executeBlock(t,a){let l=0;const i=[];try{for(;l<t.length;){if(t[l].value==="defer"){l++;let r=[];if(t[l].value==="{"){l++;let s=1;for(;l<t.length&&s>0;)t[l].value==="}"?s--:t[l].value==="{"&&s++,s>0&&r.push(t[l]),l++}else{for(;l<t.length&&t[l].value!==";";)r.push(t[l]),l++;l<t.length&&l++}i.push(r);continue}const e=await this.executeStatement(t,l,a);if(typeof e=="object"&&"type"in e)return e;l=e}}finally{for(;i.length>0;){const e=i.pop();await this.executeBlock(e,a)}}return l}async evaluate(t,a,l=!1){this.reset(l);const i=C(t);let e=0;for(;e<i.length;){const r=i[e];if(r.value==="protocol"){e++;const s=i[e].value;e++,i[e].value==="{"&&e++;const c=[];for(;i[e].value!=="}"&&i[e].type!=="EOF";){if(i[e].value==="def"){e++;const n=i[e].value;e++,i[e].value==="("&&e++;const p=[];for(;i[e].value!==")"&&i[e].type!=="EOF";){if(i[e].value===","){e++;continue}let o=!1;i[e].value==="mut"&&(o=!0,e++);const f=i[e++].value;let v=null;i[e].value===":"&&(e++,v=i[e++].value,i[e].value===":"&&e++),p.push({name:f,type:v,isMutable:o})}i[e].value===")"&&e++;let u=null;i[e].value==="->"&&(e++,i[e].value===":"&&e++,u=i[e++].value,i[e].value===":"&&e++),c.push({name:n,params:p,returnType:u})}e++}i[e].value==="}"&&e++,this.protocols.set(s,{name:s,methods:c});continue}if(r.value==="struct"){e++;const s=i[e].value;e++;const c=[];if(i[e].value===":"||i[e].value==="implements")for(e++;i[e].value!=="{";)i[e].type==="IDENTIFIER"&&c.push(i[e].value),e++;i[e].value==="{"&&e++;const n=[],p=new Map;let u=null;for(;i[e]&&i[e].value!=="}"&&i[e].type!=="EOF";)if(i[e].value==="#"){if(e++,i[e].value==="init"){const o="#init";e++,i[e].value==="("&&e++;const f=[];for(;i[e].value!==")"&&i[e].type!=="EOF";){if(i[e].value===","){e++;continue}let y=!1;i[e].value==="mut"&&(y=!0,e++);const T=i[e++].value;let O=null;i[e].value===":"&&(e++,O=i[e++].value,i[e].value===":"&&e++),f.push({name:T,type:O,isMutable:y})}i[e].value===")"&&e++,i[e].value===":"&&e++;const v=this.captureBlock(i,e,y=>e=y);i[e]?.value===":;"&&e++,u={name:o,params:f,returnType:null,body:v}}}else if(i[e].value==="def"){e++;const o=i[e].value;e++,i[e].value==="("&&e++;const f=[];for(;i[e].value!==")"&&i[e].type!=="EOF";){if(i[e].value===","){e++;continue}let T=!1;i[e].value==="mut"&&(T=!0,e++);const O=i[e++].value;let A=null;i[e].value===":"&&(e++,A=i[e++].value,i[e].value===":"&&e++),f.push({name:O,type:A,isMutable:T})}i[e].value===")"&&e++;let v=null;i[e].value==="->"&&(e++,i[e].value===":"&&e++,v=i[e++].value,i[e].value===":"&&e++),i[e].value===":"&&e++;const y=this.captureBlock(i,e,T=>e=T);i[e]?.value===":;"&&e++,p.set(o,{name:o,params:f,returnType:v,body:y})}else if(i[e].type==="IDENTIFIER"){const o=i[e++].value;let f=null;i[e].value===":"&&(e++,f=i[e++].value,i[e].value===":"&&e++),n.push({name:o,type:f}),i[e].value===","&&e++}else e++;i[e]?.value==="}"&&e++,this.structs.set(s,{name:s,fields:n,methods:p,protocols:c,initializer:u});continue}if(r.value==="def"||r.value==="defn"){e++;const s=i[e].value;e++,i[e].value==="("&&e++;const c=[];for(;i[e].value!==")"&&i[e].type!=="EOF";){if(i[e].value===","){e++;continue}let u=!1;i[e].value==="mut"&&(u=!0,e++);const o=i[e++].value;let f=null;i[e].value===":"&&(e++,f=i[e++].value,i[e].value===":"&&e++),c.push({name:o,type:f,isMutable:u})}i[e].value===")"&&e++;let n=null;i[e].value==="->"&&(e++,i[e].value===":"&&e++,n=i[e++].value,i[e].value===":"&&e++),i[e].value===":"&&e++;const p=this.captureBlock(i,e,u=>e=u);i[e]&&i[e].value===":;"&&e++,this.functions.set(s,{name:s,params:c,returnType:n,body:p});continue}e++}if(l)for(e=0;e<i.length;){if(["struct","def","defn"].includes(i[e].value)){for(;i[e].type!=="EOF";){if(i[e].value==="struct"&&i[e].value==="}"){e++;break}if(["def","defn"].includes(i[e].value)&&i[e].value===":;"){e++;break}if(i[e].value===":;"||i[e].value==="}"){e++;break}e++}continue}const r=await this.executeStatement(i,e,a);if(typeof r=="object"){if(r.type!=="expression_result")break;e=i.findIndex((s,c)=>c>=e&&s.value===";")+1}else this.lastExpressionResult!==void 0&&(a({type:"output",message:`=> ${this.formatValue(this.lastExpressionResult)}`}),this.lastExpressionResult=void 0),e=r}else{let r="_main";for(e=0;e<i.length;){if(i[e].value==="entry"){r=i[e+1].value;break}e++}let s=-1;for(let u=0;u<i.length;u++)if(i[u].value===r&&i[u+1]?.value===":"){s=u;break}let c=0;const n=s!==-1?s:i.length;for(;c<n;){if(i[c].value==="entry"){c+=2;continue}const u=await this.executeStatement(i,c,a);u===c?c++:c=u}let p=s!==-1?s+2:-1;for(e=0;e<i.length;){if(i[e].value===r&&i[e+1]?.value===":"){p=e+2;break}e++}if(p!==-1){const u=this.captureBlock(i,p,o=>{});await this.executeBlock(u,a)}else a({type:"error",message:`Entry point '${r}' not found.`})}}async executeStatement(t,a,l){try{let i=a;if(i>=t.length)return i;const e=t[i],r=(n=0)=>t[i+n]||{value:"",type:"EOF"},s=()=>t[i++];if(["struct","def","defn"].includes(e.value)){if(e.value==="struct"){for(;r().value!=="{"&&r().type!=="EOF";)s();if(r().value==="{"){s();let n=1;for(;n>0&&r().type!=="EOF";)r().value==="{"&&n++,r().value==="}"&&n--,s()}}else{for(;r().value!==":;"&&r().type!=="EOF";)s();s()}return i}if(e.value==="mut"||e.value==="let"||e.value==="const"){const n=e.value==="mut";s();const p=s().value;let u=null;r().value===":"&&(s(),u=s().value,r().value===":"&&s()),r().value==="="&&s();const o=await this.parseExpression(t,i,f=>i=f,l);return r().value===";"&&s(),u&&!this.checkType(o,u)&&l({type:"error",message:`Type Error: Variable '${p}' declared as '${u}' but got ${typeof o}`,line:e.line}),u||(u=this.inferType(o)),this.defineVar(p,o,n,u),this.lastExpressionResult=o,i}if(e.value==="enum"){s();const n=s().value;s(),r().value==="{"&&s();const p={};let u=0;for(;r().value!=="}"&&r().type!=="EOF";)if(r().type==="IDENTIFIER"){const o=s().value;p[o]=u++,r().value===","&&s()}else s();return r().value==="}"&&s(),p.__struct_type="enum",this.defineVar(n,p,!1,"enum"),this.lastExpressionResult=p,i}if(e.type==="IDENTIFIER"&&r(1)?.value==="["){const n=e.value;s(),s();const p=await this.parseExpression(t,i,u=>i=u,l);if(r().value==="]"&&s(),r().value==="="){s();const u=await this.parseExpression(t,i,o=>i=o,l);return r().value===";"&&s(),this.assignIndex(n,p,u,e.line,l),this.lastExpressionResult=u,i}}if(e.type==="IDENTIFIER"&&r(1)?.value==="="){const n=e.value;s(),s();const p=await this.parseExpression(t,i,u=>i=u,l);return r().value===";"&&s(),this.assignVar(n,p,e.line,l),this.lastExpressionResult=p,i}if(e.type==="IDENTIFIER"&&r(1)?.value==="."&&r(2)?.type==="IDENTIFIER"&&r(3)?.value==="="){const n=e.value;s(),s();const p=t[i].value;s(),s();const u=await this.parseExpression(t,i,f=>i=f,l);r().value===";"&&s();const o=this.getVar(n);return o?o.isMutable?typeof o.value=="object"&&o.value!==null?(o.value[p]=u,this.lastExpressionResult=u):(l({type:"error",message:`Runtime Error: '${n}' is not an object`,line:e.line}),this.lastExpressionResult=void 0):l({type:"error",message:`Runtime Error: Cannot mutate immutable variable '${n}'`,line:e.line}):(l({type:"error",message:`Runtime Error: Undefined variable '${n}'`,line:e.line}),this.lastExpressionResult=void 0),i}if(e.value==="html")return s(),r().value==="{"&&s(),await this.parseHtmlBlock(t,i,n=>i=n,l),r().value==="}"&&s(),i;if(e.value==="if"){s();const n=await this.parseExpression(t,i,o=>i=o,l);r().value===":"&&s();const p=this.captureBlock(t,i,o=>i=o);r().value===":;"&&s();let u=null;if(r().value==="else"&&(s(),r().value===":"&&s(),u=this.captureBlock(t,i,o=>i=o),r().value===":;"&&s()),n){const o=await this.executeBlock(p,l);if(typeof o=="object")return o}else if(u){const o=await this.executeBlock(u,l);if(typeof o=="object")return o}return i}if(e.value==="match"){s();const n=await this.parseExpression(t,i,u=>i=u,l);r().value===":"&&s();let p=!1;for(;r().value!==":;"&&r().type!=="EOF";)if(r().value==="case"){s();const u=await this.parseExpression(t,i,f=>i=f,l);r().value===":"&&s();const o=this.captureBlock(t,i,f=>i=f);if(!p&&n===u){p=!0;const f=await this.executeBlock(o,l);if(typeof f=="object")return f}}else if(r().value==="default"){s(),r().value===":"&&s();const u=this.captureBlock(t,i,o=>i=o);if(!p){p=!0;const o=await this.executeBlock(u,l);if(typeof o=="object")return o}}else i++;return r().value===":;"&&s(),i}if(e.value==="while"){s();const n=i;await this.parseExpression(t,i,o=>i=o,l),r().value===":"&&s();const p=this.captureBlock(t,i,o=>i=o);r().value===":;"&&s();const u=i;for(;;){let o=n;if(!await this.parseExpression(t,o,y=>o=y,l))break;const v=await this.executeBlock(p,l);if(typeof v=="object"){if(v.type==="break")break;if(v.type==="return")return v}await this.maybeYield()}return u}if(e.value==="for"){s();const n=s().value;s(),r().value==="in"&&s();const p=await this.parseExpression(t,i,o=>i=o,l);r().value===":"&&s();const u=this.captureBlock(t,i,o=>i=o);if(r().value===":;"&&s(),Array.isArray(p)||typeof p=="string")for(const o of p){const f=new Map;f.set(n,{value:o,isMutable:!1,type:null}),this.scopeStack.push(f);const v=await this.executeBlock(u,l);if(this.scopeStack.pop(),typeof v=="object"){if(v.type==="break")break;if(v.type==="return")return v}await this.maybeYield()}return i}if(e.value==="print"){s(),s();const n=[];for(;r().value!==")"&&r().type!=="EOF";){if(r().value===","){s();continue}n.push(await this.parseExpression(t,i,u=>i=u,l))}r().value===")"&&s(),r().value===";"&&s();const p=u=>{if(Array.isArray(u))return`[${u.map(p).join(", ")}]`;if(typeof u=="object"&&u!==null){if(u.__struct_type){const o=Object.keys(u).filter(f=>f!=="__struct_type");return`${u.__struct_type} { ${o.map(f=>`${f}: ${p(u[f])}`).join(", ")} }`}return JSON.stringify(u)}return String(u)};return l({type:"output",message:n.map(p).join(" ")}),i}if(e.value==="return"){s();const n=[];for(;r().type!=="EOF"&&!["def","defn","_main",":;"].includes(r().value)&&(n.push(await this.parseExpression(t,i,p=>i=p,l)),r().value===",");)s();return{type:"return",value:n.length===1?n[0]:n}}if(e.value==="break")return s(),r().value===";"&&s(),{type:"break"};if(e.value==="continue")return s(),r().value===";"&&s(),{type:"continue"};const c=await this.parseExpression(t,i,n=>i=n,l);return r().value===";"&&s(),c!=null&&(this.lastExpressionResult=c),i}catch(i){return l({type:"error",message:`Statement Error: ${i.message}`,line:t[a]?.line}),a+1}}async parseHtmlBlock(t,a,l,i){let e=a;const r=(n=0)=>t[e+n]||{value:"",type:"EOF"},s=async()=>{if(r().type!=="IDENTIFIER")return"";const n=t[e].value;e++;let p="";if(r().value==="{"){for(e++;r().value!=="}"&&r().type!=="EOF";)if(r().type==="STRING")p+=t[e].value,e++;else if(r().type==="IDENTIFIER")p+=await s();else if(r().value==="$"){e++;const u=await this.parseExpression(t,e,o=>e=o,i);p+=String(u)}else e++;r().value==="}"&&e++}else if(r().type==="STRING")p=t[e].value,e++;else if(r().value==="$"){e++;const u=await this.parseExpression(t,e,o=>e=o,i);p=String(u)}return`<${n}>${p}</${n}>`};let c="";for(;r().value!=="}"&&r().type!=="EOF";)c+=await s();return l(e),c}captureBlock(t,a,l){let i=a;const e=(p=0)=>t[i+p]||{value:"",type:"EOF"},r=()=>t[i++],s=[];let c=0;const n=t[i].value==="{";for(n&&(r(),c=1);i<t.length;){if(t[i].value==="}"&&n&&(c--,c===0)){r();break}if(t[i].value==="{"&&n&&c++,t[i].value===":;"&&c===0&&!n||t[i].value==="else"&&c===0&&!n)break;t[i].value===":;"&&!n&&c--,t[i].value===":"&&e(1).value!==";"&&!n&&c++,s.push(r())}return l(i),s}async parseExpression(t,a,l,i){let e=a;try{let r=await this.parseTerm(t,e,s=>e=s,i);for(;e<t.length&&(t[e].type==="OPERATOR"||t[e].value==="??");){const s=t[e].value;e++;const c=await this.parseTerm(t,e,u=>e=u,i),n=this.opToName(s);if(r&&typeof r=="object"&&r.__struct_type){const u=r.__struct_type,o=this.structs.get(u);if(o&&o.methods.has(n)){const f=o.methods.get(n);r=await this.callMethod(f,r,[c],t[e]?.line||0,i);continue}}if(["-","*","/","%"].includes(s)&&(isNaN(Number(r))||isNaN(Number(c)))){i({type:"error",message:`Runtime Error: Invalid math operation '${r} ${s} ${c}'`}),r=0;continue}s==="+"?typeof r=="number"&&typeof c=="number"?r+=c:r=String(r)+String(c):s==="-"?r=r-c:s==="*"?r=r*c:s==="/"?c===0?(i({type:"error",message:"Runtime Error: Division by zero"}),r=0):r=r/c:s==="%"?r=r%c:s===">"?r=r>c:s==="<"?r=r<c:s===">="?r=r>=c:s==="<="?r=r<=c:s==="=="?r=r===c:s==="!="?r=r!==c:s==="&&"?r=r&&c:s==="||"?r=r||c:s==="??"&&(r=r??c)}return l(e),r}catch(r){return i({type:"error",message:`Expression Error: ${r.message}`}),l(e),null}}opToName(t){return t==="+"?"add":t==="-"?"sub":t==="*"?"mul":t==="/"?"div":t==="%"?"mod":t==="=="?"eq":t==="!="?"neq":t==="<"?"lt":t===">"?"gt":t==="<="?"lte":t===">="?"gte":"op"}async parseTerm(t,a,l,i){let e=a;const r=t[e],s=(c,n=1)=>(l(e+n),c);if(r.type==="STRING"){let c=r.value;return c=c.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*)/g,(n,p)=>{const u=p.split(".");let o=this.getVar(u[0])?.value;for(let f=1;f<u.length;f++)if(o&&typeof o=="object")o=o[u[f]];else{o=void 0;break}return o!==void 0?this.formatValue(o):n}),s(c)}if(r.value==="html"){e++,t[e].value==="{"&&e++;const c=await this.parseHtmlBlock(t,e,n=>e=n,i);return t[e]&&t[e].value==="}"&&e++,s(c,0)}if(r.value==="{"){e++;const c={};for(;t[e].value!=="}"&&t[e].type!=="EOF";){const n=t[e].value;e++,t[e].value===":"&&e++,c[n]=await this.parseExpression(t,e,p=>e=p,i),t[e].value===","&&e++}return t[e].value==="}"&&e++,s(c,0)}if(r.value==="["){e++;const c=[];for(;t[e].value!=="]"&&t[e].type!=="EOF";){if(t[e].value===","){e++;continue}c.push(await this.parseExpression(t,e,n=>e=n,i))}return t[e].value==="]"&&e++,s(c,0)}if(r.type==="NUMBER")return s(parseFloat(r.value));if(r.type==="CHAR")return s(r.value);if(r.type==="BOOLEAN")return s(r.value==="True"||r.value==="true");if(r.type==="IDENTIFIER"&&r.value==="null")return s(null);if(r.type==="IDENTIFIER"){const c=t[e+1];if(this.structs.has(r.value)&&c&&c.value==="("){const n=r.value,p=this.structs.get(n);e+=2;const u=[];for(;t[e].value!==")"&&t[e].type!=="EOF";){if(t[e].value===","){e++;continue}u.push(await this.parseExpression(t,e,f=>e=f,i))}e++;const o={__struct_type:n};if(p.initializer?(u.length!==p.initializer.params.length&&i({type:"error",message:`Constructor for '${n}' expects ${p.initializer.params.length} arguments, got ${u.length}`,line:r.line}),await this.callMethod(p.initializer,o,u,r.line,i)):(u.length!==p.fields.length&&i({type:"error",message:`Struct '${n}' expects ${p.fields.length} arguments, got ${u.length}`,line:r.line}),p.fields.forEach((f,v)=>{f.type&&!this.checkType(u[v],f.type)&&i({type:"error",message:`Type Error: Struct '${n}' field '${f.name}' expects '${f.type}'`,line:r.line}),o[f.name]=u[v]})),p.protocols)for(const f of p.protocols){const v=this.protocols.get(f);if(v)for(const y of v.methods)p.methods.has(y.name)||i({type:"error",message:`Struct '${n}' does not implement protocol method '${y.name}'`,line:r.line})}return s(o,0)}if(c&&c.value==="("){const n=r.value;e+=2;const p=[];for(;t[e].value!==")"&&t[e].type!=="EOF";){if(t[e].value===","){e++;continue}p.push(await this.parseExpression(t,e,u=>e=u,i))}return e++,s(await this.callFunction(n,p,r.line,i),0)}if(c&&c.value==="?."){let n=this.getVar(r.value)?.value;for(e+=2;;){if(n==null){for(;t[e]&&(t[e].type==="IDENTIFIER"||t[e].value==="."||t[e].value==="?.");)e++;return s(null,0)}const p=t[e].value;if(e++,n=n[p],t[e]&&t[e].value!=="?.")break;e++}return s(n,0)}if(c&&(c.value==="["||c.value===".")){let n=this.getVar(r.value)?.value;for(e++;e<t.length;)if(t[e].value==="["){e++;const p=await this.parseExpression(t,e,u=>e=u,i);t[e].value==="]"&&e++,n=n?.[p]}else if(t[e].value===".")if(e++,t[e].value==="len")e++,t[e].value==="("&&(e+=2),n=Array.isArray(n)||typeof n=="string"?n.length:0;else{const p=t[e].value;if(n&&n.__struct_type&&t[e+1]?.value==="("){const u=this.structs.get(n.__struct_type);if(u&&u.methods.has(p)){e++,e++;const o=[];for(;t[e].value!==")"&&t[e].type!=="EOF";){if(t[e].value===","){e++;continue}o.push(await this.parseExpression(t,e,f=>e=f,i))}t[e].value===")"&&e++,n=await this.callMethod(u.methods.get(p),n,o,r.line,i);continue}}e++,n=n?.[p]}else break;return s(n,0)}return s(this.getVar(r.value)?.value)}return s(null)}async callFunction(t,a,l,i){if(this.nativeFunctions.has(t))return this.nativeFunctions.get(t)(a);if(this.structs.has(t)){const r=this.structs.get(t),s={__struct_type:t};return r.fields.forEach(c=>{s[c.name]=null}),r.initializer&&await this.executeFunction(r.initializer,a,l,i,s),s}const e=this.functions.get(t);return e?this.executeFunction(e,a,l,i):(i({type:"error",message:`Undefined function '${t}'`,line:l}),null)}async callMethod(t,a,l,i,e){return this.executeFunction(t,l,i,e,a)}async executeFunction(t,a,l,i,e=null){if(a.length!==t.params.length)return i({type:"error",message:`Function '${t.name}' expects ${t.params.length} arguments, got ${a.length}`,line:l}),null;const r=new Map;e&&r.set("self",{value:e,isMutable:!0,type:null}),t.params.forEach((c,n)=>{c.type&&(this.checkType(a[n],c.type)||i({type:"error",message:`Type Error: Argument '${c.name}' expects type '${c.type}'`,line:l})),r.set(c.name,{value:a[n],isMutable:c.isMutable,type:c.type})}),this.scopeStack.push(r);const s=await this.executeBlock(t.body,i);return this.scopeStack.pop(),typeof s=="object"&&s.type==="return"?(t.returnType&&!this.checkType(s.value,t.returnType)&&i({type:"error",message:`Type Error: Function '${t.name}' returned '${typeof s.value}' but expected '${t.returnType}'`,line:l}),s.value):null}}const R=new P,H=`
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
        <div class="modal-body">${H}</div>
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
`;const q=document.querySelector("#kf-input"),_=document.querySelector("#code-preview"),g=document.querySelector("#run-btn"),U=document.querySelector("#clear-btn"),d=document.querySelector("#console-output"),m=document.querySelector("#repl-input"),S=document.querySelector("#prompt-label"),N=document.querySelector("#guide-modal"),z=document.querySelector("#guide-btn"),K=document.querySelector("#close-guide");z?.addEventListener("click",()=>N?.classList.remove("hidden"));K?.addEventListener("click",()=>N?.classList.add("hidden"));N?.addEventListener("click",h=>{h.target===N&&N.classList.add("hidden")});const $=document.querySelector("#input-modal"),M=document.querySelector("#input-prompt"),F=document.querySelector("#custom-input-field"),B=document.querySelector("#submit-input");async function W(h){return new Promise(t=>{M&&(M.innerText=h||"Input Value:"),$?.classList.remove("hidden"),F?.focus();const a=()=>{const e=F?.value||"";F&&(F.value=""),$?.classList.add("hidden"),i(),t(e)},l=e=>{e.key==="Enter"&&a()},i=()=>{B?.removeEventListener("click",a),F?.removeEventListener("keydown",l)};B?.addEventListener("click",a),F?.addEventListener("keydown",l)})}R.setInputHandler(W);function x(h,t=!1){if(!d)return;const a=document.createElement("div");a.className=h.type==="error"?"log-error":"log-msg",h.type==="error"?a.innerText=`🛑 Line ${h.line||"?"}: ${h.message}`:a.innerText=t?`=> ${h.message}`:h.message,d.appendChild(a),d.scrollTop=d.scrollHeight}q?.addEventListener("change",h=>{const t=h.target.files?.[0];if(!t||!t.name.endsWith(".kf")){alert("Please upload a .kf file");return}const a=new FileReader;a.onload=l=>{_&&l.target?.result&&(_.value=l.target.result)},a.readAsText(t)});g?.addEventListener("click",async()=>{const h=_?.value||"";if(h.trim()){if(d){const t=document.createElement("div");t.className="log-msg",t.style.color="var(--text-accent)",t.style.marginTop="1rem",t.innerText="--- Executing ---",d.appendChild(t)}g&&(g.textContent="Running...",g.disabled=!0),setTimeout(async()=>{await R.evaluate(h,t=>x(t),!1),g&&(g.textContent="▶ Run Code",g.disabled=!1)},50)}});U?.addEventListener("click",()=>{d&&(d.innerHTML="")});const j=localStorage.getItem("kefir_history"),b=j?JSON.parse(j):[];let E=-1,w="",I=0;m?.addEventListener("keydown",async h=>{if(h.key==="ArrowUp")h.preventDefault(),E<b.length-1&&(E++,m.value=b[b.length-1-E]);else if(h.key==="ArrowDown")h.preventDefault(),E>0?(E--,m.value=b[b.length-1-E]):E===0&&(E=-1,m.value="");else if(h.key==="Enter"){const t=m.value,a=t.trim();if(!a&&w==="")return;const l=document.createElement("div");if(l.className="log-input",l.innerText=(w?"... ":">>> ")+t,d?.appendChild(l),d.scrollTop=d.scrollHeight,m.value="",a==="clear"||a==="cls"){d&&(d.innerHTML=""),w="",I=0,S&&(S.innerText=">>>");return}if(a==="help"){x({type:"output",message:"available commands:"}),x({type:"output",message:"  help        : show this help message"}),x({type:"output",message:"  clear / cls : clear the terminal"}),x({type:"output",message:"  print(...)  : print values"}),x({type:"output",message:"  entry _main : define entry point (for full files)"});return}w?w+=`
`+t:w=t,(a.endsWith(":")||a.endsWith("{"))&&I++,(a===":;"||a==="}")&&(I=Math.max(0,I-1)),I>0?S&&(S.innerText="..."):(a!==""&&(b.push(w.trim()),b.length>50&&b.shift(),localStorage.setItem("kefir_history",JSON.stringify(b)),E=-1,m.disabled=!0,setTimeout(async()=>{await R.evaluate(w,i=>x(i,!0),!0),m.disabled=!1,m.focus()},10)),w="",I=0,S&&(S.innerText=">>>"))}});document.querySelector(".repl-panel")?.addEventListener("click",h=>{h.target.tagName!=="BUTTON"&&m?.focus()});
