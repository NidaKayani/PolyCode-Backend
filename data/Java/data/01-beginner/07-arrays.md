# Lesson 07 — Arrays

**Module 01 · Beginner · Lesson 07 of 10**

## Learning Objectives

- Declare, initialise, and access arrays
- Iterate over arrays with loops and the enhanced for loop
- Use 2D arrays for grid-style data

## Overview

An **array** is a fixed-size, ordered collection of elements of the same type. Once created, an array's size cannot change. Arrays are the foundation for all data structures in Java.

## Key Concepts

### 1. Declaring and Creating Arrays

```java
// Declare an empty array of 5 integers
int[] scores = new int[5];      // all elements start as 0

// Declare and initialise with values
int[] primes = {2, 3, 5, 7, 11};

// String array
String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri"};
```

### 2. Accessing Elements (zero-indexed)

```java
int[] nums = {10, 20, 30, 40, 50};
System.out.println(nums[0]);   // 10  (first element)
System.out.println(nums[4]);   // 50  (last element)
System.out.println(nums.length); // 5

nums[2] = 99;   // Change element at index 2
// Array is now: {10, 20, 99, 40, 50}
```

> Accessing `nums[5]` on a 5-element array throws `ArrayIndexOutOfBoundsException`!

### 3. Iterating with a for Loop

```java
int[] scores = {88, 72, 95, 61, 84};

// Standard for loop
for (int i = 0; i < scores.length; i++) {
    System.out.println("Score " + (i + 1) + ": " + scores[i]);
}
```

### 4. Enhanced for Loop (for-each)

```java
int[] scores = {88, 72, 95, 61, 84};

for (int score : scores) {
    System.out.println(score);
}
```

Use the enhanced loop when you don't need the index.

### 5. Useful `Arrays` Class Methods

```java
import java.util.Arrays;

int[] nums = {5, 2, 8, 1, 9};

Arrays.sort(nums);                    // sort in place: {1, 2, 5, 8, 9}
System.out.println(Arrays.toString(nums)); // [1, 2, 5, 8, 9]

int[] copy = Arrays.copyOf(nums, 3);  // {1, 2, 5}
boolean equal = Arrays.equals(nums, copy); // false
```

### 6. 2D Arrays

```java
int[][] grid = new int[3][3];   // 3 rows, 3 columns

// Initialise with values
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

// Access: matrix[row][column]
System.out.println(matrix[1][2]);  // 6 (row 1, column 2)

// Iterate with nested loops
for (int row = 0; row < matrix.length; row++) {
    for (int col = 0; col < matrix[row].length; col++) {
        System.out.printf("%3d", matrix[row][col]);
    }
    System.out.println();
}
```

## Full Example

```java
import java.util.Arrays;

public class ArraysDemo {
    public static void main(String[] args) {
        // Student scores
        int[] scores = {78, 92, 55, 88, 73, 95, 61};

        // Statistics
        int sum = 0, max = scores[0], min = scores[0];
        for (int s : scores) {
            sum += s;
            if (s > max) max = s;
            if (s < min) min = s;
        }
        double avg = (double) sum / scores.length;

        System.out.printf("Scores: %s%n", Arrays.toString(scores));
        System.out.printf("Count:  %d%n", scores.length);
        System.out.printf("Sum:    %d%n", sum);
        System.out.printf("Avg:    %.1f%n", avg);
        System.out.printf("Max:    %d%n", max);
        System.out.printf("Min:    %d%n", min);

        Arrays.sort(scores);
        System.out.printf("Sorted: %s%n", Arrays.toString(scores));

        // 2D: 3x3 identity matrix
        int[][] identity = {{1,0,0},{0,1,0},{0,0,1}};
        System.out.println("\nIdentity matrix:");
        for (int[] row : identity) {
            System.out.println(Arrays.toString(row));
        }
    }
}
```

**Expected output:**
```
Scores: [78, 92, 55, 88, 73, 95, 61]
Count:  7
Sum:    542
Avg:    77.4
Max:    95
Min:    55
Sorted: [55, 61, 73, 78, 88, 92, 95]

Identity matrix:
[1, 0, 0]
[0, 1, 0]
[0, 0, 1]
```

## Exercise

1. Write a method `reverse(int[] arr)` that reverses an array in place (no new array).
2. Write a method that searches an array for a value and returns its index, or -1 if not found.
3. Create a 5×5 2D array and fill it so that each cell contains `row * column`.

## Checkpoint

You are ready for the next lesson when you can:
- Explain why arrays are zero-indexed
- Choose between standard and enhanced for loops
- Access any element in a 2D array using row/column indices

---

**Next:** Continue to lesson 08 in this module.

---

## Additional reference

# Arrays

An **array** is a fixed-size container that holds multiple values of the **same type**, stored in order and accessed by a numeric index.

## Declaring and creating arrays

```java
int[] numbers = new int[5];      // an array of 5 ints, all default to 0
String[] names = new String[3];  // an array of 3 Strings, all default to null
```

Or declare and fill it in one step using an **array literal**:

```java
int[] scores = {90, 85, 77, 92, 60};
String[] fruits = {"Apple", "Banana", "Cherry"};
```

## Accessing elements

Arrays are **zero-indexed** — the first element is at index `0`, not `1`.

```java
int[] scores = {90, 85, 77, 92, 60};
System.out.println(scores[0]);   // 90 — first element
System.out.println(scores[4]);   // 60 — last element
scores[1] = 100;                  // update an element
System.out.println(scores[1]);   // 100
```

Trying to access `scores[5]` throws an `ArrayIndexOutOfBoundsException` — the valid indices for a 5-element array are `0` through `4`.

## Array length

```java
int[] scores = {90, 85, 77, 92, 60};
System.out.println(scores.length);   // 5
```

Note: `length` is a **field**, not a method — no parentheses, unlike `String`'s `.length()`.

## Looping through an array

### Classic `for` loop (use when you need the index)

```java
int[] scores = {90, 85, 77, 92, 60};
for (int i = 0; i < scores.length; i++) {
    System.out.println("Score " + i + ": " + scores[i]);
}
```

### `for-each` loop (cleaner when you only need the values)

```java
int[] scores = {90, 85, 77, 92, 60};
for (int score : scores) {
    System.out.println(score);
}
```

## Common array operations via `java.util.Arrays`

```java
import java.util.Arrays;

int[] scores = {90, 85, 77, 92, 60};

Arrays.sort(scores);                       // sorts in place, ascending
System.out.println(Arrays.toString(scores)); // [60, 77, 85, 90, 92]
```

`Arrays.toString()` is the standard way to print an array's contents — printing the array variable directly (`System.out.println(scores)`) just prints a cryptic memory reference, not the values.

## Multi-dimensional arrays

A 2D array is an "array of arrays" — useful for grids or tables:

```java
int[][] grid = {
    {1, 2, 3},
    {4, 5, 6}
};

System.out.println(grid[0][2]);   // 3 — row 0, column 2
System.out.println(grid[1][0]);   // 4 — row 1, column 0

for (int[] row : grid) {
    for (int value : row) {
        System.out.print(value + " ");
    }
    System.out.println();
}
```

**Output:**
```
1 2 3 
4 5 6 
```

## Summary

| Operation | Syntax |
|---|---|
| Declare with size | `int[] arr = new int[5];` |
| Declare with values | `int[] arr = {1, 2, 3};` |
| Access an element | `arr[index]` |
| Get the size | `arr.length` |
| Loop with index | `for (int i = 0; i < arr.length; i++)` |
| Loop over values | `for (int x : arr)` |

> 💡 **Key tip:** Arrays have a **fixed size** once created. If you need a list that can grow or shrink, use `ArrayList` (covered in the Collections lesson, Module 02).
