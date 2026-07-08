# Lesson 03 — REST API Design and Exception Handling

**Module 04 · Professional · Lesson 03 of 05**

## Learning Objectives

- Follow REST conventions for URLs, HTTP methods, and status codes
- Use `@ControllerAdvice` for global exception handling
- Validate request bodies with Bean Validation

## Overview

A well-designed REST API is predictable, consistent, and communicates errors clearly. This lesson covers the conventions every professional Java developer uses when building APIs, plus the Spring tools that enforce them.

## Key Concepts

### 1. REST URL and Method Conventions

| Action | Method | URL | Status |
|--------|--------|-----|--------|
| List all | GET | `/api/students` | 200 |
| Get one | GET | `/api/students/{id}` | 200 / 404 |
| Create | POST | `/api/students` | 201 |
| Full update | PUT | `/api/students/{id}` | 200 / 404 |
| Partial update | PATCH | `/api/students/{id}` | 200 / 404 |
| Delete | DELETE | `/api/students/{id}` | 204 / 404 |

Rules:
- URLs are **nouns**, not verbs (`/students`, not `/getStudents`)
- Use **plural** resource names
- Nest related resources: `/api/courses/{id}/students`

### 2. Bean Validation (Jakarta Validation)

Add `spring-boot-starter-validation` dependency, then annotate your DTO:

```java
import jakarta.validation.constraints.*;

public class StudentRequest {
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50)
    private String name;

    @Email(message = "Must be a valid email")
    @NotNull
    private String email;

    @Min(value = 0, message = "Score cannot be negative")
    @Max(value = 100)
    private double score;

    // getters and setters
}
```

In the controller, add `@Valid`:

```java
@PostMapping
public ResponseEntity<Student> create(@Valid @RequestBody StudentRequest req) {
    // if validation fails, Spring throws MethodArgumentNotValidException
    Student student = new Student(req.getName(), req.getEmail(), req.getScore());
    return ResponseEntity.status(HttpStatus.CREATED).body(service.save(student));
}
```

### 3. Global Exception Handler with @ControllerAdvice

Handle all exceptions in one place instead of duplicating try-catch across controllers.

```java
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import java.util.*;

@ControllerAdvice
public class GlobalExceptionHandler {

    // 404 — Resource not found
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(ResourceNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", e.getMessage()));
    }

    // 400 — Validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException e) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors().forEach(fe ->
            fieldErrors.put(fe.getField(), fe.getDefaultMessage()));

        return ResponseEntity.badRequest().body(Map.of(
            "status", 400,
            "message", "Validation failed",
            "errors", fieldErrors
        ));
    }

    // 500 — Unexpected errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneral(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "An unexpected error occurred"));
    }
}
```

### 4. Custom Exception Classes

```java
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " with id " + id + " not found");
    }
}

// In your service:
public Student getById(Long id) {
    return repo.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Student", id));
}
```

### 5. Consistent Error Response Body

Always return the same error structure:

```json
{
  "timestamp": "2024-03-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Student with id 99 not found",
  "path": "/api/students/99"
}
```

```java
public record ErrorResponse(
    LocalDateTime timestamp,
    int status,
    String error,
    String message,
    String path
) {}
```

## Full Example — Production-grade Controller

```java
@RestController
@RequestMapping("/api/v1/students")
@Validated
public class StudentController {
    private final StudentService service;

    public StudentController(StudentService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<List<Student>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getAll(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));  // throws 404 if not found
    }

    @PostMapping
    public ResponseEntity<Student> create(@Valid @RequestBody StudentRequest req) {
        Student created = service.create(req);
        URI location = URI.create("/api/v1/students/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> update(@PathVariable Long id,
                                          @Valid @RequestBody StudentRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

## Exercise

1. Add `@NotBlank` and `@Email` validation to your `StudentRequest`, test that sending an empty name returns a 400 with a clear message.
2. Add a `ConflictException` (409) thrown when trying to create a student with a duplicate email.
3. Add a `GET /api/v1/students/search?name=ali` endpoint that uses a derived query and returns 404 if no results.

## Checkpoint

You are ready for the next lesson when you can:
- Design REST URLs following standard conventions
- Return proper HTTP status codes for all outcomes
- Handle all exceptions in one `@ControllerAdvice` class

---
**Next:** Lesson 04 — Maven, Build Tools and Project Structure
