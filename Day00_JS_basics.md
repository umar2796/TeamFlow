# TEAMFLOW — Angular Enterprise Journey
## Day 5 Notes: JavaScript Gap-Fill — Complete Reference (Self-Study)

> **How to use this file:** Each topic follows: **Explain → Why/How/When → Quiz + Answers**. Easy/familiar topics are kept short. Topics that are commonly interview-tricky or directly power Angular patterns get full depth. Read top to bottom — later topics sometimes build on earlier ones (e.g., Spread builds on Destructuring).

---

## 1. Variable Declarations — `var` / `let` / `const` (Syntax Recap)

**Explain:** `var` — function-scoped, re-assignable, re-declarable. `let` — block-scoped, re-assignable, not re-declarable in same scope. `const` — block-scoped, cannot be re-assigned (but object/array contents CAN still be mutated).

**Why/How/When:** Use `const` by default always. Use `let` only when you know the variable must change (loop counters, accumulating values). Never use `var` in modern/enterprise code.

```javascript
const user = { name: 'Rahul' };
user.name = 'Aman'; // ✅ allowed — mutating contents, not reassigning the variable
user = {};           // ❌ TypeError: Assignment to constant variable
```

**Quiz:**
Q: Why does `const arr = [1,2,3]; arr.push(4);` work without error?
A: `const` prevents reassigning what `arr` points to, not mutating the contents at that reference. `push()` mutates the array in place — the variable `arr` still points to the same array, so no reassignment occurred.

---

## 2. Data Types — Primitives vs Reference Types

**Explain:** **Primitives** (string, number, boolean, `null`, `undefined`, `symbol`, `bigint`) are stored **by value** — copying creates a fully independent copy. **Reference types** (object, array, function) are stored **by reference** — copying copies the *pointer*, not the contents.

```javascript
let a = 5;
let b = a;
b = 10;
console.log(a); // 5 — unaffected, primitives copy by value

let obj1 = { x: 1 };
let obj2 = obj1;
obj2.x = 99;
console.log(obj1.x); // 99 — SAME object in memory, both variables point to it
```

**Why/How/When:** This is the exact root cause of Angular's `OnPush` reference-equality bugs discussed on Day 4 — understanding value-vs-reference copying is foundational to understanding why immutability patterns matter.

**Quiz:**
Q: Why does mutating `obj2` also change what `obj1` shows, but mutating `b` doesn't change `a`?
A: `obj1`/`obj2` are two variable names pointing to the **same object in memory** (reference type) — mutating through either name affects the one shared object. `a`/`b` are independent primitive values (value type) — reassigning `b` has zero effect on `a`.

---

## 3. Operators — Arithmetic, Comparison, Logical, Ternary (Quick Recap)

**Explain:** Standard arithmetic (`+ - * / % **`), comparison (`< > <= >=`, `== ===`), logical (`&& || !`), ternary (`condition ? a : b`).

**Why/How/When:** You've already used all of these correctly throughout Week 1 — this entry exists only for completeness. The one operator worth a specific callout: **nullish coalescing `??`** (covered in depth in section 8) is often confused with `||` — don't skip that section even though this one is brief.

**Quiz:**
Q: What does `5 % 2` evaluate to, and what is this operator called?
A: `1` — the **modulo/remainder** operator, returns what's left over after division.

---

## 4. Control Flow — `if/else`, `switch`, `for`, `while`, `do-while`

**Explain:** Standard control flow. One enterprise-relevant note: `switch` uses `===` (strict equality) internally for its case matching, not `==`.

**Why/How/When:** In Angular templates, you'll often replace `if/else` chains with `*ngIf`/`@if` (control flow syntax) and `switch` with `*ngSwitch`/`@switch` — same logic, template-syntax equivalents (Week 3).

**Quiz:**
Q: Does `switch(5) { case '5': ... }` match the case `'5'` when the switch value is the number `5`?
A: No — `switch` uses strict equality (`===`), and `5 === '5'` is `false` (different types), so this case would NOT match.

---

## 5. Destructuring — Object & Array (HIGH PRIORITY — used constantly in Angular)

**Explain:** A shorthand syntax to "unpack" values from objects/arrays directly into named variables, instead of accessing them one property at a time.

```javascript
// Object destructuring
const task = { title: 'Design', priority: 3, status: 'todo' };
const { title, priority } = task;
console.log(title); // 'Design' — instead of task.title

// With renaming
const { title: taskTitle } = task;
console.log(taskTitle); // 'Design'

// With default values
const { assignee = 'Unassigned' } = task; // task.assignee doesn't exist → uses default
console.log(assignee); // 'Unassigned'

// Array destructuring — position-based, not name-based
const colors = ['red', 'green', 'blue'];
const [first, second] = colors;
console.log(first, second); // 'red' 'green'

// Nested destructuring
const project = { name: 'TEAMFLOW', owner: { name: 'Aman', id: 1 } };
const { owner: { name: ownerName } } = project;
console.log(ownerName); // 'Aman'

// Function parameter destructuring — VERY common in Angular
function createTask({ title, priority }) {
  console.log(title, priority);
}
createTask({ title: 'Test', priority: 2 });
```

**Why/How/When:** Used constantly in Angular for: extracting values from HTTP response objects, destructuring `@Input()` config objects, extracting route params (`const { id } = this.route.snapshot.params`), and RxJS operator callbacks. It's not optional syntax sugar — it's the enterprise-standard way to read structured data.

**Quiz:**
Q1: Given `const { a, b = 10 } = { a: 5 }`, what are the values of `a` and `b`?
A1: `a = 5`, `b = 10` (default used since `b` doesn't exist on the object).

Q2: Given `const [x, , z] = [1, 2, 3]`, what does `z` equal? (Note the empty slot.)
A2: `z = 3` — array destructuring can skip positions with empty commas; the middle value `2` is simply discarded.

---

## 6. Spread & Rest Operators (`...`) (HIGH PRIORITY)

**Explain:** Same `...` syntax, two opposite meanings depending on context.

**Spread** — "expand" an array/object into individual elements:
```javascript
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5] — NEW array, arr1 untouched

const obj1 = { name: 'Rahul', role: 'dev' };
const obj2 = { ...obj1, role: 'senior dev' }; // { name: 'Rahul', role: 'senior dev' } — overrides
```

**Rest** — "collect" multiple arguments/remaining items into a single array:
```javascript
function sum(...numbers) { // collects all arguments into an array
  return numbers.reduce((acc, n) => acc + n, 0);
}
sum(1, 2, 3, 4); // 10

const [first, ...rest] = [1, 2, 3, 4];
console.log(first); // 1
console.log(rest);  // [2, 3, 4]
```

**Why/How/When:** Spread is THE standard way to create updated copies of objects/arrays **immutably** in Angular/Redux-style state management (NgRx, Signals) — critical for the `OnPush` reference-equality pattern from Day 4:

```javascript
// Immutable update pattern — used constantly in NgRx reducers & Signal updates
this.tasks.update(currentTasks => [...currentTasks, newTask]); // new array reference
```

**Quiz:**
Q1: What's the difference between `[...arr1, 4]` and `arr1.push(4)`?
A1: Spread creates a brand NEW array with the added item (immutable) — `arr1` stays unchanged. `push()` mutates `arr1` directly in place, no new reference created.

Q2: In `const merged = { ...defaults, ...userSettings }`, if both objects have a `theme` property, which value wins?
A2: `userSettings`'s value wins — later spread properties override earlier ones, left to right.

---

## 7. Template Literals

**Explain:** Backtick-based strings (`` ` `` ` `` ) allowing embedded expressions (`${...}`) and multi-line strings without concatenation.

```javascript
const name = 'Rahul';
const greeting = `Hello, ${name}! You have ${5 + 2} tasks.`;
// vs old way: 'Hello, ' + name + '! You have ' + (5 + 2) + ' tasks.'

const multiLine = `Line 1
Line 2`; // preserves actual line break
```

**Why/How/When:** Standard for any dynamic string building in TS/Angular — component templates, dynamic class bindings, constructing URLs, logging.

**Quiz:**
Q: What does `` `Total: ${2 + 3}` `` evaluate to?
A: `"Total: 5"` — the expression inside `${}` is evaluated first, then converted to string and inserted.

---

## 8. Optional Chaining (`?.`) & Nullish Coalescing (`??`) (HIGH PRIORITY — common bug source)

**Explain:**

**Optional chaining `?.`** — safely access a nested property WITHOUT throwing an error if something along the chain is `null`/`undefined`:
```javascript
const user = { profile: null };
console.log(user.profile.name); // 💥 TypeError: Cannot read properties of null
console.log(user.profile?.name); // ✅ undefined — no crash, chain stops safely
```

**Nullish coalescing `??`** — provide a fallback ONLY when the value is `null` or `undefined` (NOT for other falsy values like `0`, `''`, `false`):
```javascript
const count = 0;
console.log(count || 10); // 10 — WRONG if you wanted to keep 0! || treats 0 as falsy
console.log(count ?? 10); // 0  — CORRECT — ?? only falls back on null/undefined
```

**Why/How/When:** This `||` vs `??` distinction is a **very common real bug** — using `||` for defaults when the value could legitimately be `0`, `''`, or `false` silently replaces valid data with your fallback. Always use `??` unless you specifically want ALL falsy values replaced.

**Quiz:**
Q1: Given `const taskCount = 0; const display = taskCount || 'No tasks';` — what does `display` equal, and is this likely a bug?
A1: `display = 'No tasks'` — likely a BUG, since `0` is a legitimate value (zero tasks) but `||` treats it as falsy and replaces it. Should use `taskCount ?? 'No tasks'` instead, which would correctly keep `0`.

Q2: Given `const user = { address: undefined }`, what does `user.address?.city ?? 'Unknown'` evaluate to?
A2: `'Unknown'` — `user.address` is `undefined`, so `?.` short-circuits to `undefined` without crashing, then `??` catches that `undefined` and falls back to `'Unknown'`.

---

## 9. Useful Object Methods

**Explain:**
```javascript
const task = { title: 'Design', priority: 3 };

Object.keys(task);    // ['title', 'priority']
Object.values(task);  // ['Design', 3]
Object.entries(task); // [['title', 'Design'], ['priority', 3]]

Object.assign({}, task, { status: 'done' }); // merges objects (spread {...} is now preferred)

Object.freeze(task);
task.priority = 99; // silently fails (or throws in strict mode) — object is now immutable
```

**Why/How/When:** `Object.entries()` combined with `.map()`/`.reduce()` is common for transforming object data into arrays for iteration (e.g., converting a settings object into a list of form fields). `Object.freeze()` is a genuine but LIMITED immutability tool — see the Deep vs Shallow Copy section for why it's not a complete solution.

**Quiz:**
Q: After `Object.freeze(task)`, does `task.priority = 99` throw an error?
A: In non-strict mode, it fails **silently** (no error, but no change either). In strict mode (which Angular/TS always uses), it throws a `TypeError`.

---

## 10. Array Methods Beyond Map/Filter/Reduce

**Explain — quick reference table:**

| Method | Purpose | Returns |
|---|---|---|
| `.find(fn)` | First item where `fn` returns true | The item itself (or `undefined`) |
| `.findIndex(fn)` | Index of first matching item | Number (or `-1`) |
| `.some(fn)` | Does AT LEAST ONE item pass? | Boolean |
| `.every(fn)` | Do ALL items pass? | Boolean |
| `.includes(val)` | Does array contain this exact value? | Boolean |
| `.sort(fn)` | Sorts IN PLACE (mutates!) | Same array, sorted |
| `.flat(depth)` | Flattens nested arrays | New flattened array |
| `.flatMap(fn)` | `.map()` then `.flat(1)` combined | New array |

```javascript
const tasks = [
  { title: 'A', priority: 3 },
  { title: 'B', priority: 5 },
  { title: 'C', priority: 1 }
];

tasks.find(t => t.priority === 5);      // { title: 'B', priority: 5 }
tasks.some(t => t.priority > 4);         // true
tasks.every(t => t.priority > 0);        // true
tasks.sort((a, b) => a.priority - b.priority); // ⚠️ MUTATES tasks in place, sorted ascending
```

**Why/How/When:** `.find()` is the standard way to locate a single task/item by ID in TEAMFLOW. `.sort()` is a critical GOTCHA — unlike `.map()`/`.filter()`, **it mutates the original array**. Always spread first if you need immutability: `[...tasks].sort(...)`.

**Quiz:**
Q1: Why is `tasks.sort((a,b) => a.priority - b.priority)` dangerous to use directly in an Angular `OnPush` component?
A1: `.sort()` mutates the array in place — the reference never changes, so `OnPush` change detection (which checks `===` reference equality) won't detect anything changed, and the UI may not re-render even though the order changed. Fix: `[...tasks].sort(...)` to get a new reference.

Q2: What's the difference between `.find()` and `.filter()` when only one item matches?
A2: `.find()` returns the single matching **item itself** (or `undefined` if none match). `.filter()` always returns an **array** — even with one match, it's `[item]`, not `item`.

---

## 11. Default Parameters

**Explain:**
```javascript
function createTask(title, priority = 1) { // priority defaults to 1 if not passed
  return { title, priority };
}
createTask('Design');        // { title: 'Design', priority: 1 }
createTask('Design', 5);     // { title: 'Design', priority: 5 }
```

**Why/How/When:** Common in service/utility function signatures to avoid `undefined` checks inside the function body.

**Quiz:**
Q: Does `createTask('Design', undefined)` use the default `priority = 1`, or does it use `undefined`?
A: It uses the default (`1`) — default parameters trigger specifically when the argument is `undefined` (whether omitted or explicitly passed as `undefined`). Passing `null` would NOT trigger the default — `priority` would be `null`.

---

## 12. IIFE — Immediately Invoked Function Expression

**Explain:** A function defined and called immediately, in one expression — creates an isolated scope that runs once.
```javascript
(function() {
  console.log('runs immediately, once');
})();
```

**Why/How/When:** Largely a legacy pattern from before ES Modules existed (used to avoid polluting global scope). You'll rarely write this directly in Angular/TS — ES Modules provide the same isolation now — but it still appears in older library code and is a common interview trivia question.

**Quiz:**
Q: Why did IIFEs become less necessary after ES Modules were introduced?
A: ES Modules give every file its own private scope automatically (Day 4) — the same isolation IIFEs were manually creating is now the default behavior of any module file.

---

## 13. Pure Functions vs Impure Functions

**Explain:** A **pure function**: given the same input, ALWAYS returns the same output, and causes NO side effects (doesn't modify anything outside itself — no mutating arguments, no changing global state, no API calls, no console.log even, strictly speaking).
```javascript
// Pure
function add(a, b) { return a + b; }

// Impure — depends on external state
let taxRate = 0.1;
function addTax(price) { return price + (price * taxRate); } // depends on outside variable

// Impure — mutates its argument (side effect)
function addTaskBad(tasks, newTask) { tasks.push(newTask); return tasks; }

// Pure version — no mutation
function addTaskGood(tasks, newTask) { return [...tasks, newTask]; }
```

**Why/How/When:** Pure functions are predictable, testable in isolation (no setup/mocking needed), and safe for Angular's `OnPush`/Signals model since they naturally produce new references instead of mutating. NgRx reducers are REQUIRED to be pure functions — this is a hard rule, not a suggestion (Week 6).

**Quiz:**
Q: Is `Math.random()` a pure function? Why or why not?
A: No — given no input, it returns a DIFFERENT output every single call. Pure functions must be deterministic (same input → same output, always).

---

## 14. Function Currying

**Explain:** Transforming a function that takes multiple arguments into a sequence of functions that each take ONE argument.
```javascript
// Normal
function add(a, b, c) { return a + b + c; }
add(1, 2, 3); // 6

// Curried
function addCurried(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}
addCurried(1)(2)(3); // 6

// Practical use — pre-configured functions
function multiplyBy(factor) {
  return (num) => num * factor;
}
const double = multiplyBy(2);
const triple = multiplyBy(3);
double(5); // 10
triple(5); // 15
```

**Why/How/When:** Less common in day-to-day Angular work, but appears in functional-programming-style utility libraries and is a recognized interview topic to demonstrate closure mastery (it's literally closures + HOFs combined — everything from Day 1 and Day 4).

**Quiz:**
Q: What core Day 1 concept makes currying possible — how does `addCurried(1)(2)(3)` "remember" that `a = 1` by the time it reaches the innermost function?
A: Closures — each returned inner function closes over the outer function's parameters, keeping them alive in memory even after the outer function has returned.

---

## 15. `Set` and `Map` Data Structures

**Explain:**

**`Set`** — a collection of UNIQUE values (no duplicates allowed, automatically enforced):
```javascript
const uniqueIds = new Set([1, 2, 2, 3, 3, 3]);
console.log(uniqueIds); // Set(3) {1, 2, 3} — duplicates auto-removed
uniqueIds.add(4);
uniqueIds.has(2); // true
```

**`Map`** — like an object, but keys can be ANY type (not just strings), and preserves insertion order reliably:
```javascript
const taskStatusMap = new Map();
taskStatusMap.set('todo', 5);
taskStatusMap.set('done', 3);
taskStatusMap.get('todo'); // 5
taskStatusMap.size; // 2
```

**Why/How/When:** `Set` is a fast, clean way to deduplicate arrays (`[...new Set(arrayWithDupes)]`) — useful for things like deduplicating selected task IDs in a multi-select UI. `Map` is preferred over plain objects when keys aren't simple strings, or when you need guaranteed insertion order and frequent add/remove operations (more performant than objects for this specific use case).

**Quiz:**
Q: What's the fastest way to remove duplicate values from an array using `Set`?
A: `const unique = [...new Set(arrayWithDupes)];` — spread the Set (which auto-dedupes) back into a new array.

---

## 16. `try/catch/finally` — Error Handling

**Explain:**
```javascript
try {
  const result = riskyOperation();
} catch (error) {
  console.log('Error occurred:', error.message);
} finally {
  console.log('This runs ALWAYS — success or failure');
}
```

**Why/How/When:** Essential for wrapping `async/await` code (as seen on Day 3), and for any operation that might throw (JSON parsing, API calls). `finally` is commonly used for cleanup logic (hiding a loading spinner) that must run regardless of outcome.

**Quiz:**
Q: If `try` succeeds with no error, does `finally` still run?
A: Yes — `finally` ALWAYS runs, whether the `try` block succeeded, threw an error, or even if there's a `return` statement inside `try`/`catch`.

---

## 17. Generators (`function*`, `yield`)

**Explain:** A special function that can PAUSE its own execution at `yield` points and resume later, producing a sequence of values over time instead of all at once.
```javascript
function* taskGenerator() {
  yield 'Design';
  yield 'Code';
  yield 'Test';
}

const gen = taskGenerator();
console.log(gen.next().value); // 'Design'
console.log(gen.next().value); // 'Code'
console.log(gen.next().value); // 'Test'
```

**Why/How/When:** Rare in day-to-day Angular development, but conceptually related to how some async iteration patterns work internally. Mostly relevant here as interview trivia — good to recognize the syntax, not critical to master deeply for your goals.

**Quiz:**
Q: What's the key difference between a normal function call and calling a generator function?
A: A normal function runs completely start-to-finish immediately when called. A generator function call returns an iterator object WITHOUT running any code yet — code only executes up to the next `yield` each time `.next()` is called.

---

## 18. Truthy / Falsy Values

**Explain:** JavaScript converts values to `true`/`false` automatically in conditional contexts (`if`, `&&`, `||`, ternary).

**The COMPLETE list of falsy values (memorize this — it's short and exhaustive):**
```
false, 0, -0, 0n (BigInt zero), '', null, undefined, NaN
```
**Everything else is truthy** — including `'0'` (string), `[]` (empty array), `{}` (empty object) — these commonly trip people up because they FEEL like they should be falsy but aren't.

```javascript
if ('0') console.log('truthy!');   // runs — non-empty string is truthy
if ([]) console.log('truthy!');    // runs — empty array is still an object, truthy
if ({}) console.log('truthy!');    // runs — empty object is truthy
```

**Why/How/When:** Directly explains the `||` default-value bug from section 8 — knowing the EXACT falsy list prevents subtle logic bugs, especially with `0` and `''` being legitimate values that get accidentally treated as "empty."

**Quiz:**
Q: Is `[]` (empty array) truthy or falsy? Does this surprise most people?
A: Truthy. This surprises many people because an empty array intuitively "feels empty/falsy," but arrays are objects, and ALL objects (including empty ones) are truthy in JS — only the 7 specific values in the falsy list are falsy.

---

## 19. Type Coercion — Implicit Conversion Rules

**Explain:** JS automatically converts types in certain operations, sometimes producing surprising results.
```javascript
'5' + 3;      // '53' — + with a string triggers STRING concatenation
'5' - 3;      // 2   — - only works numerically, so '5' is coerced to number
'5' * '2';    // 10  — same, * forces numeric coercion
true + 1;     // 2   — true coerces to 1
false + 1;    // 1   — false coerces to 0
'5' + true;   // '5true' — string concatenation wins again
null + 1;     // 1   — null coerces to 0 in numeric context
undefined + 1;// NaN — undefined coerces to NaN, poisons the whole operation
```

**Why/How/When:** The `+` operator is the special case — it checks if EITHER operand is a string, and if so, does concatenation instead of addition. All other arithmetic operators (`- * / %`) always force numeric coercion.

**Quiz:**
Q1: What does `'10' + 5 - 3` evaluate to? Trace it left to right.
A1: `'10' + 5` → `'105'` (string concat, since `+` sees a string first) → `'105' - 3` → `102` (now `-` forces numeric coercion). Final: `102`.

Q2: Why does `undefined + 1` give `NaN` while `null + 1` gives `1`?
A2: `null` coerces to `0` in numeric contexts. `undefined` coerces to `NaN` — and any arithmetic operation involving `NaN` always produces `NaN`.

---

## 20. `==` vs `===` — Full Coercion Deep Dive

**Explain:** `===` (strict equality) compares value AND type, no coercion. `==` (loose equality) coerces types before comparing, following a complex set of rules.
```javascript
5 === '5';   // false — different types, no coercion with ===
5 == '5';    // true  — '5' coerced to 5, then compared

null == undefined;  // true  — special case, these two are loosely equal to EACH OTHER only
null === undefined; // false — different types

0 == false;  // true  — false coerced to 0
0 == '';     // true  — '' coerced to 0
'' == false; // true  — both coerce to 0
NaN == NaN;  // false — NaN is never equal to anything, including itself!
```

**Why/How/When:** **Enterprise rule: ALWAYS use `===`, never `==`**, except the one specific idiom `value == null` (which cleanly checks for BOTH `null` AND `undefined` in one comparison, relying on the special case above). TypeScript's strict mode and most enterprise ESLint configs enforce this.

**Quiz:**
Q1: Why is `NaN == NaN` false, and how do you actually check if a value is `NaN`?
A1: `NaN` is defined by the IEEE spec to never equal anything, including itself — this is intentional, not a bug. Use `Number.isNaN(value)` to correctly check for `NaN`.

Q2: What's the one commonly-accepted exception where `==` is intentionally used instead of `===`?
A2: `if (value == null)` — this single check catches BOTH `null` and `undefined` at once, since `null == undefined` is `true` but neither equals anything else loosely. Equivalent to `value === null || value === undefined`, but shorter.

---

## 21. Deep Copy vs Shallow Copy (HIGH PRIORITY — real production bug source)

**Explain:** A **shallow copy** duplicates only the TOP-level structure — nested objects/arrays inside are still SHARED references with the original. A **deep copy** duplicates EVERY level, fully independent.

```javascript
const original = { name: 'Task 1', meta: { priority: 3 } };

// Shallow copy via spread
const shallowCopy = { ...original };
shallowCopy.name = 'Task 2';        // ✅ independent — doesn't affect original
shallowCopy.meta.priority = 99;      // ⚠️ ALSO changes original.meta.priority!
console.log(original.meta.priority); // 99 — nested object was SHARED, not copied

// Deep copy — structuredClone (modern, built-in)
const deepCopy = structuredClone(original);
deepCopy.meta.priority = 1;
console.log(original.meta.priority); // 99 — unaffected, truly independent

// Older deep copy trick (has limitations: loses functions, undefined, Dates become strings)
const deepCopyOld = JSON.parse(JSON.stringify(original));
```

**Why/How/When:** This is a REAL, common production bug — spreading `{...obj}` or `[...arr]` only protects the top level. If your Angular state has nested objects (very common — `task.assignee.profile.avatar`), a shallow copy update won't correctly trigger `OnPush` change detection on deeply nested changes, and worse, can cause silent unintended mutations of "copied" data. `Object.freeze()` also only freezes the top level for the same reason — nested objects inside a frozen object are NOT frozen.

**Quiz:**
Q1: Given `const copy = {...original}`, if `original` has a nested array `original.tags = ['a','b']`, does modifying `copy.tags.push('c')` affect `original.tags`?
A1: Yes — `tags` is a nested reference type; spread only copies the top-level keys, so `copy.tags` and `original.tags` point to the SAME array. Mutating one affects both.

Q2: Why doesn't `Object.freeze(obj)` fully protect a nested object structure?
A2: `Object.freeze()` only freezes the object's own top-level properties from reassignment — it does NOT recursively freeze nested objects/arrays inside it. Those nested structures remain fully mutable unless separately frozen too.

---

## 22. `typeof` vs `instanceof`

**Explain:**
```javascript
typeof 'hello';      // 'string'
typeof 5;             // 'number'
typeof true;          // 'boolean'
typeof undefined;     // 'undefined'
typeof {};             // 'object'
typeof [];              // 'object' — ⚠️ arrays report as 'object', NOT 'array'!
typeof function(){};    // 'function'
typeof null;             // 'object' — ⚠️ famous, long-standing JS bug, never fixed

[] instanceof Array;     // true — correctly identifies arrays
{} instanceof Object;    // true
```

**Why/How/When:** `typeof` is fast and fine for primitives, but useless for distinguishing arrays from plain objects (`typeof [] === 'object'`) — use `Array.isArray(value)` for that specifically, or `instanceof` for custom class instances.

**Quiz:**
Q: Why is `typeof null === 'object'` considered a "bug," and how do you correctly check for `null` instead?
A: It's a historical mistake baked into JS's earliest implementation (1995) that can never be fixed without breaking the entire web. To correctly check for `null`, use `value === null` directly, not `typeof`.

---

## 23. Immutability Patterns — `Object.freeze()` Limitations (Recap/Extension of #21)

**Explain:** Covered in #21 (shallow-only). Additional note: `Object.freeze()` prevents adding/removing/reassigning top-level properties, but is NOT the same as `const` — `const` prevents reassigning the VARIABLE; `freeze` prevents changing the OBJECT's contents.

```javascript
const task = Object.freeze({ title: 'Design', priority: 3 });
task.priority = 99;    // silently fails (or throws in strict mode)
task.newProp = 'x';    // also fails — can't add new properties either
console.log(task);      // { title: 'Design', priority: 3 } — unchanged
```

**Why/How/When:** For TRUE deep immutability, you'd need a recursive freeze utility or a library (like Immer, common in NgRx setups) — `Object.freeze()` alone is a partial tool, not a complete solution.

**Quiz:**
Q: Does `Object.freeze()` throw an error when you try to mutate a frozen object?
A: Only in strict mode (which TypeScript/Angular always uses) — it throws `TypeError`. In non-strict mode, it fails silently with no error and no change.

---

## 24. Debounce & Throttle (Practical Implementation)

**Explain:** Both LIMIT how often a function runs in response to rapid repeated events (typing, scrolling, resizing) — but with different strategies.

**Debounce** — wait until the events STOP for a pause, then run once:
```javascript
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);              // cancel the previous pending call
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const debouncedSearch = debounce((query) => console.log('Searching:', query), 300);
// User types "angular" fast — only ONE search fires, 300ms after the LAST keystroke
```

**Throttle** — run at most once every fixed interval, no matter how many events fire:
```javascript
function throttle(fn, limit) {
  let waiting = false;
  return function(...args) {
    if (!waiting) {
      fn(...args);
      waiting = true;
      setTimeout(() => { waiting = false; }, limit);
    }
  };
}

const throttledScroll = throttle(() => console.log('Scroll handled'), 200);
// User scrolls continuously — handler fires at most once every 200ms
```

**Why/How/When:** Debounce is the standard pattern for **search-as-you-type** inputs (wait for the user to pause typing before firing an API call — directly relevant to TEAMFLOW's task search/filter feature). Throttle is standard for **scroll/resize handlers** where you want regular updates but not on every single pixel of movement. In real Angular code, RxJS provides these natively as `debounceTime()` and `throttleTime()` operators (Week 5) — but understanding the raw closure-based implementation (uses `setTimeout` + closures from Day 1!) is a common interview question.

**Quiz:**
Q1: For a search input that calls an API as the user types, would you use debounce or throttle, and why?
A1: Debounce — you want to wait until the user actually STOPS typing before firing the expensive API call, not fire repeatedly while they're still actively typing.

Q2: What Day 1 concept makes the debounce implementation work — specifically, how does `timeoutId` persist correctly across multiple calls to the debounced function?
A2: Closures — the returned function closes over `timeoutId` from the outer `debounce()` scope, so every call to the debounced function can read AND update the same shared `timeoutId`, allowing `clearTimeout` to correctly cancel the previous pending call.

---

## 25. Memoization (Practical Implementation)

**Explain:** Caching a function's results based on its input, so repeated calls with the SAME input return instantly from cache instead of recomputing.

```javascript
function memoize(fn) {
  const cache = new Map(); // private cache — closure!
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log('From cache');
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

function slowCalculateProgress(tasks) {
  console.log('Calculating...'); // simulate expensive work
  return (tasks.filter(t => t.done).length / tasks.length) * 100;
}

const memoizedCalc = memoize(slowCalculateProgress);
memoizedCalc(tasks); // 'Calculating...' then returns result
memoizedCalc(tasks); // 'From cache' — instant, same input
```

**Why/How/When:** Directly the same `createTaskCounter()` private-state pattern from Day 1 — a closure holding private state (here, a `Map` cache instead of a counter). Useful for expensive computed values that don't change often — Angular's `computed()` signals (Week 5) apply this exact same caching principle automatically, recalculating only when a dependency actually changes.

**Quiz:**
Q: What core Day 1 concept does the `cache` variable rely on to stay private and persistent across multiple calls to the memoized function?
A: Closures — `cache` is declared in `memoize()`'s outer scope, and the returned inner function retains permanent access to that same `cache` object across every call, exactly like `count` in `createTaskCounter()`.

---

## Master Interview Recap — Pick Any 5 to Self-Test

1. Why does `const arr = [1,2,3]; arr.push(4)` not throw an error?
2. What's the real difference between `undefined` and `ReferenceError`? (3rd time this appears across the full JS journey)
3. Why should you prefer `??` over `||` for default values?
4. Why is `.sort()` dangerous to call directly on state used in an `OnPush` Angular component?
5. What are ALL 7 falsy values in JavaScript?
6. Why does `'5' + 3` give `'53'` but `'5' - 3` give `2`?
7. What's the one accepted exception to the "always use `===`" rule?
8. Why doesn't spreading `{...obj}` protect nested objects from mutation?
9. What's the difference between debounce and throttle, and which fits a search box?
10. What Day 1 concept underlies BOTH debounce AND memoization implementations?

(Answers are all in the sections above — use this as a final self-check before moving to TypeScript.)

---

## Status: JavaScript Foundation — FULLY COMPLETE

All core mechanics (Days 1–4) + all common gap-fill syntax/patterns (Day 5) now covered. Genuinely ready to move into TypeScript with a complete JS base underneath it.

## Next Up: Week 2 — TypeScript for Enterprise Angular
Interfaces vs Types, Generics, Utility Types, Mapped/Conditional Types, `infer`, Type Guards, Decorators — every topic applied directly to TEAMFLOW's `Task`, `Project`, `User` domain models.
