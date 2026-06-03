<div align="center">

<br />

```
███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗     █████╗ ██╗
████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝    ██╔══██╗██║
██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗    ███████║██║
██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║    ██╔══██║██║
██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║    ██║  ██║██║
╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝    ╚═╝  ╚═╝╚═╝
```

### Enterprise-Grade Autonomous Agent Platform with Persistent Semantic Memory

<br />

[![Java](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.5-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![PostgreSQL](https://img.shields.io/badge/pgvector-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![LangChain4j](https://img.shields.io/badge/LangChain4j_1.14-1C3C3C?style=for-the-badge)](https://docs.langchain4j.dev/)

<br />

**Nexus AI** is a real-time autonomous agent platform that turns natural language prompts into structured, AI-executed research and code workflows — complete with live streaming, persistent memory, and a glassmorphic control room UI.

<br />

[✦ Architecture](#-architecture) · [✦ Backend](#-backend) · [✦ Frontend](#-frontend) · [✦ API Reference](#-api-reference) · [✦ Getting Started](#-getting-started) · [✦ Roadmap](#-roadmap)

<br />

</div>

---

## ✦ What is Nexus AI?

Nexus is an **AI Operations Control Room** — submit a natural language prompt and watch an autonomous agent think, plan, invoke tools, and deliver a structured artifact in real time. Built for engineers who want a production-grade reference for agentic systems.

```
You type:    "Analyze the security posture of our REST API endpoints"
                              │
                              ▼
          Nexus agent THINKS → PLANS → EXECUTES → DELIVERS
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         Live logs      Tool calls       Final report
         streaming      (DB writes)      in Artifact Vault
```

<br />

### Core Capabilities at a Glance

| Capability | Description |
|---|---|
| 🧠 **ReAct Reasoning Loop** | Autonomous Think → Act → Observe cycles with self-correcting retry logic (up to 5 attempts) |
| 📡 **Real-Time Log Streaming** | Every agent thought, tool call, and result streamed live to a terminal-style console UI |
| 📄 **Artifact Vault** | Structured Markdown reports and code artifacts saved to a persistent, searchable vault |
| 🔍 **Semantic Memory (RAG)** | Upload documents → chunk → embed → retrieve via pgvector cosine similarity |
| 🔧 **Dynamic Tool Invocation** | Gemini decides at runtime which Java methods to call via LangChain4j `@Tool` annotations |
| ♾️ **Virtual Thread Concurrency** | JDK 21 Project Loom — thousands of concurrent agents, zero thread pool exhaustion |
| 🛡️ **MCP Server** | Model Context Protocol server for database diagnostics and health checks |
| ⚡ **Task State Machine** | Full `PENDING → RUNNING → COMPLETED/FAILED` lifecycle with a complete audit trail |

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         NEXUS AI PLATFORM                            │
│                                                                      │
│   ┌──────────────────────┐         ┌──────────────────────────────┐  │
│   │    nexus-ui (React)  │  REST   │  nexus-backend (Spring Boot) │  │
│   │                      │◄───────►│                              │  │
│   │  · Prompt Panel      │         │  · Task & Knowledge APIs     │  │
│   │  · Terminal Console  │         │  · Agent Orchestrator        │  │
│   │  · Artifact Vault    │         │  · AutonomousAgent           │  │
│   │  · Task History      │         │  · DatabaseTools (@Tool)     │  │
│   │  · System Health     │         │  · DocumentIngestion (RAG)   │  │
│   │                      │         │  · MCP Server                │  │
│   │  Zustand · Axios     │         │  · Virtual Thread Executor   │  │
│   └──────────────────────┘         └──────────┬───────────────────┘  │
│                                               │                      │
│                                    ┌──────────▼─────────────┐        │
│                                    │   Google Gemini 2.5    │        │
│                                    │   Flash  +  Embeddings │        │
│                                    └──────────┬─────────────┘        │
│                                               │                      │
│                                    ┌──────────▼─────────────┐        │
│                                    │  Supabase PostgreSQL   │        │
│                                    │  + pgvector extension  │        │
│                                    │                        │        │
│                                    │  profiles              │        │
│                                    │  agent_tasks           │        │
│                                    │  agent_logs            │        │
│                                    │  artifacts             │        │
│                                    │  semantic_memory       │        │
│                                    └────────────────────────┘        │
└──────────────────────────────────────────────────────────────────────┘
```

### Request Lifecycle

```
POST /api/v1/tasks/execute
    │
    ├─► TaskController → TaskService.createTask() → INSERT agent_tasks (PENDING)
    │
    ├─► Return 202 Accepted { taskId }   ← Client starts polling immediately
    │
    └─► AgentOrchestrator [Async / Virtual Thread]
            │
            ├─► Status → RUNNING
            ├─► AutonomousAgent.chat(taskId, prompt) → Gemini 2.5 Flash
            │       │
            │       ├─► THOUGHT  → postAgentLog()    → INSERT agent_logs
            │       ├─► ACTION   → saveArtifact()    → INSERT artifacts
            │       ├─► ERROR    → Self-correct, retry (up to 5×)
            │       └─► DONE
            │
            └─► Status → COMPLETED / FAILED
```

---

## ⚙️ Backend

The backend is a resilient, high-throughput Spring Boot service built for long-running AI workflows.

### Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Language | Java + Virtual Threads (Project Loom) | 21 |
| Framework | Spring Boot | 3.5 |
| AI Framework | LangChain4j | 1.14.0 |
| LLM | Google Gemini 2.5 Flash | v1beta |
| Embedding Model | text-embedding-004 | 768-dim |
| Vector Store | pgvector (via LangChain4j) | — |
| Database | PostgreSQL (Supabase) | 15+ |
| ORM | Hibernate 6.5 + hibernate-vector | 6.5.0 |
| MCP Server | Spring AI MCP | 1.1.5 |
| Document Parsing | Apache Tika | — |

### Package Structure

```
src/main/java/com/nexus/
├── agent/
│   ├── OrchestratorAgent.java       # Lightweight @AiService chat interface
│   └── mcp/NexusMcpServer.java      # MCP server: query_database, check_db_health
├── ai/
│   ├── AutonomousAgent.java         # Primary ReAct agent with full system prompt
│   └── tools/DatabaseTools.java     # @Tool methods: log, update status, save artifact
├── api/
│   ├── TaskController.java          # Task execution, stop, list, details, logs
│   ├── KnowledgeController.java     # Document upload → RAG pipeline
│   └── NexusController.java         # Direct chat endpoint
├── config/
│   ├── AsyncConfig.java             # Virtual thread executor
│   ├── VectorStoreConfig.java       # ChatModel, EmbeddingModel, pgvector beans
│   └── DatabaseSeeder.java          # Auto-seeds default user on startup
├── model/
│   ├── entity/                      # AgentTask, AgentLog, Artifact, Profile
│   └── enums/                       # TaskStatus, LogLevel
├── repository/                      # Spring Data JPA repositories
└── service/
    ├── AgentOrchestrator.java       # Core async workflow + retry engine
    ├── TaskService.java             # Task CRUD & log operations
    └── DocumentIngestionService.java # Async document → embedding pipeline
```

### Agent Orchestration & Self-Correction

The `AgentOrchestrator` runs on a dedicated virtual thread and implements a battle-tested retry loop:

1. **Fetch & Activate** — Load task, transition to `RUNNING`
2. **Invoke Agent** — Call `AutonomousAgent.chat()` with task context
3. **Self-Correct** — On failure, inject the error back as a `DIAGNOSTIC SELF-CORRECTION PROTOCOL` message, retry
4. **Rate Limit Handling** — Parse Gemini `429` responses, extract `retryDelay`, sleep accordingly
5. **Fallback Artifact** — If the agent didn't call `saveArtifact()`, persist the raw LLM response
6. **User-Initiated Stop** — `POST /tasks/{taskId}/stop` sets status to `FAILED`; orchestrator detects and aborts cleanly

### RAG & Semantic Memory Pipeline

```
Upload → Apache Tika Parse → Recursive Chunk (800 tok / 120 overlap)
       → Enrich Metadata   → Embed (text-embedding-004, 768-dim)
       → Store in pgvector (cosine similarity)
```

Every stage runs **asynchronously** (`@Async` + virtual threads). The API returns `202 Accepted` immediately.

### Dynamic Tool System

The LLM decides at runtime which Java methods to call:

| Tool | Description |
|---|---|
| `postAgentLog(taskId, level, message)` | Writes incremental log entries to `agent_logs` |
| `updateTaskStatus(taskId, status)` | Transitions the task lifecycle state |
| `saveArtifact(taskId, title, content, type)` | Persists the final report or code to `artifacts` |

All tools include robust UUID parsing and descriptive error messages to guide the model on retry.

---

## 🎨 Frontend

A premium **glassmorphic AI Operations Control Room** built with React 19 and Framer Motion.

### Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 19.2 |
| Build Tool | Vite | 8.0 |
| Styling | TailwindCSS | 4.3 |
| Animation | Framer Motion | 12.38 |
| State | Zustand | 5.0 |
| HTTP | Axios | 1.16 |

### Component Architecture

```
src/
├── App.jsx                     # Root router
├── components/
│   ├── layout/DashboardLayout  # Sidebar + status bar
│   └── ui/
│       ├── PromptPanel         # Glow-accented prompt input + quick triggers
│       ├── TerminalConsole     # Color-coded live log streaming
│       └── ArtifactVault       # Markdown/code viewer + clipboard
├── pages/
│   ├── AgentControl            # Primary control room
│   ├── TaskHistory             # Execution audit log table
│   └── SystemHealth            # CPU/Memory/DB animated gauges
├── hooks/useAgentStream.js     # Long-polling: logs + task status every 1.5s
└── store/
    ├── useStore.js             # UI state & metrics
    └── useNexusStore.js        # Real task execution + API state
```

### Terminal Log Colors

| Level | Color | Meaning |
|---|---|---|
| `THOUGHT` | Indigo | Agent's internal reasoning |
| `TOOL_CALL` | Blue | Tool invocation event |
| `SUCCESS` | Green | Successful operation |
| `ERROR` | Red | Error or diagnostic |
| `INFO` | Gray | General status |

### Artifact Vault Features

- Custom Markdown renderer: headers, lists, code blocks, tables, GitHub callouts (`> [!NOTE]`, `> [!WARNING]`), interactive checklists
- Tabbed **Markdown** / **Code** view
- One-click clipboard copy with visual confirmation

### Real-Time Polling

```
POST /tasks/execute  →  202 { taskId }
                                │
          ┌─────── every 1.5s ──┘
          ▼
  GET /tasks/{id}/logs  →  append new logs to terminal
  GET /tasks/{id}       →  update status badge
          │
  status !== RUNNING  →  clearInterval(), stop polling
```

---

## 🗄️ Database Schema

```sql
-- User profiles (linked to Supabase auth.users)
CREATE TABLE profiles (
    id         UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name  TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP
);

-- Task lifecycle state machine
CREATE TABLE agent_tasks (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES profiles(id),
    prompt       TEXT,
    goal_summary TEXT,
    status       VARCHAR NOT NULL,  -- PENDING | RUNNING | COMPLETED | FAILED
    created_at   TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Step-by-step execution audit trail
CREATE TABLE agent_logs (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id    UUID NOT NULL REFERENCES agent_tasks(id),
    level      VARCHAR NOT NULL,   -- INFO | THOUGHT | TOOL_CALL | SUCCESS | ERROR
    message    TEXT,
    raw_data   JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Generated reports and code artifacts
CREATE TABLE artifacts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id       UUID NOT NULL REFERENCES agent_tasks(id),
    title         VARCHAR NOT NULL,
    content       TEXT,
    artifact_type VARCHAR,          -- 'markdown' | 'code'
    created_at    TIMESTAMP DEFAULT NOW()
);

-- Semantic memory — RAG vector store
CREATE TABLE semantic_memory (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    embedding     vector(768),
    text          TEXT,
    metadata      JSONB,
    user_id       UUID,
    document_name TEXT,
    chunk_index   INT,
    created_at    TIMESTAMP DEFAULT NOW()
);
```

**Entity Relationship**

```
profiles ──< agent_tasks ──< agent_logs
                   └───────< artifacts

semantic_memory  (standalone, user_id for multi-tenant isolation)
```

---

## 📡 API Reference

### Tasks

| Method | Endpoint | Description | Returns |
|---|---|---|---|
| `POST` | `/api/v1/tasks/execute` | Execute an agentic workflow | `202 { taskId }` |
| `POST` | `/api/v1/tasks/{taskId}/stop` | Stop / cancel a running task | `200 { message }` |
| `GET` | `/api/v1/tasks` | List all tasks, newest first | `200 [AgentTask]` |
| `GET` | `/api/v1/tasks/{taskId}` | Get task details + artifacts | `200 { task, artifacts }` |
| `GET` | `/api/v1/tasks/{taskId}/logs` | Get execution logs | `200 [AgentLog]` |

**Execute — Request Body**

```json
{
  "userId": "d7b29a24-4f27-4632-bd88-5188f6fa9809",
  "prompt": "Analyze the security posture of the REST API endpoints"
}
```

### Knowledge (RAG)

| Method | Endpoint | Description | Returns |
|---|---|---|---|
| `POST` | `/api/v1/knowledge/upload` | Upload document for semantic memory | `202 { message, fileName }` |

> Upload as `multipart/form-data` with fields `file` (the document) and `userId` (UUID).

### Chat

| Method | Endpoint | Description | Returns |
|---|---|---|---|
| `POST` | `/api/v1/nexus/chat` | Direct chat with orchestrator agent | `200 text` |

A Postman collection is included at `nexus-backend/nexus_postman_collection.json`.

---

## 🚀 Getting Started

### Prerequisites

- **JDK 21+**
- **Maven 3.9+**
- **Node.js 20+**
- **Supabase** project (PostgreSQL + `pgvector` extension)
- **Google AI API Key** (Gemini 2.5 Flash + text-embedding-004)

### 1 — Clone

```bash
git clone https://github.com/your-username/nexus-ai.git
cd nexus-ai
```

### 2 — Backend

```bash
cd nexus-backend

# Set required environment variables
export GOOGLE_AI_API_KEY=your_google_ai_api_key
export SPRING_DATASOURCE_URL=jdbc:postgresql://db.xxxx.supabase.co:5432/postgres?sslmode=require
export SPRING_DATASOURCE_PASSWORD=your_supabase_db_password

# Enable pgvector in Supabase SQL editor first:
# CREATE EXTENSION IF NOT EXISTS vector;

mvn clean compile
mvn spring-boot:run
```

Backend starts on `http://localhost:8081`. `DatabaseSeeder` auto-creates the default test user on first boot.

### 3 — Frontend

```bash
cd nexus-ui
npm install

# Create .env
echo "PORT=3000\nVITE_BACKEND_URL=http://localhost:8081" > .env

npm run dev
```

Frontend starts on `http://localhost:3000` with automatic API proxying.

### 4 — Test

Import `nexus-backend/nexus_postman_collection.json` into Postman. All endpoints are pre-configured with the default user ID `d7b29a24-4f27-4632-bd88-5188f6fa9809`.

---

## 🐳 Docker Deployment

The backend uses a **multi-stage Distroless image** for minimal attack surface:

```bash
cd nexus-backend

docker build -t nexus-backend .

docker run -p 8081:8080 \
  -e GOOGLE_AI_API_KEY=your_key \
  -e SPRING_DATASOURCE_URL=your_jdbc_url \
  -e SPRING_DATASOURCE_PASSWORD=your_password \
  nexus-backend
```

**Dockerfile highlights:**

```dockerfile
# Stage 1 — Build
FROM maven:3.9.6-eclipse-temurin-21 AS build
RUN mvn clean package -DskipTests

# Stage 2 — Distroless runtime (no shell, no OS bloat)
FROM gcr.io/distroless/java21-debian12
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 📁 Project Structure

```
nexus-ai/
│
├── nexus-backend/                     # Spring Boot service
│   ├── Dockerfile
│   ├── pom.xml
│   ├── nexus_postman_collection.json
│   └── src/main/
│       ├── java/com/nexus/
│       │   ├── agent/                 # @AiService interfaces + MCP server
│       │   ├── ai/                    # AutonomousAgent + @Tool definitions
│       │   ├── api/                   # REST controllers + DTOs
│       │   ├── config/                # Spring beans (AI, async, vector store)
│       │   ├── model/                 # JPA entities + enums
│       │   ├── repository/            # Spring Data repositories
│       │   └── service/               # Orchestrator, task service, ingestion
│       └── resources/
│           ├── application.yml
│           └── application-local.yml
│
└── nexus-ui/                          # React 19 frontend
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── components/                # DashboardLayout, PromptPanel, Terminal, Vault
        ├── pages/                     # AgentControl, TaskHistory, SystemHealth
        ├── hooks/                     # useAgentStream (polling)
        ├── store/                     # useStore, useNexusStore (Zustand)
        └── services/                  # Axios API client
```

---

## 🗺️ Roadmap

### ✅ Phase 1 — Complete

- [x] Core agent orchestration with ReAct reasoning loops
- [x] Dynamic `@Tool` invocation with self-correcting retries
- [x] Real-time log streaming + Artifact Vault
- [x] pgvector setup + document ingestion pipeline
- [x] Glassmorphic dashboard with Framer Motion

### 🔲 Phase 2 — Planned

- [ ] RAG-augmented prompt injection (retrieval → context → generation)
- [ ] Hybrid search: vector similarity + BM25 full-text
- [ ] Cross-encoder reranking for improved retrieval precision

### 🔲 Phase 3 — Future

- [ ] Reflection memory — self-improving agent strategies
- [ ] Temporal memory — time-weighted relevance scoring
- [ ] Knowledge graph integration (Neo4j)
- [ ] WebSocket real-time streaming (replace long-polling)
- [ ] Multi-user authentication + Row Level Security enforcement

---

## ⚙️ Configuration Reference

| Property | Default | Description |
|---|---|---|
| `server.port` | `8081` | Backend HTTP port |
| `spring.datasource.url` | `${SPRING_DATASOURCE_URL}` | Supabase JDBC URL |
| `langchain4j.google-ai-gemini.api-key` | `${GOOGLE_AI_API_KEY}` | Google AI API key |
| `langchain4j.google-ai-gemini.model-name` | `gemini-2.5-flash` | LLM model identifier |
| `langchain4j.google-ai-gemini.temperature` | `0.7` | Response creativity |
| `spring.jpa.hibernate.ddl-auto` | `update` | Auto-create/update tables |
| `spring.ai.mcp.server.enabled` | `true` | Enable MCP server |

---

<div align="center">

<br />

**Built with** ☕ Java 21 · ⚛ React 19 · 🧠 Gemini 2.5 Flash · 🔗 LangChain4j · 🐘 pgvector

<br />

*If this project helped you, consider leaving a ⭐ — it helps others discover it.*

</div>
