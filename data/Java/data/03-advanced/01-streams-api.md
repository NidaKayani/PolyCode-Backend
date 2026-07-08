# Lesson 01 — Streams API

**Module 03 · Advanced · Lesson 01 of 10**

## Learning Objectives

- Build stream pipelines with `filter`, `map`, `sorted`, `reduce`, and `collect`
- Understand the difference between intermediate and terminal operations
- Use `Collectors` to group and summarise data

## Overview

The **Stream API** (Java 8+) lets you process collections declaratively — describing *what* you want rather than *how* to do it. A stream pipeline is: **source → intermediate operations → terminal operation**. Streams don't modify the original collection; they produce new values.

## Key Concepts

### 1. Creating Streams

```java
import java.util.stream.*;

// From a collection
List<String> names = List.of("Alice", "Bob", "Charlie");
Stream<String> stream = names.stream();

// From values directly
Stream<Integer> nums = Stream.of(1, 2, 3, 4, 5);

// Infinite stream
Stream<Integer> evens = Stream.iterate(0, n -> n + 2);  // 0, 2, 4, 6...

// IntStream for primitives (no boxing overhead)
IntStream range = IntStream.rangeClosed(1, 10);   // 1 to 10 inclusive
```

### 2. Intermediate Operations (lazy — return a new Stream)

```java
List<String> names = List.of("Alice", "Bob", "Charlie", "Anna", "Brian");

names.stream()
     .filter(n -> n.startsWith("A"))    // keep only names starting with A
     .map(String::toUpperCase)           // transform each
     .sorted()                           // sort alphabetically
     .forEach(System.out::println);
// Output:
// ALICE
// ANNA
```

| Operation | What it does |
|-----------|-------------|
| `filter(predicate)` | Keep elements matching condition |
| `map(function)` | Transform each element |
| `mapToInt/Double/Long` | Map to primitive stream |
| `sorted()` / `sorted(comparator)` | Sort elements |
| `distinct()` | Remove duplicates |
| `limit(n)` | Take first n elements |
| `skip(n)` | Skip first n elements |
| `peek(consumer)` | Debug — inspect without changing |

### 3. Terminal Operations (trigger execution)

```java
List<Integer> numbers = List.of(3, 1, 4, 1, 5, 9, 2, 6);

long count   = numbers.stream().filter(n -> n > 3).count();      // 4
int  sum     = numbers.stream().mapToInt(Integer::intValue).sum(); // 31
int  max     = numbers.stream().mapToInt(Integer::intValue).max().getAsInt(); // 9
boolean any  = numbers.stream().anyMatch(n -> n > 8);             // true
boolean all  = numbers.stream().allMatch(n -> n > 0);             // true
List<Integer> sorted = numbers.stream().sorted().collect(Collectors.toList());
```

### 4. collect() and Collectors

```java
import java.util.stream.Collectors;

List<String> names = List.of("Alice", "Bob", "Charlie", "Anna");

// To List
List<String> result = names.stream()
    .filter(n -> n.length() > 3)
    .collect(Collectors.toList());   // [Alice, Charlie, Anna]

// To Map
Map<Integer, List<String>> byLength = names.stream()
    .collect(Collectors.groupingBy(String::length));
// {5=[Alice, Anna (4)...], actually: {5=[Alice], 3=[Bob], 7=[Charlie], 4=[Anna]}

// Joining
String joined = names.stream()
    .collect(Collectors.joining(", ", "[", "]"));
// [Alice, Bob, Charlie, Anna]

// Counting per group
Map<Integer, Long> countByLength = names.stream()
    .collect(Collectors.groupingBy(String::length, Collectors.counting()));
```

### 5. reduce()

```java
// Sum using reduce
int sum = IntStream.rangeClosed(1, 100).reduce(0, Integer::sum);  // 5050

// Factorial
int factorial = IntStream.rangeClosed(1, 5).reduce(1, (a, b) -> a * b);  // 120
```

### 6. flatMap()

Flattens a stream of streams into one stream:

```java
List<List<Integer>> nested = List.of(
    List.of(1, 2, 3),
    List.of(4, 5),
    List.of(6, 7, 8, 9)
);

List<Integer> flat = nested.stream()
    .flatMap(Collection::stream)
    .collect(Collectors.toList());
// [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

## Full Example

```java
import java.util.*;
import java.util.stream.*;

public class StreamsDemo {
    record Employee(String name, String dept, double salary) {}

    public static void main(String[] args) {
        List<Employee> employees = List.of(
            new Employee("Alice",   "Engineering", 95000),
            new Employee("Bob",     "Marketing",   72000),
            new Employee("Charlie", "Engineering", 88000),
            new Employee("Diana",   "HR",          65000),
            new Employee("Eve",     "Engineering", 105000),
            new Employee("Frank",   "Marketing",   78000)
        );

        // Average salary per department
        System.out.println("=== Avg Salary by Department ===");
        employees.stream()
            .collect(Collectors.groupingBy(Employee::dept,
                     Collectors.averagingDouble(Employee::salary)))
            .forEach((dept, avg) ->
                System.out.printf("%-15s $%.0f%n", dept, avg));

        // Top 3 earners
        System.out.println("\n=== Top 3 Earners ===");
        employees.stream()
            .sorted(Comparator.comparingDouble(Employee::salary).reversed())
            .limit(3)
            .forEach(e -> System.out.printf("%-10s $%.0f%n", e.name(), e.salary()));

        // All Engineering employees earning > $90k
        System.out.println("\n=== Senior Engineers (>$90k) ===");
        employees.stream()
            .filter(e -> e.dept().equals("Engineering") && e.salary() > 90000)
            .map(Employee::name)
            .collect(Collectors.joining(", "));
    }
}
```

**Expected output:**
```
=== Avg Salary by Department ===
Engineering     $96000
Marketing       $75000
HR              $65000

=== Top 3 Earners ===
Eve        $105000
Alice      $95000
Charlie    $88000

=== Senior Engineers (>$90k) ===
Alice, Eve
```

## Exercise

1. Given a list of integers, use streams to find all perfect squares, double them, and collect into a sorted list.
2. Given a list of sentences, use `flatMap` to get a frequency map of all words.
3. Given a list of `Product(name, category, price)`, group by category and find the most expensive product per category.

## Checkpoint

You are ready for the next lesson when you can:
- Build a 3-stage stream pipeline from memory
- Use `groupingBy` with a downstream collector
- Explain why intermediate operations are lazy

---

**Next:** Continue to lesson 02 in this module.

---

## Additional reference

# Streams API

A **Stream** is a pipeline for processing collections of data declaratively — describing *what* you want done (filter these, map those, sum it up), rather than writing manual loops to do it.

## Creating a stream

```java
import java.util.List;
import java.util.stream.Stream;

List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
Stream<Integer> stream = numbers.stream();
```

A stream doesn't store data itself — it's a view over a source (like a `List`) that you can chain operations onto.

## The pipeline shape: source → intermediate ops → terminal op

```java
import java.util.List;

List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

List<Integer> result = numbers.stream()
        .filter(n -> n % 2 == 0)   // intermediate: keep even numbers
        .map(n -> n * n)            // intermediate: square each one
        .sorted()                    // intermediate: sort ascending
        .toList();                   // terminal: collect into a List

System.out.println(result);
```

**Output:**
```
[4, 16, 36, 64, 100]
```

**Intermediate operations** (`filter`, `map`, `sorted`) return another stream, so you can chain more onto them. **Terminal operations** (`toList`, `forEach`, `count`, `sum`) end the pipeline and produce a result.

## Common operations

```java
import java.util.List;

List<String> names = List.of("Maryam", "Ali", "Sara", "Hassan", "Amna");

// filter — keep elements matching a condition
names.stream()
     .filter(name -> name.length() > 4)
     .forEach(System.out::println);

// map — transform each element
names.stream()
     .map(String::toUpperCase)
     .forEach(System.out::println);

// count — how many match
long count = names.stream().filter(name -> name.startsWith("A")).count();
System.out.println("Names starting with A: " + count);

// reduce — combine all elements into one result
int totalLetters = names.stream()
        .mapToInt(String::length)
        .sum();
System.out.println("Total letters: " + totalLetters);
```

**Output:**
```
Maryam
Hassan
MARYAM
ALI
SARA
HASSAN
AMNA
Names starting with A: 2
Total letters: 23
```

## Sorting with a custom rule

```java
List<String> sorted = names.stream()
        .sorted((a, b) -> a.length() - b.length())   // shortest name first
        .toList();
System.out.println(sorted);
```

## Why use streams instead of a for-loop?

```java
// Traditional loop
List<Integer> evens = new java.util.ArrayList<>();
for (int n : numbers) {
    if (n % 2 == 0) {
        evens.add(n);
    }
}

// Equivalent stream
List<Integer> evensStream = numbers.stream()
        .filter(n -> n % 2 == 0)
        .toList();
```

Both produce the same result — streams just read closer to a description of the *goal* ("give me the even ones") instead of the step-by-step *mechanics* of a loop.

## Summary

| Operation | Type | Purpose |
|---|---|---|
| `filter(predicate)` | Intermediate | Keep elements matching a condition |
| `map(function)` | Intermediate | Transform each element |
| `sorted()` | Intermediate | Sort the elements |
| `forEach(action)` | Terminal | Run an action on each element |
| `count()` | Terminal | Count matching elements |
| `toList()` / `collect(...)` | Terminal | Gather results into a collection |
| `reduce(...)` | Terminal | Combine all elements into one value |

> 💡 **Key tip:** A stream can only be consumed **once**. If you need to run two different pipelines over the same data, call `.stream()` again on the original collection for each one.
