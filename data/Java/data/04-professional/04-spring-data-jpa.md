# Lesson 02 — Spring Data JPA

**Module 04 · Professional · Lesson 02 of 05**

## Learning Objectives

- Map a Java class to a database table with JPA annotations
- Use `JpaRepository` for CRUD without writing SQL
- Write custom queries with `@Query`

## Overview

**JPA (Java Persistence API)** is the standard for mapping Java objects to database tables (ORM — Object-Relational Mapping). **Spring Data JPA** builds on top of it to generate common database operations automatically — you define an interface and Spring writes the implementation.

## Key Concepts

### 1. Entity — Mapping a Class to a Table

```java
import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)   // auto-increment
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    private double score;

    // Constructors, getters, setters
    public Student() {}   // JPA requires a no-arg constructor

    public Student(String name, String email, double score) {
        this.name = name; this.email = email; this.score = score;
    }

    // getters / setters...
}
```

### 2. Repository — Auto-generated CRUD

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
    // Spring generates: save(), findById(), findAll(), delete(), count(), etc.
}
```

That's it — no SQL, no implementation class needed.

### 3. Using the Repository in a Service

```java
@Service
public class StudentService {
    private final StudentRepository repo;

    public StudentService(StudentRepository repo) { this.repo = repo; }

    public List<Student> getAll()              { return repo.findAll(); }
    public Optional<Student> getById(Long id)  { return repo.findById(id); }
    public Student save(Student s)             { return repo.save(s); }
    public void delete(Long id)                { repo.deleteById(id); }
}
```

### 4. Derived Query Methods (Spring generates SQL from method name)

```java
public interface StudentRepository extends JpaRepository<Student, Long> {
    // SELECT * FROM students WHERE name = ?
    List<Student> findByName(String name);

    // SELECT * FROM students WHERE score >= ? ORDER BY score DESC
    List<Student> findByScoreGreaterThanEqualOrderByScoreDesc(double minScore);

    // SELECT * FROM students WHERE email LIKE ?
    Optional<Student> findByEmail(String email);

    // SELECT COUNT(*) FROM students WHERE score > ?
    long countByScoreGreaterThan(double threshold);
}
```

### 5. Custom JPQL Query with @Query

```java
@Query("SELECT s FROM Student s WHERE s.score BETWEEN :min AND :max")
List<Student> findInScoreRange(@Param("min") double min, @Param("max") double max);

// Native SQL
@Query(value = "SELECT * FROM students ORDER BY score DESC LIMIT :n",
       nativeQuery = true)
List<Student> findTopN(@Param("n") int n);
```

### 6. Full Controller (CRUD REST API)

```java
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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Student create(@RequestBody Student student) {
        return service.save(student);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> update(@PathVariable Long id,
                                          @RequestBody Student updated) {
        return service.getById(id).map(s -> {
            updated.setId(id);
            return ResponseEntity.ok(service.save(updated));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (service.getById(id).isEmpty()) return ResponseEntity.notFound().build();
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

### 7. application.properties for MySQL

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/school
spring.datasource.username=root
spring.datasource.password=secret
spring.jpa.hibernate.ddl-auto=update   # creates/updates tables on startup
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

## Exercise

1. Add a `Course` entity and a `StudentCourse` many-to-many relationship using `@ManyToMany`.
2. Add a `findByNameContainingIgnoreCase` derived query for a search endpoint.
3. Write a `@Transactional` service method that enrolls a student in a course, throwing an exception (and rolling back) if the course is full.

## Checkpoint

You are ready for the next lesson when you can:
- Write an Entity class with all JPA annotations
- Create a repository and use auto-generated methods
- Build a full CRUD REST API with Spring Data JPA

---
**Next:** Lesson 03 — REST API Design and Exception Handling
