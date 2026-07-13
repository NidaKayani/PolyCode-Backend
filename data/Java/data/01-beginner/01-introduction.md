# Lesson 01 — Introduction to Java

**Module 01 · Beginner · Lesson 01 of 10**


## Learning objectives

- Understand **introduction to java** in Java
- Read and write small examples you can run locally
- Connect this topic to the next lesson in the course

## Overview

Introduction to Java is a core topic on the PolyCode **Java Certificate Course** path. Work through the examples, then try the exercise before moving on.

## Key concepts

1. **Syntax and structure** — how Java expresses this idea clearly
2. **Common patterns** — what you will see in real projects
3. **Mistakes to avoid** — typical beginner errors and fixes


## Reference

# What is Java?

Java is a general-purpose, **object-oriented programming language** created by Sun Microsystems in 1995 (now owned by Oracle). It's one of the most widely used languages in the world, powering everything from Android apps to large-scale banking systems.

Three ideas explain almost everything about how Java behaves:

- **Compiled, then run on a virtual machine.** You write `.java` source files. The `javac` compiler turns them into **bytecode** (`.class` files) — not directly into machine code. The **Java Virtual Machine (JVM)** then runs that bytecode.
- **"Write once, run anywhere."** Because the JVM (not your source code) talks to the operating system, the same `.class` file runs unchanged on Windows, macOS, or Linux, as long as each has a JVM installed.
- **Statically typed.** Every variable's type is fixed at compile time. This is the single biggest practical difference from languages like Python or JavaScript — Java will refuse to compile if you try to put a `String` where an `int` is expected.

## JDK vs JRE vs JVM

| Term | Full name | What it does |
|---|---|---|
| **JDK** | Java Development Kit | Everything you need to *write and compile* Java — includes the compiler (`javac`), debugging tools, and a JRE. Install this one. |
| **JRE** | Java Runtime Environment | Everything you need to *run* compiled Java — the JVM plus standard libraries. |
| **JVM** | Java Virtual Machine | The engine that actually executes bytecode. |

If you're learning Java, you install the **JDK** — it includes the other two.

## Setting up your environment

1. Download the JDK from [Oracle's site](https://www.oracle.com/java/technologies/downloads/) or use [Adoptium](https://adoptium.net/) (a free, open-source build).
2. Install it, then confirm it worked:
   ```bash
   java -version
   javac -version
   ```
3. Pick an editor: **IntelliJ IDEA** (popular, has a free Community Edition), **VS Code** with the "Extension Pack for Java," or **Eclipse**. Any of these will do for this course.

## Your first Java program

Every Java program needs at least one **class**, and an entry point method called `main`. Save this as `HelloWorld.java` — the filename must match the public class name exactly.

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

Compile and run it from a terminal:

```bash
javac HelloWorld.java   # creates HelloWorld.class (bytecode)
java HelloWorld         # runs it on the JVM
```

**Output:**
```
Hello, World!
```

### Breaking that down

| Piece | Meaning |
|---|---|
| `public class HelloWorld` | Declares a class named `HelloWorld`. In Java, code lives inside classes — there's no "top-level" loose code like in Python. |
| `public static void main(String[] args)` | The fixed signature the JVM looks for to start the program. `static` means it runs without creating an object first; `void` means it returns nothing; `String[] args` holds command-line arguments. |
| `System.out.println(...)` | Prints text to the console, followed by a new line. `System.out.print(...)` does the same without the new line. |
| `;` | Every statement ends with a semicolon — Java does **not** use indentation to mark blocks the way Python does. |
| `{ }` | Curly braces mark the start and end of a block (a class body, a method body, etc.). |

## Comments

```java
// Single-line comment

/* Multi-line
   comment */

/** Javadoc comment — used to generate documentation */
```

## Why learn Java?

- **Strongly typed** — many mistakes are caught at compile time, before the program ever runs.
- **Huge ecosystem** — Spring (web apps), Android development, big data tools like Hadoop and Kafka are all Java-based.
- **Performance** — the JVM's just-in-time compiler makes Java fast enough for large production systems.
- **Backward compatible** — code written years ago generally still compiles and runs today.

> 💡 **Key tip:** Unlike Python, Java is **compiled and statically typed**. If your code has a type mismatch, it won't even compile — you'll catch the bug immediately instead of at runtime.
