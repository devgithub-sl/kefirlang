import fs from 'fs';
import path from 'path';
import { KefirInterpreter } from '../src/interpreter';

const filePath = process.argv[2];
if (!filePath) {
    console.error('Usage: npx tsx scripts/run_file.ts <path-to-file>');
    process.exit(1);
}

const absPath = path.resolve(filePath);
if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    process.exit(1);
}

const code = fs.readFileSync(absPath, 'utf-8');
const interpreter = new KefirInterpreter();

// Mock console output
const log = (entry: any) => {
    if (entry.type === 'error') console.error(`ERR: ${entry.message}`);
    else console.log(entry.message);
};

console.log(`Running ${path.basename(absPath)}...`);
const start = performance.now();
interpreter.evaluate(code, log, false).then(() => {
    const end = performance.now();
    console.log(`\nDone in ${(end - start).toFixed(2)}ms`);
});
