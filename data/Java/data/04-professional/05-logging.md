# Lesson 05 — Logging Best Practices

**Module 4 · Professional · Lesson 5 of 10**


## Learning objectives

- Understand **logging best practices** in Java
- Read and write small examples you can run locally
- Connect this topic to the next lesson in the course

## Overview

Logging Best Practices is a core topic on the PolyCode **Java Certificate Course** path. Work through the examples, then try the exercise before moving on.

## Key concepts

1. **Syntax and structure** — how Java expresses this idea clearly
2. **Common patterns** — what you will see in real projects
3. **Mistakes to avoid** — typical beginner errors and fixes

## Example

```java
// Logging Best Practices — practice sketch
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

# Logging

**Logging** records what a program is doing while it runs — for debugging, monitoring, and diagnosing issues in production, where you can't just attach a debugger.

## Why not just use `System.out.println`?

`println` always prints, always goes to one place (the console), and has no concept of severity. Real applications need to:

- Turn detailed messages on/off without changing code (e.g., verbose in development, quiet in production)
- Distinguish "just for info" from "something's actually wrong"
- Send output to files, monitoring systems, or multiple destinations at once

That's what a logging framework provides.

## SLF4J + Logback — the standard combo

**SLF4J** is a simple logging *interface*; **Logback** is the most common implementation behind it. You code against SLF4J, and Logback does the actual writing.

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OrderService {
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    public void placeOrder(String item, int quantity) {
        logger.info("Placing order: {} x {}", item, quantity);

        if (quantity <= 0) {
            logger.warn("Suspicious order quantity: {}", quantity);
        }

        try {
            // ... order processing logic
            logger.info("Order placed successfully");
        } catch (Exception e) {
            logger.error("Order failed for item: {}", item, e);
        }
    }
}
```

**Output (typical console format):**
```
2026-06-26 10:15:02 INFO  OrderService - Placing order: Laptop x 2
2026-06-26 10:15:02 INFO  OrderService - Order placed successfully
```

The `{}` placeholders work like `printf`'s `%s` — values get substituted in, and (importantly) the string is only built if that log level is actually enabled, which is more efficient than always concatenating with `+`.

## Log levels, from least to most severe

| Level | When to use it |
|---|---|
| `TRACE` | Extremely fine-grained detail, rarely enabled |
| `DEBUG` | Useful detail during development |
| `INFO` | Normal operational events worth recording ("order placed", "server started") |
| `WARN` | Something unexpected, but not breaking | 
| `ERROR` | Something failed and needs attention |

You configure a **minimum level** (e.g., `INFO` in production) — anything below that threshold is simply skipped, with no code changes needed.

## A minimal Logback configuration

```xml
<!-- src/main/resources/logback.xml -->
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss} %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <root level="INFO">
        <appender-ref ref="CONSOLE" />
    </root>
</configuration>
```

This says: log everything `INFO` and above, formatted with a timestamp and level, sent to the console.

## Summary

| Concept | Description |
|---|---|
| SLF4J | The logging interface your code calls |
| Logback | A common implementation that actually writes the logs |
| Log level | Controls which messages are recorded, without code changes |
| `{}` placeholders | Efficient, readable way to insert variable values into a message |

> 💡 **Key tip:** Log at `INFO` for things you'd want to see in a normal production trace, and `ERROR` only for actual failures — overusing `ERROR` for routine events makes real problems harder to spot.
