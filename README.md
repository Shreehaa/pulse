# Pulse

## Distributed Event Processing & Workflow Platform

Pulse is a cloud-native workflow and event processing platform built with
Java, Spring Boot, React, PostgreSQL, Redis Streams, Docker, and
Prometheus/Grafana.

It provides a reliable workflow for submitting jobs, processing them
asynchronously, tracking execution state, handling retries, and routing
repeatedly failed jobs to a dead-letter queue.

---

## Overview

Pulse is designed around an asynchronous job-processing architecture.

Instead of processing a job directly inside the HTTP request, the API
accepts the job, persists its state, publishes an event to Redis Streams,
and allows a background worker to process it independently.

### Core capabilities

- Asynchronous job execution
- Persistent job state
- Idempotent job submission
- Retry handling
- Dead-letter queue support
- Execution history
- JWT authentication
- Database-backed users
- Operational monitoring
- Containerized deployment

---

## Key Features

### Job Processing

- Create and track workflow jobs
- Asynchronous execution using Redis Streams
- Background worker processing
- Job lifecycle tracking
- Execution attempt tracking
- CSV job result generation

### Reliability

- Idempotency-key based duplicate request protection
- Automatic retry handling
- Maximum retry attempt limit
- Dead-letter queue for permanently failed jobs
- Persistent status history
- PostgreSQL-backed workflow state

### Authentication

- User registration
- User login
- BCrypt password hashing
- JWT-based authentication
- Protected API endpoints
- Database-backed user accounts

### Monitoring

- Spring Boot Actuator
- Prometheus metrics
- Grafana dashboard
- Job processing metrics
- Success and failure metrics
- Retry and attempt tracking
- System health monitoring

### Frontend

- React + TypeScript dashboard
- Job management interface
- Job details and execution history
- Failed jobs view
- Analytics dashboard
- Authentication pages
- Light/dark theme support
- Responsive application layout

---

## Architecture

```text
                         +----------------------+
                         |      React UI        |
                         |   React + TypeScript |
                         +----------+-----------+
                                    |
                                    | REST API
                                    v
                         +----------------------+
                         |    Spring Boot API   |
                         |                      |
                         | Controllers          |
                         | Services             |
                         | Security / JWT       |
                         +----+------------+----+
                              |            |
                              |            |
                              v            v
                    +-------------+   +----------------+
                    | PostgreSQL  |   | Redis / Valkey |
                    |             |   |                |
                    | Jobs        |   | Redis Streams   |
                    | Attempts    |   | Consumer Group  |
                    | History     |   | Retry Pipeline  |
                    | Users       |   | Dead Letter     |
                    +-------------+   +-------+--------+
                                             |
                                             v
                                      +--------------+
                                      |  Job Worker  |
                                      |              |
                                      | Process Jobs |
                                      | Handle Retry |
                                      | Generate     |
                                      | Results      |
                                      +------+-------+
                                             |
                                             v
                                      +--------------+
                                      | Job Results  |
                                      +--------------+

                         Observability
                              |
                    +---------+---------+
                    |                   |
                    v                   v
              +-----------+       +-----------+
              | Prometheus| ----> |  Grafana  |
              +-----------+       +-----------+
---

## Job Lifecycle

A submitted job moves through PENDING, PROCESSING, COMPLETED, or FAILED states. Failed jobs can be retried up to the configured maximum attempts before being routed to the dead-letter queue.


## Technology Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot |
| API | REST |
| Frontend | React, TypeScript, Vite |
| Database | PostgreSQL |
| Messaging | Redis Streams / Valkey |
| Authentication | Spring Security, JWT, BCrypt |
| Containerization | Docker, Docker Compose |
| Monitoring | Prometheus, Grafana |
| Testing | JUnit, Spring Boot Test |
| Build | Maven |
| CI | GitHub Actions |
| Deployment | Render |


## Project Structure

``text
pulse/
|-- .github/workflows/
|   -- ci.yml
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- services/
|   |   -- styles/
|   |-- Dockerfile
|   -- package.json
|-- monitoring/
|   -- prometheus/
|       -- prometheus.yml
|-- src/
|   |-- main/
|   |   |-- java/com/pulse/
|   |   -- resources/
|   -- test/
|-- docker-compose.yml
|-- Dockerfile
|-- pom.xml
-- README.md
``

## API Overview

### Authentication

``text
POST /api/auth/register
POST /api/auth/login
`` 

### Jobs

``text
POST /api/jobs
GET  /api/jobs
GET  /api/jobs/{id}
`` 

### Job History

``text
GET /api/jobs/{id}/history
`` 

### Health

``text
GET /actuator/health
``

## Idempotent Job Submission

Pulse requires an Idempotency-Key when creating a job. This prevents accidental duplicate job creation when the same request is submitted more than once.

Example:

``http
POST /api/jobs
Authorization: Bearer <JWT>
Idempotency-Key: <unique-request-id>
Content-Type: application/json
`` 

``json
{
  "name": "Monthly Sales Report"
}
`` 

## Retry and Dead-Letter Queue

Failed jobs are automatically retried by the background worker. Pulse currently allows a maximum of 3 processing attempts with a 5-second retry delay.

Redis streams:

``text
pulse:jobs
pulse:jobs:dlq
`` 

Consumer group:

``text
pulse-workers
``

## Database Model

Pulse uses PostgreSQL for durable workflow state. Core entities include User, Job, JobAttempt, JobStatusHistory, and idempotency records.

The database design separates current job state from execution history, allowing individual attempts and status transitions to be tracked.

## Monitoring

Pulse integrates Spring Boot Actuator, Prometheus, and Grafana for operational visibility.

The monitoring dashboard tracks total jobs, pending jobs, processing jobs, completed jobs, failed jobs, attempts, retries, success rate, failure rate, and active processing activity.

Grafana dashboard:

``text
Pulse-System Monitoring
``

## Running Locally

### Prerequisites

- Java 21
- Maven
- Node.js
- Docker Desktop
- Git

### Clone

``bash
git clone https://github.com/Shreehaa/pulse.git
cd pulse
`` 

### Start with Docker Compose

``bash
docker compose up -d --build
`` 

### Local Services

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8080 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

### Stop

``bash
docker compose down
`` 

## Docker

Pulse is fully containerized using Docker and Docker Compose. The development environment includes the React frontend, Spring Boot backend, PostgreSQL, Redis, Prometheus, and Grafana.


## Environment Configuration

Sensitive configuration is provided through environment variables and should never be committed to Git.

Backend variables include:

``text
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
SPRING_DATA_REDIS_HOST
SPRING_DATA_REDIS_PORT
PULSE_SECURITY_JWT_SECRET
PULSE_APP_USERNAME
PULSE_APP_PASSWORD
`` 

Frontend:

``env
VITE_API_BASE_URL=http://localhost:8080
`` 

## Testing

Backend tests use JUnit and Spring Boot testing.

Run tests with:

``powershell
.\mvnw.cmd test
`` 

GitHub Actions also runs automated validation for repository changes.

## Deployment

Pulse is deployed using Render.

The production architecture consists of a React frontend, Spring Boot backend, PostgreSQL database, and Valkey-compatible Redis service.

Production configuration is supplied through environment variables for database credentials, Redis connectivity, JWT security, and application settings.

## CI/CD

GitHub Actions provides continuous integration by building the backend and running automated tests when changes are pushed to the repository.


## Reliability Design

Pulse demonstrates production-oriented backend reliability patterns:

- Asynchronous job processing using Redis Streams
- Idempotent job submission
- Automatic retry handling
- Dead-letter queue for repeatedly failed jobs
- Persistent workflow state in PostgreSQL
- Execution and status history
- Metrics and operational monitoring
- Containerized deployment

## Future Improvements

Potential future enhancements include:

- Horizontal worker scaling
- Distributed rate limiting
- Job scheduling
- Priority queues
- Object storage for large job results
- Distributed tracing and OpenTelemetry
- Kubernetes deployment
- Role-based access control
- Real-time job updates

## Project Status

Pulse is an actively developed portfolio project focused on backend engineering, distributed processing, reliability patterns, authentication, containerization, and observability.

