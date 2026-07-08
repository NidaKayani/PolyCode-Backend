# Lesson 04 — Design Patterns

**Module 05 · Mastery · Lesson 04 of 05**

## Learning Objectives

- Implement Singleton, Builder, Factory, Observer, and Strategy patterns
- Recognise which pattern solves which class of problem
- Identify these patterns already used in Java's standard library

## Overview

**Design patterns** are proven, named solutions to recurring design problems. They are the vocabulary of experienced developers — knowing them lets you communicate intent clearly and write code that is maintainable and extensible.

## Key Patterns

### 1. Singleton — One Instance Only

```java
public class DatabaseConnection {
    private static DatabaseConnection instance;
    private final String url;

    private DatabaseConnection() {
        url = System.getenv("DB_URL");
    }

    // Thread-safe lazy initialisation
    public static synchronized DatabaseConnection getInstance() {
        if (instance == null) {
            instance = new DatabaseConnection();
        }
        return instance;
    }

    public String getUrl() { return url; }
}

// Usage — always the same object:
DatabaseConnection conn1 = DatabaseConnection.getInstance();
DatabaseConnection conn2 = DatabaseConnection.getInstance();
System.out.println(conn1 == conn2);  // true
```

**In Java stdlib:** `Runtime.getRuntime()`, `System.console()`

### 2. Builder — Construct Complex Objects Step-by-Step

```java
public class HttpRequest {
    private final String method;
    private final String url;
    private final Map<String, String> headers;
    private final String body;

    private HttpRequest(Builder builder) {
        this.method  = builder.method;
        this.url     = builder.url;
        this.headers = builder.headers;
        this.body    = builder.body;
    }

    public static class Builder {
        private String method = "GET";
        private String url;
        private Map<String, String> headers = new HashMap<>();
        private String body;

        public Builder url(String url)    { this.url = url; return this; }
        public Builder method(String m)   { this.method = m; return this; }
        public Builder header(String k, String v) { headers.put(k, v); return this; }
        public Builder body(String body)  { this.body = body; return this; }
        public HttpRequest build()        { return new HttpRequest(this); }
    }
}

// Usage (fluent API):
HttpRequest req = new HttpRequest.Builder()
    .url("https://api.example.com/students")
    .method("POST")
    .header("Content-Type", "application/json")
    .header("Authorization", "Bearer token123")
    .body("{\"name\":\"Alice\"}")
    .build();
```

**In Java stdlib:** `StringBuilder`, `Stream.Builder`, `Locale.Builder`

### 3. Factory Method — Let Subclasses Decide What to Create

```java
public interface Notification {
    void send(String message);
}

public class EmailNotification implements Notification {
    private final String email;
    public EmailNotification(String email) { this.email = email; }
    @Override public void send(String msg) {
        System.out.println("Email to " + email + ": " + msg);
    }
}

public class SMSNotification implements Notification {
    private final String phone;
    public SMSNotification(String phone) { this.phone = phone; }
    @Override public void send(String msg) {
        System.out.println("SMS to " + phone + ": " + msg);
    }
}

// Factory
public class NotificationFactory {
    public static Notification create(String type, String recipient) {
        return switch (type.toLowerCase()) {
            case "email" -> new EmailNotification(recipient);
            case "sms"   -> new SMSNotification(recipient);
            default -> throw new IllegalArgumentException("Unknown type: " + type);
        };
    }
}

// Usage:
Notification n = NotificationFactory.create("email", "alice@example.com");
n.send("Your order has shipped!");
```

### 4. Observer — Notify Many Listeners of Events

```java
public interface EventListener<T> {
    void onEvent(T event);
}

public class EventBus<T> {
    private final List<EventListener<T>> listeners = new ArrayList<>();

    public void subscribe(EventListener<T> listener) { listeners.add(listener); }
    public void unsubscribe(EventListener<T> listener) { listeners.remove(listener); }
    public void publish(T event) { listeners.forEach(l -> l.onEvent(event)); }
}

// Usage:
EventBus<String> bus = new EventBus<>();
bus.subscribe(msg -> System.out.println("Logger: " + msg));
bus.subscribe(msg -> System.out.println("Notifier: " + msg.toUpperCase()));
bus.publish("User logged in");
// Logger: User logged in
// Notifier: USER LOGGED IN
```

**In Java stdlib:** `java.util.Observable`, button listeners in Swing/JavaFX, Spring's `ApplicationEventPublisher`

### 5. Strategy — Swap Algorithms at Runtime

```java
@FunctionalInterface
public interface SortStrategy {
    void sort(int[] arr);
}

public class Sorter {
    private SortStrategy strategy;

    public Sorter(SortStrategy strategy) { this.strategy = strategy; }
    public void setStrategy(SortStrategy strategy) { this.strategy = strategy; }
    public void sort(int[] arr) { strategy.sort(arr); }
}

// Strategies as lambdas
SortStrategy bubbleSort = arr -> { /* bubble sort */ };
SortStrategy javaSort   = Arrays::sort;

Sorter sorter = new Sorter(javaSort);
int[] data = {5, 2, 8, 1};
sorter.sort(data);   // [1, 2, 5, 8]

sorter.setStrategy(bubbleSort);   // swap at runtime
sorter.sort(data);
```

**In Java stdlib:** `Comparator` in `Collections.sort()`, `ExecutorService` strategies

## Full Example — Putting it Together

```java
public class PatternDemo {
    // Strategy pattern for payment processing
    @FunctionalInterface
    interface PaymentStrategy { boolean pay(double amount); }

    static class Order {
        private final String id;
        private final double total;
        private final List<String> log = new ArrayList<>();

        public Order(String id, double total) { this.id = id; this.total = total; }

        public boolean checkout(PaymentStrategy payment) {
            boolean success = payment.pay(total);
            log.add(success ? "Payment of $" + total + " succeeded"
                            : "Payment failed");
            return success;
        }

        public void printLog() { log.forEach(System.out::println); }
    }

    public static void main(String[] args) {
        PaymentStrategy creditCard  = amount -> { System.out.println("Charging card $" + amount); return true; };
        PaymentStrategy paypal      = amount -> { System.out.println("PayPal transfer $" + amount); return true; };
        PaymentStrategy declinedCard = amount -> { System.out.println("Card declined!"); return false; };

        Order order = new Order("ORD-001", 149.99);
        order.checkout(creditCard);
        order.checkout(declinedCard);
        order.checkout(paypal);
        order.printLog();
    }
}
```

## Exercise

1. Implement a **Decorator** pattern: create a `TextFormatter` interface, then wrap a base implementation with `BoldDecorator`, `ItalicDecorator`, and `UpperCaseDecorator` that can be combined.
2. Implement the **Command** pattern for a text editor with `TypeCommand`, `DeleteCommand`, and an undo stack.
3. Identify 3 design patterns used in the Spring Boot framework and explain where each is applied.

## Checkpoint

You are ready for the final lesson when you can:
- Implement all 5 patterns in this lesson from memory
- Explain the problem each pattern solves in one sentence
- Name where each pattern appears in Java's standard library

---
**Next:** Lesson 03 — Java Interview Preparation
