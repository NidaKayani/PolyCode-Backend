# Lesson 06 — File I/O

**Module 02 · Intermediate · Lesson 06 of 06**

## Learning Objectives

- Read and write text files using `BufferedReader` / `BufferedWriter`
- Use the modern `Files` API (Java 11+)
- Handle file exceptions correctly

## Overview

Real applications constantly read config files, write logs, and process data files. Java provides two approaches: the classic `java.io` streams and the modern `java.nio.file.Files` API. The modern API is simpler for most tasks.

## Key Concepts

### 1. Writing a File (Modern API)

```java
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

Path file = Path.of("students.txt");

List<String> lines = List.of(
    "Alice, 92",
    "Bob, 85",
    "Charlie, 78"
);

Files.write(file, lines);   // creates or overwrites the file
System.out.println("File written: " + file.toAbsolutePath());
```

### 2. Reading a File (Modern API)

```java
// Read all lines at once
List<String> lines = Files.readAllLines(Path.of("students.txt"));
for (String line : lines) {
    System.out.println(line);
}

// Read entire file as a single String (Java 11+)
String content = Files.readString(Path.of("students.txt"));
System.out.println(content);
```

### 3. Appending to a File

```java
import java.nio.file.StandardOpenOption;

Files.writeString(
    Path.of("log.txt"),
    "New log entry\n",
    StandardOpenOption.CREATE,
    StandardOpenOption.APPEND
);
```

### 4. Classic BufferedReader / BufferedWriter

Useful for large files — reads line by line without loading everything into memory.

```java
import java.io.*;

// Writing
try (BufferedWriter writer = new BufferedWriter(new FileWriter("output.txt"))) {
    writer.write("Line 1");
    writer.newLine();
    writer.write("Line 2");
}

// Reading
try (BufferedReader reader = new BufferedReader(new FileReader("output.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
}
```

### 5. Checking and Managing Files

```java
Path p = Path.of("data.txt");

Files.exists(p);           // does it exist?
Files.isReadable(p);       // can we read it?
Files.size(p);             // size in bytes
Files.delete(p);           // delete it
Files.copy(p, Path.of("backup.txt"));   // copy
Files.move(p, Path.of("archive/data.txt"));  // move/rename
```

### 6. Working with Directories

```java
Path dir = Path.of("reports");
Files.createDirectories(dir);   // create dir (and parents)

// List all files in a directory
Files.list(dir).forEach(System.out::println);

// Walk entire directory tree
Files.walk(dir)
     .filter(f -> f.toString().endsWith(".txt"))
     .forEach(System.out::println);
```

## Full Example

```java
import java.io.*;
import java.nio.file.*;
import java.util.*;

public class FileIODemo {
    record Student(String name, int score) {}

    public static void main(String[] args) throws IOException {
        Path file = Path.of("scores.csv");

        // 1. Write CSV
        List<Student> students = List.of(
            new Student("Alice", 92),
            new Student("Bob", 85),
            new Student("Charlie", 78),
            new Student("Diana", 96)
        );

        try (BufferedWriter bw = Files.newBufferedWriter(file)) {
            bw.write("name,score");
            bw.newLine();
            for (Student s : students) {
                bw.write(s.name() + "," + s.score());
                bw.newLine();
            }
        }
        System.out.println("Written to: " + file.toAbsolutePath());

        // 2. Read back and parse
        System.out.println("\n--- Student Report ---");
        int total = 0, count = 0;
        List<String> lines = Files.readAllLines(file);
        for (int i = 1; i < lines.size(); i++) {   // skip header
            String[] parts = lines.get(i).split(",");
            String name = parts[0];
            int score = Integer.parseInt(parts[1]);
            total += score;
            count++;
            System.out.printf("%-10s %d%n", name, score);
        }
        System.out.printf("Average: %.1f%n", (double) total / count);
    }
}
```

**Expected output:**
```
Written to: /home/user/scores.csv

--- Student Report ---
Alice      92
Bob        85
Charlie    78
Diana      96
Average: 87.8
```

## Exercise

1. Write a program that reads a `.txt` file and counts the number of lines, words, and characters (like the Unix `wc` command).
2. Write a simple CSV parser that reads a file of `name,age,city` records and prints only rows where age > 25.
3. Create a `Logger` class with a method `log(String message)` that appends a timestamped line to `app.log`.

## Checkpoint

You are ready for Module 03 when you can:
- Write and read files using both the classic and modern APIs
- Append to an existing file without overwriting it
- Use try-with-resources to safely close file handles

---

**Next:** This is the final lesson in this module.

---

## Additional reference

# File I/O

Java's `java.io` and `java.nio.file` packages let programs read from and write to files on disk.

## Writing to a file

```java
import java.io.FileWriter;
import java.io.IOException;

public class WriteDemo {
    public static void main(String[] args) {
        try (FileWriter writer = new FileWriter("notes.txt")) {
            writer.write("Hello, file!\n");
            writer.write("Second line.\n");
        } catch (IOException e) {
            System.out.println("Could not write file: " + e.getMessage());
        }
    }
}
```

The `try (...)` form is called **try-with-resources**: anything declared inside the parentheses is automatically closed when the block ends, even if an exception occurs — you don't need a separate `finally { writer.close(); }`.

## Reading a file line by line

```java
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class ReadDemo {
    public static void main(String[] args) {
        try (BufferedReader reader = new BufferedReader(new FileReader("notes.txt"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        } catch (IOException e) {
            System.out.println("Could not read file: " + e.getMessage());
        }
    }
}
```

**Output:**
```
Hello, file!
Second line.
```

`readLine()` returns `null` once there are no more lines — that's the loop's stopping condition.

## A shorter way: `Files` and `Scanner`

For smaller files, two convenient alternatives:

```java
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.io.IOException;

List<String> lines = Files.readAllLines(Path.of("notes.txt"));
for (String line : lines) {
    System.out.println(line);
}
```

```java
import java.io.File;
import java.io.FileNotFoundException;
import java.util.Scanner;

try (Scanner fileScanner = new Scanner(new File("notes.txt"))) {
    while (fileScanner.hasNextLine()) {
        System.out.println(fileScanner.nextLine());
    }
} catch (FileNotFoundException e) {
    System.out.println("File not found: " + e.getMessage());
}
```

`Scanner` works for files the same way it works for keyboard input (Lesson 10, Module 01) — just point it at a `File` instead of `System.in`.

## Why file operations always involve exceptions

Reading or writing a file can fail for reasons outside your program's control — the file might not exist, the disk might be full, or permissions might be wrong. Java forces you to acknowledge this by requiring a `catch` (or declaring `throws IOException`) anywhere file I/O happens. Exception handling itself is covered in depth in the next lesson.

## Summary

| Task | Class to use |
|---|---|
| Write text to a file | `FileWriter`, often wrapped for try-with-resources |
| Read a file line by line | `BufferedReader` + `FileReader` |
| Read a whole file quickly | `Files.readAllLines(Path.of(...))` |
| Read a file like keyboard input | `Scanner` pointed at a `File` |

> 💡 **Key tip:** Always open files inside a `try (...)` with resources — it guarantees the file is closed properly, even if something goes wrong halfway through.
