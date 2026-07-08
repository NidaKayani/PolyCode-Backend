# Lesson 04 — Exception Handling

**Module 02 · Intermediate · Lesson 04 of 06**

## Learning Objectives

- Use try-catch-finally to handle exceptions
- Distinguish checked vs unchecked exceptions
- Create and throw custom exceptions

## Overview

When something goes wrong at runtime (dividing by zero, file not found, invalid input), Java throws an **exception** — an object describing what went wrong. If not caught, the program crashes with a stack trace. Proper exception handling makes programs robust and user-friendly.

## Key Concepts

### 1. The Exception Hierarchy

```
Throwable
├── Error          (JVM problems — don't catch these: OutOfMemoryError)
└── Exception
    ├── RuntimeException  (unchecked — not required to handle)
    │   ├── NullPointerException
    │   ├── ArrayIndexOutOfBoundsException
    │   ├── ClassCastException
    │   └── NumberFormatException
    └── IOException       (checked — must handle or declare)
        ├── FileNotFoundException
        └── ...
```

### 2. try-catch-finally

```java
try {
    int result = 10 / 0;   // throws ArithmeticException
} catch (ArithmeticException e) {
    System.out.println("Cannot divide by zero: " + e.getMessage());
} finally {
    System.out.println("This always runs — cleanup here");
}
```

### 3. Multiple catch Blocks

```java
try {
    String s = null;
    System.out.println(s.length());   // NullPointerException
    int n = Integer.parseInt("abc");  // NumberFormatException
} catch (NullPointerException e) {
    System.out.println("Null value: " + e.getMessage());
} catch (NumberFormatException e) {
    System.out.println("Bad number format: " + e.getMessage());
} catch (Exception e) {
    System.out.println("Unexpected error: " + e.getMessage());
}
```

### 4. Multi-catch (Java 7+)

```java
try {
    // risky code
} catch (NullPointerException | NumberFormatException e) {
    System.out.println("Input error: " + e.getMessage());
}
```

### 5. Throwing Exceptions

```java
public static int divide(int a, int b) {
    if (b == 0) {
        throw new IllegalArgumentException("Divisor cannot be zero");
    }
    return a / b;
}
```

### 6. Custom Exceptions

```java
// Custom checked exception
public class InsufficientFundsException extends Exception {
    private double amount;

    public InsufficientFundsException(double amount) {
        super("Insufficient funds. Short by: $" + amount);
        this.amount = amount;
    }

    public double getShortfall() { return amount; }
}

// Custom unchecked exception
public class InvalidAgeException extends RuntimeException {
    public InvalidAgeException(int age) {
        super("Invalid age: " + age + ". Must be between 0 and 150.");
    }
}
```

### 7. try-with-resources (Java 7+)

Automatically closes resources (files, connections) — no need for `finally`.

```java
try (Scanner sc = new Scanner(new File("data.txt"))) {
    while (sc.hasNextLine()) {
        System.out.println(sc.nextLine());
    }
} catch (FileNotFoundException e) {
    System.out.println("File not found: " + e.getMessage());
}
// Scanner is automatically closed here
```

## Full Example

```java
public class ExceptionDemo {

    static class BankAccount {
        private double balance;

        public BankAccount(double balance) { this.balance = balance; }

        public void withdraw(double amount) throws InsufficientFundsException {
            if (amount <= 0) throw new IllegalArgumentException("Amount must be positive");
            if (amount > balance) throw new InsufficientFundsException(amount - balance);
            balance -= amount;
            System.out.printf("Withdrew $%.2f. Balance: $%.2f%n", amount, balance);
        }
    }

    static class InsufficientFundsException extends Exception {
        private final double shortfall;
        public InsufficientFundsException(double shortfall) {
            super(String.format("Need $%.2f more", shortfall));
            this.shortfall = shortfall;
        }
        public double getShortfall() { return shortfall; }
    }

    public static void main(String[] args) {
        BankAccount acc = new BankAccount(500.0);

        double[] withdrawals = {100.0, 250.0, 300.0, -50.0};
        for (double amount : withdrawals) {
            try {
                acc.withdraw(amount);
            } catch (InsufficientFundsException e) {
                System.out.println("Failed: " + e.getMessage());
            } catch (IllegalArgumentException e) {
                System.out.println("Invalid: " + e.getMessage());
            }
        }
    }
}
```

**Expected output:**
```
Withdrew $100.00. Balance: $400.00
Withdrew $250.00. Balance: $150.00
Failed: Need $150.00 more
Invalid: Amount must be positive
```

## Exercise

1. Write a method `parseAndDivide(String a, String b)` that parses two strings as integers and divides them, handling `NumberFormatException` and `ArithmeticException`.
2. Create a `PasswordValidator` that throws a custom `WeakPasswordException` if the password is shorter than 8 characters or has no numbers.
3. Write a try-with-resources example that reads a text file line by line.

## Checkpoint

You are ready for the next lesson when you can:
- Explain the difference between checked and unchecked exceptions
- Write a custom exception class
- Use try-with-resources correctly

---
**Next:** Lesson 05 — Generics
