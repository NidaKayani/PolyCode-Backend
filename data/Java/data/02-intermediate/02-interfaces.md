# Lesson 02 — Interfaces

**Module 02 · Intermediate · Lesson 02 of 06**

## Learning Objectives

- Define and implement interfaces
- Understand how interfaces differ from abstract classes
- Use default and static interface methods (Java 8+)

## Overview

An **interface** is a contract — it defines methods a class *must* implement, without providing the implementation. A class can implement **multiple interfaces** (unlike inheritance, where only one parent class is allowed). Interfaces are how Java achieves multiple-type behaviour.

## Key Concepts

### 1. Defining an Interface

```java
public interface Drawable {
    void draw();           // implicitly public abstract
    double getArea();
}

public interface Resizable {
    void resize(double factor);
}
```

### 2. Implementing an Interface

```java
public class Circle implements Drawable, Resizable {
    private double radius;

    public Circle(double radius) { this.radius = radius; }

    @Override
    public void draw() {
        System.out.println("Drawing circle with radius " + radius);
    }

    @Override
    public double getArea() { return Math.PI * radius * radius; }

    @Override
    public void resize(double factor) { radius *= factor; }
}
```

### 3. Interface vs Abstract Class

| Feature | Interface | Abstract Class |
|---------|-----------|----------------|
| Multiple inheritance | ✅ (implement many) | ❌ (extend only one) |
| Constructor | ❌ | ✅ |
| Fields | Only constants (`static final`) | Any fields |
| Methods | Abstract + default/static | Any methods |
| Use when | Defining capability | Sharing common code |

### 4. Default Methods (Java 8+)

Provide a default implementation — implementing classes can override it or use it as-is.

```java
public interface Logger {
    void log(String message);   // must implement

    default void logError(String message) {   // optional to override
        log("[ERROR] " + message);
    }

    default void logInfo(String message) {
        log("[INFO] " + message);
    }
}
```

### 5. static Methods in Interfaces

```java
public interface MathUtils {
    static double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }
}

// Usage:
double result = MathUtils.clamp(150, 0, 100);  // 100.0
```

### 6. Functional Interfaces (1 abstract method)

An interface with exactly one abstract method can be used with **lambda expressions**.

```java
@FunctionalInterface
public interface Validator {
    boolean validate(String input);
}

// Lambda usage:
Validator emailCheck = email -> email.contains("@");
System.out.println(emailCheck.validate("user@example.com")); // true
```

## Full Example

```java
public class InterfaceDemo {
    interface Payable {
        double calculatePay();
        default String paymentSummary() {
            return String.format("Pay: $%.2f", calculatePay());
        }
    }

    interface Taxable {
        double TAX_RATE = 0.20;   // implicitly public static final
        double calculateTax();
    }

    static class Employee implements Payable, Taxable {
        private String name;
        private double hourlyRate;
        private int hoursWorked;

        public Employee(String name, double hourlyRate, int hoursWorked) {
            this.name = name;
            this.hourlyRate = hourlyRate;
            this.hoursWorked = hoursWorked;
        }

        @Override public double calculatePay() { return hourlyRate * hoursWorked; }
        @Override public double calculateTax() { return calculatePay() * TAX_RATE; }

        public void printSlip() {
            System.out.println("Employee: " + name);
            System.out.println(paymentSummary());
            System.out.printf("Tax (20%%): $%.2f%n", calculateTax());
            System.out.printf("Net:       $%.2f%n", calculatePay() - calculateTax());
            System.out.println("---");
        }
    }

    public static void main(String[] args) {
        Employee[] staff = {
            new Employee("Alice", 30.0, 160),
            new Employee("Bob",   25.0, 120)
        };
        for (Employee e : staff) e.printSlip();
    }
}
```

**Expected output:**
```
Employee: Alice
Pay: $4800.00
Tax (20%): $960.00
Net:       $3840.00
---
Employee: Bob
Pay: $3000.00
Tax (20%): $600.00
Net:       $2400.00
---
```

## Exercise

1. Create a `Sortable` interface with methods `sortAscending()` and `sortDescending()`. Implement it in a `NumberList` class.
2. Create a `Playable` interface for a media player (play, pause, stop, seek). Implement it in `AudioPlayer` and `VideoPlayer` classes.
3. Write a `@FunctionalInterface` called `StringTransformer` and use it with lambdas to reverse, uppercase, and remove spaces from strings.

## Checkpoint

You are ready for the next lesson when you can:
- Implement two interfaces in one class
- Explain when to choose an interface over an abstract class
- Write a default method in an interface

---

**Next:** Continue to lesson 03 in this module.

---

## Additional reference

# Interfaces

An **interface** defines a contract — a set of method signatures that any implementing class must provide, without saying *how* those methods work. It's Java's way of saying "anything that's a `Drawable` must have a `draw()` method," without caring what kind of object does the drawing.

## Declaring and implementing an interface

```java
interface Drawable {
    void draw();   // no body — just a signature, ending in a semicolon
}

class Circle implements Drawable {
    public void draw() {
        System.out.println("Drawing a circle");
    }
}

class Square implements Drawable {
    public void draw() {
        System.out.println("Drawing a square");
    }
}
```

```java
Drawable shape1 = new Circle();
Drawable shape2 = new Square();
shape1.draw();   // Drawing a circle
shape2.draw();   // Drawing a square
```

**Output:**
```
Drawing a circle
Drawing a square
```

Notice the variable type is `Drawable`, but each object behaves according to its actual class — this is **polymorphism**: treating different types uniformly through a shared contract.

## Implementing multiple interfaces

Unlike classes (which can only extend one parent), a class can implement **as many interfaces as it needs**:

```java
interface Flyable {
    void fly();
}

interface Swimmable {
    void swim();
}

class Duck implements Flyable, Swimmable {
    public void fly() {
        System.out.println("Duck is flying");
    }
    public void swim() {
        System.out.println("Duck is swimming");
    }
}
```

This is one of the main reasons interfaces exist — Java doesn't allow multiple class inheritance, but it does allow implementing multiple interfaces.

## Default and static methods (Java 8+)

Interfaces can also include methods with actual bodies, using `default` (an implementation any implementing class can use as-is, or override) or `static` (called directly on the interface itself):

```java
interface Greetable {
    void greet();   // abstract — must be implemented

    default void sayHello() {           // default — has a body, optional to override
        System.out.println("Hello there!");
    }

    static void info() {                 // static — belongs to the interface itself
        System.out.println("This is the Greetable interface.");
    }
}

class Person implements Greetable {
    public void greet() {
        System.out.println("Hi, I'm a person.");
    }
}
```

```java
Person p = new Person();
p.greet();        // Hi, I'm a person.
p.sayHello();      // Hello there! (inherited default behavior, not overridden)
Greetable.info();  // This is the Greetable interface. (called on the interface, not an object)
```

## Interface vs abstract class

| | Interface | Abstract class |
|---|---|---|
| Methods | Mostly abstract (plus `default`/`static`) | Can mix abstract and fully implemented |
| Fields | Only `public static final` constants | Any kind of field |
| Inheritance | A class can implement many | A class can extend only one |
| Use it for | "Can-do" capabilities (`Flyable`, `Comparable`) | A shared base with common state/behavior |

> 💡 **Key tip:** Reach for an interface when you're describing a **capability** that unrelated classes might share (a `Car` and a `Bird` are both `Movable`, despite having nothing else in common).
