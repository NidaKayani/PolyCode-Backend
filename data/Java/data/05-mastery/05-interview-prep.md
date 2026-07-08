# Lesson 05 — Interview Preparation

**Module 05 · Mastery · Lesson 05 of 05**


## Learning objectives

- Understand **interview preparation** in Java
- Read and write small examples you can run locally
- Connect this topic to the next lesson in the course

## Overview

Interview Preparation is a core topic on the PolyCode **Java Certificate Course** path. Work through the examples, then try the exercise before moving on.

## Key concepts

1. **Syntax and structure** — how Java expresses this idea clearly
2. **Common patterns** — what you will see in real projects
3. **Mistakes to avoid** — typical beginner errors and fixes

## Example

```java
// Interview Preparation — practice sketch
// add your code here
```

## Exercise

1. Write a short program that uses today's topic.
2. Change one value and predict the output before running.
3. Explain the result in your own words (2–3 sentences).

## Checkpoint

You are ready for the next lesson when you can solve the exercise without copying the example.

---

**Next:** This is the final lesson in this module.

---

## Additional reference

# Interview Prep

This lesson collects the Java concepts that come up most often in technical interviews, with short, direct answers you can build on.

## Core language questions

**Q: What's the difference between `==` and `.equals()` for objects?**
`==` checks whether two references point to the exact same object in memory. `.equals()` checks logical equality, based on whatever rule the class defines (for `String`, that means comparing characters). Covered fully in Module 01, Lesson 09.

**Q: What's the difference between an `ArrayList` and an array?**
An array has a **fixed size** set at creation. An `ArrayList` can grow and shrink dynamically, at a small performance cost, and offers many built-in methods (`add`, `remove`, `contains`).

**Q: What's the difference between `abstract class` and `interface`?**
An interface defines a contract (mostly abstract methods, plus `default`/`static`); a class can implement many. An abstract class can hold real fields and a mix of implemented/unimplemented methods; a class can extend only one. See Module 02, Lesson 02.

**Q: Explain method overloading vs overriding.**
**Overloading** — same method name, different parameter lists, resolved at compile time (Module 01, Lesson 06). **Overriding** — a subclass redefines a method it inherited, with the *same* signature, resolved at runtime based on the actual object's type (Module 02, Lesson 01).

**Q: What is a `NullPointerException`, and how do you avoid one?**
It's thrown when you call a method or access a field on a reference that's `null`. Avoid it by checking `if (obj != null)` before use, initializing fields with sensible defaults, and (in modern Java) using `Optional` for values that might legitimately be absent.

**Q: What's the difference between checked and unchecked exceptions?**
Checked exceptions (like `IOException`) must be either caught or declared with `throws` — the compiler enforces handling them. Unchecked exceptions (like `NullPointerException`, which extends `RuntimeException`) don't require this — they usually represent programming bugs rather than expected failure conditions.

## A small coding question, worked through

**"Write a method that checks if a string is a palindrome (reads the same forwards and backwards)."**

```java
static boolean isPalindrome(String s) {
    String cleaned = s.toLowerCase().replaceAll("[^a-z0-9]", "");
    int left = 0;
    int right = cleaned.length() - 1;

    while (left < right) {
        if (cleaned.charAt(left) != cleaned.charAt(right)) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}
```

```java
System.out.println(isPalindrome("Racecar"));        // true
System.out.println(isPalindrome("Hello"));           // false
System.out.println(isPalindrome("A man a plan a canal Panama"));   // true
```

**Talking through the approach out loud** (interviewers care about this as much as the code): clean the input to ignore case/punctuation, then use two pointers moving inward from both ends, comparing characters — `O(n)` time, `O(n)` space for the cleaned copy.

## Tips for the whiteboard/live-coding portion

- **Say your plan before coding.** "I'll use two pointers, one from each end" takes 10 seconds and shows your thinking even if the code isn't perfect yet.
- **Start with the simplest correct approach.** A working `O(n²)` solution beats a half-finished clever one — you can optimize afterward if there's time.
- **Talk through edge cases out loud:** empty string, `null` input, a single character.
- **Ask clarifying questions** rather than guessing — "should this be case-sensitive?" is a normal, expected question, not a weakness.

## Behavioral round basics

Most Java interviews include non-coding questions too. Have one or two concrete stories ready for:

- A time you debugged something tricky (what was the bug, how did you trace it?)
- A time you had to learn something new quickly for a project
- A disagreement with a teammate about a technical decision, and how it was resolved

> 💡 **Key tip:** Interviewers are usually evaluating *how you think*, not whether you memorized the exact right answer — narrating your reasoning out loud is almost always more valuable than going silent until you have the perfect solution.
