# Lesson 06 — JDBC and Database Access

**Module 03 · Advanced · Lesson 06 of 10**

## Learning Objectives

- Connect to a database using JDBC
- Execute queries and updates with `PreparedStatement`
- Map `ResultSet` rows to Java objects

## Overview

**JDBC (Java Database Connectivity)** is Java's standard API for talking to relational databases (MySQL, PostgreSQL, SQLite, etc.). You write SQL; JDBC sends it to the database and brings back the results. In production you'd use Spring Data or Hibernate on top, but understanding raw JDBC is essential for debugging and optimisation.

## Key Concepts

### 1. Adding the Driver (Maven/Gradle)

```xml
<!-- pom.xml for SQLite (easy to run locally) -->
<dependency>
    <groupId>org.xerial</groupId>
    <artifactId>sqlite-jdbc</artifactId>
    <version>3.45.1.0</version>
</dependency>

<!-- MySQL -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.3.0</version>
</dependency>
```

### 2. Connecting

```java
import java.sql.*;

String url = "jdbc:sqlite:students.db";           // SQLite
// String url = "jdbc:mysql://localhost:3306/mydb"; // MySQL

try (Connection conn = DriverManager.getConnection(url)) {
    System.out.println("Connected: " + conn.getMetaData().getDatabaseProductName());
}
```

### 3. Creating a Table

```java
String sql = """
    CREATE TABLE IF NOT EXISTS students (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        name    TEXT    NOT NULL,
        email   TEXT    UNIQUE,
        score   REAL    DEFAULT 0
    )
    """;

try (Connection conn = DriverManager.getConnection(url);
     Statement stmt = conn.createStatement()) {
    stmt.execute(sql);
}
```

### 4. PreparedStatement — Insert / Update / Delete

Always use `PreparedStatement` for user-supplied data — it prevents **SQL injection**.

```java
String insert = "INSERT INTO students (name, email, score) VALUES (?, ?, ?)";

try (Connection conn = DriverManager.getConnection(url);
     PreparedStatement ps = conn.prepareStatement(insert)) {

    ps.setString(1, "Alice");
    ps.setString(2, "alice@example.com");
    ps.setDouble(3, 92.5);
    ps.executeUpdate();

    // Batch insert for multiple rows
    String[][] data = {{"Bob","bob@ex.com","85"},{"Charlie","c@ex.com","78"}};
    for (String[] row : data) {
        ps.setString(1, row[0]);
        ps.setString(2, row[1]);
        ps.setDouble(3, Double.parseDouble(row[2]));
        ps.addBatch();
    }
    ps.executeBatch();
}
```

### 5. Querying — ResultSet

```java
String query = "SELECT * FROM students WHERE score > ? ORDER BY score DESC";

try (Connection conn = DriverManager.getConnection(url);
     PreparedStatement ps = conn.prepareStatement(query)) {

    ps.setDouble(1, 80.0);
    ResultSet rs = ps.executeQuery();

    while (rs.next()) {
        int    id    = rs.getInt("id");
        String name  = rs.getString("name");
        double score = rs.getDouble("score");
        System.out.printf("%-3d %-10s %.1f%n", id, name, score);
    }
}
```

### 6. Transactions

Wrap related operations in a transaction — either all succeed or all roll back.

```java
Connection conn = DriverManager.getConnection(url);
conn.setAutoCommit(false);   // start transaction

try {
    // debit account A
    // credit account B
    conn.commit();
} catch (SQLException e) {
    conn.rollback();   // undo everything
    throw e;
} finally {
    conn.setAutoCommit(true);
    conn.close();
}
```

## Full Example

```java
import java.sql.*;
import java.util.*;

public class JdbcDemo {
    record Student(int id, String name, String email, double score) {}

    static final String URL = "jdbc:sqlite:demo.db";

    static void createTable() throws SQLException {
        try (Connection c = DriverManager.getConnection(URL);
             Statement s = c.createStatement()) {
            s.execute("""
                CREATE TABLE IF NOT EXISTS students (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT, email TEXT, score REAL)
                """);
        }
    }

    static void insert(String name, String email, double score) throws SQLException {
        String sql = "INSERT INTO students (name,email,score) VALUES (?,?,?)";
        try (Connection c = DriverManager.getConnection(URL);
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, name); ps.setString(2, email); ps.setDouble(3, score);
            ps.executeUpdate();
        }
    }

    static List<Student> findTopStudents(double minScore) throws SQLException {
        List<Student> result = new ArrayList<>();
        String sql = "SELECT * FROM students WHERE score >= ? ORDER BY score DESC";
        try (Connection c = DriverManager.getConnection(URL);
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setDouble(1, minScore);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                result.add(new Student(rs.getInt("id"), rs.getString("name"),
                    rs.getString("email"), rs.getDouble("score")));
            }
        }
        return result;
    }

    public static void main(String[] args) throws SQLException {
        createTable();
        insert("Alice",   "alice@ex.com",   92.5);
        insert("Bob",     "bob@ex.com",     85.0);
        insert("Charlie", "charlie@ex.com", 78.3);
        insert("Diana",   "diana@ex.com",   96.1);

        System.out.println("Top students (score ≥ 85):");
        for (Student s : findTopStudents(85)) {
            System.out.printf("  [%d] %-8s %.1f  %s%n",
                s.id(), s.name(), s.score(), s.email());
        }
    }
}
```

**Expected output:**
```
Top students (score ≥ 85):
  [4] Diana    96.1  diana@ex.com
  [1] Alice    92.5  alice@ex.com
  [2] Bob      85.0  bob@ex.com
```

## Exercise

1. Add an `updateScore(int id, double newScore)` method to the demo above.
2. Add a `deleteStudent(int id)` method and verify the row is gone.
3. Write a transaction that transfers "grade points" from one student to another — roll back if either student doesn't exist.

## Checkpoint

You are ready for Module 04 when you can:
- Connect to a database and run a query
- Explain why PreparedStatement prevents SQL injection
- Wrap multiple inserts in a transaction

---
**Module 03 Complete!** You are ready for **Module 04 — Professional Java**.
