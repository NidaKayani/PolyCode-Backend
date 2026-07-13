# Lesson 03 — Multithreading Basics

**Module 03 · Advanced · Lesson 03 of 10**


## Learning objectives

- Understand **multithreading basics** in Java
- Read and write small examples you can run locally
- Connect this topic to the next lesson in the course

## Overview

Multithreading Basics is a core topic on the PolyCode **Java Certificate Course** path. Work through the examples, then try the exercise before moving on.

## Key concepts

1. **Syntax and structure** — how Java expresses this idea clearly
2. **Common patterns** — what you will see in real projects
3. **Mistakes to avoid** — typical beginner errors and fixes

## Example

```java
// Multithreading Basics — practice sketch
// add your code here
```

## Exercise

1. Write a short program that uses today's topic.
2. Change one value and predict the output before running.
3. Explain the result in your own words (2–3 sentences).

## Checkpoint

You are ready for the next lesson when you can solve the exercise without copying the example.

---

**Next:** Continue to lesson 03 in this module.

---

## Additional reference

# Multithreading

A **thread** is an independent path of execution within a program. By default, Java programs run on a single thread (the "main" thread) — multithreading lets multiple parts of a program run concurrently.

## Creating a thread by extending `Thread`

```java
class CounterThread extends Thread {
    public void run() {
        for (int i = 1; i <= 5; i++) {
            System.out.println(Thread.currentThread().getName() + ": " + i);
        }
    }
}

public class Main {
    public static void main(String[] args) {
        CounterThread t1 = new CounterThread();
        t1.start();   // start() launches the thread; calling run() directly would NOT create a new thread
    }
}
```

`start()` schedules the thread to run concurrently. Calling `run()` directly would just execute it like a normal method call on the current thread.

## Creating a thread with `Runnable` (the more common approach)

Implementing `Runnable` is generally preferred — it doesn't "use up" your only chance to extend a class, since Java only allows single inheritance:

```java
class PrintTask implements Runnable {
    private String message;

    PrintTask(String message) {
        this.message = message;
    }

    public void run() {
        for (int i = 1; i <= 3; i++) {
            System.out.println(message + " " + i);
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Thread t1 = new Thread(new PrintTask("Worker A"));
        Thread t2 = new Thread(new PrintTask("Worker B"));
        t1.start();
        t2.start();
    }
}
```

Because both threads run concurrently, their output can interleave unpredictably — you might see `Worker A 1`, `Worker B 1`, `Worker A 2`... in any order, which is different each time you run it.

## Using lambdas with `Runnable`

Since `Runnable` has exactly one method, it's a natural fit for a lambda expression (covered fully in the next lesson):

```java
Thread t = new Thread(() -> {
    for (int i = 1; i <= 3; i++) {
        System.out.println("Lambda thread: " + i);
    }
});
t.start();
```

## Pausing a thread: `sleep`

```java
class SlowTask implements Runnable {
    public void run() {
        for (int i = 1; i <= 3; i++) {
            System.out.println("Step " + i);
            try {
                Thread.sleep(1000);   // pause for 1000 milliseconds (1 second)
            } catch (InterruptedException e) {
                System.out.println("Interrupted");
            }
        }
    }
}
```

## The problem multithreading introduces: race conditions

When two threads modify the same shared data at the same time, results can become inconsistent:

```java
class Counter {
    private int count = 0;

    void increment() {
        count++;   // not safe if called from multiple threads at once
    }

    int getCount() {
        return count;
    }
}
```

If two threads call `increment()` at almost the exact same moment, they can both read the old value before either writes the new one back — and an increment gets lost.

## Fixing it with `synchronized`

```java
class Counter {
    private int count = 0;

    synchronized void increment() {   // only one thread at a time can run this method
        count++;
    }

    int getCount() {
        return count;
    }
}
```

`synchronized` forces threads to take turns inside that method, preventing them from stepping on each other's updates.

## Summary

| Concept | Description |
|---|---|
| `Thread` | An independent path of execution |
| `start()` | Begins running a thread concurrently |
| `Runnable` | Preferred way to define thread work — doesn't block extending another class |
| `Thread.sleep(ms)` | Pauses the current thread |
| Race condition | Two threads corrupting shared data by acting at the same time |
| `synchronized` | Restricts a method/block to one thread at a time |

> 💡 **Key tip:** Prefer `Runnable` over extending `Thread` in real code — it keeps your class free to extend something else later, and separates "what work to do" from "how to run it."
