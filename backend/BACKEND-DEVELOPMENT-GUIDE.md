# 🚀 Backend Development Guide

## Spring Boot + IntelliJ + MySQL

Welcome to your journey into backend development! 🎉 This guide will help you understand our project structure and get your development environment set up for collaborative work. Don't worry if you're new to this - we'll take it step by step.

**Tech Stack Overview:**

- ☕ **Language:** Java
- 🏗️ **Framework:** Spring Boot 3.x
- 🗄️ **Database:** MySQL
- 🔧 **Build Tool:** Maven
- 💻 **IDE:** IntelliJ IDEA

---

## ✅ Prerequisites Checklist

Before we start coding, make sure you have:

- [ ] **JDK 21 or 24** installed on your machine
- [ ] **IntelliJ IDEA** (Community Edition is perfect!)
- [ ] **MySQL Server 8.0** running
- [ ] **MySQL Workbench** (optional but helpful for database management)
- [ ] **Postman** or similar tool for testing APIs (optional)

> 💡 **Pro Tip:** Don't have everything? No problem! Install them one by one and come back.

---

## 🎯 Step 1: Opening Your Project

Let's get your project running in IntelliJ!

### 📂 Opening the Project

1. **Launch IntelliJ IDEA**
2. **File → Open**
3. **Navigate to and select the `backend/` folder** (not the root project!)
4. **Click "Open"**
5. ⏳ **Wait patiently** while Maven downloads dependencies (grab a coffee! ☕)

### ⚙️ Setting Up Your Environment

1. **Configure JDK:** Go to `File → Project Structure → Project SDK`
2. **Select your installed JDK** (21 or 24)
3. **Find the main class:** `src/main/java/com/training/feedbacktool/FeedbacktoolApplication.java`
4. **Click the green ▶️ Run button** next to the class name

🎉 **Congratulations!** If you see "Started FeedbacktoolApplication" in the console, you're ready to code!

---

## 🏗️ Understanding Your Project Structure

Think of your project like a well-organized house:

```
src/main/java/com/training/feedbacktool/
├── 🎮 controller/     → Your API endpoints (the front door)
├── 🏪 service/        → Business logic (the brain)
├── 📦 repository/     → Database operations (the storage room)
├── 🏷️ entity/         → Data models (the blueprints)
└── 📋 dto/           → Data transfer objects (the messengers)
```

### 🤔 What Goes Where?

- **Controllers** 🎮: Handle HTTP requests (GET, POST, etc.)
- **Services** 🏪: Process business logic and rules
- **Repositories** 📦: Talk to your database
- **Entities** 🏷️: Represent your database tables
- **DTOs** 📋: Shape data for API requests/responses

---

## 🗄️ Step 2: Setting Up MySQL Database

Let's create a cozy home for your data!

### 🔧 Creating Your Database

Open **MySQL Workbench** or your terminal and run these magic commands:

```sql
-- Create your database
CREATE DATABASE feedbacktool CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a dedicated user (security best practice!)
CREATE USER 'feedback'@'localhost' IDENTIFIED BY 'feedback123';

-- Give permissions to your user
GRANT ALL PRIVILEGES ON feedbacktool.* TO 'feedback'@'localhost';

-- Apply the changes
FLUSH PRIVILEGES;
```

### 📝 Configuring Your Application

Now, let's tell Spring Boot how to connect to your database. Update your `application.properties` file:

**Location:** `backend/src/main/resources/application.properties`

```properties
# Application name
spring.application.name=feedbacktool

# 🔌 MySQL Connection Settings
spring.datasource.url=jdbc:mysql://localhost:3306/feedbacktool?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=feedback
spring.datasource.password=feedback123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# 🔍 JPA/Hibernate Settings (the magic that creates tables!)
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

> 🔒 **Security Note:** In real projects, never hardcode passwords! Use environment variables.

---

## 🎯 Step 3: Building Your First Feature

Time to create your first feedback system! We'll build this step-by-step.

### 🏷️ Step 3a: Create Your Data Model (Entity)

First, let's define what a "Feedback" looks like in our system.

**Create:** `src/main/java/com/training/feedbacktool/entity/Feedback.java`

```java
package com.training.feedbacktool.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity  // 🏷️ This tells Spring "Hey, this is a database table!"
public class Feedback {

    @Id  // 🆔 Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // 🔢 Auto-increment
    private Long id;

    private String name;        // 👤 Who gave the feedback?
    private String message;     // 💬 What did they say?
    private Instant createdAt = Instant.now();  // ⏰ When was it created?

    // 🏗️ Default constructor (Spring needs this!)
    public Feedback() {}

    // 🎯 Constructor for creating new feedback
    public Feedback(String name, String message) {
        this.name = name;
        this.message = message;
    }

    // 🔧 Getters and Setters (Spring needs these too!)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
```

### 📦 Step 3b: Create Your Repository

This is your data access layer - think of it as your database assistant!

**Create:** `src/main/java/com/training/feedbacktool/repository/FeedbackRepository.java`

```java
package com.training.feedbacktool.repository;

import com.training.feedbacktool.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

// 🎪 The magic interface! Spring creates all the basic database operations for you
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    // 🎯 You get these methods for FREE:
    // - save()
    // - findAll()
    // - findById()
    // - delete()
    // And many more!
}
```

### 🎮 Step 3c: Create Your Controller

This is where the magic happens - your API endpoints!

**Create:** `src/main/java/com/training/feedbacktool/controller/FeedbackController.java`

```java
package com.training.feedbacktool.controller;

import com.training.feedbacktool.entity.Feedback;
import com.training.feedbacktool.repository.FeedbackRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController  // 🎮 This makes it a REST API controller
@RequestMapping("/api/feedback")  // 🛣️ Base URL for all endpoints
@CrossOrigin(origins = "*")  // 🌐 Allow frontend to connect (for development)
public class FeedbackController {

    private final FeedbackRepository repository;

    // 💉 Constructor injection (Spring's way of providing dependencies)
    public FeedbackController(FeedbackRepository repository) {
        this.repository = repository;
    }

    // 📋 GET /api/feedback → Get all feedback
    @GetMapping
    public List<Feedback> getAllFeedback() {
        return repository.findAll();
    }

    // ➕ POST /api/feedback → Create new feedback
    @PostMapping
    public Feedback createFeedback(@RequestBody Feedback feedback) {
        return repository.save(feedback);
    }
}
```

---

## 🏃‍♂️ Step 4: Running Your Application

### 🚀 Starting the Server

**Option 1: Using IntelliJ**

- Click the ▶️ green arrow next to `FeedbacktoolApplication`
- Wait for "Started FeedbacktoolApplication" message

**Option 2: Using Terminal**

```bash
# Navigate to backend folder
cd backend

# Run using Maven wrapper
.\mvnw.cmd spring-boot:run
```

### 🎯 Testing Your API

**🔍 Check if it's running:**
Open your browser and go to: `http://localhost:8080`

**📋 Get all feedback (should be empty initially):**

```
GET http://localhost:8080/api/feedback
```

**➕ Create new feedback:**

```
POST http://localhost:8080/api/feedback
Content-Type: application/json

{
  "name": "Alice",
  "message": "This app is awesome!"
}
```

---

## 💡 Pro Tips & Tricks

### 🔧 Useful Configuration Options

Add these to your `application.properties` for better development experience:

```properties
# 📝 See all SQL queries (helpful for learning!)
spring.jpa.show-sql=true

# 🎨 Pretty-print JSON responses
spring.jackson.serialization.indent-output=true
```

### 🐛 Common Issues & Solutions

**🚫 "Port 8080 already in use"**

- Solution: Change `server.port=8081` in `application.properties`

**❌ "Cannot connect to database"**

- Check: Is MySQL running?
- Check: Do the database and user exist?
- Check: Are the credentials correct?

**🏗️ "Tables not created"**

- Check: Are your `@Entity` classes in the right package?
- Check: Is `spring.jpa.hibernate.ddl-auto=update` set?

**🔄 "Maven issues in IntelliJ"**

- Solution: Right-click `pom.xml` → Maven → Reload project


