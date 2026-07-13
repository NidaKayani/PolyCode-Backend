# Lesson 07 — JUnit Testing

**Module 03 · Advanced · Lesson 07 of 10**


## Learning objectives

- Understand **junit testing** in Java
- Read and write small examples you can run locally
- Connect this topic to the next lesson in the course

## Overview

JUnit Testing is a core topic on the PolyCode **Java Certificate Course** path. Work through the examples, then try the exercise before moving on.

## Key concepts

1. **Syntax and structure** — how Java expresses this idea clearly
2. **Common patterns** — what you will see in real projects
3. **Mistakes to avoid** — typical beginner errors and fixes

## Example

```java
// JUnit Testing — practice sketch
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

# Unit Testing with JUnit

**JUnit** is the standard framework for writing automated tests in Java. A unit test checks that one small piece of code (usually a single method) behaves correctly, without needing to manually run the whole program and check by eye.

## The code under test

```java
public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }

    public int divide(int a, int b) {
        if (b == 0) {
            throw new IllegalArgumentException("Cannot divide by zero");
        }
        return a / b;
    }
}
```

## Writing a test class

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class CalculatorTest {

    @Test
    void testAdd() {
        Calculator calc = new Calculator();
        int result = calc.add(2, 3);
        assertEquals(5, result);   // fails the test if result != 5
    }

    @Test
    void testDivide() {
        Calculator calc = new Calculator();
        assertEquals(4, calc.divide(8, 2));
    }

    @Test
    void testDivideByZeroThrows() {
        Calculator calc = new Calculator();
        assertThrows(IllegalArgumentException.class, () -> calc.divide(5, 0));
    }
}
```

Running this class executes each `@Test` method independently. Each one passes silently or reports a clear failure showing exactly which assertion didn't hold.

## Common assertions

| Method | Checks |
|---|---|
| `assertEquals(expected, actual)` | Values are equal |
| `assertTrue(condition)` / `assertFalse(condition)` | A boolean expression |
| `assertNull(value)` / `assertNotNull(value)` | Whether something is `null` |
| `assertThrows(Exception.class, () -> ...)` | The code throws the expected exception |

## Setting up and tearing down: `@BeforeEach` / `@AfterEach`

When several tests need the same starting object, set it up once instead of repeating the code in every test:

```java
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class CalculatorTest {
    private Calculator calc;

    @BeforeEach
    void setUp() {
        calc = new Calculator();   // runs fresh before every single @Test
    }

    @Test
    void testAdd() {
        assertEquals(5, calc.add(2, 3));
    }

    @Test
    void testSubtractIsNegativeWhenSmallerFirst() {
        assertEquals(-1, calc.add(2, -3));
    }
}
```

`@BeforeEach` runs before **every** test method, giving each one a clean, predictable starting point — tests shouldn't depend on each other or on leftover state.

## Why bother with tests at all?

- **Catch regressions** — if a later change breaks `add()`, the test fails immediately instead of the bug surfacing in production.
- **Document behavior** — `testDivideByZeroThrows` tells future readers exactly what's supposed to happen on bad input, without them reading the implementation.
- **Confidence to refactor** — if the tests still pass after restructuring the code, you haven't broken anything that mattered.

> 💡 **Key tip:** A good unit test checks **one specific behavior** and has a name that describes it — `testDivideByZeroThrows` is far more useful at a glance than `test3`.
