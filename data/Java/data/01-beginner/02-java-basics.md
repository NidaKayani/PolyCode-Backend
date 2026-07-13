# Lesson 02 — Java Basics and Syntax

**Module 01 · Beginner · Lesson 02 of 10**

## Learning Objectives

- Understand the structure of a Java program
- Know the difference between compiled and interpreted languages
- Write and read basic Java syntax correctly

## Overview

Java is a **compiled, statically-typed, object-oriented** language. Before your code runs, the Java compiler (`javac`) converts it into **bytecode** (`.class` files), which the Java Virtual Machine (JVM) then executes. This is what makes Java "write once, run anywhere."

Every Java program starts inside a **class**, and execution begins from a special method called `main`.

## Key Concepts

### 1. Program Structure

Every Java file must have:
- A **class** whose name matches the filename exactly
- A `main` method as the entry point

```java
// File: MyProgram.java
public class MyProgram {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}
```

| Part | Meaning |
|------|---------|
| `public` | Accessible from anywhere |
| `class MyProgram` | Defines a class named MyProgram |
| `static` | Belongs to the class, not an object |
| `void` | Returns nothing |
| `String[] args` | Command-line arguments |

### 2. Statements and Semicolons

Every statement in Java **must end with a semicolon** `;`. Forgetting it is the most common beginner mistake.

```java
System.out.println("This works");   // ✅ correct
System.out.println("This fails")    // ❌ missing semicolon
```

### 3. Comments

```java
// Single-line comment

/*
   Multi-line comment
   spans multiple lines
*/

/**
 * Javadoc comment — used to generate documentation
 * @param name the name to greet
 */
```

### 4. Case Sensitivity

Java is **case-sensitive**. `Main`, `main`, and `MAIN` are three different things.

```java
String name = "Alice";   // ✅
String Name = "Bob";     // This is a DIFFERENT variable
```

### 5. Printing Output

```java
System.out.println("Prints with newline at end");
System.out.print("Prints WITHOUT newline");
System.out.printf("Formatted: name=%s, age=%d%n", "Alice", 25);
```

## Full Example

```java
public class JavaBasics {
    public static void main(String[] args) {
        // Print a greeting
        System.out.println("=== Java Basics Demo ===");

        // Variables
        int year = 2024;
        String language = "Java";

        // Formatted output
        System.out.printf("%s was created in 1995. Current year: %d%n", language, year);

        // Math
        int a = 10, b = 3;
        System.out.println("Sum: " + (a + b));
        System.out.println("Division: " + (a / b));      // Integer division = 3
        System.out.println("Remainder: " + (a % b));     // 1
        System.out.println("Float div: " + (a / (double) b)); // 3.333...
    }
}
```

**Expected output:**
```
=== Java Basics Demo ===
Java was created in 1995. Current year: 2024
Sum: 13
Division: 3
Remainder: 1
Float div: 3.3333333333333335
```

## Exercise

1. Create a file `AboutMe.java` with a class named `AboutMe`.
2. In `main`, print your name, age, and favourite programming concept on separate lines.
3. Use `printf` to format at least one line.
4. Add a comment explaining what each `System.out` call does.

## Checkpoint

You are ready for the next lesson when you can:
- Explain why the filename must match the class name
- Fix a "missing semicolon" error on sight
- Use both `println` and `printf` correctly

---
**Next:** Lesson 03 — Hello World and Running Your First Program
