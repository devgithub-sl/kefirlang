import { tokenize, type Token } from './lexer';

export interface LogEntry {
    type: 'output' | 'error';
    message: string;
    line?: number;
}

interface FunctionDef {
    name: string;
    params: { name: string, type: string | null }[];
    body: Token[];
    returnType: string | null;
}

interface StructDef {
    name: string;
    fields: { name: string, type: string | null }[];
}

interface Variable {
    value: any;
    isMutable: boolean;
    type: string | null;
}

type NativeFunction = (args: any[]) => any;
type ExecutionSignal = { type: 'return' | 'break' | 'continue' | 'expression_result', value?: any };

export class KefirInterpreter {
    private globalVariables: Map<string, Variable> = new Map();
    private functions: Map<string, FunctionDef> = new Map();
    private structs: Map<string, StructDef> = new Map();
    private nativeFunctions: Map<string, NativeFunction> = new Map();
    private scopeStack: Map<string, Variable>[] = [];

    constructor() {
        this.initNativeFunctions();
        this.scopeStack = [this.globalVariables];
    }

    reset(soft = false) {
        if (!soft) {
            this.globalVariables.clear();
            this.functions.clear();
            this.structs.clear();
            this.scopeStack = [this.globalVariables];
        }
        this.initNativeFunctions();
    }

    private initNativeFunctions() {
        this.nativeFunctions.clear();
        this.nativeFunctions.set('fetch', async (args) => {
            try {
                const response = await fetch(args[0]);
                const text = await response.text();
                try { return JSON.parse(text); } catch { return text; }
            } catch (e) { return null; }
        });
        this.nativeFunctions.set('sleep', async (args) => {
            await new Promise(r => setTimeout(r, args[0]));
            return true;
        });
        this.nativeFunctions.set('range', (args) => {
            if (args.length < 2) return [];
            const start = args[0]; const end = args[1];
            const arr = []; for (let i = start; i < end; i++) arr.push(i); return arr;
        });
        this.nativeFunctions.set('floor', (args) => Math.floor(args[0]));
        this.nativeFunctions.set('ceil', (args) => Math.ceil(args[0]));
        this.nativeFunctions.set('sqrt', (args) => Math.sqrt(args[0]));
        this.nativeFunctions.set('random', () => Math.random());
        this.nativeFunctions.set('sin', (args) => Math.sin(args[0]));
        this.nativeFunctions.set('cos', (args) => Math.cos(args[0]));
        // String Utils
        this.nativeFunctions.set('upper', (args) => String(args[0]).toUpperCase());
        this.nativeFunctions.set('lower', (args) => String(args[0]).toLowerCase());
        this.nativeFunctions.set('trim', (args) => String(args[0]).trim());
        this.nativeFunctions.set('split', (args) => String(args[0]).split(args[1]));
        this.nativeFunctions.set('replace', (args) => String(args[0]).replace(new RegExp(args[1], 'g'), args[2]));
        // Array Utils
        this.nativeFunctions.set('join', (args) => Array.isArray(args[0]) ? args[0].join(args[1] || '') : String(args[0]));
        this.nativeFunctions.set('reverse', (args) => Array.isArray(args[0]) ? [...args[0]].reverse() : args[0]);
        this.nativeFunctions.set('contains', (args) => {
            if (Array.isArray(args[0]) || typeof args[0] === 'string') return args[0].includes(args[1]);
            return false;
        });

        this.nativeFunctions.set('str', (args) => String(args[0]));
        this.nativeFunctions.set('int', (args) => parseInt(args[0]));
        this.nativeFunctions.set('typeof', (args) => {
            if (Array.isArray(args[0])) return "array";
            if (args[0] === null) return "null";
            if (typeof args[0] === 'object' && args[0].__struct_type) return args[0].__struct_type;
            return typeof args[0];
        });
        this.nativeFunctions.set('len', (args) => {
            if (Array.isArray(args[0]) || typeof args[0] === 'string') return args[0].length;
            if (typeof args[0] === 'object' && args[0] !== null) return Object.keys(args[0]).length;
            return 0;
        });
        this.nativeFunctions.set('push', (args) => {
            if (Array.isArray(args[0])) { args[0].push(args[1]); return args[0]; }
            return null;
        });
        this.nativeFunctions.set('pop', (args) => {
            if (Array.isArray(args[0])) return args[0].pop();
            return null;
        });
        this.nativeFunctions.set('keys', (args) => {
            if (typeof args[0] === 'object' && args[0] !== null) return Object.keys(args[0]);
            return [];
        });
    }

    private getVar(name: string): Variable | undefined {
        for (let i = this.scopeStack.length - 1; i >= 0; i--) {
            const scope = this.scopeStack[i];
            if (scope.has(name)) return scope.get(name);
        }
        return undefined;
    }

    private defineVar(name: string, val: any, isMutable: boolean, type: string | null) {
        const currentScope = this.scopeStack[this.scopeStack.length - 1];
        currentScope.set(name, { value: val, isMutable, type });
    }

    private assignVar(name: string, val: any, line: number, logCallback: (l: LogEntry) => void) {
        const variable = this.getVar(name);
        if (variable) {
            if (!variable.isMutable) {
                logCallback({ type: 'error', message: `Runtime Error: Cannot reassign immutable variable '${name}'`, line });
                return;
            }
            if (variable.type && !this.checkType(val, variable.type)) {
                logCallback({ type: 'error', message: `Type Error: Variable '${name}' expects '${variable.type}'`, line });
                return;
            }
            variable.value = val;
        } else {
            this.defineVar(name, val, false, null);
        }
    }

    private assignIndex(name: string, index: any, val: any, line: number, logCallback: (l: LogEntry) => void) {
        const variable = this.getVar(name);
        if (!variable || !variable.isMutable) {
            logCallback({ type: 'error', message: `Runtime Error: Cannot mutate '${name}'`, line });
            return;
        }
        if (Array.isArray(variable.value)) {
            if (typeof index !== 'number') {
                logCallback({ type: 'error', message: `Runtime Error: Array index must be a number`, line });
                return;
            }
            if (index < 0 || index >= variable.value.length) {
                logCallback({ type: 'error', message: `Runtime Error: Index ${index} out of bounds`, line });
                return;
            }
            variable.value[index] = val;
        } else if (typeof variable.value === 'object' && variable.value !== null) {
            variable.value[index] = val;
        } else {
            logCallback({ type: 'error', message: `Runtime Error: '${name}' is not indexable`, line });
        }
    }

    private checkType(val: any, typeName: string): boolean {
        if (typeName === 'any') return true;
        switch (typeName) {
            case 'int':
            case 'float':
            case 'number': return typeof val === 'number';
            case 'string': return typeof val === 'string';
            case 'bool':
            case 'boolean': return typeof val === 'boolean';
            case 'array': return Array.isArray(val);
            case 'object':
            case 'dict': return typeof val === 'object' && val !== null && !Array.isArray(val);
            default:
                if (this.structs.has(typeName)) {
                    return typeof val === 'object' && val !== null && val.__struct_type === typeName;
                }
                return true;
        }
    }

    private async executeBlock(tokens: Token[], onLog: (l: LogEntry) => void): Promise<number | ExecutionSignal> {
        let idx = 0;
        const deferStack: Token[][] = [];

        try {
            while (idx < tokens.length) {
                if (tokens[idx].value === 'defer') {
                    idx++;
                    let deferBlock: Token[] = [];
                    if (tokens[idx].value === '{') {
                        idx++;
                        let depth = 1;
                        while (idx < tokens.length && depth > 0) {
                            if (tokens[idx].value === '}') depth--;
                            else if (tokens[idx].value === '{') depth++;
                            if (depth > 0) deferBlock.push(tokens[idx]);
                            idx++;
                        }
                    } else {
                        while (idx < tokens.length && tokens[idx].value !== ';') {
                            deferBlock.push(tokens[idx]);
                            idx++;
                        }
                        if (idx < tokens.length) idx++;
                    }
                    deferStack.push(deferBlock);
                    continue;
                }

                const result = await this.executeStatement(tokens, idx, onLog);

                if (typeof result === 'object' && 'type' in result) {
                    return result;
                }
                idx = result as number;
            }
        } finally {
            while (deferStack.length > 0) {
                const block = deferStack.pop()!;
                await this.executeBlock(block, onLog);
            }
        }
        return idx;
    }

    async evaluate(source: string, onLog: (entry: LogEntry) => void, replMode = false) {
        this.reset(replMode);
        const tokens = tokenize(source);
        let i = 0;

        // Pass 1: Hoisting
        while (i < tokens.length) {
            const token = tokens[i];
            if (token.value === 'struct') {
                i++; const structName = tokens[i].value; i++;
                if (tokens[i].value === '{') i++;
                const fields: { name: string, type: string | null }[] = [];
                while (tokens[i].value !== '}' && tokens[i].type !== 'EOF') {
                    if (tokens[i].type === 'IDENTIFIER') {
                        const fieldName = tokens[i++].value;
                        let fieldType = null;
                        if (tokens[i].value === ':') {
                            i++; fieldType = tokens[i++].value; if (tokens[i].value === ':') i++;
                        }
                        fields.push({ name: fieldName, type: fieldType });
                    } else {
                        i++;
                    }
                }
                if (tokens[i].value === '}') i++;
                this.structs.set(structName, { name: structName, fields });
                continue;
            }
            if (token.value === 'def' || token.value === 'defn') {
                i++; const funcName = tokens[i].value; i++;
                if (tokens[i].value === '(') i++;
                const params: { name: string, type: string | null }[] = [];
                while (tokens[i].value !== ')' && tokens[i].type !== 'EOF') {
                    if (tokens[i].value === ',') { i++; continue; }
                    const paramName = tokens[i++].value;
                    let paramType = null;
                    if (tokens[i].value === ':') {
                        i++; paramType = tokens[i++].value; if (tokens[i].value === ':') i++;
                    }
                    params.push({ name: paramName, type: paramType });
                }
                if (tokens[i].value === ')') i++;

                let returnType = null;
                if (tokens[i].value === '->') {
                    i++; if (tokens[i].value === ':') i++;
                    returnType = tokens[i++].value;
                    if (tokens[i].value === ':') i++;
                }

                if (tokens[i].value === ':') i++;
                const bodyTokens = this.captureBlock(tokens, i, (n) => i = n);
                if (tokens[i] && tokens[i].value === ':;') i++;
                this.functions.set(funcName, { name: funcName, params, returnType, body: bodyTokens });
                continue;
            }
            i++;
        }

        // Pass 2: Execution
        if (!replMode) {
            let entryLabel = '_main';
            i = 0;
            while (i < tokens.length) {
                if (tokens[i].value === 'entry') { entryLabel = tokens[i + 1].value; break; }
                i++;
            }
            let startIndex = -1;
            i = 0;
            while (i < tokens.length) {
                if (tokens[i].value === entryLabel && tokens[i + 1]?.value === ':') { startIndex = i + 2; break; }
                i++;
            }
            if (startIndex !== -1) {
                const mainBody = this.captureBlock(tokens, startIndex, (_) => { });
                await this.executeBlock(mainBody, onLog);
            } else {
                onLog({ type: 'error', message: `Entry point '${entryLabel}' not found.` });
            }
        } else {
            i = 0;
            while (i < tokens.length) {
                if (['struct', 'def', 'defn'].includes(tokens[i].value)) {
                    while (tokens[i].type !== 'EOF') {
                        if (tokens[i].value === 'struct' && tokens[i].value === '}') { i++; break; }
                        if (['def', 'defn'].includes(tokens[i].value) && tokens[i].value === ':;') { i++; break; }
                        if (tokens[i].value === ':;' || tokens[i].value === '}') { i++; break; }
                        i++;
                    }
                    continue;
                }
                const res = await this.executeStatement(tokens, i, onLog);
                if (typeof res === 'object') {
                    if (res.type === 'expression_result' && res.value !== undefined) {
                        const format = (a: any): string => {
                            if (Array.isArray(a)) return `[${a.map(format).join(', ')}]`;
                            if (typeof a === 'object' && a !== null) {
                                if (a.__struct_type) {
                                    const keys = Object.keys(a).filter(k => k !== '__struct_type');
                                    return `${a.__struct_type} { ${keys.map(k => `${k}: ${format(a[k])}`).join(', ')} }`;
                                }
                                return JSON.stringify(a);
                            }
                            return String(a);
                        }
                        onLog({ type: 'output', message: `=> ${format(res.value)}` });
                    }
                    if (res.type !== 'expression_result') break;
                    i = tokens.findIndex((t, index) => index >= i && t.value === ';') + 1;
                } else {
                    i = res as number;
                }
            }
        }
    }

    private async executeStatement(tokens: Token[], startIndex: number, onLog: (l: LogEntry) => void): Promise<number | ExecutionSignal> {
        try {
            let i = startIndex;
            if (i >= tokens.length) return i;
            const token = tokens[i];
            const peek = (offset = 0) => tokens[i + offset] || { value: '', type: 'EOF' };
            const consume = () => tokens[i++];

            if (['struct', 'def', 'defn'].includes(token.value)) {
                if (token.value === 'struct') {
                    while (peek().value !== '}' && peek().type !== 'EOF') consume();
                    consume();
                } else {
                    while (peek().value !== ':;' && peek().type !== 'EOF') consume();
                    consume();
                }
                return i;
            }

            if (token.value === 'mut' || token.value === 'let') {
                const isMutable = token.value === 'mut';
                consume(); const varName = consume().value; consume();
                let declaredType = null;
                if (peek().value === ':') {
                    consume(); declaredType = consume().value; if (peek().value === ':') consume();
                }
                if (peek().value === '=') consume();
                const val = await this.parseExpression(tokens, i, (n) => i = n, onLog);
                if (peek().value === ';') consume();

                if (declaredType && !this.checkType(val, declaredType)) {
                    onLog({ type: 'error', message: `Type Error: Variable '${varName}' declared as '${declaredType}' but got ${typeof val}`, line: token.line });
                }
                this.defineVar(varName, val, isMutable, declaredType);
                return i;
            }

            if (token.type === 'IDENTIFIER' && peek(1)?.value === '[') {
                const varName = token.value; consume(); consume();
                const index = await this.parseExpression(tokens, i, (n) => i = n, onLog);
                if (peek().value === ']') consume();
                if (peek().value === '=') {
                    consume();
                    const val = await this.parseExpression(tokens, i, (n) => i = n, onLog);
                    if (peek().value === ';') consume();
                    this.assignIndex(varName, index, val, token.line, onLog);
                    return i;
                }
            }

            if (token.type === 'IDENTIFIER' && peek(1)?.value === '=') {
                const varName = token.value; consume(); consume();
                const val = await this.parseExpression(tokens, i, (n) => i = n, onLog);
                if (peek().value === ';') consume();
                this.assignVar(varName, val, token.line, onLog);
                return i;
            }

            if (token.value === 'html') {
                consume(); if (peek().value === '{') consume();
                await this.parseHtmlBlock(tokens, i, (n) => i = n, onLog);
                if (peek().value === '}') consume();
                return i;
            }

            if (token.value === 'if') {
                consume();
                const condition = await this.parseExpression(tokens, i, (n) => i = n, onLog);
                if (peek().value === ':') consume();
                const ifBlock = this.captureBlock(tokens, i, (n) => i = n);
                if (peek().value === ':;') consume();
                let elseBlock: Token[] | null = null;
                if (peek().value === 'else') {
                    consume(); if (peek().value === ':') consume();
                    elseBlock = this.captureBlock(tokens, i, (n) => i = n);
                    if (peek().value === ':;') consume();
                }
                if (condition) {
                    const res = await this.executeBlock(ifBlock, onLog);
                    if (typeof res === 'object') return res;
                } else if (elseBlock) {
                    const res = await this.executeBlock(elseBlock, onLog);
                    if (typeof res === 'object') return res;
                }
                return i;
            }

            if (token.value === 'match') {
                consume();
                const matchVal = await this.parseExpression(tokens, i, (n) => i = n, onLog);
                if (peek().value === ':') consume();
                let matched = false;
                while (peek().value !== ':;' && peek().type !== 'EOF') {
                    if (peek().value === 'case') {
                        consume(); const caseVal = await this.parseExpression(tokens, i, (n) => i = n, onLog);
                        if (peek().value === ':') consume();
                        const block = this.captureBlock(tokens, i, (n) => i = n);
                        if (!matched && matchVal === caseVal) {
                            matched = true;
                            const res = await this.executeBlock(block, onLog);
                            if (typeof res === 'object') return res;
                        }
                    }
                    else if (peek().value === 'default') {
                        consume(); if (peek().value === ':') consume();
                        const block = this.captureBlock(tokens, i, (n) => i = n);
                        if (!matched) {
                            matched = true;
                            const res = await this.executeBlock(block, onLog);
                            if (typeof res === 'object') return res;
                        }
                    }
                    else { i++; }
                }
                if (peek().value === ':;') consume();
                return i;
            }

            if (token.value === 'while') {
                consume(); const conditionStart = i;
                await this.parseExpression(tokens, i, (n) => i = n, onLog);
                if (peek().value === ':') consume();
                const loopBody = this.captureBlock(tokens, i, (n) => i = n);
                if (peek().value === ':;') consume();
                const loopEnd = i;
                while (true) {
                    let tempI = conditionStart;
                    const cond = await this.parseExpression(tokens, tempI, (n) => tempI = n, onLog);
                    if (!cond) break;
                    const res = await this.executeBlock(loopBody, onLog);
                    if (typeof res === 'object') {
                        if (res.type === 'break') break;
                        if (res.type === 'return') return res;
                    }
                    await new Promise(r => setTimeout(r, 0));
                }
                return loopEnd;
            }

            if (token.value === 'for') {
                consume(); const loopVar = consume().value; consume();
                if (peek().value === 'in') consume();
                const iterable = await this.parseExpression(tokens, i, (n) => i = n, onLog);
                if (peek().value === ':') consume();
                const loopBody = this.captureBlock(tokens, i, (n) => i = n);
                if (peek().value === ':;') consume();
                if (Array.isArray(iterable) || typeof iterable === 'string') {
                    for (const item of iterable) {
                        const loopScope = new Map<string, Variable>();
                        loopScope.set(loopVar, { value: item, isMutable: false, type: null });
                        this.scopeStack.push(loopScope);
                        const res = await this.executeBlock(loopBody, onLog);
                        this.scopeStack.pop();
                        if (typeof res === 'object') {
                            if (res.type === 'break') break;
                            if (res.type === 'return') return res;
                        }
                        await new Promise(r => setTimeout(r, 0));
                    }
                }
                return i;
            }

            if (token.value === 'print') {
                consume(); consume();
                const args: any[] = [];
                while (peek().value !== ')' && peek().type !== 'EOF') {
                    if (peek().value === ',') { consume(); continue; }
                    args.push(await this.parseExpression(tokens, i, (n) => i = n, onLog));
                }
                if (peek().value === ')') consume();
                if (peek().value === ';') consume();
                const format = (a: any): string => {
                    if (Array.isArray(a)) return `[${a.map(format).join(', ')}]`;
                    if (typeof a === 'object' && a !== null) {
                        if (a.__struct_type) {
                            const keys = Object.keys(a).filter(k => k !== '__struct_type');
                            return `${a.__struct_type} { ${keys.map(k => `${k}: ${format(a[k])}`).join(', ')} }`;
                        }
                        return JSON.stringify(a);
                    }
                    return String(a);
                }
                onLog({ type: 'output', message: args.map(format).join(' ') });
                return i;
            }

            if (token.value === 'return') {
                consume();
                const returns: any[] = [];
                while (peek().type !== 'EOF' && !['def', 'defn', '_main', ':;'].includes(peek().value)) {
                    returns.push(await this.parseExpression(tokens, i, (n) => i = n, onLog));
                    if (peek().value === ',') consume(); else break;
                }
                return { type: 'return', value: returns.length === 1 ? returns[0] : returns };
            }
            if (token.value === 'break') { consume(); if (peek().value === ';') consume(); return { type: 'break' }; }
            if (token.value === 'continue') { consume(); if (peek().value === ';') consume(); return { type: 'continue' }; }

            const expressionValue = await this.parseExpression(tokens, i, (n) => i = n, onLog);

            if (peek().value === ';') consume();

            if (expressionValue !== undefined && expressionValue !== null) {
                return { type: 'expression_result', value: expressionValue };
            }

            return i;
        } catch (e: any) {
            onLog({ type: 'error', message: `Statement Error: ${e.message}`, line: tokens[startIndex]?.line });
            return startIndex + 1; // Safely advance
        }
    }

    // ... (HTML, CaptureBlock, ParseExpression, ParseTerm, CallFunction same as previous robust version)
    private async parseHtmlBlock(tokens: Token[], startIndex: number, advance: (i: number) => void, onLog: (l: LogEntry) => void): Promise<string> {
        let i = startIndex;
        const safePeek = (offset = 0) => tokens[i + offset] || { value: '', type: 'EOF' };
        const parseTag = async (): Promise<string> => {
            if (safePeek().type !== 'IDENTIFIER') return "";
            const tagName = tokens[i].value;
            i++;
            let content = "";
            if (safePeek().value === '{') {
                i++;
                while (safePeek().value !== '}' && safePeek().type !== 'EOF') {
                    if (safePeek().type === 'STRING') { content += tokens[i].value; i++; }
                    else if (safePeek().type === 'IDENTIFIER') { content += await parseTag(); }
                    else if (safePeek().value === '$') {
                        i++;
                        const val = await this.parseExpression(tokens, i, (n) => i = n, onLog);
                        content += String(val);
                    } else { i++; }
                }
                if (safePeek().value === '}') i++;
            }
            else if (safePeek().type === 'STRING') { content = tokens[i].value; i++; }
            else if (safePeek().value === '$') {
                i++;
                const val = await this.parseExpression(tokens, i, (n) => i = n, onLog);
                content = String(val);
            }
            return `<${tagName}>${content}</${tagName}>`;
        };
        let html = "";
        while (safePeek().value !== '}' && safePeek().type !== 'EOF') { html += await parseTag(); }
        advance(i);
        return html;
    }

    private captureBlock(tokens: Token[], startIndex: number, advance: (i: number) => void): Token[] {
        let i = startIndex;
        const peek = (offset = 0) => tokens[i + offset] || { value: '', type: 'EOF' };
        const consume = () => tokens[i++];
        const block: Token[] = [];
        let depth = 0;
        while (i < tokens.length) {
            if (tokens[i].value === ':;' && depth === 0) break;
            if (tokens[i].value === ':;') depth--;
            if (tokens[i].value === ':' && peek(1).value !== ';') depth++;
            block.push(consume());
        }
        advance(i);
        return block;
    }

    private async parseExpression(tokens: Token[], startIndex: number, advance: (i: number) => void, onLog: (l: LogEntry) => void): Promise<any> {
        let i = startIndex;
        try {
            let left = await this.parseTerm(tokens, i, (n) => i = n, onLog);
            while (i < tokens.length && (tokens[i].type === 'OPERATOR' || tokens[i].value === '??')) {
                const op = tokens[i].value;
                i++;
                const right = await this.parseTerm(tokens, i, (n) => i = n, onLog);

                const isMath = ['-', '*', '/', '%'].includes(op);
                if (isMath && (isNaN(Number(left)) || isNaN(Number(right)))) {
                    onLog({ type: 'error', message: `Runtime Error: Invalid math operation '${left} ${op} ${right}'` });
                    left = 0;
                    continue; // Soft fail
                }

                if (left && typeof left === 'object' && left.__struct_type) {
                    const method = `${left.__struct_type}__${this.opToName(op)}`;
                    if (this.functions.has(method)) {
                        left = await this.callFunction(method, [left, right], tokens[i]?.line || 0, onLog);
                        continue;
                    }
                }

                if (op === '+') {
                    if (typeof left === 'number' && typeof right === 'number') left += right;
                    else left = String(left) + String(right);
                }
                else if (op === '-') left = left - right;
                else if (op === '*') left = left * right;
                else if (op === '/') {
                    if (right === 0) {
                        onLog({ type: 'error', message: `Runtime Error: Division by zero` });
                        left = 0;
                    } else {
                        left = left / right;
                    }
                }
                else if (op === '%') left = left % right;
                else if (op === '>') left = left > right;
                else if (op === '<') left = left < right;
                else if (op === '==') left = left === right;
                else if (op === '!=') left = left !== right;
                else if (op === '&&') left = left && right;
                else if (op === '||') left = left || right;
                else if (op === '??') left = (left === null || left === undefined) ? right : left;
            }
            advance(i);
            return left;
        } catch (e: any) {
            onLog({ type: 'error', message: `Expression Error: ${e.message}` });
            advance(i);
            return null;
        }
    }

    private inputCallback: ((prompt: string) => Promise<string | null>) | null = null;

    setInputHandler(handler: (prompt: string) => Promise<string | null>) {
        this.inputCallback = handler;
    }

    private opToName(op: string) {
        if (op === '+') return 'add';
        if (op === '-') return 'sub';
        if (op === '*') return 'mul';
        if (op === '/') return 'div';
        if (op === '==') return 'eq';
        return 'op';
    }

    private async parseTerm(tokens: Token[], startIndex: number, advance: (i: number) => void, onLog: (l: LogEntry) => void): Promise<any> {
        let i = startIndex;
        const token = tokens[i];
        const done = (val: any, offset = 1) => { advance(i + offset); return val; };

        if (token.type === 'STRING') {
            let str = token.value;
            str = str.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, name) => {
                const val = this.getVar(name)?.value;
                return val !== undefined ? String(val) : match;
            });
            return done(str);
        }

        if (token.value === 'html') {
            i++; if (tokens[i].value === '{') i++;
            const html = await this.parseHtmlBlock(tokens, i, (n) => i = n, onLog);
            if (tokens[i] && tokens[i].value === '}') i++;
            return done(html, 0);
        }

        if (token.value === '{') {
            i++; const dict: any = {};
            while (tokens[i].value !== '}' && tokens[i].type !== 'EOF') {
                const key = tokens[i].value; i++;
                if (tokens[i].value === ':') i++;
                dict[key] = await this.parseExpression(tokens, i, (n) => i = n, onLog);
                if (tokens[i].value === ',') i++;
            }
            if (tokens[i].value === '}') i++;
            return done(dict, 0);
        }

        if (token.value === '[') {
            i++; const elements: any[] = [];
            while (tokens[i].value !== ']' && tokens[i].type !== 'EOF') {
                if (tokens[i].value === ',') { i++; continue; }
                elements.push(await this.parseExpression(tokens, i, (n) => i = n, onLog));
            }
            if (tokens[i].value === ']') i++;
            return done(elements, 0);
        }

        if (token.type === 'NUMBER') return done(parseFloat(token.value));
        if (token.type === 'CHAR') return done(token.value);
        if (token.type === 'BOOLEAN') return done(token.value === 'True');
        if (token.type === 'IDENTIFIER' && token.value === 'null') return done(null);

        if (token.value === 'input') {
            const next = tokens[i + 1];
            if (next && next.value === '(') {
                i += 2; let promptText = "";
                if (tokens[i].type === 'STRING') { promptText = tokens[i].value; i++; }
                if (tokens[i].value === ')') i++;
                await new Promise(resolve => setTimeout(resolve, 50));

                let userInput: string | null = "";
                if (this.inputCallback) {
                    userInput = await this.inputCallback(promptText);
                } else {
                    userInput = prompt(promptText);
                }

                const num = parseFloat(userInput || "");
                return done(!isNaN(num) ? num : userInput, 0);
            }
        }

        if (token.type === 'IDENTIFIER') {
            const next = tokens[i + 1];
            if (this.structs.has(token.value) && next && next.value === '(') {
                const structName = token.value;
                const def = this.structs.get(structName)!;
                i += 2;
                const args: any[] = [];
                while (tokens[i].value !== ')' && tokens[i].type !== 'EOF') {
                    if (tokens[i].value === ',') { i++; continue; }
                    args.push(await this.parseExpression(tokens, i, (n) => i = n, onLog));
                }
                i++;
                if (args.length !== def.fields.length) {
                    onLog({ type: 'error', message: `Struct '${structName}' expects ${def.fields.length} arguments, got ${args.length}`, line: token.line });
                }
                const instance: any = { __struct_type: structName };
                def.fields.forEach((f, idx) => {
                    if (f.type && !this.checkType(args[idx], f.type)) {
                        onLog({ type: 'error', message: `Type Error: Struct '${structName}' field '${f.name}' expects '${f.type}'`, line: token.line });
                    }
                    instance[f.name] = args[idx];
                });
                return done(instance, 0);
            }
            if (next && next.value === '(') {
                const funcName = token.value; i += 2;
                const args: any[] = [];
                while (tokens[i].value !== ')' && tokens[i].type !== 'EOF') {
                    if (tokens[i].value === ',') { i++; continue; }
                    args.push(await this.parseExpression(tokens, i, (n) => i = n, onLog));
                }
                i++;
                return done(await this.callFunction(funcName, args, token.line, onLog), 0);
            }
            if (next && next.value === '?.') {
                let obj = this.getVar(token.value)?.value;
                i += 2;
                while (true) {
                    if (obj === null || obj === undefined) {
                        while (tokens[i] && (tokens[i].type === 'IDENTIFIER' || tokens[i].value === '.' || tokens[i].value === '?.')) i++;
                        return done(null, 0);
                    }
                    const prop = tokens[i].value; i++;
                    obj = obj[prop];
                    if (tokens[i] && tokens[i].value !== '?.') break;
                    i++;
                }
                return done(obj, 0);
            }
            if (next && (next.value === '[' || next.value === '.')) {
                let obj = this.getVar(token.value)?.value;
                i++;
                while (i < tokens.length) {
                    if (tokens[i].value === '[') {
                        i++;
                        const idx = await this.parseExpression(tokens, i, (n) => i = n, onLog);
                        if (tokens[i].value === ']') i++;
                        obj = obj?.[idx];
                    }
                    else if (tokens[i].value === '.') {
                        i++;
                        if (tokens[i].value === 'len') {
                            i++;
                            if (tokens[i].value === '(') i += 2;
                            obj = (Array.isArray(obj) || typeof obj === 'string') ? obj.length : 0;
                        } else {
                            const prop = tokens[i].value; i++;
                            obj = obj?.[prop];
                        }
                    }
                    else break;
                }
                return done(obj, 0);
            }
            return done(this.getVar(token.value)?.value);
        }
        return done(null);
    }

    private async callFunction(name: string, args: any[], line: number, onLog: (l: LogEntry) => void): Promise<any> {
        if (this.nativeFunctions.has(name)) return this.nativeFunctions.get(name)!(args);
        const func = this.functions.get(name);
        if (!func) { onLog({ type: 'error', message: `Undefined function '${name}'`, line }); return null; }
        if (args.length !== func.params.length) {
            onLog({ type: 'error', message: `Function '${name}' expects ${func.params.length} arguments, got ${args.length}`, line });
            return null; // Stop execution if arity mismatch
        }
        const localScope = new Map<string, Variable>();
        func.params.forEach((p, idx) => {
            if (p.type) {
                if (!this.checkType(args[idx], p.type)) {
                    onLog({ type: 'error', message: `Type Error: Argument '${p.name}' expects type '${p.type}'`, line });
                }
            }
            localScope.set(p.name, { value: args[idx], isMutable: false, type: p.type });
        });
        if (name.startsWith('is')) {
            if (name.includes('True') && typeof args[0] !== 'boolean') onLog({ type: 'error', message: `Type Error: '${name}' expects Boolean`, line });
            if (name.includes('"string"') && typeof args[0] !== 'string') onLog({ type: 'error', message: `Type Error: '${name}' expects String`, line });
        }
        this.scopeStack.push(localScope);
        const result = await this.executeBlock(func.body, onLog);
        this.scopeStack.pop();
        if (typeof result === 'object' && result.type === 'return') {
            if (func.returnType && !this.checkType(result.value, func.returnType)) {
                onLog({ type: 'error', message: `Type Error: Function '${name}' returned '${typeof result.value}' but expected '${func.returnType}'`, line });
            }
            return result.value;
        }
        return null;
    }
}