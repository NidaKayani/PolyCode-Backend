# Lesson 04 — Variables and Data Types

**Module 01 · Beginner · Lesson 04 of 10**

## Learning Objectives

- Declare and initialize variables in Java
- Know all 8 primitive types and when to use each
- Understand the difference between primitives and `String`

## Overview

Java is **statically typed** — every variable must have a declared type, and that type cannot change. The compiler checks types at compile time, catching many bugs before the program even runs.

## Key Concepts

### 1. The 8 Primitive Types

| Type | Size | Range / Use | Example |
|------|------|-------------|---------|
| `byte` | 8-bit | -128 to 127 | `byte b = 100;` |
| `short` | 16-bit | -32,768 to 32,767 | `short s = 1000;` |
| `int` | 32-bit | ~-2 billion to 2 billion | `int age = 25;` |
| `long` | 64-bit | Very large integers | `long pop = 8_000_000_000L;` |
| `float` | 32-bit | Decimal, ~7 digits precision | `float f = 3.14f;` |
| `double` | 64-bit | Decimal, ~15 digits precision | `double pi = 3.14159;` |
| `char` | 16-bit | Single Unicode character | `char grade = 'A';` |
| `boolean` | 1-bit | `true` or `false` | `boolean isJavaFun = true;` |

> **Rule of thumb:** Use `int` for whole numbers, `double` for decimals, `boolean` for yes/no, `char` for single characters.

### 2. Declaring and Initialising Variables

```java
// Declare then assign
int score;
score = 95;

// Declare and assign in one line (preferred)
int lives = 3;

// Multiple variables of the same type
int x = 10, y = 20, z = 30;
```

### 3. The `long` and `float` Suffixes

```java
long bigNumber = 9_876_543_210L;  // Must add L for long literals
float temperature = 36.6f;         // Must add f for float literals
double price = 19.99;              // No suffix needed for double
```

### 4. `String` — Not a Primitive

`String` is a class, not a primitive. It holds text and has many useful methods.

```java
String name = "Alice";
String greeting = "Hello, " + name + "!";   // Concatenation with +
int length = name.length();                  // 5
String upper = name.toUpperCase();           // "ALICE"
boolean starts = name.startsWith("Al");      // true
```

### 5. `var` (Java 10+) — Type Inference

```java
var count = 42;         // compiler infers int
var message = "Hi";    // compiler infers String
var pi = 3.14;         // compiler infers double
```

Use `var` only when the type is obvious from context.

### 6. Constants with `final`

```java
final double TAX_RATE = 0.18;   // Cannot be changed after assignment
// TAX_RATE = 0.20;  ← compile error!
```

## Full Example

```java
public class VariablesDemo {
    public static void main(String[] args) {
        // Primitive types
        int age = 20;
        double gpa = 3.85;
        char grade = 'A';
        boolean enrolled = true;

        // String
        String name = "Zara";

        // Constant
        final int MAX_CREDITS = 20;

        // Output
        System.out.println("Student: " + name);
        System.out.println("Age: " + age);
        System.out.printf("GPA: %.2f%n", gpa);
        System.out.println("Grade: " + grade);
        System.out.println("Enrolled: " + enrolled);
        System.out.println("Max credits allowed: " + MAX_CREDITS);

        // Type limits
        int maxInt = Integer.MAX_VALUE;
        System.out.println("Largest int: " + maxInt);
        System.out.println("Largest int + 1 overflows: " + (maxInt + 1));
    }
}
```

**Expected output:**
```
Student: Zara
Age: 20
GPA: 3.85
Grade: A
Enrolled: true
Max credits allowed: 20
Largest int: 2147483647
Largest int + 1 overflows: -2147483648
// Variables and Data Types — practice sketch
// add your code here
```

## Exercise

1. Declare variables to represent a product: name (String), price (double), quantity (int), inStock (boolean).
2. Calculate the total cost (`price * quantity`) and store it in a `double`.
3. Print a receipt-style summary using `printf`.
4. Make the tax rate (18%) a `final` constant and include tax in the total.

## Checkpoint

You are ready for the next lesson when you can:
- Name all 8 primitive types from memory
- Explain why `long` needs `L` and `float` needs `f`
- Describe the difference between `int` and `Integer`

---

**Next:** Continue to lesson 05 in this module.

---

## Additional reference

# Variables and Data Types

A **variable** is a named container for a value. In Java, every variable has a fixed **type**, declared before you can use it — this is different from languages like Python or JavaScript, where a variable can hold any type.

## Declaring and initializing variables

```java
int age;        // declaration — no value yet
age = 21;        // assignment

int score = 95;  // declaration + assignment in one line ("initialization")
```

## The 8 primitive types

Java has 8 built-in (primitive) types, split into four groups:

| Category | Type | Size | Example |
|---|---|---|---|
| Whole numbers | `byte` | 1 byte | `byte b = 100;` |
| | `short` | 2 bytes | `short s = 30000;` |
| | `int` | 4 bytes | `int x = 100000;` |
| | `long` | 8 bytes | `long big = 9999999999L;` |
| Decimal numbers | `float` | 4 bytes | `float f = 3.14f;` |
| | `double` | 8 bytes | `double d = 3.14159;` |
| Characters | `char` | 2 bytes | `char c = 'A';` |
| True/false | `boolean` | 1 bit | `boolean isOn = true;` |

`int` and `double` are by far the most commonly used — reach for those unless you have a specific reason for the others.

Note the suffixes: a `long` literal needs `L` (`9999999999L`), and a `float` literal needs `f` (`3.14f`) — without them, Java assumes `int` and `double` by default, and won't compile.

## Reference types

Anything that isn't one of the 8 primitives is a **reference type** — most importantly `String`:

```java
String name = "Maryam";   // double quotes, not single — single quotes are for char
```

`char` uses single quotes for exactly one character; `String` uses double quotes for any amount of text (including zero or one character).

## Type casting

**Widening (implicit)** — Java converts automatically when no data can be lost:

```java
int wholeNumber = 10;
double asDecimal = wholeNumber;   // int → double, automatic
System.out.println(asDecimal);   // 10.0
```

**Narrowing (explicit)** — you must cast manually, because data could be lost:

```java
double price = 19.99;
int wholePrice = (int) price;     // explicit cast required
System.out.println(wholePrice);  // 19 — the decimal part is dropped, not rounded
```

## Constants with `final`

A variable marked `final` cannot be reassigned after its first value:

```java
final double PI = 3.14159;
// PI = 3.2;   // compile error — cannot assign a value to final variable PI
```

By convention, constants are named in `ALL_CAPS`.

## Putting it together

```java
public class VariableDemo {
    public static void main(String[] args) {
        String name = "Maryam";
        int age = 21;
        double gpa = 3.8;
        boolean isEnrolled = true;
        char grade = 'A';

        System.out.println(name + " | age " + age + " | GPA " + gpa
                + " | enrolled: " + isEnrolled + " | grade: " + grade);
    }
}
```

**Output:**
```
Maryam | age 21 | GPA 3.8 | enrolled: true | grade: A
```

> 💡 **Key tip:** Choosing the right type isn't optional in Java — pick `int` for whole numbers, `double` for decimals, `boolean` for true/false, and `String` for text, and you'll cover the vast majority of real situations.
