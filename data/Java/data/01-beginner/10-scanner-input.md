# Lesson 10 — Scanner and User Input

**Module 01 · Beginner · Lesson 10 of 10**

## Learning Objectives

- Read user input from the console using `Scanner`
- Handle different input types (int, double, String)
- Validate input and handle common errors

## Overview

The `Scanner` class (in `java.util`) reads input from the keyboard (or files). It's the standard way beginners accept user input in console Java programs.

## Key Concepts

### 1. Setting Up Scanner

```java
import java.util.Scanner;

public class InputDemo {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);   // attach to keyboard

        System.out.print("Enter your name: ");
        String name = sc.nextLine();

        System.out.println("Hello, " + name + "!");
        sc.close();   // always close when done
    }
}
```

### 2. Reading Different Types

```java
Scanner sc = new Scanner(System.in);

int age        = sc.nextInt();      // reads an integer
double salary  = sc.nextDouble();   // reads a decimal
String word    = sc.next();         // reads one word (stops at space)
String line    = sc.nextLine();     // reads the entire line
```

### 3. The Newline Trap

After `nextInt()` or `nextDouble()`, a leftover newline character stays in the buffer. Calling `nextLine()` immediately after reads that empty newline, not the user's input.

```java
Scanner sc = new Scanner(System.in);

System.out.print("Enter age: ");
int age = sc.nextInt();
sc.nextLine();   // ← consume the leftover newline

System.out.print("Enter name: ");
String name = sc.nextLine();   // now works correctly
```

### 4. Input Validation Loop

```java
Scanner sc = new Scanner(System.in);
int number = -1;

while (true) {
    System.out.print("Enter a positive number: ");
    if (sc.hasNextInt()) {
        number = sc.nextInt();
        if (number > 0) break;
        System.out.println("Must be positive!");
    } else {
        System.out.println("That's not an integer!");
        sc.next();   // discard the invalid token
    }
}
System.out.println("You entered: " + number);
```

## Full Example — Simple Calculator

```java
import java.util.Scanner;

public class Calculator {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.println("=== Simple Calculator ===");
        System.out.print("Enter first number:  ");
        double a = sc.nextDouble();
        System.out.print("Enter operator (+,-,*,/): ");
        String op = sc.next();
        System.out.print("Enter second number: ");
        double b = sc.nextDouble();

        double result;
        switch (op) {
            case "+" -> result = a + b;
            case "-" -> result = a - b;
            case "*" -> result = a * b;
            case "/" -> {
                if (b == 0) { System.out.println("Cannot divide by zero!"); sc.close(); return; }
                result = a / b;
            }
            default -> { System.out.println("Unknown operator: " + op); sc.close(); return; }
        }

        System.out.printf("Result: %.2f %s %.2f = %.2f%n", a, op, b, result);
        sc.close();
    }
}
```

**Sample run:**
```
=== Simple Calculator ===
Enter first number:  15
Enter operator (+,-,*,/): /
Enter second number: 4
Result: 15.00 / 4.00 = 3.75
```

## Exercise

1. Write a program that asks for 5 integers one by one and prints their sum, average, max, and min.
2. Write a number-guessing game: the program picks a random number 1-100, the user guesses, and the program says "Too high", "Too low", or "Correct!".
3. Extend the calculator above to loop until the user types `q` to quit.

## Checkpoint

You are ready for the next module when you can:
- Read integers, doubles, and full lines from `Scanner`
- Fix the newline trap between `nextInt()` and `nextLine()`
- Write an input-validation loop

---

**Next:** This is the final lesson in this module.

---

## Additional reference

# Scanner and User Input

`Scanner` (from `java.util`) is the standard way to read input from the keyboard in a console Java program.

## Setting it up

```java
import java.util.Scanner;

public class InputDemo {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Enter your name: ");
        String name = scanner.nextLine();

        System.out.println("Hello, " + name + "!");

        scanner.close();   // good practice once you're done reading input
    }
}
```

## Reading different types

`Scanner` has a separate method for each type you want to read:

```java
Scanner scanner = new Scanner(System.in);

System.out.print("Enter your age: ");
int age = scanner.nextInt();

System.out.print("Enter your GPA: ");
double gpa = scanner.nextDouble();

System.out.print("Are you enrolled (true/false): ");
boolean enrolled = scanner.nextBoolean();

System.out.print("Enter your full name: ");
String fullName = scanner.nextLine();
```

| Method | Reads |
|---|---|
| `nextInt()` | An `int` |
| `nextDouble()` | A `double` |
| `nextBoolean()` | A `boolean` (`true`/`false`) |
| `next()` | A single word (stops at whitespace) |
| `nextLine()` | An entire line, including spaces |

## The classic `nextInt()` + `nextLine()` pitfall

This trips up almost every beginner at least once:

```java
Scanner scanner = new Scanner(System.in);

System.out.print("Enter your age: ");
int age = scanner.nextInt();        // reads "21", leaves the newline character behind

System.out.print("Enter your name: ");
String name = scanner.nextLine();   // reads that leftover newline as an empty line!

System.out.println(age + " - " + name);  // name prints as empty
```

**Why it happens:** when you type `21` and press Enter, `nextInt()` reads only the `21` — the newline character from pressing Enter is still waiting in the input. The very next `nextLine()` immediately consumes that leftover newline instead of waiting for you to type a name.

**The fix** — add an extra `scanner.nextLine()` to consume the leftover newline before reading the real line:

```java
int age = scanner.nextInt();
scanner.nextLine();                 // consumes the leftover newline
String name = scanner.nextLine();   // now reads the actual typed line correctly
```

## A complete example

```java
import java.util.Scanner;

public class ProfileBuilder {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Name: ");
        String name = scanner.nextLine();

        System.out.print("Age: ");
        int age = scanner.nextInt();

        System.out.println("\nProfile created:");
        System.out.println("Name: " + name + ", Age: " + age);

        scanner.close();
    }
}
```

If the user types `Maryam` and then `21`:

**Output:**
```
Name: Maryam
Age: 21

Profile created:
Name: Maryam, Age: 21
```

> 💡 **Key tip:** If text input is coming out blank right after reading a number, you've almost certainly hit the leftover-newline issue — add a throwaway `scanner.nextLine()` right after the numeric read.
