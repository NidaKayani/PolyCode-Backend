# Lesson 05 — Control Flow and Loops

**Module 01 · Beginner · Lesson 05 of 10**

## Learning Objectives

- Use `if`, `else if`, `else`, and `switch` to make decisions
- Write `for`, `while`, and `do-while` loops
- Use `break` and `continue` correctly

## Overview

Programs rarely run top-to-bottom without decisions or repetition. **Control flow** statements let your program choose different paths, and **loops** let it repeat actions without copy-pasting code.

## Key Concepts

### 1. if / else if / else

```java
int score = 78;

if (score >= 90) {
    System.out.println("A");
} else if (score >= 80) {
    System.out.println("B");
} else if (score >= 70) {
    System.out.println("C");
} else {
    System.out.println("F");
}
// Output: C
```

### 2. Ternary Operator (short if-else)

```java
int age = 20;
String status = (age >= 18) ? "Adult" : "Minor";
System.out.println(status);  // Adult
```

### 3. switch Statement

```java
int day = 3;
switch (day) {
    case 1: System.out.println("Monday"); break;
    case 2: System.out.println("Tuesday"); break;
    case 3: System.out.println("Wednesday"); break;
    default: System.out.println("Other day");
}
// Output: Wednesday
```

> Always add `break` at the end of each case — without it, Java falls through to the next case!

### 4. switch Expression (Java 14+)

```java
String dayName = switch (day) {
    case 1 -> "Monday";
    case 2 -> "Tuesday";
    case 3 -> "Wednesday";
    default -> "Other";
};
```

### 5. for Loop

```java
// Count 1 to 5
for (int i = 1; i <= 5; i++) {
    System.out.print(i + " ");
}
// Output: 1 2 3 4 5

// Count down
for (int i = 5; i >= 1; i--) {
    System.out.print(i + " ");
}
// Output: 5 4 3 2 1
```

### 6. while Loop

```java
int n = 1;
while (n <= 5) {
    System.out.print(n + " ");
    n++;
}
// Output: 1 2 3 4 5
```

### 7. do-while Loop

The body runs **at least once**, then checks the condition.

```java
int n = 10;
do {
    System.out.println("Runs once even though n > 5");
    n++;
} while (n <= 5);
```

### 8. break and continue

```java
// break exits the loop entirely
for (int i = 1; i <= 10; i++) {
    if (i == 6) break;
    System.out.print(i + " ");
}
// Output: 1 2 3 4 5

// continue skips to the next iteration
for (int i = 1; i <= 10; i++) {
    if (i % 2 == 0) continue;   // skip even numbers
    System.out.print(i + " ");
}
// Output: 1 3 5 7 9
```

## Full Example

```java
public class ControlFlowDemo {
    public static void main(String[] args) {
        // Multiplication table for 7
        System.out.println("--- 7 Times Table ---");
        for (int i = 1; i <= 10; i++) {
            System.out.printf("7 x %2d = %d%n", i, 7 * i);
        }

        // Find first number divisible by both 3 and 7
        System.out.println("\n--- First number divisible by 3 AND 7 ---");
        int n = 1;
        while (true) {
            if (n % 3 == 0 && n % 7 == 0) {
                System.out.println(n);
                break;
            }
            n++;
        }

        // Print only odd numbers 1-20
        System.out.println("\n--- Odd numbers 1-20 ---");
        for (int i = 1; i <= 20; i++) {
            if (i % 2 == 0) continue;
            System.out.print(i + " ");
        }
        System.out.println();
    }
}
```

**Expected output:**
```
--- 7 Times Table ---
7 x  1 = 7
7 x  2 = 14
...
7 x 10 = 70

--- First number divisible by 3 AND 7 ---
21

--- Odd numbers 1-20 ---
1 3 5 7 9 11 13 15 17 19
```

## Exercise

1. Print a triangle of stars using nested loops (5 rows).
2. Write a loop that sums all integers from 1 to 100 and prints the result.
3. Use a `switch` to print the name of a month given its number (1-12).

## Checkpoint

You are ready for the next lesson when you can:
- Choose correctly between `for`, `while`, and `do-while`
- Explain what happens if you forget `break` in a `switch`
- Write a nested loop without an infinite loop

---
**Next:** Lesson 06 — Methods
