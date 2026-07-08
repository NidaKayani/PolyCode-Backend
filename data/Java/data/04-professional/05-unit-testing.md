# Lesson 05 — Unit Testing with JUnit 5 and Mockito

**Module 04 · Professional · Lesson 05 of 05**

## Learning Objectives

- Write unit tests with JUnit 5 annotations and assertions
- Mock dependencies with Mockito
- Test Spring REST controllers with MockMvc

## Overview

Professional code is **tested code**. Unit tests catch bugs early, document expected behaviour, and let you refactor safely. JUnit 5 is the standard Java test framework; Mockito lets you replace real dependencies (like databases) with controlled fakes.

## Key Concepts

### 1. JUnit 5 Basics

```java
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {

    private Calculator calc;

    @BeforeEach   // runs before each test
    void setUp() { calc = new Calculator(); }

    @AfterEach    // runs after each test
    void tearDown() {}

    @Test
    void addition_returnsCorrectSum() {
        int result = calc.add(3, 4);
        assertEquals(7, result);
    }

    @Test
    void division_byZero_throwsException() {
        assertThrows(ArithmeticException.class, () -> calc.divide(10, 0));
    }

    @Test
    @DisplayName("Negative numbers sum correctly")
    void negativeNumbers() {
        assertEquals(-5, calc.add(-2, -3));
    }

    @ParameterizedTest
    @CsvSource({"1,1,2", "5,3,8", "-1,1,0", "0,0,0"})
    void add_multipleInputs(int a, int b, int expected) {
        assertEquals(expected, calc.add(a, b));
    }
}
```

### 2. Common Assertions

```java
assertEquals(expected, actual)
assertNotEquals(a, b)
assertTrue(condition)
assertFalse(condition)
assertNull(value)
assertNotNull(value)
assertThrows(Exception.class, () -> methodThatThrows())
assertAll(               // check multiple conditions at once
    () -> assertEquals(5, result.size()),
    () -> assertTrue(result.contains("Alice"))
)
```

### 3. Mockito — Mocking Dependencies

```java
import org.mockito.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    StudentRepository repo;   // fake — doesn't touch the database

    @InjectMocks
    StudentService service;   // real — uses the mock repo

    @Test
    void getById_existingId_returnsStudent() {
        Student alice = new Student(1L, "Alice", "alice@ex.com", 92.0);
        when(repo.findById(1L)).thenReturn(Optional.of(alice));

        Student result = service.getById(1L);

        assertEquals("Alice", result.getName());
        verify(repo, times(1)).findById(1L);
    }

    @Test
    void getById_missingId_throwsNotFoundException() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> service.getById(99L));
    }

    @Test
    void save_callsRepositorySave() {
        Student student = new Student("Bob", "bob@ex.com", 85.0);
        when(repo.save(student)).thenReturn(student);

        service.create(student);

        verify(repo).save(student);   // verify it was called
    }
}
```

### 4. MockMvc — Testing REST Controllers

```java
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StudentController.class)   // loads only web layer
class StudentControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    StudentService service;   // mock the service

    @Test
    void getAll_returnsStudentList() throws Exception {
        when(service.getAll()).thenReturn(List.of(
            new Student(1L, "Alice", "alice@ex.com", 92.0)
        ));

        mockMvc.perform(get("/api/students"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("Alice"))
            .andExpect(jsonPath("$[0].score").value(92.0))
            .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void getById_notFound_returns404() throws Exception {
        when(service.getById(99L)).thenThrow(new ResourceNotFoundException("Student", 99L));

        mockMvc.perform(get("/api/students/99"))
            .andExpect(status().isNotFound());
    }

    @Test
    void create_validBody_returns201() throws Exception {
        String json = """
            {"name":"Bob","email":"bob@ex.com","score":85}
            """;
        Student bob = new Student(2L, "Bob", "bob@ex.com", 85.0);
        when(service.create(any())).thenReturn(bob);

        mockMvc.perform(post("/api/students")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(2));
    }
}
```

### 5. Test Coverage

Aim for ≥ 80% line coverage on service and utility classes. Use JaCoCo:

```bash
mvn test jacoco:report
# Report at: target/site/jacoco/index.html
```

## Exercise

1. Write tests for a `StringUtils` class: `isPalindrome`, `countVowels`, `titleCase`.
2. Write `StudentServiceTest` covering: getAll, getById (found + not found), create, delete.
3. Write `StudentControllerTest` covering all 5 endpoints (GET all, GET by id, POST, PUT, DELETE).

## Checkpoint

You are ready for Module 05 when you can:
- Write a JUnit 5 test with `@BeforeEach` and parameterized inputs
- Mock a repository with Mockito and verify it was called
- Test a Spring controller endpoint with MockMvc

---
**Module 04 Complete!** You are ready for **Module 05 — Mastery**.
