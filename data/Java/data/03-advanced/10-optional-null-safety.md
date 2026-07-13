# Lesson 10 — Optional and Null Safety

**Module 03 · Advanced · Lesson 10 of 10**

## Learning Objectives

- Use `Optional<T>` to represent values that may be absent
- Chain Optional operations with `map`, `flatMap`, and `filter`
- Avoid `NullPointerException` in real-world code

## Overview

`NullPointerException` is the most common Java runtime crash. Java 8 introduced `Optional<T>` — a container that either holds a value or explicitly represents "no value". Using Optional forces callers to handle the absent case, eliminating silent null bugs.

## Key Concepts

### 1. Creating Optionals

```java
import java.util.Optional;

Optional<String> present = Optional.of("Hello");          // must be non-null
Optional<String> empty   = Optional.empty();              // explicitly absent
Optional<String> maybe   = Optional.ofNullable(getValue()); // null becomes empty
```

### 2. Checking and Getting

```java
Optional<String> opt = Optional.of("Alice");

opt.isPresent()   // true
opt.isEmpty()     // false (Java 11+)
opt.get()         // "Alice" — throws NoSuchElementException if empty!

// Safer alternatives:
opt.orElse("default")                     // return value or fallback
opt.orElseGet(() -> computeDefault())     // lazy fallback
opt.orElseThrow(() -> new RuntimeException("Not found"))
```

### 3. Transforming with map and flatMap

```java
Optional<String> name = Optional.of("  alice  ");

Optional<String> upper = name
    .map(String::trim)
    .map(String::toUpperCase);

System.out.println(upper.orElse("nobody"));  // ALICE

// flatMap: when the mapping function itself returns Optional
Optional<String> email = findUser("alice")
    .flatMap(user -> user.getEmail());   // getEmail() returns Optional<String>
```

### 4. filter

```java
Optional<Integer> age = Optional.of(17);

Optional<Integer> legalAge = age.filter(a -> a >= 18);
System.out.println(legalAge.isPresent());   // false
```

### 5. ifPresent / ifPresentOrElse

```java
Optional<String> name = Optional.of("Alice");

name.ifPresent(n -> System.out.println("Hello, " + n));
// Hello, Alice

name.ifPresentOrElse(
    n -> System.out.println("Found: " + n),
    () -> System.out.println("Not found")
);
```

### 6. When NOT to use Optional

- **Don't** use Optional as a field type in a class
- **Don't** use Optional in method parameters (use overloading instead)
- **Don't** use Optional with collections (return an empty list instead)
- **Do** use Optional as a **return type** for methods that may not find a value

## Full Example

```java
import java.util.*;

public class OptionalDemo {
    record User(String id, String name, String email) {
        Optional<String> getEmail() {
            return email == null ? Optional.empty() : Optional.of(email);
        }
    }

    static Map<String, User> db = Map.of(
        "u1", new User("u1", "Alice", "alice@example.com"),
        "u2", new User("u2", "Bob", null)   // no email
    );

    static Optional<User> findUser(String id) {
        return Optional.ofNullable(db.get(id));
    }

    static String getEmailDomain(String userId) {
        return findUser(userId)
            .flatMap(User::getEmail)
            .map(email -> email.substring(email.indexOf('@') + 1))
            .map(String::toUpperCase)
            .orElse("NO EMAIL");
    }

    public static void main(String[] args) {
        String[] ids = {"u1", "u2", "u3"};

        for (String id : ids) {
            System.out.printf("User %-3s → domain: %s%n", id, getEmailDomain(id));
        }

        // Safe update
        findUser("u1").ifPresentOrElse(
            u -> System.out.println("Found: " + u.name()),
            () -> System.out.println("User not found")
        );
    }
}
```

**Expected output:**
```
User u1  → domain: EXAMPLE.COM
User u2  → domain: NO EMAIL
User u3  → domain: NO EMAIL
Found: Alice
```

## Exercise

1. Write a method `findFirstEven(List<Integer> list)` that returns `Optional<Integer>` — the first even number, or empty if none.
2. Chain three Optional operations: find a user by ID, get their address, get the city — returning `Optional<String>`.
3. Refactor an existing class that returns `null` on "not found" to return `Optional` instead, and update all callers.

## Checkpoint

You are ready for the next lesson when you can:
- Chain `map`, `flatMap`, and `filter` on Optional
- Explain when `get()` is dangerous
- Describe the 3 situations where Optional should NOT be used

---
**Next:** Lesson 05 — JDBC and Database Access
