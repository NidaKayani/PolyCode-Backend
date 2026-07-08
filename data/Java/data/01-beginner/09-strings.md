# Lesson 09 — Strings

**Module 01 · Beginner · Lesson 09 of 10**

## Learning Objectives

- Use common `String` methods confidently
- Understand immutability and why `==` doesn't compare string content
- Use `StringBuilder` for efficient string building

## Overview

`String` is one of the most-used types in Java. Unlike primitives, `String` is a class with dozens of methods. A critical feature: **strings are immutable** — once created, a String object cannot be changed. Every operation creates a new String.

## Key Concepts

### 1. Creating Strings

```java
String a = "Hello";                  // String literal (preferred)
String b = new String("Hello");      // Explicit object (rarely needed)
```

### 2. Comparing Strings

**Never use `==` to compare string content.** Use `.equals()`.

```java
String s1 = "Java";
String s2 = "Java";
String s3 = new String("Java");

System.out.println(s1 == s2);        // true  (same literal, same object in pool)
System.out.println(s1 == s3);        // false (different objects in memory!)
System.out.println(s1.equals(s3));   // true  ← always use this
System.out.println(s1.equalsIgnoreCase("JAVA")); // true
```

### 3. Essential String Methods

```java
String s = "  Hello, Java World!  ";

s.length()               // 22
s.trim()                 // "Hello, Java World!"  (removes leading/trailing spaces)
s.toLowerCase()          // "  hello, java world!  "
s.toUpperCase()          // "  HELLO, JAVA WORLD!  "
s.contains("Java")       // true
s.startsWith("  Hello")  // true
s.endsWith("!")          // false (has trailing space)
s.indexOf("Java")        // 9  (index of first occurrence)
s.replace("Java", "Python")  // "  Hello, Python World!  "
s.substring(8, 12)       // "Java"  (index 8 inclusive to 12 exclusive)
s.split(", ")            // ["  Hello", "Java World!  "]
s.isEmpty()              // false
s.isBlank()              // false (Java 11+: checks for whitespace only)
```

### 4. String Concatenation and `+`

```java
String first = "Hello";
String second = "World";
String result = first + ", " + second + "!";   // "Hello, World!"

// Concatenating in a loop is SLOW — use StringBuilder instead
```

### 5. StringBuilder — Efficient String Building

```java
StringBuilder sb = new StringBuilder();
for (int i = 1; i <= 5; i++) {
    sb.append(i);
    if (i < 5) sb.append(", ");
}
String result = sb.toString();
System.out.println(result);  // 1, 2, 3, 4, 5

// Other StringBuilder methods:
sb.insert(0, "Numbers: ");
sb.reverse();
sb.delete(0, 3);
```

### 6. String Formatting

```java
String name = "Alice";
int age = 25;

// printf style
String msg = String.format("Name: %s, Age: %d", name, age);

// Modern: formatted() in Java 15+
String msg2 = "Name: %s, Age: %d".formatted(name, age);
```

### 7. Converting Between Types

```java
// String → number
int n = Integer.parseInt("42");
double d = Double.parseDouble("3.14");

// Number → String
String s1 = String.valueOf(42);
String s2 = Integer.toString(42);
String s3 = "" + 42;   // quick but less readable
```

## Full Example

```java
public class StringsDemo {
    public static void main(String[] args) {
        String sentence = "The quick brown fox jumps over the lazy dog";

        System.out.println("Original: " + sentence);
        System.out.println("Length: " + sentence.length());
        System.out.println("Upper: " + sentence.toUpperCase());
        System.out.println("Contains 'fox': " + sentence.contains("fox"));
        System.out.println("Word count: " + sentence.split(" ").length);
        System.out.println("Replace: " + sentence.replace("fox", "cat"));

        // Reverse words
        String[] words = sentence.split(" ");
        StringBuilder reversed = new StringBuilder();
        for (int i = words.length - 1; i >= 0; i--) {
            reversed.append(words[i]);
            if (i > 0) reversed.append(" ");
        }
        System.out.println("Reversed words: " + reversed);

        // Palindrome check
        String test = "racecar";
        String rev = new StringBuilder(test).reverse().toString();
        System.out.println(test + " is palindrome: " + test.equals(rev));
    }
}
```

**Expected output:**
```
Original: The quick brown fox jumps over the lazy dog
Length: 43
Upper: THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG
Contains 'fox': true
Word count: 9
Replace: The quick brown cat jumps over the lazy dog
Reversed words: dog lazy the over jumps fox brown quick The
racecar is palindrome: true
```

## Exercise

1. Write a method `countVowels(String s)` that counts vowels (a, e, i, o, u) in a string.
2. Write a method `titleCase(String s)` that capitalises the first letter of every word.
3. Write a method `isPalindrome(String s)` that returns `true` if the string reads the same forwards and backwards (ignore case and spaces).

## Checkpoint

You are ready for the next lesson when you can:
- Explain why `==` fails for string comparison
- Choose between `String` and `StringBuilder` appropriately
- Convert a `String` to an `int` and back

---
**Next:** Lesson 10 — Scanner and User Input

**Next:** Continue to lesson 10 in this module.

---

## Additional reference

# Strings

A `String` is a sequence of characters. In Java, `String` is a reference type (not a primitive) with a large set of built-in methods.

## Creating strings

```java
String name = "Maryam";                 // common way — a string literal
String greeting = new String("Hello");   // also valid, rarely needed
```

## Strings are immutable

Once a `String` is created, it **cannot be changed**. Methods that look like they modify a string actually return a brand-new one:

```java
String name = "maryam";
name.toUpperCase();          // does nothing to `name` — the result is discarded
System.out.println(name);   // still "maryam"

name = name.toUpperCase();   // reassign to capture the new value
System.out.println(name);   // "MARYAM"
```

## Common String methods

```java
String text = "  Hello, Java World!  ";

System.out.println(text.length());              // 23 (counts the spaces)
System.out.println(text.trim());                // "Hello, Java World!" (no leading/trailing spaces)
System.out.println(text.toUpperCase());          // "  HELLO, JAVA WORLD!  "
System.out.println(text.toLowerCase());          // "  hello, java world!  "
System.out.println(text.trim().charAt(0));       // 'H' — character at index 0
System.out.println(text.indexOf("Java"));        // position where "Java" starts
System.out.println(text.contains("World"));      // true
System.out.println(text.trim().substring(7));    // "Java World!" — from index 7 to the end
System.out.println(text.trim().substring(0, 5)); // "Hello" — index 0 up to (not including) 5
System.out.println(text.replace("Java", "Python")); // "  Hello, Python World!  "
```

## Comparing strings: `==` vs `.equals()`

This is one of the most important habits to build early:

```java
String a = "hello";
String b = "hello";
String c = new String("hello");

System.out.println(a == b);        // true — literals can share the same memory
System.out.println(a == c);        // false — `new String(...)` is a separate object
System.out.println(a.equals(c));   // true — compares the actual characters
```

`==` checks whether two variables point to the **same object in memory**. `.equals()` checks whether the **content** is the same. For comparing what a string actually *says*, always use `.equals()`.

## Splitting and joining

```java
String csv = "apple,banana,cherry";
String[] fruits = csv.split(",");
System.out.println(fruits[1]);   // banana

String joined = String.join(" - ", fruits);
System.out.println(joined);      // apple - banana - cherry
```

## Building strings efficiently: `StringBuilder`

Because `String` is immutable, repeatedly concatenating inside a loop creates many throwaway objects. `StringBuilder` is a mutable alternative built for this:

```java
StringBuilder sb = new StringBuilder();
for (int i = 1; i <= 5; i++) {
    sb.append(i).append(" ");
}
System.out.println(sb.toString());   // 1 2 3 4 5
```

## Summary

| Method | Purpose |
|---|---|
| `.length()` | Number of characters |
| `.charAt(i)` | Character at index `i` |
| `.substring(start, end)` | Extract part of the string |
| `.indexOf(text)` | Position where `text` first appears, or `-1` |
| `.contains(text)` | `true`/`false` |
| `.equals(other)` | Compares content (use this, not `==`) |
| `.toUpperCase()` / `.toLowerCase()` | Case conversion (returns a new string) |
| `.trim()` | Removes leading/trailing whitespace |
| `.split(delimiter)` | Breaks a string into a `String[]` |

> 💡 **Key tip:** Always compare string *content* with `.equals()`, never `==`. Using `==` is one of the most common bugs new Java developers write.
