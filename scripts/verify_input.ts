
import { KefirInterpreter } from '../src/interpreter';

const interpreter = new KefirInterpreter();
interpreter.reset();

// Mock Input Handler
const inputs = ["123", "45.67", "true", "False", "hello"];
let inputIndex = 0;

interpreter.setInputHandler(async (text) => {
    const val = inputs[inputIndex++] || "";
    console.log(`[MockInput] User entered: "${val}"`);
    return val;
});

const code = `
entry _main;
_main:
    mut v1 = input("Enter int:");
    print("v1:", v1, "Type:", typeof(v1));
    
    mut v2 = input("Enter float:");
    print("v2:", v2, "Type:", typeof(v2));

    mut v3 = input("Enter bool true:");
    print("v3:", v3, "Type:", typeof(v3));

    mut v4 = input("Enter bool false:");
    print("v4:", v4, "Type:", typeof(v4));

    mut v5 = input("Enter string:");
    print("v5:", v5, "Type:", typeof(v5));
:;
`;

interpreter.evaluate(code, (l) => {
    if (l.type === 'error') console.error(`[ERROR] ${l.message}`);
    else console.log(l.message);
});
