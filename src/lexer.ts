export type TokenType = 
  | 'KEYWORD' | 'IDENTIFIER' | 'NUMBER' | 'STRING' | 'CHAR' | 'BOOLEAN' 
  | 'OPERATOR' | 'PUNCTUATION' | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
}

const KEYWORDS = new Set([
  'entry', 'def', 'defn', 'return', 'print', 
  'if', 'else', 'while', 'for', 'in', 'input', 
  'mut', 'let', 'break', 'continue',
  'struct', 'defer', 'html', 
  'match', 'case', 'default'
]);
const BOOLEANS = new Set(['True', 'False']);

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;
  let line = 1;

  while (cursor < source.length) {
    const char = source[cursor];

    if (/\s/.test(char)) {
      if (char === '\n') line++;
      cursor++;
      continue;
    }

    if (char === '/' && source[cursor + 1] === '/') {
      while (cursor < source.length && source[cursor] !== '\n') cursor++;
      continue;
    }

    if (/[0-9]/.test(char)) {
      let numStr = '';
      while (cursor < source.length && /[0-9.]/.test(source[cursor])) {
        numStr += source[cursor++];
      }
      tokens.push({ type: 'NUMBER', value: numStr, line });
      continue;
    }

    if (char === '"') {
      let str = '';
      cursor++; 
      let closed = false;
      while (cursor < source.length) {
          if (source[cursor] === '"') { closed = true; break; }
          if (source[cursor] === '\n') line++;
          str += source[cursor++];
      }
      if (!closed) { console.error(`Unterminated string at line ${line}`); tokens.push({ type: 'STRING', value: str, line }); return tokens; }
      cursor++; 
      tokens.push({ type: 'STRING', value: str, line });
      continue;
    }

    if (char === "'") {
      let c = '';
      cursor++; 
      if(cursor < source.length) c = source[cursor++];
      if(source[cursor] === "'") cursor++;
      tokens.push({ type: 'CHAR', value: c, line });
      continue;
    }

    if (/[a-zA-Z_]/.test(char)) {
      let word = '';
      while (cursor < source.length && /[a-zA-Z0-9_"]/.test(source[cursor])) {
        word += source[cursor++];
      }
      if (KEYWORDS.has(word)) tokens.push({ type: 'KEYWORD', value: word, line });
      else if (BOOLEANS.has(word)) tokens.push({ type: 'BOOLEAN', value: word, line });
      else tokens.push({ type: 'IDENTIFIER', value: word, line });
      continue;
    }

    const twoChar = source.substr(cursor, 2);
    if ([':;', '==', '!=', '>=', '<=', '&&', '||', '??', '?.', '->'].includes(twoChar)) {
        if ([':;'].includes(twoChar)) tokens.push({ type: 'PUNCTUATION', value: twoChar, line });
        else tokens.push({ type: 'OPERATOR', value: twoChar, line });
        cursor += 2;
        continue;
    }
    
    if (['+', '-', '*', '/', '>', '<', '%'].includes(char)) {
        tokens.push({ type: 'OPERATOR', value: char, line });
        cursor++;
        continue;
    }
    
    if (['=', ';', ':', '(', ')', ',', '.', '[', ']', '{', '}', '$'].includes(char)) {
      tokens.push({ type: 'PUNCTUATION', value: char, line });
      cursor++;
      continue;
    }

    console.warn(`Unknown character: ${char} at line ${line}`);
    cursor++;
  }

  tokens.push({ type: 'EOF', value: '', line });
  return tokens;
}