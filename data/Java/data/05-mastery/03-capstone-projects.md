# Lesson 03 — Capstone Projects

**Module 05 · Mastery · Lesson 03 of 05**


## Learning objectives

- Understand **capstone projects** in Java
- Read and write small examples you can run locally
- Connect this topic to the next lesson in the course

## Overview

Capstone Projects is a core topic on the PolyCode **Java Certificate Course** path. Work through the examples, then try the exercise before moving on.

## Key concepts

1. **Syntax and structure** — how Java expresses this idea clearly
2. **Common patterns** — what you will see in real projects
3. **Mistakes to avoid** — typical beginner errors and fixes

## Example

```java
// Capstone Projects — practice sketch
// add your code here
```

## Exercise

1. Write a short program that uses today's topic.
2. Change one value and predict the output before running.
3. Explain the result in your own words (2–3 sentences).

## Checkpoint

You are ready for the next lesson when you can solve the exercise without copying the example.

---

**Next:** Continue to lesson 04 in this module.

---

## Additional reference

# Capstone Projects

A capstone project ties together everything from the course into one real, working application. Below are project options at three difficulty levels, each with the skills it exercises and a suggested structure.

## Option 1: Library Management System (moderate)

A console or simple web app for managing books, members, and borrowing.

**Skills practiced:** classes & objects, collections (`ArrayList`/`HashMap`), file I/O for persistence, exception handling.

**Suggested structure:**
```java
class Book {
    String title;
    String author;
    boolean isBorrowed;
}

class Member {
    String name;
    List<Book> borrowedBooks;
}

class Library {
    List<Book> catalog;
    List<Member> members;

    void borrowBook(Member member, Book book) { /* ... */ }
    void returnBook(Member member, Book book) { /* ... */ }
    List<Book> searchByTitle(String keyword) { /* ... */ }
}
```

**Stretch goals:** save/load the catalog to a file between runs; add due dates and overdue fines.

## Option 2: Student Grade Tracker REST API (intermediate-advanced)

A Spring Boot web service for recording and retrieving student grades.

**Skills practiced:** Spring Boot, REST API design, JDBC or Spring Data for persistence, unit testing with JUnit.

**Suggested endpoints:**
```
GET    /students            → list all students
POST   /students            → add a new student
GET    /students/{id}/grades → get a student's grades
POST   /students/{id}/grades → add a grade for a student
```

**Stretch goals:** calculate and return a GPA per student; add input validation with proper `400`/`404` responses (Module 04, Lesson 02).

## Option 3: Task Scheduler with Multithreading (advanced)

A simulated task-processing system where multiple worker threads pull tasks from a shared queue.

**Skills practiced:** multithreading, `Queue`, design patterns (Observer for task-completion notifications), exception handling.

**Suggested structure:**
```java
class Task {
    String name;
    int priority;
}

class TaskQueue {
    Queue<Task> tasks;        // shared between threads — needs synchronized access
    synchronized void addTask(Task t) { /* ... */ }
    synchronized Task getNextTask() { /* ... */ }
}

class Worker implements Runnable {
    TaskQueue queue;
    public void run() {
        // repeatedly pull and "process" tasks until the queue is empty
    }
}
```

**Stretch goals:** add task priorities so higher-priority tasks are processed first; log each task's start/finish with the logging framework from Module 04.

## How to approach any capstone

1. **Write the core classes first**, with no fancy framework — get the plain logic compiling and working.
2. **Add persistence** (file I/O or a database) once the core logic is solid.
3. **Add tests** for the trickiest logic, not for everything — focus on the parts most likely to break.
4. **Only then** add a web layer (Spring Boot) or threading, if your chosen project needs it.

> 💡 **Key tip:** Pick the project whose difficulty matches lessons you found *hardest*, not easiest — a capstone is most useful when it forces you to actually use the topic you're least confident in.
