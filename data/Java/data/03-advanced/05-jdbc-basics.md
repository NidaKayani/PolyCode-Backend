# Lesson 05 — JDBC and Databases

**Module 03 · Advanced · Lesson 05 of 10**


## Learning objectives

- Understand **jdbc and databases** in Java
- Read and write small examples you can run locally
- Connect this topic to the next lesson in the course

## Overview

JDBC and Databases is a core topic on the PolyCode **Java Certificate Course** path. Work through the examples, then try the exercise before moving on.

## Key concepts

1. **Syntax and structure** — how Java expresses this idea clearly
2. **Common patterns** — what you will see in real projects
3. **Mistakes to avoid** — typical beginner errors and fixes

## Example

```java
// JDBC and Databases — practice sketch
// add your code here
```

## Exercise

1. Write a short program that uses today's topic.
2. Change one value and predict the output before running.
3. Explain the result in your own words (2–3 sentences).

## Checkpoint

You are ready for the next lesson when you can solve the exercise without copying the example.

---

**Next:** Continue to lesson 05 in this module.

---

## Additional reference

# JDBC Basics

**JDBC** (Java Database Connectivity) is the standard API Java uses to connect to and query relational databases like MySQL, PostgreSQL, or SQLite.

## The four core pieces

| Interface/Class | Role |
|---|---|
| `DriverManager` | Opens a connection to the database |
| `Connection` | Represents an active database session |
| `Statement` / `PreparedStatement` | Sends SQL commands |
| `ResultSet` | Holds the rows returned by a query |

## Connecting to a database

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

String url = "jdbc:mysql://localhost:3306/school";
String user = "root";
String password = "yourpassword";

try (Connection conn = DriverManager.getConnection(url, user, password)) {
    System.out.println("Connected successfully!");
} catch (SQLException e) {
    System.out.println("Connection failed: " + e.getMessage());
}
```

The JDBC URL format is `jdbc:<database-type>://<host>:<port>/<database-name>`.

## Running a query: `SELECT`

```java
import java.sql.*;

String url = "jdbc:mysql://localhost:3306/school";

try (Connection conn = DriverManager.getConnection(url, "root", "yourpassword");
     Statement stmt = conn.createStatement();
     ResultSet rs = stmt.executeQuery("SELECT id, name, grade FROM students")) {

    while (rs.next()) {
        int id = rs.getInt("id");
        String name = rs.getString("name");
        String grade = rs.getString("grade");
        System.out.println(id + " - " + name + " - " + grade);
    }
} catch (SQLException e) {
    System.out.println("Query failed: " + e.getMessage());
}
```

`rs.next()` moves the cursor to the next row and returns `false` once there are no more rows — that's what drives the `while` loop.

## Using `PreparedStatement` (the safer way to insert variables into SQL)

```java
String insertSql = "INSERT INTO students (name, grade) VALUES (?, ?)";

try (Connection conn = DriverManager.getConnection(url, "root", "yourpassword");
     PreparedStatement ps = conn.prepareStatement(insertSql)) {

    ps.setString(1, "Maryam");
    ps.setString(2, "A");
    ps.executeUpdate();

    System.out.println("Student added.");
} catch (SQLException e) {
    System.out.println("Insert failed: " + e.getMessage());
}
```

`?` placeholders get filled in with `setString`, `setInt`, and so on, and JDBC handles the value safely behind the scenes. This also protects against **SQL injection** — building SQL by concatenating raw strings together (`"... VALUES ('" + name + "')"`) is a serious, well-known security risk, because user input could contain SQL that changes the meaning of the query. `PreparedStatement` treats the input strictly as data, never as part of the SQL itself.

## Why `try-with-resources` matters here

`Connection`, `Statement`, and `ResultSet` all hold real external resources (network sockets, memory on the database server). Declaring them in `try (...)` guarantees they're closed automatically, even if an exception is thrown midway through.

## Summary

| Step | What happens |
|---|---|
| 1. Connect | `DriverManager.getConnection(url, user, password)` |
| 2. Prepare a statement | `conn.createStatement()` or `conn.prepareStatement(sql)` |
| 3. Execute | `executeQuery(...)` for `SELECT`, `executeUpdate(...)` for `INSERT`/`UPDATE`/`DELETE` |
| 4. Read results | Loop with `rs.next()`, pulling out columns by name or index |
| 5. Close | Automatic with try-with-resources |

> 💡 **Key tip:** Always use `PreparedStatement` with `?` placeholders instead of building SQL strings by hand — it's both safer (prevents SQL injection) and handles type conversion for you.
