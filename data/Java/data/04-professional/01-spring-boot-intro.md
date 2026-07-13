# Lesson 01 — Spring Boot Introduction

**Module 04 · Professional · Lesson 01 of 05**

## Learning Objectives

- Create a Spring Boot project and run it
- Understand auto-configuration and the application context
- Build your first REST endpoint

## Overview

**Spring Boot** is the industry-standard way to build Java backend applications. It eliminates boilerplate by auto-configuring everything based on what's on your classpath. A production-ready web server starts with a single `main` method.

## Key Concepts

### 1. Project Setup (Spring Initializr)

Go to **https://start.spring.io** and select:
- **Project:** Maven  
- **Language:** Java  
- **Spring Boot:** 3.x  
- **Dependencies:** Spring Web, Spring Data JPA, H2 Database (for dev)

Download and open in IntelliJ or VS Code.

Your `pom.xml` key dependencies:
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

### 2. The Entry Point

```java
@SpringBootApplication   // = @Configuration + @EnableAutoConfiguration + @ComponentScan
public class MyApp {
    public static void main(String[] args) {
        SpringApplication.run(MyApp.class, args);
        // Starts embedded Tomcat on port 8080
    }
}
```

### 3. Your First REST Controller

```java
import org.springframework.web.bind.annotation.*;

@RestController                // = @Controller + @ResponseBody
@RequestMapping("/api")
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello from Spring Boot!";
    }

    @GetMapping("/hello/{name}")
    public String greet(@PathVariable String name) {
        return "Hello, " + name + "!";
    }

    @GetMapping("/add")
    public int add(@RequestParam int a, @RequestParam int b) {
        return a + b;
    }
}
```

Access at:
- `GET http://localhost:8080/api/hello` → `Hello from Spring Boot!`
- `GET http://localhost:8080/api/hello/Alice` → `Hello, Alice!`
- `GET http://localhost:8080/api/add?a=5&b=3` → `8`

### 4. Returning JSON

Spring Boot automatically converts Java objects to JSON using Jackson.

```java
public record Product(int id, String name, double price) {}

@GetMapping("/product")
public Product getProduct() {
    return new Product(1, "Laptop", 999.99);
}
// Response: {"id":1,"name":"Laptop","price":999.99}

@GetMapping("/products")
public List<Product> getAll() {
    return List.of(
        new Product(1, "Laptop", 999.99),
        new Product(2, "Mouse",  29.99)
    );
}
```

### 5. application.properties

```properties
# src/main/resources/application.properties
server.port=8080
spring.application.name=my-app

# H2 in-memory database
spring.datasource.url=jdbc:h2:mem:testdb
spring.h2.console.enabled=true
spring.jpa.show-sql=true
```

### 6. Dependency Injection with @Autowired / Constructor Injection

```java
@Service
public class ProductService {
    public List<String> getAllNames() {
        return List.of("Laptop", "Mouse", "Keyboard");
    }
}

@RestController
@RequestMapping("/api")
public class ProductController {
    private final ProductService productService;

    // Constructor injection (preferred over @Autowired on field)
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/names")
    public List<String> names() {
        return productService.getAllNames();
    }
}
```

## Full Example — Mini REST API

```java
// Model
public record Student(Long id, String name, int score) {}

// Service
@Service
public class StudentService {
    private final List<Student> students = new ArrayList<>(List.of(
        new Student(1L, "Alice", 92),
        new Student(2L, "Bob",   85),
        new Student(3L, "Diana", 96)
    ));

    public List<Student> getAll()           { return students; }
    public Optional<Student> getById(Long id) {
        return students.stream().filter(s -> s.id().equals(id)).findFirst();
    }
}

// Controller
@RestController
@RequestMapping("/api/students")
public class StudentController {
    private final StudentService service;

    public StudentController(StudentService service) { this.service = service; }

    @GetMapping
    public List<Student> all() { return service.getAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Student> byId(@PathVariable Long id) {
        return service.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
```

Test with:
```
GET http://localhost:8080/api/students       → all students
GET http://localhost:8080/api/students/2     → Bob
GET http://localhost:8080/api/students/99    → 404 Not Found
```

## Exercise

1. Add a `@PostMapping` endpoint that accepts a `Student` JSON body and adds it to the list.
2. Add a `@DeleteMapping("/{id}")` that removes a student by ID.
3. Add a `@GetMapping("/top")` that returns only students with score ≥ 90.

## Checkpoint

You are ready for the next lesson when you can:
- Run a Spring Boot app and hit an endpoint in a browser
- Explain the difference between `@RestController` and `@Controller`
- Use `@PathVariable`, `@RequestParam`, and `@RequestBody`

---

**Next:** Continue to lesson 02 in this module.

---

## Additional reference

# Spring Boot Introduction

**Spring Boot** is a framework that drastically reduces the setup work needed to build a Java web application — it auto-configures sensible defaults so you can focus on your application's actual logic instead of plumbing.

## The entry point

Every Spring Boot app starts with a class annotated `@SpringBootApplication`:

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MyApp {
    public static void main(String[] args) {
        SpringApplication.run(MyApp.class, args);
    }
}
```

This single annotation combines three things behind the scenes: component scanning (find your classes), auto-configuration (set up sensible defaults), and marking this as a configuration class.

## Dependency Injection — Spring's core idea

Instead of a class creating the objects it depends on with `new`, Spring creates and "injects" them for you. This keeps classes decoupled and easy to test.

```java
import org.springframework.stereotype.Service;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

@Service
class GreetingService {
    String greet(String name) {
        return "Hello, " + name + "!";
    }
}

@Component
class Greeter {
    private final GreetingService greetingService;

    @Autowired   // Spring supplies a GreetingService automatically — you never write `new GreetingService()`
    Greeter(GreetingService greetingService) {
        this.greetingService = greetingService;
    }

    void run() {
        System.out.println(greetingService.greet("Maryam"));
    }
}
```

`@Service` and `@Component` mark classes Spring should manage; `@Autowired` tells Spring "give me an instance of this when you build the object."

## Your first REST endpoint

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class HelloController {

    @GetMapping("/hello")
    String hello() {
        return "Hello from Spring Boot!";
    }
}
```

With the app running, visiting `http://localhost:8080/hello` in a browser returns:

```
Hello from Spring Boot!
```

`@RestController` marks a class whose methods respond directly to web requests; `@GetMapping("/hello")` maps that specific method to `GET /hello`. REST endpoints in depth are the focus of the next lesson.

## `application.properties`

App-wide settings (like the port or database connection) live in `src/main/resources/application.properties`:

```properties
server.port=8081
spring.application.name=my-app
```

## Running the app

If you're using Maven (covered in Lesson 03), the standard command is:

```bash
mvn spring-boot:run
```

## Summary

| Annotation | Purpose |
|---|---|
| `@SpringBootApplication` | Marks the main entry-point class |
| `@Component` / `@Service` | Marks a class Spring should manage and inject where needed |
| `@Autowired` | Requests Spring to supply a dependency automatically |
| `@RestController` | Marks a class that handles web requests and returns data directly |
| `@GetMapping(path)` | Maps a method to handle `GET` requests at that path |

> 💡 **Key tip:** You almost never write `new SomeService()` in Spring code — if you find yourself doing that, you're probably fighting the framework instead of using dependency injection as intended.
