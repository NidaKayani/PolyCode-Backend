# Lesson 04 — Maven and Gradle

**Module 4 · Professional · Lesson 04 of 10**


## Learning objectives

- Understand **maven and gradle** in Java
- Read and write small examples you can run locally
- Connect this topic to the next lesson in the course

## Overview

Maven and Gradle is a core topic on the PolyCode **Java Certificate Course** path. Work through the examples, then try the exercise before moving on.

## Key concepts

1. **Syntax and structure** — how Java expresses this idea clearly
2. **Common patterns** — what you will see in real projects
3. **Mistakes to avoid** — typical beginner errors and fixes

## Example

```java
// Maven and Gradle — practice sketch
// add your code here
```

## Exercise

1. Write a short program that uses today's topic.
2. Change one value and predict the output before running.
3. Explain the result in your own words (2–3 sentences).

## Checkpoint

You are ready for the next lesson when you can solve the exercise without copying the example.

---

**Next:** Continue to lesson 04 in this module.

---

## Additional reference

# Maven and Gradle

Real Java projects depend on external libraries (like Spring or JUnit) and need a repeatable way to compile, test, and package the code. **Maven** and **Gradle** are the two dominant build tools that handle this.

## What a build tool actually does

1. Downloads the libraries your project depends on (and their dependencies, recursively)
2. Compiles your source code
3. Runs your tests
4. Packages everything into a runnable artifact (a `.jar` file)

## Maven — `pom.xml`

Maven projects are configured in a single XML file, `pom.xml` ("Project Object Model"), placed at the project root:

```xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0.0</version>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <version>3.2.0</version>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.0</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

Each `<dependency>` is identified by `groupId` (who made it), `artifactId` (the library's name), and `version`.

### Common Maven commands

```bash
mvn compile        # compile the source code
mvn test            # run the tests
mvn package         # build a .jar file
mvn clean install   # delete old build output, then rebuild and install locally
```

## Gradle — `build.gradle`

Gradle uses a script (Groovy or Kotlin syntax) instead of XML, and is generally considered faster and more flexible:

```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.2.0'
}

group = 'com.example'
version = '1.0.0'

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'
}
```

### Common Gradle commands

```bash
gradle build    # compile, test, and package
gradle test      # run the tests
gradle run        # run the application directly
```

## Maven vs Gradle, side by side

| | Maven | Gradle |
|---|---|---|
| Config format | XML (`pom.xml`) | Groovy/Kotlin script (`build.gradle`) |
| Philosophy | Convention over configuration, rigid lifecycle | More flexible, programmable build logic |
| Speed | Slower (no build caching by default) | Faster — incremental builds, build caching |
| Common in | Long-established enterprise codebases | Newer projects, Android development |

## The dependency download flow

When you add a dependency and run a build, the tool:

1. Checks a local cache (`~/.m2` for Maven, `~/.gradle` for Gradle) first
2. If missing, downloads it from a remote repository (typically **Maven Central**)
3. Resolves and downloads that dependency's own dependencies too (**transitive dependencies**)
4. Adds everything to the classpath so your code can use it

> 💡 **Key tip:** You'll see both tools in real Java jobs. They solve the same problem differently — once you understand *what* a build tool does (dependencies → compile → test → package), reading either config format becomes much easier.
