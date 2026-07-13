# Lesson 03 — Collections Framework

**Module 02 · Intermediate · Lesson 03 of 06**

## Learning Objectives

- Use `ArrayList`, `LinkedList`, `HashMap`, `HashSet`, and `LinkedHashMap`
- Iterate collections using for-each and iterators
- Choose the right collection for the job

## Overview

Arrays are fixed-size. The **Collections Framework** gives you dynamic, resizable data structures. `java.util` contains List, Set, Map, and Queue interfaces with multiple implementations. Knowing which to use and why is a core Java skill.

## Key Concepts

### 1. List — ArrayList and LinkedList

`List` is ordered and allows duplicates.

```java
import java.util.ArrayList;
import java.util.List;

List<String> names = new ArrayList<>();
names.add("Alice");
names.add("Bob");
names.add("Charlie");
names.add("Alice");   // duplicates allowed

System.out.println(names.size());      // 4
System.out.println(names.get(1));      // Bob
System.out.println(names.contains("Bob"));  // true

names.remove("Bob");                   // remove by value
names.remove(0);                       // remove by index

// Iterate
for (String name : names) {
    System.out.println(name);
}
```

**ArrayList vs LinkedList:**
| | ArrayList | LinkedList |
|--|-----------|------------|
| Get by index | O(1) — fast | O(n) — slow |
| Insert/delete at middle | O(n) | O(1) |
| Use when | Most cases | Frequent insertions/deletions |

### 2. Set — HashSet, LinkedHashSet, TreeSet

`Set` has **no duplicates**. HashSet has no order, LinkedHashSet preserves insertion order, TreeSet sorts.

```java
import java.util.HashSet;
import java.util.Set;

Set<String> fruits = new HashSet<>();
fruits.add("Apple");
fruits.add("Banana");
fruits.add("Apple");   // duplicate — ignored
fruits.add("Cherry");

System.out.println(fruits.size());     // 3
System.out.println(fruits.contains("Banana")); // true
```

### 3. Map — HashMap, LinkedHashMap, TreeMap

`Map` stores key-value pairs. Keys must be unique.

```java
import java.util.HashMap;
import java.util.Map;

Map<String, Integer> scores = new HashMap<>();
scores.put("Alice", 92);
scores.put("Bob", 85);
scores.put("Charlie", 78);

System.out.println(scores.get("Bob"));         // 85
System.out.println(scores.containsKey("Alice")); // true
scores.put("Bob", 90);   // update existing key

// Iterate entries
for (Map.Entry<String, Integer> entry : scores.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}

// Helpful methods
scores.getOrDefault("Dave", 0);   // 0 (Dave doesn't exist)
scores.putIfAbsent("Eve", 88);    // only adds if key absent
```

### 4. Queue and Deque

```java
import java.util.ArrayDeque;
import java.util.Queue;

Queue<String> queue = new ArrayDeque<>();
queue.offer("Task 1");   // add to back
queue.offer("Task 2");
queue.offer("Task 3");

System.out.println(queue.peek());    // Task 1 (look without removing)
System.out.println(queue.poll());    // Task 1 (remove from front)
System.out.println(queue.size());    // 2
```

### 5. Collections Utility Methods

```java
import java.util.Collections;
import java.util.List;

List<Integer> nums = new ArrayList<>(List.of(5, 2, 8, 1, 9));
Collections.sort(nums);                  // [1, 2, 5, 8, 9]
Collections.reverse(nums);               // [9, 8, 5, 2, 1]
Collections.shuffle(nums);               // random order
int max = Collections.max(nums);
int min = Collections.min(nums);
```

## Full Example

```java
import java.util.*;

public class CollectionsDemo {
    public static void main(String[] args) {
        // Word frequency counter
        String text = "the cat sat on the mat the cat sat";
        String[] words = text.split(" ");

        Map<String, Integer> freq = new LinkedHashMap<>();
        for (String word : words) {
            freq.put(word, freq.getOrDefault(word, 0) + 1);
        }

        System.out.println("Word frequencies:");
        freq.forEach((word, count) ->
            System.out.printf("  %-8s: %d%n", word, count));

        // Unique words sorted
        Set<String> unique = new TreeSet<>(freq.keySet());
        System.out.println("\nUnique words (sorted): " + unique);

        // Top 3 most frequent
        List<Map.Entry<String, Integer>> entries = new ArrayList<>(freq.entrySet());
        entries.sort((a, b) -> b.getValue() - a.getValue());

        System.out.println("\nTop 3 most frequent:");
        entries.stream().limit(3).forEach(e ->
            System.out.println("  " + e.getKey() + " x" + e.getValue()));
    }
}
```

**Expected output:**
```
Word frequencies:
  the      : 3
  cat      : 2
  sat      : 2
  on       : 1
  mat      : 1

Unique words (sorted): [cat, mat, on, sat, the]

Top 3 most frequent:
  the x3
  cat x2
  sat x2
```

## Exercise

1. Write a program that reads 10 integers from the user and uses a `Set` to find duplicates.
2. Implement a simple phone book using `TreeMap<String, String>` (name → phone number) with add, remove, and search operations.
3. Use a `Queue` (ArrayDeque) to simulate a print spooler that processes jobs in order.

## Checkpoint

You are ready for the next lesson when you can:
- Explain the difference between List, Set, and Map
- Choose between HashMap and TreeMap
- Iterate a Map using `entrySet()`

---
**Next:** Lesson 04 — Exception Handling
