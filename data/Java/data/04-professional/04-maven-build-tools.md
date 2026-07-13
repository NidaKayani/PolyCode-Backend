# Lesson 04 — Maven and Project Structure

**Module 04 · Professional · Lesson 04 of 05**

## Learning Objectives

- Understand Maven's build lifecycle and directory structure
- Manage dependencies with `pom.xml`
- Run, test, and package a project from the command line

## Overview

**Maven** is the most widely used Java build tool. It manages dependencies (downloading JARs from the internet), compiles your code, runs tests, and packages everything into a deployable JAR. Understanding Maven is essential for working in any professional Java team.

## Key Concepts

### 1. Standard Directory Structure

```
my-project/
├── pom.xml                        ← project config and dependencies
└── src/
    ├── main/
    │   ├── java/
    │   │   └── com/company/app/   ← your production code
    │   └── resources/
    │       └── application.properties
    └── test/
        ├── java/
        │   └── com/company/app/   ← your test code
        └── resources/
```

### 2. pom.xml Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="...">

    <modelVersion>4.0.0</modelVersion>

    <!-- Project coordinates — uniquely identifies this project -->
    <groupId>com.quantumlogics</groupId>
    <artifactId>polycode-backend</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <!-- Inherit Spring Boot defaults (dependency versions, plugins) -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.3</version>
    </parent>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <!-- Spring Web (REST) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Data JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- MySQL driver (scope=runtime: not needed to compile, only to run) -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Testing (scope=test: only used in tests) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- Package as executable JAR -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### 3. Dependency Scopes

| Scope | Available in | Packaged in JAR |
|-------|-------------|-----------------|
| `compile` (default) | Compile + run | ✅ |
| `runtime` | Run only | ✅ |
| `test` | Tests only | ❌ |
| `provided` | Compile only (e.g. servlet API) | ❌ |

### 4. Maven Lifecycle Commands

```bash
# Compile source code
mvn compile

# Run tests
mvn test

# Package into target/your-app.jar
mvn package

# Skip tests while packaging
mvn package -DskipTests

# Clean compiled files and start fresh
mvn clean

# Clean, compile, test, and package
mvn clean package

# Run a Spring Boot app
mvn spring-boot:run

# Install into local Maven repository (~/.m2)
mvn install
```

### 5. Maven Wrapper (mvnw)

Spring Boot projects include `mvnw` / `mvnw.cmd` — a self-contained Maven script so teammates don't need Maven installed:

```bash
./mvnw spring-boot:run        # Linux/Mac
mvnw.cmd spring-boot:run      # Windows
```

### 6. Multi-module Project Structure

For larger apps, split into modules:

```
parent-pom/
├── pom.xml               ← parent pom with shared config
├── api/                  ← REST controllers module
│   └── pom.xml
├── service/              ← business logic module
│   └── pom.xml
└── data/                 ← JPA entities and repositories
    └── pom.xml
```

## Common Maven Problems and Fixes

```bash
# Dependency not downloading?
mvn clean install -U          # force update snapshots

# "Could not find artifact" error?
# Check ~/.m2/repository and delete the broken folder, then retry

# Port 8080 already in use?
# application.properties:  server.port=8081

# Tests failing in CI but passing locally?
mvn test -Dspring.profiles.active=test
```

## Exercise

1. Add `spring-boot-devtools` as a `runtime` dependency and observe how it auto-restarts on code changes.
2. Add the `jacoco-maven-plugin` to your `pom.xml` and run `mvn verify` to generate a test coverage report.
3. Create a Maven profile (`-Pproduction`) that swaps in `application-prod.properties` with a real database URL.

## Checkpoint

You are ready for the next lesson when you can:
- Navigate a Maven project structure confidently
- Add a dependency to `pom.xml` and understand its scope
- Run `mvn clean package` and execute the resulting JAR

---
**Next:** Lesson 05 — Unit Testing with JUnit 5
