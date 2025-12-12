
import { KefirInterpreter } from '../src/interpreter';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
    const file = process.argv[2];
    if (!file) {
        console.error("Please provide a file to run");
        process.exit(1);
    }

    const filePath = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
    const content = fs.readFileSync(filePath, 'utf-8');

    const interpreter = new KefirInterpreter();
    interpreter.reset();

    // Mock logs
    const logs: any[] = [];
    const logCallback = (l: any) => {
        logs.push(l);
        if (l.type === 'error') console.error(`[ERROR] Line ${l.line}: ${l.message}`);
        else console.log(l.message);
    };

    console.log(`Running ${path.basename(filePath)}...`);
    await interpreter.evaluate(content, logCallback);
}

run();
