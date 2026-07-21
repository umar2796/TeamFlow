# TEAMFLOW — Angular Enterprise Journey
## Day 1 Notes: Execution Context, Scope, Closures

---

## 1. Execution Context

**Definition:** A container the JS engine creates to manage code execution. It holds:
- Variable Environment (`var`, function declarations)
- Lexical Environment (`let`/`const`, closures)
- Value of `this`
- Reference to outer environment (for scope chain resolution)

**Types:**
| Type | Created |
|---|---|
| Global Execution Context (GEC) | Once, when script starts |
| Function Execution Context (FEC) | Every time a function is invoked |
| Eval Execution Context | Rare/deprecated practice, ignore |

**Two phases of every execution context:**
1. **Creation phase** — memory allocated for variables/functions (hoisting happens here)
2. **Execution phase** — code runs line by line, values assigned

---

## 2. Call Stack

**Definition:** A LIFO (Last In, First Out) structure that tracks execution contexts as functions are called and completed.

```javascript
function first() { second(); }
function second() { third(); }
function third() { console.log('done'); }
first();
```
Stack grows: `GEC → first() → second() → third()`
Stack shrinks in reverse as each function returns.

**Key interview fact:** `RangeError: Maximum call stack size exceeded` happens when the stack grows unbounded — typically infinite/unterminated recursion, since each call pushes a new context that never gets popped.

**Angular connection:** Every lifecycle hook call (`ngOnInit`, `ngOnChanges`), every event handler, every subscription callback pushes a new Function Execution Context onto the stack. Angular's `Zone.js` wraps around this stack mechanism to detect when async work completes (deep dive in Week 5).

---

## 3. Scope

**Definition:** Where a variable is accessible in code.

| Keyword | Scope Type | Hoisting Behavior |
|---|---|---|
| `var` | Function-scoped | Hoisted + initialized as `undefined` |
| `let` | Block-scoped (`{ }`) | Hoisted but in **Temporal Dead Zone (TDZ)** until declaration line executes |
| `const` | Block-scoped (`{ }`) | Same as `let`, plus cannot be reassigned |

**Critical distinction:**
```javascript
console.log(a); // undefined
var a = 1;

console.log(b); // ReferenceError: Cannot access 'b' before initialization (TDZ)
let b = 2;
```

**Block-leak bug (why `var` is banned in enterprise code):**
```javascript
function test() {
  if (true) {
    var x = 10;   // leaks OUTSIDE the if-block (function-scoped)
    let y = 20;   // stays INSIDE the if-block only (block-scoped)
  }
  console.log(x); // 10 — accessible
  console.log(y); // ReferenceError: y is not defined — NOT accessible
}
```

**Interview trap — error type difference:**
- Accessing `let`/`const` *before* declaration in same scope → `ReferenceError: Cannot access before initialization` (TDZ)
- Accessing `let`/`const` *outside* the block it was declared in → `ReferenceError: <var> is not defined` (never hoisted into that scope at all)

**Rule enforced in enterprise Angular projects:** `no-var`, `prefer-const` ESLint rules exist specifically to prevent block-leak bugs.

---

## 4. Closures

**Definition:** A closure is formed when a function "remembers" variables from its lexical (outer) scope, even after the outer function has finished executing and been popped off the call stack.

```javascript
function outer() {
  let count = 0;
  return function inner() {
    count++;
    return count;
  };
}
const counter = outer();
counter(); // 1
counter(); // 2
```
`outer()` finishes and is popped off the stack, but `count` stays alive in memory because `inner` still holds a reference to it. This is how closures create **true private state** — nothing outside can access `count` directly.

---

## 5. The Classic Interview Question: `var` vs `let` in Loops with `setTimeout`

```javascript
// var version
for (var i = 1; i <= 3; i++) {
  setTimeout(() => console.log(i), 1000);
}
// Output: 4, 4, 4
```
**Why:** `var` creates ONE shared `i` for the entire loop (function-scoped). The loop runs to completion synchronously *before* any `setTimeout` callback fires. By the time callbacks run, `i` is `4` (the value after the loop condition failed). All three callbacks reference the same `i`, so all print `4`.

```javascript
// let version
for (let i = 1; i <= 3; i++) {
  setTimeout(() => console.log(i), 1000);
}
// Output: 1, 2, 3
```
**Why:** `let` creates a **brand-new binding of `i` for every iteration** of the loop. Each `setTimeout` callback closes over its own private, isolated `i`. No sharing occurs.

**Real-world Angular bug this causes:**
```typescript
// BUGGY — using var in a loop with async work
for (var i = 0; i < this.tasks.length; i++) {
  this.taskService.getTask(this.tasks[i].id).subscribe(task => {
    console.log(this.tasks[i]); // wrong/stale index due to shared i
  });
}
```
Fix: use `let`, or better, use array methods (`forEach`/`map`) which create fresh scope per callback naturally.

---

## 6. Postfix vs Prefix Increment (Interview Trick)

| Operator | Behavior |
|---|---|
| `count++` (postfix) | Returns the **current** value, THEN increments |
| `++count` (prefix) | Increments FIRST, THEN returns the **new** value |

```javascript
let count = 0;
console.log(count++); // 0 (returns old value, then count becomes 1)
console.log(count);   // 1

let count2 = 0;
console.log(++count2); // 1 (increments first, then returns new value)
```

**Common bug:** Writing `const increment = () => count++;` as a "clean" arrow function silently returns the **old** value instead of the updated one. Correct one-liner: `() => ++count`. Or split into two statements for clarity:
```typescript
increment: function() {
  count++;
  return count;
}
```

---

## 7. Practical Pattern: Private State via Closures

```javascript
function createTaskCounter() {
  let count = 0; // private — inaccessible from outside

  return {
    increment: function () {
      count++;
      return count;
    },
    decrement: function () {
      if (count > 0) {
        count--;
      }
      return count;
    },
    getCount: function () {
      return count;
    }
  };
}
```

**Key properties:**
- `count` cannot be accessed or mutated directly (`counter.count` doesn't exist)
- Each call to `createTaskCounter()` creates a fully independent, isolated closure with its own `count` in memory
- This is the same fundamental mechanism behind: memoization, debounce/throttle utilities, and (conceptually) why Angular services with different provider scopes get independent state instances

---

## 8. Code Review Standards Established Today

1. **No side-effect ternaries** — a ternary should return a *value*, not perform an action and discard the result. Use `if/else` for actions.
2. **Consistent camelCase** on all method/function names (`getCount`, not `getcount`) — enforced across Angular/TS enterprise style guides.
3. **Business logic doesn't belong in `AppComponent`** — it's the root shell. Utility/business logic moves into services or utility functions (formalized in Week 3-4).
4. **Prefer arrow functions** in modern TS/Angular codebases for consistency and to avoid `this`-binding surprises (deep dive coming in the `this` keyword lesson).

---

## 9. Interview Q&A Recap (Self-Test)

1. **Q:** Why does `console.log(a); var a = 1;` print `undefined` instead of throwing an error?
   **A:** `var` is hoisted to the top of its scope during the creation phase and auto-initialized to `undefined`.

2. **Q:** Why does the same pattern with `let` throw a `ReferenceError`?
   **A:** `let` is hoisted but remains in the Temporal Dead Zone (TDZ) until its declaration line actually executes.

3. **Q:** What causes `Maximum call stack size exceeded`?
   **A:** Unbounded recursion — each call pushes a new Function Execution Context that never gets popped because the function never reaches a base case/return.

4. **Q:** Why does `for (var i...)` with `setTimeout` print the final value for every callback, but `let` doesn't?
   **A:** `var` is function-scoped (one shared variable for the whole loop); `let` creates a fresh block-scoped binding per iteration, so each closure captures its own isolated copy.

5. **Q:** What's the difference between `count++` and `++count`?
   **A:** `count++` (postfix) returns the value *before* incrementing; `++count` (prefix) increments first, then returns the new value.

---

## Next Up: Day 2 — Prototypes & `this` Keyword
