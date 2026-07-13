# Lesson 05 — Generics

**Module 02 · Intermediate · Lesson 05 of 06**

## Learning Objectives

- Write generic classes and methods
- Use bounded type parameters (`extends`, `super`)
- Understand wildcards `<?>`

## Overview

**Generics** let you write code that works with any type while keeping **compile-time type safety**. Instead of writing a `StringBox`, `IntBox`, and `DoublBox` separately, you write one `Box<T>` that works for all. This is how all Java collections (like `ArrayList<T>`) are built.

## Key Concepts

### 1. Generic Class

```java
public class Box<T> {
    private T value;

    public Box(T value) { this.value = value; }
    public T getValue() { return value; }
    public void setValue(T value) { this.value = value; }

    @Override
    public String toString() { return "Box[" + value + "]"; }
}

// Usage:
Box<String> strBox = new Box<>("Hello");
Box<Integer> intBox = new Box<>(42);
Box<Double> dblBox = new Box<>(3.14);

System.out.println(strBox.getValue().toUpperCase()); // HELLO
System.out.println(intBox.getValue() * 2);           // 84
```

### 2. Multiple Type Parameters

```java
public class Pair<A, B> {
    private A first;
    private B second;

    public Pair(A first, B second) { this.first = first; this.second = second; }
    public A getFirst() { return first; }
    public B getSecond() { return second; }

    @Override
    public String toString() { return "(" + first + ", " + second + ")"; }
}

Pair<String, Integer> person = new Pair<>("Alice", 30);
System.out.println(person);  // (Alice, 30)
```

### 3. Generic Methods

```java
public static <T> T getMiddle(T[] array) {
    return array[array.length / 2];
}

String[] names = {"Alice", "Bob", "Charlie", "Dave"};
System.out.println(getMiddle(names));   // Bob

Integer[] nums = {10, 20, 30, 40, 50};
System.out.println(getMiddle(nums));    // 30
```

### 4. Bounded Type Parameters

Restrict `T` to a specific type or its subtypes:

```java
// T must be a Number or subclass (Integer, Double, etc.)
public static <T extends Number> double sum(List<T> list) {
    double total = 0;
    for (T item : list) {
        total += item.doubleValue();
    }
    return total;
}

System.out.println(sum(List.of(1, 2, 3, 4, 5)));        // 15.0
System.out.println(sum(List.of(1.1, 2.2, 3.3)));        // 6.6
// sum(List.of("a", "b"));  ← compile error! String is not a Number
```

### 5. Wildcards

```java
// Unknown type — read-only
public static void printList(List<?> list) {
    for (Object item : list) System.out.println(item);
}

// Upper bound wildcard — anything extending Number
public static double sumList(List<? extends Number> list) {
    double total = 0;
    for (Number n : list) total += n.doubleValue();
    return total;
}

// Lower bound wildcard — Number or its supertypes
public static void addNumbers(List<? super Integer> list) {
    list.add(10);
    list.add(20);
}
```

## Full Example

```java
import java.util.ArrayList;
import java.util.List;

public class GenericsDemo {
    // Generic stack implementation
    static class Stack<T> {
        private List<T> items = new ArrayList<>();

        public void push(T item) { items.add(item); }

        public T pop() {
            if (isEmpty()) throw new RuntimeException("Stack is empty");
            return items.remove(items.size() - 1);
        }

        public T peek() {
            if (isEmpty()) throw new RuntimeException("Stack is empty");
            return items.get(items.size() - 1);
        }

        public boolean isEmpty() { return items.isEmpty(); }
        public int size() { return items.size(); }

        @Override
        public String toString() { return items.toString(); }
    }

    // Generic method with bound
    static <T extends Comparable<T>> T findMax(List<T> list) {
        T max = list.get(0);
        for (T item : list) {
            if (item.compareTo(max) > 0) max = item;
        }
        return max;
    }

    public static void main(String[] args) {
        // String stack
        Stack<String> history = new Stack<>();
        history.push("page1.html");
        history.push("page2.html");
        history.push("page3.html");
        System.out.println("History: " + history);
        System.out.println("Back: " + history.pop());
        System.out.println("Current: " + history.peek());

        // Generic findMax
        System.out.println("\nMax int: " + findMax(List.of(3, 7, 1, 9, 4)));
        System.out.println("Max str: " + findMax(List.of("banana", "apple", "cherry")));
    }
}
```

**Expected output:**
```
History: [page1.html, page2.html, page3.html]
Back: page3.html
Current: page2.html

Max int: 9
Max str: cherry
```

## Exercise

1. Create a generic `Result<T>` class that holds either a value or an error message (like Kotlin's Result type). It should have methods `isSuccess()`, `getValue()`, `getError()`.
2. Write a generic `swap(T[] array, int i, int j)` method that swaps two elements.
3. Write a bounded generic method `<T extends Comparable<T>> List<T> filterGreaterThan(List<T> list, T threshold)`.

## Checkpoint

You are ready for the next lesson when you can:
- Write a generic class with a type parameter
- Explain what `<T extends Comparable<T>>` means
- Describe when to use `? extends` vs `? super`

---

**Next:** Continue to lesson 06 in this module.

---

## Additional reference

# Generics Introduction

**Generics** let you write a class or method that works with any type, while still keeping Java's type safety — the compiler checks types for you instead of you discovering mismatches at runtime.

## The problem generics solve

Without generics, a general-purpose container would have to use `Object`, losing all type information:

```java
class Box {
    private Object content;
    void set(Object content) { this.content = content; }
    Object get() { return content; }
}

Box box = new Box();
box.set("Hello");
String text = (String) box.get();   // manual cast required — easy to get wrong
```

If you accidentally put an `Integer` in and tried to cast it to `String`, that mistake wouldn't surface until the program crashed at runtime.

## A generic class

```java
class Box<T> {
    private T content;

    void set(T content) {
        this.content = content;
    }

    T get() {
        return content;
    }
}
```

`T` is a **type parameter** — a placeholder for "whatever type is decided when this box is created."

```java
Box<String> stringBox = new Box<>();
stringBox.set("Hello");
String text = stringBox.get();   // no cast needed — the compiler already knows it's a String

Box<Integer> intBox = new Box<>();
intBox.set(42);
int number = intBox.get();
```

Trying `stringBox.set(42)` simply **won't compile** — the mistake is caught immediately, instead of crashing later.

## A generic method

Type parameters can also apply to a single method rather than a whole class:

```java
class Util {
    static <T> void printArray(T[] array) {
        for (T item : array) {
            System.out.print(item + " ");
        }
        System.out.println();
    }
}
```

```java
Integer[] numbers = {1, 2, 3, 4};
String[] words = {"a", "b", "c"};

Util.printArray(numbers);   // 1 2 3 4
Util.printArray(words);     // a b c
```

The same method body works for both `Integer[]` and `String[]` — and any other type — without being rewritten.

## Multiple type parameters

```java
class Pair<K, V> {
    private K key;
    private V value;

    Pair(K key, V value) {
        this.key = key;
        this.value = value;
    }

    K getKey() { return key; }
    V getValue() { return value; }
}
```

```java
Pair<String, Integer> score = new Pair<>("Maryam", 95);
System.out.println(score.getKey() + ": " + score.getValue());
```

**Output:**
```
Maryam: 95
```

## Where you've already met generics

`ArrayList<String>`, `HashMap<String, Integer>`, and `List<T>` are all generic types from the standard library — every time you write `List<String>`, you're using generics, just without defining one yourself.

> 💡 **Key tip:** Generics move type-mismatch errors from *runtime crashes* to *compile-time errors* — the same bug, caught much earlier and much more cheaply.
