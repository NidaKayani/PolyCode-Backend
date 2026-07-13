# Lesson 01 — OOP: Inheritance and Polymorphism

**Module 02 · Intermediate · Lesson 01 of 06**

## Learning Objectives

- Use `extends` to create subclasses
- Override methods with `@Override`
- Understand polymorphism — treating subclasses as their parent type

## Overview

**Inheritance** lets one class (child) reuse and extend the behaviour of another (parent). **Polymorphism** lets you write code that works with any subclass through the parent type, making programs flexible and extensible.

## Key Concepts

### 1. extends

```java
// Parent class
public class Animal {
    protected String name;
    protected int age;

    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public void speak() {
        System.out.println(name + " makes a sound.");
    }

    public String describe() {
        return name + " (age " + age + ")";
    }
}

// Child class
public class Dog extends Animal {
    private String breed;

    public Dog(String name, int age, String breed) {
        super(name, age);   // calls Animal's constructor
        this.breed = breed;
    }

    @Override
    public void speak() {   // override Animal's speak()
        System.out.println(name + " barks: Woof!");
    }

    public String getBreed() { return breed; }
}
```

### 2. super keyword

- `super(args)` — calls the parent constructor (must be first line)
- `super.method()` — calls the parent version of an overridden method

```java
@Override
public void speak() {
    super.speak();   // prints "Rex makes a sound."
    System.out.println(name + " also barks!");
}
```

### 3. @Override Annotation

Always use `@Override` when overriding. It makes the compiler verify you're actually overriding (catches typos in method names).

### 4. Polymorphism

```java
Animal[] animals = {
    new Dog("Rex", 3, "Shepherd"),
    new Cat("Whiskers", 5),
    new Bird("Tweety", 2)
};

for (Animal a : animals) {
    a.speak();   // calls each subclass's version automatically
}
```

### 5. instanceof Check

```java
Animal a = new Dog("Rex", 3, "Shepherd");

if (a instanceof Dog dog) {   // Java 16+ pattern matching
    System.out.println("Breed: " + dog.getBreed());
}
```

### 6. Abstract Classes

An abstract class cannot be instantiated — it exists only to be extended.

```java
public abstract class Shape {
    public abstract double area();   // must be implemented by subclasses
    public abstract double perimeter();

    public void printInfo() {
        System.out.printf("Area: %.2f, Perimeter: %.2f%n", area(), perimeter());
    }
}

public class Circle extends Shape {
    private double radius;
    public Circle(double radius) { this.radius = radius; }

    @Override public double area() { return Math.PI * radius * radius; }
    @Override public double perimeter() { return 2 * Math.PI * radius; }
}
```

## Full Example

```java
public class InheritanceDemo {
    abstract static class Vehicle {
        protected String brand;
        protected int year;

        public Vehicle(String brand, int year) {
            this.brand = brand; this.year = year;
        }

        public abstract String fuelType();

        public void describe() {
            System.out.printf("%d %s — runs on %s%n", year, brand, fuelType());
        }
    }

    static class Car extends Vehicle {
        private int doors;
        public Car(String brand, int year, int doors) {
            super(brand, year); this.doors = doors;
        }
        @Override public String fuelType() { return "petrol"; }
        @Override public void describe() {
            super.describe();
            System.out.println("  Doors: " + doors);
        }
    }

    static class ElectricCar extends Car {
        private int range;
        public ElectricCar(String brand, int year, int doors, int range) {
            super(brand, year, doors); this.range = range;
        }
        @Override public String fuelType() { return "electricity"; }
        @Override public void describe() {
            super.describe();
            System.out.println("  Range: " + range + " km");
        }
    }

    public static void main(String[] args) {
        Vehicle[] fleet = {
            new Car("Toyota", 2020, 4),
            new ElectricCar("Tesla", 2023, 4, 560)
        };
        for (Vehicle v : fleet) {
            v.describe();
            System.out.println();
        }
    }
}
```

**Expected output:**
```
2020 Toyota — runs on petrol
  Doors: 4

2023 Tesla — runs on electricity
  Doors: 4
  Range: 560 km
```

## Exercise

1. Create a `Shape` hierarchy: abstract `Shape`, then `Rectangle`, `Circle`, and `Triangle` subclasses. Each implements `area()` and `perimeter()`.
2. Create an array of 5 different shapes and print all their info using polymorphism.
3. Add an abstract `Employee` class with `calculatePay()`, then create `FullTimeEmployee` and `FreelanceEmployee` subclasses.

## Checkpoint

You are ready for the next lesson when you can:
- Write a 3-level inheritance hierarchy
- Explain the difference between `abstract` class and regular class
- Describe what polymorphism achieves

---
**Next:** Lesson 02 — Interfaces
