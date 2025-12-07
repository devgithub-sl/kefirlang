# 🥛 KefirLang
```
KefirLang is a robust, interpreted programming language built with TypeScript. It runs entirely in the browser and features a modern syntax inspired by Python, Rust, and Kotlin. It includes a strong runtime type system, an interactive REPL, and unique features like an HTML DSL and Defer blocks.
```

## 🚀 Getting Started

### Installation
1. Clone the repository.
2. Install dependencies:
```bash
npm install
Start the development server:Bashnpm run dev
UsageFile Mode: Upload a .kf file to execute it.REPL Mode: 
Type commands directly into the terminal interface to execute code interactively.
```

#📘 Syntax Documentation
1. Program StructureEvery Kefir program must have an entry point named _main.
```ts
entry _main;

_main:
  print("Hello, Kefir!");
:;
```

2. Variables & Types
```table
Kefir supports Type Hinting and Mutability Control.
Keyword      Mutable? Description   
x = 10       No       Implicit immutable constant.
let x = 10   No       Explicit immutable constant (allows shadowing).
mut x = 10   Yes      Mutable variable.
```

# Type Hinting: You can optionally enforce types using :type: syntax.
```ts
mut age :int: = 25;
let name :string: = "Admin";
mut list :array: = [1, 2];
Supported Types: int, float, string, bool, array, object (or dict), and Struct names.
```
3. Data Structures
# Arrays:
```
mut arr = [10, 20, 30];
push(arr, 40);      // Add item
mut last = pop(arr); // Remove item
print(arr[0]);      // Access
```

# Dictionaries:
```ts
mut user = { name: "Kefir", id: 1 };
print(user["name"]);
print(keys(user)); // Get all keys
```

# Structs: Define custom data containers.
```ts
struct Point { x, y }

mut p = Point(10, 20);
print(p.x);
```

4. Control Flow
# If / Else:
```ts
if x > 10:
  print("High");
:; else:
  print("Low");
:;
```

# Match (Switch):
```ts
match status:
  case 200: print("OK"); :;
  case 404: print("Not Found"); :;
  default: print("Error"); :;
:;
```

# Loops:
```ts
// While Loop
while x > 0:
  x = x - 1;
:;

// For Loop (Iterate Array or String)
for num in [1, 2, 3]:
  print(num);
:;

// Range Loop
for i in range(0, 5):
  print(i);
:;
Flow Control: Use break to exit a loop and continue to skip an iteration.
```

5. Functions
# Functions support parameters, type checking, and return types.
```ts
// Definition
defn add(a :int:, b :int:) -> :int::
  return a + b

// Call
result = add(5, 10);
```

6. Advanced Features
# String Interpolation: Inject variables directly into strings using $.
```ts
mut name = "World";
print("Hello, $name!"); 
```
# Defer: Schedule code to run when the current scope exits (LIFO order). Useful for cleanup.
```ts
defer print("I run last!");
print("I run first.");
```

# Operator Overloading: Define math behavior for custom Structs.
```ts
defn Point__add(p1, p2):
  return Point(p1.x + p2.x, p1.y + p2.y)

// Usage
mut p3 = p1 + p2; // Automatically calls Point__add
```

# Optionals: Handle null values safely.
```ts
// Null Coalescing (Default value)
val = missing ?? "Default";

// Optional Chaining (Safe access)
val = data?.user?.profile?.name;
```

# HTML DSL: Generate HTML strings directly within code.
```ts

mut title = "My Page";
mut view = html {
  div {
    h1 $title
    p "Content goes here"
  }
};
```
# 📚 Standard Library
- FunctionDescription
```bash
print(...)Output text to console.
input(msg)Prompt user for input.
len(obj)Get length of array, string, or dict.
push(arr, val)Add item to array.
pop(arr)Remove last item from array.
keys(dict)Get dictionary keys.
range(s, e)Create array from start to end.
typeof(obj)Return type string.
str(val)Convert to string.
int(val)Convert to integer.
floor(n)Round down.
ceil(n)Round up.
sqrt(n)Square root.
random()Random number 0-1.
```