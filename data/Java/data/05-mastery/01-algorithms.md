# Lesson 01 — Algorithms and Data Structures

**Module 05 · Mastery · Lesson 01 of 03**

## Learning Objectives

- Implement and analyse common sorting and searching algorithms
- Understand Big-O notation for time and space complexity
- Implement core data structures: Stack, Queue, LinkedList, Binary Search Tree

## Overview

Algorithms and data structures are the foundation of computer science and a staple of technical interviews. This lesson covers the essential algorithms every Java developer must know, with clean implementations and Big-O analysis.

## Key Concepts

### 1. Big-O Cheat Sheet

| Complexity | Name | Example |
|-----------|------|---------|
| O(1) | Constant | Array access, HashMap get |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Loop through array |
| O(n log n) | Log-linear | Merge sort, quick sort |
| O(n²) | Quadratic | Bubble sort, nested loops |
| O(2ⁿ) | Exponential | Recursive Fibonacci |

### 2. Sorting Algorithms

#### Bubble Sort — O(n²)
```java
public static void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}
```

#### Merge Sort — O(n log n)
```java
public static void mergeSort(int[] arr, int left, int right) {
    if (left >= right) return;
    int mid = (left + right) / 2;
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    merge(arr, left, mid, right);
}

private static void merge(int[] arr, int left, int mid, int right) {
    int[] temp = Arrays.copyOfRange(arr, left, right + 1);
    int i = 0, j = mid - left + 1, k = left;
    while (i <= mid - left && j <= right - left) {
        arr[k++] = (temp[i] <= temp[j]) ? temp[i++] : temp[j++];
    }
    while (i <= mid - left) arr[k++] = temp[i++];
    while (j <= right - left) arr[k++] = temp[j++];
}
```

### 3. Searching Algorithms

#### Linear Search — O(n)
```java
public static int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}
```

#### Binary Search — O(log n) — array must be sorted!
```java
public static int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;   // avoids overflow
        if (arr[mid] == target)  return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
```

### 4. Data Structures

#### Stack (LIFO)
```java
public class Stack<T> {
    private final LinkedList<T> list = new LinkedList<>();

    public void push(T item) { list.addFirst(item); }
    public T pop()           { return list.removeFirst(); }
    public T peek()          { return list.getFirst(); }
    public boolean isEmpty() { return list.isEmpty(); }
    public int size()        { return list.size(); }
}
```

#### Queue (FIFO)
```java
public class Queue<T> {
    private final LinkedList<T> list = new LinkedList<>();

    public void enqueue(T item) { list.addLast(item); }
    public T dequeue()          { return list.removeFirst(); }
    public T peek()             { return list.getFirst(); }
    public boolean isEmpty()    { return list.isEmpty(); }
}
```

#### Binary Search Tree
```java
public class BST {
    private int value;
    private BST left, right;

    public BST(int value) { this.value = value; }

    public BST insert(int val) {
        if (val < value) {
            if (left == null) left = new BST(val);
            else left.insert(val);
        } else {
            if (right == null) right = new BST(val);
            else right.insert(val);
        }
        return this;
    }

    public boolean contains(int val) {
        if (val == value) return true;
        if (val < value)  return left  != null && left.contains(val);
        return right != null && right.contains(val);
    }

    // In-order traversal prints sorted values
    public void inOrder() {
        if (left  != null) left.inOrder();
        System.out.print(value + " ");
        if (right != null) right.inOrder();
    }
}
```

## Full Example

```java
import java.util.Arrays;

public class AlgorithmsDemo {
    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        System.out.println("Original: " + Arrays.toString(arr));

        int[] toSort = arr.clone();
        mergeSort(toSort, 0, toSort.length - 1);
        System.out.println("Sorted:   " + Arrays.toString(toSort));

        int target = 25;
        System.out.println("Binary search for " + target + ": index "
            + binarySearch(toSort, target));

        // BST demo
        BST tree = new BST(50);
        for (int v : new int[]{30, 70, 20, 40, 60, 80}) tree.insert(v);
        System.out.print("In-order: ");
        tree.inOrder();
        System.out.println();
        System.out.println("Contains 40: " + tree.contains(40));
        System.out.println("Contains 45: " + tree.contains(45));
    }
}
```

**Expected output:**
```
Original: [64, 34, 25, 12, 22, 11, 90]
Sorted:   [11, 12, 22, 25, 34, 64, 90]
Binary search for 25: index 3
In-order: 20 30 40 50 60 70 80
Contains 40: true
Contains 45: false
```

## Exercise

1. Implement Quick Sort and benchmark it vs Merge Sort on 100,000 random integers.
2. Implement a `MinStack` — a stack that supports `push`, `pop`, `peek`, and `getMin` all in O(1).
3. Implement a doubly-linked list with `addFirst`, `addLast`, `removeFirst`, `removeLast`, and `reverse` operations.

## Checkpoint

You are ready for the next lesson when you can:
- Explain the Big-O of Bubble Sort, Merge Sort, and Binary Search
- Implement a BST insert and search from memory
- Write a Stack and Queue using a LinkedList

---

**Next:** Continue to lesson 02 in this module.

---

## Additional reference

# Algorithms

An **algorithm** is a step-by-step procedure for solving a problem. This lesson covers how to reason about an algorithm's efficiency, and walks through two foundational examples: sorting and searching.

## Big O notation — describing efficiency

**Big O** describes how an algorithm's running time grows as the input size (`n`) grows — not the exact time, but the *shape* of the growth.

| Notation | Name | Example |
|---|---|---|
| `O(1)` | Constant | Accessing `array[5]` |
| `O(log n)` | Logarithmic | Binary search |
| `O(n)` | Linear | A single loop through `n` items |
| `O(n log n)` | Linearithmic | Efficient sorting (merge sort, quicksort) |
| `O(n²)` | Quadratic | Nested loops over the same data (bubble sort) |

A smaller-growth algorithm isn't always faster on tiny inputs, but it wins decisively as `n` gets large — an `O(n²)` algorithm on 1,000,000 items does roughly a trillion operations; an `O(n log n)` one does roughly 20 million.

## Sorting: Bubble Sort

Bubble sort repeatedly compares neighboring elements and swaps them if they're out of order — each full pass "bubbles" the largest remaining value to the end.

```java
public class BubbleSort {
    static void sort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }

    public static void main(String[] args) {
        int[] numbers = {5, 2, 9, 1, 7};
        sort(numbers);
        System.out.println(java.util.Arrays.toString(numbers));
    }
}
```

**Output:**
```
[1, 2, 5, 7, 9]
```

Bubble sort is `O(n²)` — easy to understand, but too slow for large datasets. (In real code, just call `Arrays.sort(arr)`, which uses a far more efficient algorithm internally — bubble sort is taught for understanding, not for production use.)

## Searching: Linear Search vs Binary Search

**Linear search** checks every element one by one — works on any array, sorted or not, in `O(n)` time:

```java
static int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;   // not found
}
```

**Binary search** is dramatically faster, but only works on a **sorted** array — it repeatedly checks the middle element and discards half the remaining search space each time, giving `O(log n)`:

```java
static int binarySearch(int[] sortedArr, int target) {
    int low = 0;
    int high = sortedArr.length - 1;

    while (low <= high) {
        int mid = (low + high) / 2;

        if (sortedArr[mid] == target) {
            return mid;
        } else if (sortedArr[mid] < target) {
            low = mid + 1;    // target must be in the right half
        } else {
            high = mid - 1;   // target must be in the left half
        }
    }
    return -1;   // not found
}
```

```java
int[] sorted = {1, 3, 5, 7, 9, 11, 13};
System.out.println(binarySearch(sorted, 9));    // 4
System.out.println(binarySearch(sorted, 4));    // -1
```

**Why it's faster:** searching 1,000,000 sorted items linearly could take up to 1,000,000 comparisons; binary search takes at most about 20 — each step cuts the remaining possibilities in half.

## Summary

| Algorithm | Time complexity | Requirement |
|---|---|---|
| Bubble sort | `O(n²)` | None |
| Linear search | `O(n)` | None |
| Binary search | `O(log n)` | Array must already be sorted |

> 💡 **Key tip:** Before reaching for a clever algorithm, ask: is the data sorted? Binary search's massive speed advantage only exists *because* the data is already in order.
