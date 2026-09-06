# TEAMFLOW — Angular Enterprise Journey
## Day 3 Notes (Complete): Event Loop, Promises, Async/Await

---

## 1. Why the Event Loop Exists

JavaScript is **single-threaded** — one call stack, one thing executed at a time. If async operations (network calls, timers) truly blocked that single stack while waiting, the entire browser tab would freeze — no clicks, no scrolling, no rendering — for the entire wait duration.

**The fix:** JS doesn't run alone. It runs *inside* an environment (browser or Node.js) that provides additional systems running independently and **genuinely in parallel** to JS's single call stack:
- **Web APIs** — `setTimeout`, `fetch`, DOM event listeners. These are handled by the browser's own internal threads — completely separate from JS's call stack. A browser's timer system counts down independently of whatever JS is doing at that moment; a network request travels over the actual network on a separate thread while JS keeps running other code.
- **Queues** — waiting areas where completed async work lines up before being handed back to JS.
- **Event Loop** — a constantly running referee: *"Is the call stack completely empty? If yes, take the next item from a queue and push it onto the stack."*

**Important nuance on "parallel":** JS's call stack itself never runs two lines of your code at once — that part stays strictly single-threaded, always. But the *environment surrounding* JS (browser/Node) genuinely does work in parallel — that parallelism is exactly what prevents the UI from freezing during a timer or network wait.

**Critical rule — what "stack is empty" actually means:** The Event Loop does NOT sneak work in between two individual statements within the same synchronous run (e.g., between line 1 and line 2 of the same script). When a script/function starts executing, its entire Execution Context stays on the stack as a container until **every single synchronous line inside it has completely finished** — only then is the stack considered "empty" for the Event Loop's purposes. Each full synchronous run (a whole script, or a whole callback) is one atomic, uninterruptible unit — often called a "task" or "tick."

```javascript
function runAll() {
  console.log('1');
  console.log('2');
  console.log('3');
}
setTimeout(() => console.log('timer'), 0);
runAll();
console.log('4');
// Output: 1, 2, 3, 4, timer
// 'timer' has NO chance of interleaving between 1/2/3/4 — the whole
// synchronous block runs as one uninterruptible unit first.
```

---

## 2. `setTimeout(fn, 0)` Does NOT Mean "Run Immediately"

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
console.log('3');
```
**Output: `1, 3, 2`** — NOT `1, 2, 3`.

**Why:** `setTimeout` hands its callback off to the browser's timer system and JS moves on immediately without waiting — even a `0ms` delay. The callback only runs after ALL current synchronous code finishes and the stack is fully empty.

**Rule to memorize:** *`setTimeout(fn, 0)` means "run as soon as possible AFTER the current synchronous code completely finishes" — not "run right now."*

**Registration order matters for same-delay timers:**
```javascript
console.log('A');
setTimeout(() => console.log('B'), 0);
console.log('C');
setTimeout(() => console.log('D'), 0);
console.log('E');
// Output: A, C, E, B, D
// All synchronous lines (A, C, E) run first, fully, one at a time.
// Only once the stack is fully empty do the queued timer callbacks run,
// in the order their timers completed (B registered first, so B before D).
```

---

## 3. Callback Hell — The Problem Promises Solve

Before Promises, chained dependent async steps were handled with nested callbacks:
```javascript
getUser(userId, function(user) {
  getTasks(user.id, function(tasks) {
    getComments(tasks[0].id, function(comments) {
      console.log(comments);
      // nesting deeper and deeper — "Callback Hell" / "Pyramid of Doom"
    });
  });
});
```
Hard to read, hard to maintain, error handling needed at every nested level.

---

## 4. What a Promise Is

A Promise is an object representing **a value that doesn't exist yet, but will exist eventually** (or fail trying) — like a receipt/token handed to you the moment you place an order, before the order is ready.

**3 possible states:**
- **Pending** — still waiting
- **Fulfilled** — completed successfully, has a result value
- **Rejected** — failed, has an error reason

**Once settled (fulfilled or rejected), a Promise's state is permanent — it can never change again.**

```javascript
const myPromise = new Promise(function(resolve, reject) {
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve('Data loaded!');   // pending → fulfilled
    } else {
      reject('Failed to load');  // pending → rejected
    }
  }, 1000);
});

myPromise
  .then(result => console.log(result))   // runs only after resolve()
  .catch(error => console.log(error));    // runs only after reject()
```

**Promises let async chains stay flat instead of nesting:**
```javascript
orderFood()
  .then(food => callCab(food))
  .then(cab => textFriend(cab))
  .then(reply => unlockDoor(reply))
  .then(() => console.log('done'));
```

**Note:** Attaching `.then()`/`.catch()` does NOT wait or block — it just registers callbacks for later and moves on immediately, exactly like `setTimeout` registration.

---

## 5. Microtasks vs Macrotasks — The Priority System

**Rule:** Every time the call stack becomes completely empty, the Event Loop:
1. Checks the **microtask queue** first and drains it **completely** — including any NEW microtasks added during that draining process
2. **Only after** the microtask queue is fully empty, checks the **macrotask queue** and runs ONE macrotask
3. Repeats

### Microtasks (higher priority)
- `Promise.then()` / `.catch()` / `.finally()`
- `async/await` continuations (code after `await` is a `.then()` in disguise)
- `queueMicrotask()`
- `MutationObserver` callbacks

### Macrotasks (lower priority — always run after ALL microtasks drain)
- `setTimeout()` / `setInterval()`
- DOM events (click, scroll, keypress)
- **Network/I-O completions** — `fetch()`, `XMLHttpRequest`, and **Angular's `HttpClient`**
- `requestAnimationFrame`
- File I/O (Node.js)

**Key distinguishing question:** *"Is this waiting on something already resolved in-memory (microtask), or waiting on something external — timer, network, user interaction (macrotask)?"*

**Common misconception to avoid:** Just because `fetch()`/`HttpClient` *return* a Promise does NOT make them microtasks. The actual network wait is a real I/O operation completing outside JS — it's macrotask-classified. Only the `.then()`/`subscribe()` callback that fires once the response *arrives* gets scheduled with macrotask timing, not microtask timing. "Returns a Promise" and "is a microtask" are not the same thing.

### Full worked trace:
```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);          // macrotask
Promise.resolve().then(() => console.log('3')); // microtask
console.log('4');
```
**Output: `1, 4, 3, 2`**
- `1`, `4` — synchronous, run first
- `3` — microtask, drained before any macrotask
- `2` — macrotask, runs last

---

## 6. Async/Await Is Syntax Sugar Over Promises

`async`/`await` does not introduce a new async mechanism — it lets Promise-based code be written to *look* synchronous while behaving identically to `.then()` chains underneath.

```javascript
// .then() chain version
function getTaskDetails() {
  getUser(1)
    .then(user => getTasks(user.id))
    .then(tasks => getComments(tasks[0].id))
    .then(comments => console.log(comments))
    .catch(error => console.log('Error:', error));
}

// async/await version — identical behavior
async function getTaskDetails() {
  try {
    const user = await getUser(1);
    const tasks = await getTasks(user.id);
    const comments = await getComments(tasks[0].id);
    console.log(comments);
  } catch (error) {
    console.log('Error:', error);
  }
}
```

**The two rules:**
- **`async`** before a function → the function **always returns a Promise** automatically, even a plain `return 5` becomes `Promise.resolve(5)` behind the scenes.
- **`await`** before a Promise → **pauses** the function's execution at that exact line, hands control back to the caller immediately, and schedules the *rest* of the function to resume as a **microtask** once the awaited Promise settles.

**Critical insight:** Code **before** the first `await` in an `async` function runs synchronously, immediately — exactly like normal code. `async` does NOT mean "runs later" or "runs on a separate thread." Only the `await` line itself creates the pause/resume-as-microtask behavior.

### Worked trace:
```javascript
console.log('1');
async function test() {
  console.log('2');
  await null;
  console.log('3');
}
test();
console.log('4');
```
**Output: `1, 2, 4, 3`**
- `1` — synchronous
- `test()` called → runs synchronously until the `await` → logs `2`
- `await null` pauses `test()`; the remainder (`console.log('3')`) is scheduled as a microtask
- Control returns to caller → `console.log('4')` runs synchronously
- Stack empty → microtask queue checked → resumed `test()` continues → logs `3`

---

## 7. The Common Performance Mistake — Sequential Await

```javascript
// BAD — sequential, ~3 seconds total if each call takes 1 second
async function getAllTasks() {
  const task1 = await fetchTask(1);
  const task2 = await fetchTask(2);
  const task3 = await fetchTask(3);
  return [task1, task2, task3];
}
```
**The problem:** Each `await` **blocks** the function from moving to the next line until that specific call fully resolves. Since `fetchTask(2)` doesn't even START until `fetchTask(1)` finishes, three independent 1-second calls take ~3 seconds total — even though they don't depend on each other's results at all.

### The Fix — `Promise.all()`

```javascript
// GOOD — parallel, ~1 second total
async function getAllTasks() {
  const [task1, task2, task3] = await Promise.all([
    fetchTask(1),
    fetchTask(2),
    fetchTask(3)
  ]);
  return [task1, task2, task3];
}
```
All three calls **start simultaneously**. `Promise.all()` returns one combined Promise that resolves once **all** individual promises resolve. Total wait time ≈ the slowest individual call, not the sum of all calls.

**Critical behavior — all-or-nothing:** If **any single promise** in the array rejects, `Promise.all()` **immediately rejects as a whole**, discarding results from promises that succeeded.

### `Promise.allSettled()` — When Partial Failure Is Acceptable

```javascript
const results = await Promise.allSettled([
  fetchTask(1),
  fetchTask(2),
  fetchTask(3)
]);
// results: [{status: 'fulfilled', value: ...}, {status: 'rejected', reason: ...}, ...]
```
Waits for **every** promise to settle regardless of outcome, and returns a status (`fulfilled`/`rejected`) per promise individually — nothing is discarded, even if some fail.

**Rule of thumb:**
| Need | Use |
|---|---|
| All results required; any failure should fail the whole operation | `Promise.all()` |
| Partial success is acceptable; need to know which succeeded/failed | `Promise.allSettled()` |

---

## 8. Direct Angular Payoff

```typescript
async ngOnInit() {
  console.log('1 - init start');

  this.http.get('/api/tasks').subscribe(data => {
    console.log('3 - HTTP response arrived');  // macrotask-like — network I/O
  });

  Promise.resolve().then(() => console.log('2 - microtask'));

  console.log('4 - init end');
}
```
**Output: `1 - init start`, `4 - init end`, `2 - microtask`, `3 - HTTP response arrived`**

Understanding this priority order is essential for correctly predicting execution order in real production code involving RxJS Observables, HTTP calls, and Promise-based logic mixed together — a common source of race-condition bugs if misunderstood.

In real Angular/enterprise code, `async/await` shows up less often than RxJS `subscribe()`/operators for HTTP calls (Angular is RxJS-first — Week 5 deep dive), but still appears for: converting a one-off Observable to a Promise (`firstValueFrom`), Guards/Resolvers awaiting an async check before allowing navigation, and any browser-native Promise-based API (e.g. `navigator.clipboard.writeText()`).

---

## 9. Connection to RxJS (Flagged High-Priority Topic — Week 5 Preview)

This is the exact same *problem shape* you'll see formalized in RxJS combination operators:
- **`Promise.all()`** ≈ **`forkJoin`** — wait for all independent async sources to complete once, get all results together, fails if any one fails
- **`combineLatest`** has no direct Promise equivalent — it re-emits every time ANY source emits a new value (for ongoing streams, not one-time results). The mental model of "combining multiple independent async sources" starts here and gets extended in Week 5.

---

## Interview Q&A Recap

1. **Q:** Why doesn't `setTimeout(fn, 0)` run `fn` immediately?
   **A:** It's handed off to the browser's timer system and only queued for execution after all current synchronous code finishes and the call stack is empty — even a 0ms delay still waits for that.

2. **Q:** What problem do Promises solve that plain callbacks don't?
   **A:** They flatten deeply nested dependent async chains ("Callback Hell") into flat, readable `.then()` chains, and provide a standardized way to handle success/failure states.

3. **Q:** Once a Promise is fulfilled, can it later become rejected?
   **A:** No — once settled (fulfilled or rejected), a Promise's state is permanent and can never change again.

4. **Q:** Between a `setTimeout` callback and a `Promise.then()` callback registered around the same time, which runs first once the stack is empty?
   **A:** The `Promise.then()` callback (microtask) always runs first — the entire microtask queue is drained before any macrotask is processed, regardless of registration order.

5. **Q:** Is an HTTP call (`fetch`/`HttpClient.subscribe()`) a microtask or macrotask?
   **A:** Macrotask — it's a real network I/O operation completing outside JS; only the resulting `.then()`/`subscribe()` callback is scheduled once the response actually arrives, timed like other macrotasks. Returning a Promise does not automatically make something a microtask.

6. **Q:** Why does code before the first `await` in an async function run synchronously?
   **A:** `async` only guarantees the function returns a Promise — it doesn't defer execution. Only `await` itself pauses execution, scheduling the remainder as a microtask.

7. **Q:** What's the key behavioral difference between `Promise.all()` and `Promise.allSettled()`?
   **A:** `Promise.all()` is all-or-nothing — one rejection anywhere rejects the whole thing immediately, discarding successful results. `Promise.allSettled()` always waits for every promise and returns a per-promise status regardless of success/failure.

8. **Q:** What's wrong with writing 3 independent, unrelated API calls as 3 sequential `await` statements?
   **A:** Sequential `await` blocks each subsequent call from starting until the previous one fully resolves, turning what could be parallel (~1x the slowest call) into serial execution (~sum of all calls) — a real performance cost with no benefit since the calls don't depend on each other.

---

## JavaScript Foundations Status Check (Days 1–3 Complete)

Covered so far: Execution Context, Call Stack, Scope/Hoisting, Closures, `this` (all 5 rules, flagged for reinforcement), Prototypes/Prototype Chain, Event Loop, Microtasks/Macrotasks, Promises, Async/Await, Promise.all/allSettled.

**Remaining before moving to TypeScript:** Higher Order Functions & Array Methods (map/filter/reduce — direct precursor to RxJS operators), Modules (import/export), brief Browser Rendering/Performance overview.

---

## Next Up: Day 4 — Higher Order Functions & Array Methods
