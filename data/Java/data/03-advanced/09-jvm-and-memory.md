# Lesson 09 — JVM and Memory

**Module 03 · Advanced · Lesson 09 of 10**


## Learning objectives

- Understand **jvm and memory** in Java
- Read and write small examples you can run locally
- Connect this topic to the next lesson in the course

## Overview

JVM and Memory is a core topic on the PolyCode **Java Certificate Course** path. Work through the examples, then try the exercise before moving on.

## Key concepts

1. **Syntax and structure** — how Java expresses this idea clearly
2. **Common patterns** — what you will see in real projects
3. **Mistakes to avoid** — typical beginner errors and fixes

## Example

```java
// JVM and Memory — practice sketch
// add your code here
```

## Exercise

1. Write a short program that uses today's topic.
2. Change one value and predict the output before running.
3. Explain the result in your own words (2–3 sentences).

## Checkpoint

You are ready for the next lesson when you can solve the exercise without copying the example.

---

**Next:** This is the final lesson in this module.

---

## Additional reference

# JVM and Memory Management

Understanding how the JVM manages memory explains *why* Java behaves the way it does — why some objects disappear automatically, why certain bugs cause `OutOfMemoryError`, and why object references behave differently from primitive values.

## JVM architecture, at a glance

| Component | Role |
|---|---|
| Class Loader | Loads `.class` files into memory when needed |
| Runtime Data Areas | Where the running program's data actually lives (see below) |
| Execution Engine | Interprets bytecode and JIT-compiles hot code paths to native machine code |
| Garbage Collector | Automatically reclaims memory no longer in use |

## The two memory areas you'll actually reason about

### The Stack

Each thread gets its own stack, which holds **local variables** and **method call frames**. It's fast, and memory is reclaimed automatically the instant a method returns.

```java
void calculate() {
    int x = 5;        // lives on the stack
    int y = 10;        // lives on the stack
    int sum = x + y;   // lives on the stack
}   // the moment this method returns, x, y, and sum are gone
```

### The Heap

All **objects** (anything created with `new`) live on the heap, shared across the whole program — not tied to one method call.

```java
class Dog {
    String name;
}

void createDog() {
    Dog d = new Dog();   // the Dog OBJECT lives on the heap;
                           // the variable `d` (a reference to it) lives on the stack
    d.name = "Rex";
}
```

This split explains an important behavior: when you pass an object to a method, you're passing a **reference** (a heap address), not a copy of the data:

```java
class Counter {
    int value = 0;
}

static void increment(Counter c) {
    c.value++;   // modifies the SAME object the caller has
}

Counter counter = new Counter();
increment(counter);
increment(counter);
System.out.println(counter.value);   // 2 — both calls affected the same heap object
```

## Garbage collection

Java doesn't require you to manually free memory (unlike C/C++). The **garbage collector** periodically scans the heap and reclaims objects that nothing references anymore:

```java
Dog d = new Dog();
d.name = "Rex";
d = null;   // the Dog object is now unreachable — eligible for garbage collection
```

Once nothing in the program can reach an object, the GC is free to reclaim its memory at some point — you don't control exactly when.

## A common source of memory problems

Holding onto references longer than necessary (for example, in a growing static list that's never cleared) prevents the GC from reclaiming that memory, even if the objects are otherwise unused. Over time, this can lead to an `OutOfMemoryError`:

```java
static List<byte[]> leak = new ArrayList<>();

void leakyMethod() {
    leak.add(new byte[1_000_000]);   // keeps growing — `leak` always holds a reference,
                                       // so the GC can never reclaim these arrays
}
```

## Why this matters day to day

- **Pass-by-reference behavior for objects** explains why modifying an object inside a method affects the caller's copy too.
- **Primitives are copied**, not referenced — passing an `int` to a method never lets that method change the caller's original value.
- **Stack overflow** happens from runaway recursion with no base case — each call adds another frame to the stack until it runs out of space.

> 💡 **Key tip:** If a method seems to be mysteriously modifying data the caller didn't expect, check whether you're working with an object reference (shared) versus a primitive value (copied) — this single distinction explains a large share of confusing Java bugs.
