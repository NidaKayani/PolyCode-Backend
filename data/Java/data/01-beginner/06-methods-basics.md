# Lesson 06 — Methods

**Module 01 · Beginner · Lesson 06 of 10**

## Learning Objectives

- Define and call methods with parameters and return values
- Understand method overloading
- Know the difference between `void` and non-void methods

## Overview

A **method** is a named block of code that performs a specific task. Instead of writing the same logic repeatedly, you write it once as a method and call it whenever needed. Methods make code **reusable**, **readable**, and **easier to test**.

## Key Concepts

### 1. Method Anatomy

```java
// accessModifier returnType methodName(parameterList) { body }
public static int add(int a, int b) {
    return a + b;
}
```

| Part | Meaning |
|------|---------|
| `public` | Callable from anywhere |
| `static` | Can be called without creating an object |
| `int` | Return type (use `void` if nothing is returned) |
| `add` | Method name (use camelCase) |
| `int a, int b` | Parameters (inputs) |
| `return a + b` | Return value |

### 2. void Methods (no return value)

```java
public static void greet(String name) {
    System.out.println("Hello, " + name + "!");
}

// Calling it:
greet("Alice");   // Hello, Alice!
```

### 3. Methods with Return Values

```java
public static double circleArea(double radius) {
    return Math.PI * radius * radius;
}

// Calling it:
double area = circleArea(5.0);
System.out.printf("Area: %.2f%n", area);  // Area: 78.54
```

### 4. Method Overloading

Multiple methods can share the same name if their **parameter lists differ** (different types or number of parameters).

```java
public static int multiply(int a, int b) {
    return a * b;
}

public static double multiply(double a, double b) {
    return a * b;
}

public static int multiply(int a, int b, int c) {
    return a * b * c;
}

// Java picks the right one automatically:
multiply(3, 4);           // calls int version → 12
multiply(2.5, 4.0);       // calls double version → 10.0
multiply(2, 3, 4);        // calls 3-parameter version → 24
```

### 5. Parameters vs Arguments

- **Parameter**: variable in the method definition (`int a`)
- **Argument**: actual value passed when calling (`add(5, 3)` — here `5` and `3` are arguments)

### 6. Scope

Variables declared inside a method only exist inside that method.

```java
public static void example() {
    int local = 10;    // only visible inside example()
}
// System.out.println(local); ← compile error! local doesn't exist here
```

## Full Example

```java
public class MethodsDemo {

    public static int max(int a, int b) {
        return (a > b) ? a : b;
    }

    public static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; i <= Math.sqrt(n); i++) {
            if (n % i == 0) return false;
        }
        return true;
    }

    public static String repeat(String text, int times) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < times; i++) {
            sb.append(text);
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println("Max of 17 and 42: " + max(17, 42));

        System.out.println("Primes up to 30:");
        for (int i = 2; i <= 30; i++) {
            if (isPrime(i)) System.out.print(i + " ");
        }
        System.out.println();

        System.out.println(repeat("Java! ", 3));
    }
}
```

**Expected output:**
```
Max of 17 and 42: 42
Primes up to 30:
2 3 5 7 11 13 17 19 23 29
Java! Java! Java!
```

## Exercise

1. Write a short program that uses today's topic.
2. Change one value and predict the output before running.
3. Explain the result in your own words (2–3 sentences).

## Checkpoint

You are ready for the next lesson when you can solve the exercise without copying the example.

---

**Next:** Continue to lesson 07 in this module.

---

## Additional reference

# Methods

A **method** is a named, reusable block of code that performs a task. Instead of repeating the same statements, you define them once and call the method whenever you need them.

**Benefits:** reusability (write once, use many times), readability (named blocks are easier to follow), and maintainability (fix a bug in one place).

## Defining and calling a method

```java
public class Calculator {

    static void greet() {
        System.out.println("Hello, World!");
    }

    public static void main(String[] args) {
        greet();   // calling the method
        greet();   // can call it as many times as needed
    }
}
```

A method declaration has four parts: **modifiers** (`static`), a **return type** (`void` here, meaning "returns nothing"), a **name**, and **parentheses** for parameters.

## Methods with parameters

```java
static void greet(String name) {
    System.out.println("Hello, " + name + "!");
}

greet("Alice");
greet("Bob");
```

**Output:**
```
Hello, Alice!
Hello, Bob!
```

Parameters must each declare a type, and arguments are matched **by position**, left to right.

## Methods that return a value

Replace `void` with the type you're returning, and use `return`:

```java
static int add(int a, int b) {
    return a + b;
}

int result = add(5, 3);
System.out.println(result);   // 8
```

A method can only return **one** value (though that value can be an array, a list, or an object holding several pieces of data).

## Method overloading

Java lets you define multiple methods with the **same name** but **different parameter lists** — the compiler picks the right one based on the arguments you pass:

```java
static int add(int a, int b) {
    return a + b;
}

static double add(double a, double b) {
    return a + b;
}

System.out.println(add(2, 3));       // calls the int version → 5
System.out.println(add(2.5, 3.5));   // calls the double version → 6.0
```

This is how `System.out.println` itself works — it's overloaded to accept `int`, `String`, `double`, and more.

## Scope — where a variable "lives"

```java
public class ScopeDemo {
    static int counter = 0;   // field — visible to the whole class

    static void increment() {
        int local = 5;        // local variable — only exists inside this method
        counter++;
    }

    public static void main(String[] args) {
        increment();
        increment();
        System.out.println(counter);   // 2
        // System.out.println(local);  // ERROR — local doesn't exist out here
    }
}
```

A variable declared inside a method (a **local variable**) only exists for that method's call — it disappears once the method finishes.

## Recursion — a method that calls itself

Every recursive method needs a **base case** (when to stop) to avoid running forever:

```java
static int factorial(int n) {
    if (n == 0 || n == 1) {   // base case
        return 1;
    }
    return n * factorial(n - 1);   // recursive call
}

System.out.println(factorial(5));   // 120
```

**Trace:** `factorial(5)` = `5 * factorial(4)` = `5 * 4 * factorial(3)` = ... = `5 * 4 * 3 * 2 * 1` = `120`.

## Summary

| Concept | Description |
|---|---|
| `void` method | Performs an action, returns nothing |
| Method with return type | Returns one value of that type |
| Parameters | Inputs declared with a type, matched by position |
| Overloading | Same name, different parameter lists |
| Local variable | Only exists inside the method where it's declared |
| Recursion | A method calling itself, with a base case to stop |

> 💡 **Key tip:** A good method does **one thing** and has a name that describes exactly what that thing is — `calculateTotal()`, not `doStuff()`.
