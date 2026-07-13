# Lesson 02 — Lambda Expressions and Functional Interfaces

**Module 03 · Advanced · Lesson 02 of 10**

## Learning Objectives

- Write lambda expressions for common functional interfaces
- Use `Function`, `Predicate`, `Consumer`, `Supplier`, and `BiFunction`
- Chain functions with `andThen`, `compose`, and `and`/`or`

## Overview

A **lambda expression** is a short, anonymous function you can pass around like a value. Combined with **functional interfaces** (interfaces with one abstract method), lambdas let you write concise, expressive code — no need to create a separate class just to pass behaviour.

## Key Concepts

### 1. Lambda Syntax

```java
// Full form
(int a, int b) -> { return a + b; }

// Inferred types
(a, b) -> { return a + b; }

// Single expression (return is implicit)
(a, b) -> a + b

// Single parameter (parentheses optional)
name -> name.toUpperCase()

// No parameters
() -> System.out.println("Hello!")
```

### 2. Built-in Functional Interfaces (`java.util.function`)

| Interface | Signature | Use |
|-----------|-----------|-----|
| `Predicate<T>` | `T → boolean` | Test a condition |
| `Function<T,R>` | `T → R` | Transform a value |
| `Consumer<T>` | `T → void` | Use a value, no return |
| `Supplier<T>` | `() → T` | Provide a value |
| `BiFunction<T,U,R>` | `T,U → R` | Two inputs, one output |
| `UnaryOperator<T>` | `T → T` | Transform, same type |
| `BinaryOperator<T>` | `T,T → T` | Combine two same-type values |

### 3. Predicate

```java
import java.util.function.Predicate;

Predicate<String> isLong    = s -> s.length() > 5;
Predicate<String> startsA   = s -> s.startsWith("A");

System.out.println(isLong.test("Hello"));     // false
System.out.println(isLong.test("Hello World")); // true

// Compose predicates
Predicate<String> longAndA = isLong.and(startsA);
Predicate<String> longOrA  = isLong.or(startsA);
Predicate<String> notLong  = isLong.negate();

System.out.println(longAndA.test("Alexander")); // true
```

### 4. Function and Chaining

```java
import java.util.function.Function;

Function<String, Integer> strLen   = String::length;
Function<Integer, String> intToStr = n -> "Length: " + n;

// andThen: apply strLen, then intToStr
Function<String, String> combined = strLen.andThen(intToStr);
System.out.println(combined.apply("Hello"));  // Length: 5

// compose: apply intToStr first, then strLen (opposite order)
```

### 5. Consumer

```java
import java.util.function.Consumer;

Consumer<String> print = System.out::println;
Consumer<String> shout = s -> System.out.println(s.toUpperCase());

// Chain consumers
Consumer<String> both = print.andThen(shout);
both.accept("hello");
// hello
// HELLO
```

### 6. Supplier

```java
import java.util.function.Supplier;

Supplier<String> greeting = () -> "Good morning!";
Supplier<Double> random   = Math::random;

System.out.println(greeting.get());  // Good morning!
System.out.println(random.get());    // 0.7364...
```

### 7. Method References

Shorthand for lambdas that just call an existing method:

```java
// Static method
Function<String, Integer> parse = Integer::parseInt;

// Instance method on parameter
Function<String, String> upper = String::toUpperCase;

// Instance method on specific object
String prefix = "Hello, ";
Function<String, String> greet = prefix::concat;

// Constructor reference
Supplier<ArrayList<String>> listFactory = ArrayList::new;
```

## Full Example

```java
import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class LambdaDemo {
    // Higher-order function: takes a function as parameter
    static <T, R> List<R> transform(List<T> list, Function<T, R> fn) {
        return list.stream().map(fn).collect(Collectors.toList());
    }

    static <T> List<T> filter(List<T> list, Predicate<T> predicate) {
        return list.stream().filter(predicate).collect(Collectors.toList());
    }

    static <T> void process(List<T> list, Consumer<T> action) {
        list.forEach(action);
    }

    public static void main(String[] args) {
        List<String> names = List.of("Alice", "Bob", "Charlie", "Anna", "Brian");

        // Transform: names → lengths
        List<Integer> lengths = transform(names, String::length);
        System.out.println("Lengths: " + lengths);

        // Filter: names starting with A
        List<String> aNames = filter(names, n -> n.startsWith("A"));
        System.out.println("A names: " + aNames);

        // Compose predicates
        Predicate<String> longName  = n -> n.length() > 4;
        Predicate<String> startsB   = n -> n.startsWith("B");
        List<String> special = filter(names, longName.or(startsB));
        System.out.println("Long or B: " + special);

        // Consumer chain
        Consumer<String> upper = s -> System.out.print(s.toUpperCase());
        Consumer<String> comma = s -> System.out.print(", ");
        process(aNames, upper.andThen(comma));
        System.out.println();

        // Function pipeline
        Function<String, String> clean    = String::trim;
        Function<String, String> titleCase = s -> 
            Character.toUpperCase(s.charAt(0)) + s.substring(1).toLowerCase();
        Function<String, String> pipeline  = clean.andThen(titleCase);

        List<String> messy = List.of("  alice  ", "BOB", "  CHARLIE");
        System.out.println(transform(messy, pipeline));
    }
}
```

**Expected output:**
```
Lengths: [5, 3, 7, 4, 5]
A names: [Alice, Anna]
Long or B: [Alice, Charlie, Brian]
ALICE, ANNA,
[Alice, Bob, Charlie]
```

## Exercise

1. Write a method `applyTwice(Function<T,T> f, T value)` that applies a function to a value twice.
2. Build a validation pipeline for a registration form: check that a username is non-null, length ≥ 3, and contains only letters using composed `Predicate`s.
3. Create a `BiFunction<List<Integer>, Predicate<Integer>, Map<Boolean, List<Integer>>>` that partitions a list into matching and non-matching elements.

## Checkpoint

You are ready for the next lesson when you can:
- Write all 5 core functional interfaces from memory
- Chain predicates with `and`, `or`, `negate`
- Use method references for static, instance, and constructor calls

---
**Next:** Lesson 03 — Multithreading and Concurrency
