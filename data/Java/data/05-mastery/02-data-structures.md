# Lesson 02 — Data Structures

**Module 05 · Mastery · Lesson 02 of 05**


## Learning objectives

- Understand **data structures** in Java
- Read and write small examples you can run locally
- Connect this topic to the next lesson in the course

## Overview

Data Structures is a core topic on the PolyCode **Java Certificate Course** path. Work through the examples, then try the exercise before moving on.

## Key concepts

1. **Syntax and structure** — how Java expresses this idea clearly
2. **Common patterns** — what you will see in real projects
3. **Mistakes to avoid** — typical beginner errors and fixes

## Example

```java
// Data Structures — practice sketch
// add your code here
```

## Exercise

1. Write a short program that uses today's topic.
2. Change one value and predict the output before running.
3. Explain the result in your own words (2–3 sentences).

## Checkpoint

You are ready for the next lesson when you can solve the exercise without copying the example.

---

**Next:** Continue to lesson 03 in this module.

---

## Additional reference

# Data Structures

A **data structure** organizes data so specific operations (adding, finding, removing) can be performed efficiently. Choosing the right one for the job is one of the most practical skills in programming.

## Stack — Last In, First Out (LIFO)

Think of a stack of plates: you add to the top, and you remove from the top.

```java
import java.util.Stack;

Stack<String> stack = new Stack<>();
stack.push("first");
stack.push("second");
stack.push("third");

System.out.println(stack.pop());   // third — the most recently added comes off first
System.out.println(stack.peek());  // second — look at the top without removing it
System.out.println(stack.size());  // 2
```

**Used for:** undo functionality, tracking function calls (this is literally how the JVM's call stack works), matching brackets/parentheses.

## Queue — First In, First Out (FIFO)

Think of a checkout line: the first person to join is the first one served.

```java
import java.util.Queue;
import java.util.LinkedList;

Queue<String> queue = new LinkedList<>();
queue.offer("Maryam");
queue.offer("Ali");
queue.offer("Sara");

System.out.println(queue.poll());   // Maryam — the first one added comes off first
System.out.println(queue.peek());   // Ali — look at the front without removing it
```

**Used for:** task scheduling, processing requests in the order they arrive, breadth-first search.

## LinkedList — a chain of connected nodes

Unlike an array, a `LinkedList` doesn't need contiguous memory — each element ("node") points to the next one. This makes inserting/removing from the middle cheaper than with an array-backed list, at the cost of slower random access.

```java
import java.util.LinkedList;

LinkedList<String> list = new LinkedList<>();
list.add("B");
list.addFirst("A");   // efficient — no shifting required, unlike with an ArrayList
list.addLast("C");

System.out.println(list);   // [A, B, C]
```

## HashMap — fast key-to-value lookup

A `HashMap` stores key-value pairs and gives near-instant (`O(1)` on average) lookup by key — no scanning required.

```java
import java.util.HashMap;

HashMap<String, Integer> ages = new HashMap<>();
ages.put("Maryam", 21);
ages.put("Ali", 23);

System.out.println(ages.get("Maryam"));        // 21
System.out.println(ages.containsKey("Sara"));   // false
ages.remove("Ali");

for (String name : ages.keySet()) {
    System.out.println(name + ": " + ages.get(name));
}
```

**Used for:** counting occurrences, caching, any "look something up by a name/id" scenario.

## Choosing between them

| Need | Reach for |
|---|---|
| Undo/redo, reversing order | `Stack` |
| Process items in arrival order | `Queue` |
| Frequent inserts/removes in the middle | `LinkedList` |
| Fast random access by numeric index | `ArrayList` (Module 02, Lesson 03) |
| Fast lookup by a unique key | `HashMap` |
| No duplicates, unordered | `HashSet` |

## A practical example: counting word frequency with a HashMap

```java
import java.util.HashMap;

String[] words = {"java", "python", "java", "java", "python"};
HashMap<String, Integer> counts = new HashMap<>();

for (String word : words) {
    counts.put(word, counts.getOrDefault(word, 0) + 1);
}

System.out.println(counts);
```

**Output:**
```
{java=3, python=2}
```

`getOrDefault(word, 0)` returns the current count, or `0` if the word hasn't been seen yet — avoiding a manual "does this key exist?" check.

> 💡 **Key tip:** The right data structure usually makes the algorithm *simpler*, not just faster — if you're writing complicated logic to track "what came first" or "have I seen this before," there's probably a `Queue` or `HashMap` that does it directly.
