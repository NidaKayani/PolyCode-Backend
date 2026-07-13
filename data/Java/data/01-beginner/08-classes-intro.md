# Lesson 08 — Introduction to Classes and Objects

**Module 01 · Beginner · Lesson 08 of 10**

## Learning Objectives

- Define a class with fields, constructors, and methods
- Create objects and call their methods
- Understand the `this` keyword

## Overview

Java is an **object-oriented language**. A **class** is a blueprint, and an **object** is a real instance created from that blueprint. For example, `Car` is a class; your red Toyota is an object.

Classes bundle related **data** (fields) and **behaviour** (methods) together — this is called **encapsulation**.

## Key Concepts

### 1. Defining a Class

```java
public class Dog {
    // Fields (data)
    String name;
    String breed;
    int age;

    // Constructor (called when creating an object)
    public Dog(String name, String breed, int age) {
        this.name = name;
        this.breed = breed;
        this.age = age;
    }

    // Method (behaviour)
    public void bark() {
        System.out.println(name + " says: Woof!");
    }

    public String describe() {
        return name + " is a " + age + "-year-old " + breed;
    }
}
```

### 2. Creating Objects

```java
// new ClassName(constructor arguments)
Dog rex = new Dog("Rex", "German Shepherd", 3);
Dog buddy = new Dog("Buddy", "Golden Retriever", 5);

rex.bark();                    // Rex says: Woof!
System.out.println(buddy.describe()); // Buddy is a 5-year-old Golden Retriever
```

### 3. The `this` Keyword

`this` refers to the **current object**. It's used when a parameter name shadows a field name.

```java
public Dog(String name, int age) {
    this.name = name;   // this.name = field, name = parameter
    this.age = age;
}
```

### 4. Multiple Constructors (Constructor Overloading)

```java
public class Dog {
    String name;
    int age;

    // Full constructor
    public Dog(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // Default age constructor
    public Dog(String name) {
        this(name, 1);  // calls the full constructor
    }
}

Dog puppy = new Dog("Max");       // age defaults to 1
Dog adult = new Dog("Rex", 4);
```

### 5. Getters and Setters (best practice)

Fields should be `private`, accessed through public methods.

```java
public class Person {
    private String name;   // private — hidden from outside
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // Getter
    public String getName() { return name; }
    public int getAge() { return age; }

    // Setter with validation
    public void setAge(int age) {
        if (age >= 0) this.age = age;
    }
}
```

## Full Example

```java
public class BankAccount {
    private String owner;
    private double balance;

    public BankAccount(String owner, double initialBalance) {
        this.owner = owner;
        this.balance = initialBalance;
    }

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            System.out.printf("Deposited %.2f. New balance: %.2f%n", amount, balance);
        }
    }

    public void withdraw(double amount) {
        if (amount > balance) {
            System.out.println("Insufficient funds!");
        } else {
            balance -= amount;
            System.out.printf("Withdrawn %.2f. New balance: %.2f%n", amount, balance);
        }
    }

    public void printStatement() {
        System.out.printf("[%s] Balance: $%.2f%n", owner, balance);
    }

    public static void main(String[] args) {
        BankAccount acc = new BankAccount("Alice", 1000.00);
        acc.printStatement();
        acc.deposit(500.00);
        acc.withdraw(200.00);
        acc.withdraw(2000.00);   // insufficient
        acc.printStatement();
    }
}
```

**Expected output:**
```
[Alice] Balance: $1000.00
Deposited 500.00. New balance: $1500.00
Withdrawn 200.00. New balance: $1300.00
Insufficient funds!
[Alice] Balance: $1300.00
```

## Exercise

1. Create a `Rectangle` class with `width` and `height` fields, a constructor, and methods `area()` and `perimeter()`.
2. Create a `Student` class with `name`, `id`, and `grades` (array). Add a method `average()` that returns the average grade.
3. Add private fields and public getters/setters to both classes.

## Checkpoint

You are ready for the next lesson when you can:
- Write a class from scratch with fields, constructor, and methods
- Explain why fields should be `private`
- Use `this` correctly

---
**Next:** Lesson 09 — Strings

---

## Additional reference

# Classes and Objects

A **class** is a blueprint that describes what data (fields) and behavior (methods) something has. An **object** is one specific instance created from that blueprint.

Think of `class Car` as the architectural drawing, and each individual car you build from it (a red Civic, a blue Tesla) as an object.

## Defining a class

```java
public class Dog {
    // fields — the data each Dog object holds
    String name;
    int age;

    // method — behavior every Dog object can perform
    void bark() {
        System.out.println(name + " says Woof!");
    }
}
```

## Creating objects with `new`

```java
public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog();   // create an object (an "instance") of Dog
        myDog.name = "Rex";
        myDog.age = 3;
        myDog.bark();
    }
}
```

**Output:**
```
Rex says Woof!
```

Each object has its **own copy** of the fields. Creating a second `Dog` doesn't affect the first one's `name` or `age`.

## Constructors

A **constructor** is a special method, matching the class name, that runs automatically when you create an object with `new`. It's the standard way to set up initial values.

```java
public class Dog {
    String name;
    int age;

    // constructor
    Dog(String name, int age) {
        this.name = name;
        this.age = age;
    }

    void bark() {
        System.out.println(name + " says Woof!");
    }
}
```

```java
Dog myDog = new Dog("Rex", 3);   // values passed straight in
myDog.bark();
```

### The `this` keyword

Inside the constructor, `this.name` refers to the object's field, while plain `name` refers to the parameter — `this` is how Java tells them apart when they share a name.

## Encapsulation: `private` fields with getters and setters

Making fields `private` prevents code outside the class from changing them directly. Instead, you expose controlled access through public methods:

```java
public class Dog {
    private String name;
    private int age;

    Dog(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // getter
    public String getName() {
        return name;
    }

    // setter — can include validation
    public void setAge(int age) {
        if (age >= 0) {
            this.age = age;
        }
    }

    public int getAge() {
        return age;
    }
}
```

```java
Dog myDog = new Dog("Rex", 3);
System.out.println(myDog.getName());   // Rex
myDog.setAge(4);
System.out.println(myDog.getAge());    // 4
myDog.setAge(-1);                       // ignored by the validation check
System.out.println(myDog.getAge());    // still 4
```

This is one of Java's core principles: keep data **private**, and only let outside code change it through methods you control.

## Summary

| Term | Meaning |
|---|---|
| Class | The blueprint/template |
| Object | A specific instance created from a class |
| Field | A piece of data an object holds |
| Method | A behavior an object can perform |
| Constructor | Runs automatically when an object is created with `new` |
| `this` | Refers to the current object, disambiguating from parameters |
| Encapsulation | Keeping fields `private` and exposing controlled access via getters/setters |

> 💡 **Key tip:** If a field shouldn't change carelessly from outside the class, make it `private` and write a getter/setter — this is the default habit in professional Java code.
