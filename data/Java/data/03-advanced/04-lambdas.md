# Lesson 04 — Lambda Expressions

**Module 03 · Advanced · Lesson 04 of 10**


## Learning objectives

- Understand **lambda expressions** in Java
- Read and write small examples you can run locally
- Connect this topic to the next lesson in the course

## Overview

Lambda Expressions is a core topic on the PolyCode **Java Certificate Course** path. Work through the examples, then try the exercise before moving on.

## Key concepts

1. **Syntax and structure** — how Java expresses this idea clearly
2. **Common patterns** — what you will see in real projects
3. **Mistakes to avoid** — typical beginner errors and fixes

## Example

```java
// Lambda Expressions — practice sketch
// add your code here
```

## Exercise

1. Write a short program that uses today's topic.
2. Change one value and predict the output before running.
3. Explain the result in your own words (2–3 sentences).

## Checkpoint

You are ready for the next lesson when you can solve the exercise without copying the example.

---

**Next:** Continue to lesson 04 in this module.

---

## Additional reference

# Lambda Expressions

A **lambda expression** is a compact way to write an anonymous (unnamed) function — most useful when you need to pass a small piece of behavior somewhere, without writing a whole separate method or class for it.

## Basic syntax

```java
(parameters) -> expression
(parameters) -> { statements; }
```

## Functional interfaces — what lambdas actually are

A lambda can only be assigned to a **functional interface**: an interface with exactly one abstract method.

```java
interface Operation {
    int apply(int a, int b);
}
```

```java
Operation add = (a, b) -> a + b;
Operation multiply = (a, b) -> a * b;

System.out.println(add.apply(3, 4));        // 7
System.out.println(multiply.apply(3, 4));   // 12
```

The lambda's parameters and body fill in the single abstract method (`apply`) — Java infers which method you mean because there's only one possible match.

## Built-in functional interfaces (`java.util.function`)

You rarely need to define your own — the standard library already provides the common shapes:

```java
import java.util.function.Predicate;
import java.util.function.Function;
import java.util.function.Consumer;
import java.util.function.Supplier;

Predicate<Integer> isEven = n -> n % 2 == 0;
System.out.println(isEven.test(4));   // true

Function<Integer, Integer> square = n -> n * n;
System.out.println(square.apply(5));   // 25

Consumer<String> printer = s -> System.out.println("Got: " + s);
printer.accept("Hello");   // Got: Hello

Supplier<String> greeting = () -> "Hi there!";
System.out.println(greeting.get());   // Hi there!
```

| Interface | Takes | Returns | Use case |
|---|---|---|---|
| `Predicate<T>` | `T` | `boolean` | A yes/no test |
| `Function<T, R>` | `T` | `R` | A transformation |
| `Consumer<T>` | `T` | nothing | An action to perform on a value |
| `Supplier<T>` | nothing | `T` | Produces a value on demand |

## Lambdas with collections and streams

This is where lambdas show up constantly in real code:

```java
import java.util.List;

List<String> names = List.of("Maryam", "Ali", "Sara", "Hassan");

names.forEach(name -> System.out.println("Hello, " + name));

List<String> longNames = names.stream()
        .filter(name -> name.length() > 4)
        .toList();
System.out.println(longNames);
```

## Method references — an even shorter form

When a lambda just calls an existing method with no extra logic, you can reference that method directly with `::`:

```java
names.forEach(System.out::println);          // instead of: name -> System.out.println(name)

List<String> upper = names.stream()
        .map(String::toUpperCase)              // instead of: name -> name.toUpperCase()
        .toList();
```

## Before and after: sorting a list

```java
import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;

List<String> names = new ArrayList<>(List.of("Hassan", "Ali", "Sara"));

// Old style — an anonymous class
names.sort(new Comparator<String>() {
    public int compare(String a, String b) {
        return a.length() - b.length();
    }
});

// Same thing as a lambda
names.sort((a, b) -> a.length() - b.length());
```

Both sort by name length, but the lambda removes the ceremony of declaring a whole anonymous class for one tiny method.

> 💡 **Key tip:** A lambda is only valid where Java expects a **functional interface** (one abstract method). If you get a compile error about an "incompatible target type," check that the interface you're assigning to truly has just one abstract method.
