# Lesson 05 — Security Basics

**Module 4 · Professional · Lesson 05 of 06**


## Learning objectives

- Understand **security basics** in Java
- Read and write small examples you can run locally
- Connect this topic to the next lesson in the course

## Overview

Security Basics is a core topic on the PolyCode **Java Certificate Course** path. Work through the examples, then try the exercise before moving on.

## Key concepts

1. **Syntax and structure** — how Java expresses this idea clearly
2. **Common patterns** — what you will see in real projects
3. **Mistakes to avoid** — typical beginner errors and fixes

## Example

```java
// Security Basics — practice sketch
// add your code here
```

## Exercise

1. Write a short program that uses today's topic.
2. Change one value and predict the output before running.
3. Explain the result in your own words (2–3 sentences).

## Checkpoint

You are ready for the next lesson when you can solve the exercise without copying the example.

---

**Next:** Continue to lesson 06 in this module.

---

## Additional reference

# Security Basics

Writing secure Java applications is mostly about a handful of well-known defensive habits, applied consistently. This lesson focuses on *recognizing risks and applying the standard fixes* — not on attack techniques.

## SQL Injection — and why `PreparedStatement` prevents it

Building SQL by gluing strings together lets attacker-supplied input change the meaning of your query:

```java
// RISKY — never build SQL by concatenating user input
String unsafeQuery = "SELECT * FROM users WHERE username = '" + userInput + "'";
```

The fix, already covered in the JDBC lesson, is to always use `PreparedStatement` with `?` placeholders, which treats input strictly as data — never as part of the SQL syntax itself:

```java
String safeQuery = "SELECT * FROM users WHERE username = ?";
PreparedStatement ps = connection.prepareStatement(safeQuery);
ps.setString(1, userInput);
```

## Validating input

Never trust data coming from a user, a request body, or a file — check it before acting on it:

```java
public void registerUser(String email, int age) {
    if (email == null || !email.contains("@")) {
        throw new IllegalArgumentException("Invalid email address");
    }
    if (age < 0 || age > 130) {
        throw new IllegalArgumentException("Invalid age");
    }
    // proceed with registration
}
```

## Storing passwords: hash, never store as plain text

A password should never be stored as readable text — if your database is ever exposed, every account is compromised instantly. Instead, store a **hash** using a purpose-built, slow hashing algorithm such as BCrypt:

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

String hashed = encoder.encode("myPassword123");   // store THIS, never the raw password
System.out.println(hashed);   // a long, irreversible hash string

boolean matches = encoder.matches("myPassword123", hashed);
System.out.println(matches);   // true — used to verify login attempts
```

`BCrypt` is intentionally slow and includes a random "salt" automatically, which is exactly what makes it resistant to brute-force and lookup-table attacks — never use general-purpose hashes like plain MD5 or SHA-1 for passwords.

## Keeping secrets out of source code

Hardcoding an API key, password, or database credential directly in a `.java` file means it ends up in version control, visible to anyone with repository access — including in the project's history, even after later removal.

```java
// RISKY — visible to anyone who can read the source or the git history
String apiKey = "sk-abc123realkeyhere";
```

```java
// BETTER — read from an environment variable or a config file excluded from git
String apiKey = System.getenv("API_KEY");
```

## HTTPS instead of HTTP

HTTP sends data in plain text — anyone intercepting network traffic (a public Wi-Fi network, for example) can read it. HTTPS encrypts the connection, protecting credentials, tokens, and any sensitive data in transit. Production services should always run behind HTTPS.

## The principle of least privilege

Give each component (a database user, an API key, a service account) only the permissions it actually needs to do its job — nothing more. A reporting service that only reads data shouldn't have a database account that can also delete tables.

## Summary

| Risk | Standard fix |
|---|---|
| SQL injection | `PreparedStatement` with `?` placeholders |
| Untrusted input | Validate before using it |
| Stored passwords | Hash with BCrypt (or similar), never store plain text |
| Secrets in code | Read from environment variables / external config, not hardcoded |
| Unencrypted traffic | Use HTTPS |
| Overly broad permissions | Apply least privilege to every account and credential |

> 💡 **Key tip:** Most real-world security incidents trace back to one of these basics being skipped, not to some exotic attack — getting these habits right covers most of the everyday risk.
