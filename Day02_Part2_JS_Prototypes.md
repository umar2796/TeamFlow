# TEAMFLOW — Angular Enterprise Journey
## Day 2 (Part 2) Notes: Prototypes & Prototypal Inheritance

---

## 1. The Problem Prototypes Solve

Without prototypes, every object needing the "same" behavior would need its own private copy of every function:

```javascript
const task1 = { title: 'Design', complete: function() { console.log('done'); } };
const task2 = { title: 'Code', complete: function() { console.log('done'); } };
```

With 10,000 task objects, that's 10,000 duplicate `complete` functions wasting memory — even though they all do exactly the same thing.

**The fix:** store shared behavior **once**, in one place, and let all objects fall back to that shared place when they don't have the property themselves.

---

## 2. The Prototype Chain — Core Mechanism

```javascript
const taskMethods = {
  complete: function() {
    console.log('done');
  }
};

const task1 = { title: 'Design' };
Object.setPrototypeOf(task1, taskMethods);

task1.complete(); // 'done'
```

**How property lookup actually works in JS:**
1. JS checks if the property/method exists **directly on the object itself**
2. If not found, JS checks the object's **prototype** (the linked fallback object)
3. If still not found, JS checks the prototype's prototype — and keeps walking up
4. This continues until it reaches `null` (the end of the chain) — if not found anywhere, returns `undefined` (for properties) or throws `TypeError` (if you try to call it as a function)

This fallback-lookup chain is called the **prototype chain**.

---

## 3. Built-In Prototypes You Already Use

**Every array** automatically links to `Array.prototype`, which holds `push`, `pop`, `map`, `filter`, `forEach`, `reduce`, `slice`, etc. — ONE shared copy for every array in your program.

```javascript
const arr1 = [1, 2, 3];
const arr2 = ['a', 'b'];

console.log(arr1.push === arr2.push); // true — same function in memory
console.log(Object.getPrototypeOf(arr1) === Array.prototype); // true
```

**Every plain object literal** automatically links to `Object.prototype`, which holds `hasOwnProperty`, `toString`, `valueOf`, etc.

```javascript
const obj = { name: 'Rahul' };
console.log(Object.getPrototypeOf(obj) === Object.prototype); // true
```

---

## 4. Constructor Functions + `prototype` (Pre-ES6 Class Pattern)

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHi = function() {
  console.log('Hi, ' + this.name);
};

const p1 = new Person('Aman');
const p2 = new Person('Priya');

p1.sayHi(); // 'Hi, Aman'
p2.sayHi(); // 'Hi, Priya'

console.log(p1.sayHi === p2.sayHi); // true — same shared function
```

**What's happening, combining 3 rules learned so far:**
1. **`new` binding (Rule 4):** creates a fresh object, `this` points to it, runs constructor body → `this.name = name` lands on the new object
2. **Prototype chain:** `sayHi` is NOT copied per-instance — it lives once on `Person.prototype`, and every instance falls back to that same shared function
3. **Implicit binding (Rule 2):** when calling `p1.sayHi()`, JS looks left of the dot → `this = p1` for that specific call, so `this.name` resolves correctly per-instance even though the function itself is shared

**This is the mechanism ES6 `class` syntax hides under the hood** — `class Person { sayHi() {...} }` compiles down to essentially this exact pattern.

---

## 5. Direct Connection to `this` Lesson — Regular Methods vs Arrow Class Fields

```typescript
class TaskComponent {
  taskName = 'Design Review';

  logRegular() {                 // stored ONCE on TaskComponent.prototype
    console.log(this.taskName);
  }

  logArrow = () => {              // stored PER INSTANCE (class field)
    console.log(this.taskName);
  };
}

const comp1 = new TaskComponent();
const comp2 = new TaskComponent();

console.log(comp1.logRegular === comp2.logRegular); // true  — shared prototype function
console.log(comp1.logArrow === comp2.logArrow);     // false — separate copy per instance
```

**The trade-off:**
- **Regular methods** → memory-efficient (one shared copy on the prototype), but **lose `this`** if torn away from their object and called as a bare reference (must always be called with the dot, or manually `.bind()`-ed)
- **Arrow function class fields** → safely preserve `this` no matter how they're called/passed around, but cost a small amount of **extra memory per instance** since they can't live on the shared prototype (they must individually close over each instance's own `this`)

For 99% of Angular components/services this trade-off is negligible — but understanding *why* it exists demonstrates real depth in interviews, beyond "arrow functions fix `this`, that's the rule."

---

## 6. `hasOwnProperty` vs Prototype Chain Lookup

```javascript
const obj = { name: 'Rahul' };

console.log(obj.hasOwnProperty('name'));     // true
console.log(obj.hasOwnProperty('toString')); // false
console.log(obj.toString());                  // "[object Object]" — still works!
```

**Key distinction:**
- `hasOwnProperty(prop)` checks **only the object itself** — does NOT look up the prototype chain. `name` is on `obj` directly → `true`. `toString` lives on `Object.prototype`, one level up → `false`.
- Calling `obj.toString()` is a **completely separate operation** from checking `hasOwnProperty`. Method calls DO walk the full prototype chain to find and execute the method — so `toString()` still works perfectly even though `hasOwnProperty('toString')` returned `false`.

**Rule to memorize:** *`hasOwnProperty` tells you WHERE a property lives (own object vs. inherited via chain). It does NOT determine whether calling that property/method will succeed.*

---

## 7. Angular Connection — Why This Matters Practically

```typescript
@Injectable({ providedIn: 'root' })
export class TaskService {
  getTasks() {
    return this.http.get('/api/tasks');
  }
}
```

Every method on every Angular class (`getTasks`, `ngOnInit`, `onSubmit`, etc.) is stored **once** on that class's prototype, not duplicated per instance. Angular's Dependency Injection creates service/component instances using `new` internally (formal deep dive in Week 3), and all instances share method definitions via the prototype chain — exactly like `Person.prototype.sayHi`. This is why having hundreds of component instances on a complex page (e.g., hundreds of `TaskCardComponent`s on a Kanban board) remains memory-efficient — the methods aren't duplicated, only the instance-specific data (fields/properties) is.

---

## Interview Q&A Recap

1. **Q:** Why don't 10,000 array instances each carry their own copy of `push`?
   **A:** All arrays share a single `Array.prototype` object via the prototype chain; `push` is looked up there, not duplicated per array.

2. **Q:** What does the prototype chain actually do when a property isn't found on an object?
   **A:** JS walks up to the object's prototype, then that prototype's prototype, and so on, until it finds the property or reaches `null`.

3. **Q:** Why does `p1.sayHi === p2.sayHi` return `true` for constructor-function-based objects?
   **A:** `sayHi` is defined once on `Person.prototype`; both instances reference the exact same function in memory via the prototype chain, not separate copies.

4. **Q:** Why do arrow function class fields NOT sit on the prototype like regular methods do?
   **A:** Class fields are assigned directly onto each instance during construction so they can individually close over that instance's own `this` — they cannot be shared on the prototype the way stateless regular methods can.

5. **Q:** Does `hasOwnProperty('toString')` returning `false` mean `obj.toString()` will fail?
   **A:** No — `hasOwnProperty` only checks the object's own properties, not the prototype chain. Method calls still walk the full chain and will find/execute inherited methods normally.

---

## Next Up: Day 3 — Promises, Async/Await, and the Event Loop
