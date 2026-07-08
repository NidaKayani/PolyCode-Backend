# Lesson 08 — Design Patterns Intro

**Module 03 · Advanced · Lesson 08 of 10**


## Learning objectives

- Understand **design patterns intro** in Java
- Read and write small examples you can run locally
- Connect this topic to the next lesson in the course

## Overview

Design Patterns Intro is a core topic on the PolyCode **Java Certificate Course** path. Work through the examples, then try the exercise before moving on.

## Key concepts

1. **Syntax and structure** — how Java expresses this idea clearly
2. **Common patterns** — what you will see in real projects
3. **Mistakes to avoid** — typical beginner errors and fixes

## Example

```java
// Design Patterns Intro — practice sketch
// add your code here
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

# Design Patterns

A **design pattern** is a proven, reusable solution to a common software design problem — not finished code you copy, but a structural blueprint you adapt to your situation.

## Singleton — exactly one instance, shared everywhere

Use when exactly one object should coordinate something across the whole application (a configuration manager, a connection pool):

```java
public class AppConfig {
    private static AppConfig instance;
    private String environment;

    private AppConfig() {            // private constructor — no one else can call `new`
        environment = "production";
    }

    public static AppConfig getInstance() {
        if (instance == null) {
            instance = new AppConfig();
        }
        return instance;
    }

    public String getEnvironment() {
        return environment;
    }
}
```

```java
AppConfig config1 = AppConfig.getInstance();
AppConfig config2 = AppConfig.getInstance();
System.out.println(config1 == config2);   // true — it's the same object both times
```

## Factory — delegate object creation to a dedicated method

Use when you want calling code to ask for "a shape" without knowing exactly which class gets constructed:

```java
interface Shape {
    void draw();
}

class Circle implements Shape {
    public void draw() { System.out.println("Drawing a circle"); }
}

class Square implements Shape {
    public void draw() { System.out.println("Drawing a square"); }
}

class ShapeFactory {
    static Shape createShape(String type) {
        return switch (type) {
            case "circle" -> new Circle();
            case "square" -> new Square();
            default -> throw new IllegalArgumentException("Unknown shape: " + type);
        };
    }
}
```

```java
Shape shape = ShapeFactory.createShape("circle");
shape.draw();   // Drawing a circle
```

The calling code never writes `new Circle()` directly — it just describes what it wants, and the factory decides how to build it.

## Observer — notify many listeners when something changes

Use for event-driven situations: one change, many interested parties (this is the foundation behind GUI event listeners and pub/sub systems):

```java
import java.util.ArrayList;
import java.util.List;

interface Observer {
    void update(String event);
}

class NewsChannel implements Observer {
    private String name;
    NewsChannel(String name) { this.name = name; }
    public void update(String event) {
        System.out.println(name + " received: " + event);
    }
}

class NewsAgency {
    private List<Observer> observers = new ArrayList<>();

    void subscribe(Observer o) {
        observers.add(o);
    }

    void publish(String event) {
        for (Observer o : observers) {
            o.update(event);
        }
    }
}
```

```java
NewsAgency agency = new NewsAgency();
agency.subscribe(new NewsChannel("Channel A"));
agency.subscribe(new NewsChannel("Channel B"));
agency.publish("Breaking news!");
```

**Output:**
```
Channel A received: Breaking news!
Channel B received: Breaking news!
```

## Builder — construct complex objects step by step

Use when an object has many optional fields, to avoid a constructor with ten confusing parameters:

```java
class Pizza {
    private String size;
    private boolean cheese;
    private boolean pepperoni;

    static class Builder {
        private String size = "Medium";
        private boolean cheese = false;
        private boolean pepperoni = false;

        Builder size(String size) { this.size = size; return this; }
        Builder cheese(boolean cheese) { this.cheese = cheese; return this; }
        Builder pepperoni(boolean pepperoni) { this.pepperoni = pepperoni; return this; }

        Pizza build() {
            Pizza pizza = new Pizza();
            pizza.size = this.size;
            pizza.cheese = this.cheese;
            pizza.pepperoni = this.pepperoni;
            return pizza;
        }
    }

    public String toString() {
        return size + " pizza, cheese=" + cheese + ", pepperoni=" + pepperoni;
    }
}
```

```java
Pizza order = new Pizza.Builder()
        .size("Large")
        .cheese(true)
        .pepperoni(true)
        .build();
System.out.println(order);
```

**Output:**
```
Large pizza, cheese=true, pepperoni=true
```

Each `.method(...)` call returns `this`, letting calls chain together readably, and only the options you actually set need mentioning.

## Summary

| Pattern | Solves |
|---|---|
| Singleton | Guarantee exactly one shared instance |
| Factory | Hide object-creation logic behind a method |
| Observer | Notify many listeners when state changes |
| Builder | Construct complex objects readably, step by step |

> 💡 **Key tip:** Patterns are tools for *specific* problems, not goals in themselves — don't add a Singleton or a Factory unless the problem it solves is actually present in your code.
