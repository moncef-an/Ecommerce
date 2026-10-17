# 🛍️ High-Performance Go E-Commerce REST API

[![Go Version](https://img.shields.io/badge/Go-1.23%2B-00ADD8?style=for-the-badge&logo=go)](https://golang.org/)
[![Fiber v3](https://img.shields.io/badge/Fiber-v3.0.0-00ACD7?style=for-the-badge&logo=gofiber)](https://gofiber.io/)
[![GORM](https://img.shields.io/badge/ORM-GORM-29BEB0?style=for-the-badge)](https://gorm.io/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Cache-Redis%207.2-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Container-Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Swagger](https://img.shields.io/badge/Docs-Swagger%20OpenAPI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](http://localhost:3030/swagger/)

A robust, production-ready E-commerce RESTful API designed with clean layered architecture in **Go** and powered by **Fiber v3**. The service features high-throughput performance, strict role-based access control (RBAC), multi-level Redis caching, distributed rate limiting, automated database migrations, containerized orchestration, and interactive OpenAPI documentation.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Option A: Running with Docker Compose (Recommended)](#option-a-running-with-docker-compose-recommended)
  - [Option B: Running Locally from Source](#option-b-running-locally-from-source)
- [Interactive API Documentation](#-interactive-api-documentation)
- [Performance & Load Testing](#-performance--load-testing)
- [Author & Credits](#-author--credits)

---

## 🚀 Key Features

- **🔐 JWT Authentication & RBAC**:
  - Secure password hashing using `bcrypt`.
  - Dual-token lifecycle: short-lived Access Tokens paired with Refresh Tokens stored and invalidated in Redis.
  - Role-Based Access Control protecting sensitive endpoints (`User`, `Seller`, and `Admin`).
- **🛡️ Distributed Redis Rate Limiting**:
  - Custom sliding/fixed-window rate limiting middleware on critical authentication endpoints (`/register`, `/login`, `/refresh`) to prevent brute-force attacks.
- **📂 Categories & Catalog Management**:
  - Hierarchical category organization managed by administrators.
  - Granular CRUD operations for products strictly scoped to authorized sellers and admins.
- **⚡ High-Speed Redis Caching**:
  - Low-latency caching layer for high-read catalog endpoints to offload primary database read pressure.
- **🛒 Cart & Order Processing Pipeline**:
  - Persistent shopping cart supporting atomic item quantity updates and cleanouts.
  - End-to-end checkout pipeline managing order state lifecycle (`pending`, `completed`, `cancelled`).
- **📦 Database Migrations with Goose**:
  - Version-controlled, idempotent SQL schema migrations executed automatically at container startup.
- **📖 Interactive OpenAPI / Swagger Documentation**:
  - Self-documenting API using Swaggo integrated natively with Fiber v3 at `/swagger/*`.
- **📊 Benchmark-Ready Load Testing**:
  - Built-in k6 load testing suite simulating up to 1,000 concurrent virtual users (VUs) validating sub-second response thresholds under peak load.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Language** | [Go (Golang)](https://golang.org/) | High-concurrency compiled backend language |
| **Web Framework** | [Fiber v3](https://github.com/gofiber/fiber) | Express-inspired HTTP framework built atop Fasthttp |
| **ORM** | [GORM](https://gorm.io/) | Feature-rich Object Relational Mapping library for Go |
| **Database** | [MySQL 8.0](https://www.mysql.com/) | Primary relational persistence store for ACID transactions |
| **Cache & Key-Store** | [Redis 7.2](https://redis.io/) | In-memory key-value store for caching, rate-limiting & session tokens |
| **Database Migrations**| [Goose](https://github.com/pressly/goose) | Declarative SQL migration tool |
| **API Documentation** | [Swagger / Swaggo](https://github.com/swaggo/swag) | Automated OpenAPI specification generation & interactive UI |
| **Load Testing** | [k6](https://k6.io/) | Modern developer-centric load testing framework |
| **Containerization** | [Docker & Compose](https://www.docker.com/) | Multi-stage Docker builds & multi-container orchestration |

---

## 🏗️ Project Architecture

The project follows a clean, decoupled layered design pattern separating HTTP routing, domain orchestration, data persistence, and caching:

```text
Ecom API/
├── cmd/
│   └── main.go                  # Application entry point, dependency injection, and server startup
├── internal/
│   ├── auth/                    # JWT token generation, claims verification & hashing utilities
│   ├── cart/                    # Cart handlers, domain service, repository & DTOs
│   ├── categories/              # Category management (Repository, Service, Handlers)
│   ├── database/                # Database connection lifecycle & automated Goose migration runner
│   ├── middleware/              # AuthRequired, RBAC (RequireRole), and Redis Rate Limiter
│   ├── models/                  # Core GORM data models, enums (Roles, OrderStatus) & schema definitions
│   ├── order/                   # Order placement, checkout transaction & state management
│   ├── product/                 # Product catalog service, repository & Redis caching layer
│   ├── redis/                   # Redis client initialization & connection pooling
│   ├── routes/                  # Centralized HTTP routing definition & endpoint grouping
│   └── user/                    # User authentication, registration, refresh store & handler
├── docs/                        # Generated Swagger specs (docs.go, swagger.json, swagger.yaml)
├── migration/                   # Sequential SQL migration files executed by Goose
│   ├── 20260820000819_add_user_table.sql
│   ├── 20260830054420_categories.sql
│   ├── 20260906082955_product.sql
│   ├── 20260912134737_order.sql
│   └── 20260923160014_cart.sql
├── Dockerfile                   # Production multi-stage Alpine Docker build
├── docker-compose.yml           # Multi-container orchestration (API + MySQL + Redis)
├── test.js                      # Comprehensive k6 load & performance testing suite
├── go.mod                       # Go dependency declarations
└── .env                         # Local environment configuration
```

---

## 🏁 Getting Started

### Prerequisites

Ensure you have the following installed on your host machine:
- **Docker & Docker Compose** (Recommended: Docker Desktop)
- *Alternatively for local development without Docker*:
  - **Go 1.22+** (Go 1.23+ recommended)
  - **MySQL 8.0+**
  - **Redis 7.0+**

---

### Environment Variables

Create a `.env` file in the project root (or customize the existing one):

```env
# Server Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Redis Configuration
REDIS_ADDR=localhost:6379
REDIS_PASSWORD=your_redis_password

# MySQL Database Configuration
MYSQL_DSN=root:your_mysql_password@tcp(localhost:3306)/ecomerce?charset=utf8mb4&parseTime=True&loc=Local

# Docker Compose helper variables (Optional)
DB_PASSWORD=your_mysql_password
DB_NAME=ecomerce
```

---

### Option A: Running with Docker Compose (Recommended)

The easiest way to bootstrap the entire stack (API, MySQL database, Redis, and automated schema migrations) is using Docker Compose:

1. **Build and start all services in the background**:
   ```bash
   docker compose up -d --build
   ```

2. **Verify running containers**:
   ```bash
   docker compose ps
   ```

3. **Stream application logs**:
   ```bash
   docker compose logs -f api
   ```

4. **Stop the environment**:
   ```bash
   docker compose down
   ```
   *(Add `-v` if you wish to wipe persistent database volumes: `docker compose down -v`)*

---

### Option B: Running Locally from Source

If you prefer running the Go binary directly on your host machine:

1. **Ensure MySQL and Redis are running locally**:
   - Create a MySQL database named `ecomerce`.
   - Update `.env` with your local credentials.

2. **Download dependencies**:
   ```bash
   go mod download
   ```

3. **Run the API**:
   ```bash
   go run cmd/main.go
   ```
   *Note: Database migrations located in `migration/` will automatically run via Goose when the server initializes.*

4. **Verify the server is running**:
   - The server listens by default at: `http://localhost:3030`

---

## 📖 Interactive API Documentation

The project includes an interactive Swagger/OpenAPI UI served directly through Fiber v3.

- **Access the Swagger UI**:  
  Open your browser and navigate to:  
  👉 **[http://localhost:3030/swagger/](http://localhost:3030/swagger/)**

### Regenerating Swagger Documentation

When you add new endpoints or update API annotations in `internal/*/`, regenerate the OpenAPI documentation by running:

```bash
# Install swag CLI if not already installed
go install github.com/swaggo/swag/cmd/swag@latest

# Re-generate the documentation
swag init -g cmd/main.go -d .
```

---

## 📈 Performance & Load Testing

The repository includes a comprehensive, production-grade [k6](https://k6.io/) stress testing script ([test.js](test.js)).

### Load Test Profile
- **Virtual Users (VUs)**: Ramps up progressively through 50, 100, 250, 500, 750 up to **1,000 concurrent VUs**.
- **Coverage**: Evaluates authentication, product catalog browsing, category discovery, and cart manipulation.
- **SLA Thresholds**:
  - `failed_requests < 5%`
  - `server_errors < 1%`
  - 95th percentile response times (`p(95)`) between `1000ms` and `2000ms` under peak concurrency.

### Running the Benchmark

1. **Install k6**:
   - **Windows (winget)**: `winget install k6`
   - **macOS (Homebrew)**: `brew install k6`
   - **Linux**: `sudo apt-get install k6` (or visit [k6.io installation guide](https://k6.io/docs/get-started/installation/))

2. **Execute the benchmark**:
   ```bash
   k6 run test.js
   ```

---

## 👤 Author & Credits

- **Repository**: [moncef-an/Ecommerce](https://github.com/moncef-an/Ecommerce)
- **Author**: [@moncef-an](https://github.com/moncef-an)

---

<p align="center">Made with ❤️ in Go</p>
