<![CDATA[<div align="center">

# 🧠 NEXUS AI

### Enterprise-Grade Autonomous Agent Platform with Persistent Semantic Memory

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![LangChain4j](https://img.shields.io/badge/LangChain4j-1.14-1C3C3C?style=for-the-badge)](https://docs.langchain4j.dev/)
[![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

---

**Nexus AI** is a real-time, autonomous agentic platform engineered for long-running research, code generation, and diagnostic execution workflows. It combines an enterprise-grade Spring Boot backend with a premium glassmorphic React dashboard to deliver AI-powered task orchestration with persistent semantic memory.

[Architecture](#-architecture) · [Backend](#-backend-nexus-backend) · [Frontend](#-frontend-nexus-ui) · [Database](#-database-schema) · [API Reference](#-api-reference) · [Getting Started](#-getting-started)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Backend (`nexus-backend`)](#-backend-nexus-backend)
  - [Package Structure](#package-structure)
  - [Agent Orchestration](#agent-orchestration--react-reasoning-loop)
  - [LangChain4j AI Services](#langchain4j-ai-services)
  - [Dynamic Tool System](#dynamic-tool-system)
  - [RAG & Semantic Memory Pipeline](#rag--semantic-memory-pipeline)
  - [MCP Server](#model-context-protocol-mcp-server)
  - [Virtual Threads & Async Processing](#virtual-threads--async-processing)
  - [Auto-Seeding](#automatic-database-seeding)
  - [Configuration](#configuration)
- [Frontend (`nexus-ui`)](#-frontend-nexus-ui)
  - [Component Architecture](#component-architecture)
  - [Pages & Views](#pages--views)
  - [State Management](#state-management)
  - [Real-Time Log Streaming](#real-time-log-streaming)
  - [Design System](#design-system)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Docker Deployment](#-docker-deployment)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)

---

## 🔭 Overview

Nexus AI is designed as an **AI Operations Control Room** — a platform where users submit natural-language prompts and an autonomous agent executes multi-step reasoning loops, invokes tools, logs its thought process in real-time, and produces structured artifacts (reports, code, analysis).

### Core Capabilities

| Capability | Description |
|:---|:---|
| **Autonomous Reasoning Loops** | ReAct-pattern (Reason + Act) execution with self-correcting retry logic |
| **Real-Time Execution Streaming** | Live thought/action/error logs streamed to a terminal console UI |
| **Artifact Generation** | Structured Markdown reports and code artifacts saved to a persistent vault |
| **Persistent Semantic Memory** | RAG pipeline using pgvector for document upload, chunking, embedding, and retrieval |
| **Tool Invocation** | LLM dynamically calls Java methods at runtime via reflection-based `@Tool` annotations |
| **Task Lifecycle Management** | Full `PENDING → RUNNING → COMPLETED/FAILED` state machine with audit trails |
| **MCP Server** | Model Context Protocol server for database diagnostics and health checks |
| **Virtual Thread Concurrency** | JDK 21 Project Loom for non-blocking, high-throughput async processing |

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              NEXUS AI PLATFORM                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────┐     ┌───────────────────────────────────┐   │
│  │       nexus-ui (React)      │     │    nexus-backend (Spring Boot)    │   │
│  │                             │     │                                   │   │
│  │  ┌───────────┐ ┌─────────┐ │ REST│  ┌─────────────┐ ┌────────────┐  │   │
│  │  │ Dashboard │ │ Prompt  │ │◄───►│  │   Task      │ │  Knowledge │  │   │
│  │  │  Layout   │ │  Panel  │ │ API │  │  Controller │ │  Controller│  │   │
│  │  └───────────┘ └─────────┘ │     │  └──────┬──────┘ └──────┬─────┘  │   │
│  │  ┌───────────┐ ┌─────────┐ │     │         │               │        │   │
│  │  │ Terminal  │ │Artifact │ │     │  ┌──────▼──────┐ ┌──────▼─────┐  │   │
│  │  │ Console   │ │  Vault  │ │     │  │   Task      │ │  Document  │  │   │
│  │  └───────────┘ └─────────┘ │     │  │   Service   │ │  Ingestion │  │   │
│  │  ┌───────────┐ ┌─────────┐ │     │  └──────┬──────┘ └──────┬─────┘  │   │
│  │  │   Task    │ │ System  │ │     │         │               │        │   │
│  │  │  History  │ │ Health  │ │     │  ┌──────▼──────────────────────┐  │   │
│  │  └───────────┘ └─────────┘ │     │  │    Agent Orchestrator      │  │   │
│  │                             │     │  │  (Virtual Thread Executor) │  │   │
│  │  Zustand Stores             │     │  └──────┬───────────────┬────┘  │   │
│  │  ├── useStore (UI/Metrics)  │     │         │               │       │   │
│  │  └── useNexusStore (Tasks)  │     │  ┌──────▼──────┐ ┌──────▼────┐  │   │
│  │                             │     │  │ Autonomous  │ │ Database  │  │   │
│  │  Hooks                      │     │  │   Agent     │ │   Tools   │  │   │
│  │  └── useAgentStream (Poll)  │     │  │ (LangChain) │ │  (@Tool)  │  │   │
│  └─────────────────────────────┘     │  └──────┬──────┘ └───────────┘  │   │
│                                      │         │                        │   │
│                                      │  ┌──────▼──────┐                 │   │
│                                      │  │  Gemini 2.5 │                 │   │
│                                      │  │    Flash    │                 │   │
│                                      │  └─────────────┘                 │   │
│                                      └──────────┬────────────────────────┘  │
│                                                 │                            │
│                                      ┌──────────▼──────────────────────┐     │
│                                      │   Supabase PostgreSQL + pgvector │     │
│                                      │                                  │     │
│                                      │  ├── profiles                    │     │
│                                      │  ├── agent_tasks                 │     │
│                                      │  ├── agent_logs                  │     │
│                                      │  ├── artifacts                   │     │
│                                      │  └── semantic_memory (vectors)   │     │
│                                      └──────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
Client POST /api/v1/tasks/execute
        │
        ▼
  TaskController ──► TaskService.createTask() ──► INSERT agent_tasks (PENDING)
        │
        ├──► Return 202 Accepted { taskId }
        │
        └──► AgentOrchestrator.runAgenticWorkflow(taskId) [Async / Virtual Thread]
                │
                ├──► Update status → RUNNING
                │
                ├──► AutonomousAgent.chat(taskId, prompt) ──► Gemini 2.5 Flash
                │       │
                │       ├──► THOUGHT → postAgentLog()   ──► INSERT agent_logs
                │       ├──► ACTION  → saveArtifact()   ──► INSERT artifacts
                │       ├──► ACTION  → updateTaskStatus()
                │       └──► (Self-correcting retry on failure)
                │
                ├──► Save fallback artifact if agent didn't create one
                │
                └──► Update status → COMPLETED
```

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|:---|:---|:---|
| **Language** | Java (JDK 21 + Virtual Threads) | 21 |
| **Backend Framework** | Spring Boot | 3.5.14 |
| **AI Framework** | LangChain4j | 1.14.0 |
| **LLM** | Google Gemini 2.5 Flash | v1beta |
| **Embedding Model** | text-embedding-004 | — |
| **Vector Store** | pgvector (via LangChain4j) | — |
| **Database** | PostgreSQL (Supabase) | 15+ |
| **ORM** | Hibernate 6.5 + hibernate-vector | 6.5.0 |
| **MCP** | Spring AI MCP Server | 1.1.5 |
| **Document Parsing** | Apache Tika | — |
| **Frontend Framework** | React | 19.2 |
| **Build Tool** | Vite | 8.0 |
| **CSS Framework** | TailwindCSS | 4.3 |
| **Animation** | Framer Motion | 12.38 |
| **State Management** | Zustand | 5.0 |
| **HTTP Client** | Axios | 1.16 |
| **Icons** | Lucide React | 1.16 |
| **Containerization** | Docker (Distroless) | — |

---

## ⚙ Backend (`nexus-backend`)

The backend is a high-throughput, resilient Spring Boot service that orchestrates autonomous AI reasoning loops with dynamic tool invocation, persistent semantic memory, and full audit trail logging.

### Package Structure

```
src/main/java/com/nexus/
├── NexusAiApplication.java          # Spring Boot entry point
├── agent/
│   ├── OrchestratorAgent.java       # Simple chat agent interface (@AiService)
│   └── mcp/
│       └── NexusMcpServer.java      # MCP Server with database diagnostic tools
├── ai/
│   ├── AutonomousAgent.java         # Primary AI agent with ReAct system prompt
│   └── tools/
│       └── DatabaseTools.java       # @Tool-annotated methods for LLM invocation
├── api/
│   ├── TaskController.java          # REST endpoints for task execution & querying
│   ├── KnowledgeController.java     # REST endpoint for document upload (RAG)
│   ├── NexusController.java         # Simple chat endpoint
│   ├── TaskRequest.java             # Request DTO (userId, prompt)
│   └── ChatRequest.java             # Request DTO (message)
├── config/
│   ├── AiConfig.java                # AI-specific configuration
│   ├── AsyncConfig.java             # Virtual Thread executor configuration
│   ├── DatabaseSeeder.java          # Auto-seeds test user on startup
│   └── VectorStoreConfig.java       # ChatModel, EmbeddingModel, pgvector beans
├── model/
│   ├── entity/
│   │   ├── AgentTask.java           # JPA entity: task lifecycle
│   │   ├── AgentLog.java            # JPA entity: step-by-step logs
│   │   ├── Artifact.java            # JPA entity: generated reports/code
│   │   └── Profile.java             # JPA entity: user profile
│   └── enums/
│       ├── TaskStatus.java          # PENDING, RUNNING, COMPLETED, FAILED
│       └── LogLevel.java            # INFO, THOUGHT, TOOL_CALL, SUCCESS, ERROR
├── repository/
│   ├── AgentTaskRepository.java     # JPA repository for tasks
│   ├── AgentLogRepository.java      # JPA repository for logs
│   ├── ArtifactRepository.java      # JPA repository for artifacts
│   └── ProfileRepository.java      # JPA repository for user profiles
└── service/
    ├── AgentOrchestrator.java       # Core async workflow engine
    ├── TaskService.java             # Task CRUD & log operations
    └── DocumentIngestionService.java # Async document → embedding pipeline
```

---

### Agent Orchestration & ReAct Reasoning Loop

The `AgentOrchestrator` is the heart of the system. It runs asynchronously on a virtual thread and implements a **self-correcting retry loop** with up to 5 attempts:

1. **Task Fetch** — Loads the `AgentTask` entity from PostgreSQL
2. **Status Update** — Transitions task to `RUNNING`
3. **Agent Invocation** — Calls `AutonomousAgent.chat()` with the user prompt prepended with the task UUID context
4. **Self-Correction** — On failure, the exception message is fed back to the LLM as a `DIAGNOSTIC SELF-CORRECTION PROTOCOL`, allowing it to correct its tool call arguments and retry
5. **Rate Limit Handling** — Parses Gemini API `429` responses to extract `retryDelay` and waits accordingly before retrying
6. **Daily Quota Detection** — Detects `GenerateRequestsPerDay` quota exhaustion and reports it to the user with actionable instructions
7. **Fallback Artifact** — If the agent doesn't save an artifact via tools, the orchestrator saves a fallback artifact from the raw LLM response
8. **Completion** — Updates task status to `COMPLETED` or `FAILED`

**User-Initiated Stop**: Tasks can be cancelled mid-execution via `POST /tasks/{taskId}/stop`. The orchestrator checks for `FAILED` status at the top of each retry iteration and aborts cleanly.

---

### LangChain4j AI Services

Nexus uses **LangChain4j `@AiService`** interfaces — Spring-managed beans that declaratively bind to a `ChatModel` and inject `@Tool`-annotated components:

#### `AutonomousAgent` — Primary Task Agent

The autonomous agent has a detailed system prompt that defines:
- **Database schema awareness** — The agent knows the exact structure of `agent_tasks`, `agent_logs`, and `artifacts` tables
- **Operational rules** — Logging mandates, UUID formatting, status boundaries, artifact vault rules
- **ReAct Protocol** — A strict `THOUGHT → ACTION → OBSERVATION → REPEAT → FINAL ANSWER` loop

```java
@AiService
public interface AutonomousAgent {
    @SystemMessage("""
        You are the Nexus Autonomous Sentinel Agent...
        Rule 1 [LOGGING MANDATE]: You must ALWAYS post a log with level 'THOUGHT' before executing ANY other tool.
        Rule 2 [UUID PASSING]: Always pass the correct, raw task ID as a clean string.
        ...
    """)
    String chat(@MemoryId UUID taskId, @UserMessage String userPrompt);
}
```

#### `OrchestratorAgent` — Lightweight Chat Agent

A simpler agent for direct conversational interactions without the full task lifecycle:

```java
@AiService
public interface OrchestratorAgent {
    @SystemMessage("You are the Nexus AI Orchestrator...")
    String chat(@UserMessage String message);
}
```

---

### Dynamic Tool System

The `DatabaseTools` class exposes Java methods as **LLM-callable tools** via `@Tool` annotations. The Gemini model decides at runtime which tools to invoke based on the conversation context:

| Tool | Method | Description |
|:---|:---|:---|
| `postAgentLog` | `postAgentLog(taskId, level, message)` | Writes incremental log entries to the `agent_logs` table |
| `updateTaskStatus` | `updateTaskStatus(taskId, status)` | Updates the task lifecycle state (`RUNNING`, `COMPLETED`, `FAILED`) |
| `saveArtifact` | `saveArtifact(taskId, title, content, type)` | Saves a final report or code artifact to the `artifacts` table |

All tools include **robust UUID parsing** that strips quotes, brackets, and whitespace to handle the variety of formats LLMs might produce. Each tool provides **detailed error messages** that guide the LLM toward correct invocation on retry.

---

### RAG & Semantic Memory Pipeline

Nexus implements a full **Retrieval-Augmented Generation (RAG)** pipeline for persistent long-term memory:

```
Document Upload → Apache Tika Parsing → Recursive Chunking → Embedding (text-embedding-004) → pgvector Storage
```

#### Pipeline Stages

| Stage | Implementation | Details |
|:---|:---|:---|
| **1. Upload** | `KnowledgeController` | Accepts multipart file uploads via `POST /api/v1/knowledge/upload` |
| **2. Parsing** | Apache Tika (`ApacheTikaDocumentParser`) | Supports PDF, DOCX, TXT, and 1000+ file formats |
| **3. Chunking** | `DocumentSplitters.recursive(800, 120)` | 800-token chunks with 120-token overlap for context preservation |
| **4. Metadata** | Per-chunk enrichment | Each chunk tagged with `user_id`, `document_name`, `chunk_index` |
| **5. Embedding** | Google `text-embedding-004` | 768-dimensional vector embeddings via `GoogleAiEmbeddingModel` |
| **6. Storage** | pgvector (`PgVectorEmbeddingStore`) | Vectors stored in the `semantic_memory` table with cosine similarity indexing |

#### Configuration (`VectorStoreConfig`)

```java
@Bean
public EmbeddingModel embeddingModel() {
    return GoogleAiEmbeddingModel.builder()
            .apiKey(apiKey)
            .modelName("text-embedding-004")
            .build();
}

@Bean
public EmbeddingStore<TextSegment> embeddingStore(DataSource dataSource) {
    return PgVectorEmbeddingStore.datasourceBuilder()
            .datasource(dataSource)
            .table("semantic_memory")
            .dimension(768)
            .build();
}
```

The entire ingestion pipeline runs **asynchronously** on virtual threads via `@Async`, returning `202 Accepted` immediately while processing continues in the background.

---

### Model Context Protocol (MCP) Server

Nexus exposes an **MCP Server** (Spring AI MCP) that provides database diagnostic tools:

| MCP Tool | Description |
|:---|:---|
| `query_database` | Executes read-only `SELECT` queries for data inspection |
| `check_db_health` | Performs a `SELECT 1` health check on the Supabase connection |

The MCP server supports **stdio transport** for integration with MCP-compatible clients.

---

### Virtual Threads & Async Processing

All long-running operations (agent workflows, document ingestion) run on **JDK 21 Virtual Threads** (Project Loom):

```java
@Bean(TaskExecutionAutoConfiguration.APPLICATION_TASK_EXECUTOR_BEAN_NAME)
public AsyncTaskExecutor taskExecutor() {
    return new TaskExecutorAdapter(Executors.newVirtualThreadPerTaskExecutor());
}
```

This means:
- **Tomcat's HTTP thread pool stays free** — API endpoints return instantly (`202 Accepted`)
- **Virtually unlimited concurrency** — Each task gets its own lightweight virtual thread
- **Blocking I/O is fine** — `Thread.sleep()` for rate limit waits doesn't consume carrier threads

---

### Automatic Database Seeding

On startup, `DatabaseSeeder` automatically:
1. Inserts a default user into Supabase's `auth.users` table (satisfying foreign key constraints)
2. Creates a corresponding `profiles` row with a predictable UUID (`d7b29a24-4f27-4632-bd88-5188f6fa9809`)

This ensures the application works **out-of-the-box** for development and API testing with zero manual configuration.

---

### Configuration

#### `application.yml`

| Property | Default | Description |
|:---|:---|:---|
| `server.port` | `8081` | Backend HTTP port |
| `spring.datasource.url` | `${SPRING_DATASOURCE_URL}` | Supabase PostgreSQL JDBC URL |
| `spring.datasource.password` | `${SPRING_DATASOURCE_PASSWORD}` | Database password |
| `langchain4j.google-ai-gemini.api-key` | `${GOOGLE_AI_API_KEY}` | Google AI API key |
| `langchain4j.google-ai-gemini.model-name` | `gemini-2.5-flash` | LLM model identifier |
| `langchain4j.google-ai-gemini.temperature` | `0.7` | Response creativity level |
| `spring.jpa.hibernate.ddl-auto` | `update` | Auto-create/update tables |
| `spring.ai.mcp.server.enabled` | `true` | Enable MCP server |

---

## 🎨 Frontend (`nexus-ui`)

The frontend is designed as an **AI Operations Control Room** — a sleek, ultra-modern SPA featuring full glassmorphism aesthetics, dynamic micro-animations, and a real-time agent execution console.

### Component Architecture

```
src/
├── App.jsx                          # Root component with tab routing
├── main.jsx                         # React 19 entry point
├── index.css                        # Global styles, glassmorphism, glow effects
├── components/
│   ├── layout/
│   │   └── DashboardLayout.jsx      # Fixed sidebar + top status bar + content area
│   └── ui/
│       ├── PromptPanel.jsx          # Glow-accented prompt input with quick triggers
│       ├── TerminalConsole.jsx      # Color-coded real-time log streaming console
│       └── ArtifactVault.jsx        # Markdown/code artifact viewer with tabs & clipboard
├── pages/
│   ├── AgentControl.jsx             # Primary control room (prompt + console + vault)
│   ├── TaskHistory.jsx              # Execution audit log table
│   └── SystemHealth.jsx             # CPU/Memory/DB gauges and node status
├── hooks/
│   └── useAgentStream.js            # Real-time polling hook for log/task sync
├── store/
│   ├── useStore.js                  # UI state, metrics, mock execution pipeline
│   └── useNexusStore.js             # Real task execution, API-backed state
├── services/
│   └── api.js                       # Axios client with Vite proxy configuration
└── views/
    └── Dashboard.jsx                # Legacy dashboard wrapper
```

---

### Pages & Views

#### 🎛 Agent Control (`AgentControl.jsx`)

The primary interface, composed of three key sections:

| Component | File | Purpose |
|:---|:---|:---|
| **Prompt Panel** | `PromptPanel.jsx` | Glow-accented textarea for entering natural language prompts. Includes quick-action triggers and execute/stop buttons |
| **Terminal Console** | `TerminalConsole.jsx` | Real-time streaming console that displays color-coded agent logs with timestamps |
| **Artifact Vault** | `ArtifactVault.jsx` | Displays the final output with **Markdown** and **Code** sub-tabs, copy-to-clipboard, and rich rendering |

**Terminal Log Types & Colors:**

| Level | Color | Purpose |
|:---|:---|:---|
| `THOUGHT` | Indigo (`#a5b4fc`) | Agent's reasoning steps |
| `TOOL_CALL` | Blue (`#60a5fa`) | Tool invocation events |
| `SUCCESS` | Green (`#34d399`) | Successful operations |
| `ERROR` | Red (`#f87171`) | Errors and diagnostics |
| `INFO` | Gray | General status messages |

**Artifact Vault Features:**
- Custom Markdown parser that renders headers, lists, inline code, code blocks, tables, GitHub-style callouts (`> [!NOTE]`, `> [!WARNING]`), and interactive checklists
- Tabbed interface switching between Markdown and raw Code views
- One-click copy-to-clipboard with visual confirmation

#### 📊 Task History (`TaskHistory.jsx`)

A tabular audit log of all executed tasks:
- Task UUIDs (formatted as `TX-XXXX`)
- Full prompt instructions
- Executor agent names
- Execution duration metrics
- Precise timestamps
- Color-coded status badges: **Completed** (green), **Running** (amber), **Failed** (red)

#### 💓 System Health (`SystemHealth.jsx`)

Real-time system monitoring dashboard:
- **Animated SVG gauges** for CPU utilization, memory allocation, and database connection pool usage
- **Node status cards** showing backend latency, environment configuration, and uptime status (`ONLINE`/`STANDBY`)
- Live oscillating metrics that simulate realistic system behavior

---

### State Management

Nexus uses **Zustand** with two specialized stores for separated concerns:

#### `useStore` — UI & Metrics Store

| State | Type | Purpose |
|:---|:---|:---|
| `activeTab` | `string` | Currently active navigation tab |
| `prompt` | `string` | Current prompt input text |
| `isExecuting` | `boolean` | Whether a mock execution is running |
| `logs` | `array` | Terminal log entries |
| `tasks` | `array` | Task history (includes mock seed data) |
| `artifact` | `object` | Currently displayed artifact |
| `systemMetrics` | `object` | `{ cpu, memory, dbConnections, latency }` |

Key actions: `setActiveTab()`, `executeAgentPrompt()`, `oscillateMetrics()`

#### `useNexusStore` — Real Task Execution Store

| State | Type | Purpose |
|:---|:---|:---|
| `tasks` | `array` | API-fetched task history |
| `currentTaskId` | `UUID` | Active task being tracked |
| `logs` | `array` | Real-time logs from backend |
| `status` | `string` | `IDLE`, `RUNNING`, `COMPLETED`, `FAILED` |
| `finalArtifact` | `object` | The resolved artifact from the backend |

Key actions: `executePrompt()`, `fetchLogs()`, `fetchTaskDetails()`, `fetchTaskHistory()`, `stopExecutingPrompt()`, `resetStore()`

---

### Real-Time Log Streaming

The `useAgentStream` hook implements a **long-polling pattern** for real-time synchronization:

```
┌──────────┐  POST /tasks/execute   ┌──────────────┐
│  React   │ ────────────────────►  │   Backend    │
│  Client  │ ◄──── 202 { taskId }   │              │
└──────┬───┘                        └──────────────┘
       │
       │  Every 1.5s (while status === 'RUNNING'):
       │  ┌─────────────────────────────────────────┐
       │  │  GET /tasks/{taskId}/logs → update logs  │
       │  │  GET /tasks/{taskId}     → update status │
       │  └─────────────────────────────────────────┘
       │
       │  When status !== 'RUNNING':
       └──► clearInterval() — stop polling
```

The hook:
- Starts polling immediately on task creation
- Fetches both logs and task details every 1.5 seconds
- Automatically stops when the task completes or fails
- Cleans up intervals on unmount to prevent memory leaks

---

### Design System

| Element | Implementation |
|:---|:---|
| **Color Scheme** | Dark-mode HSL palette built on Slate/Zinc/Indigo/Emerald |
| **Typography** | Inter (body) + system-ui fallbacks |
| **Glassmorphism** | `backdrop-blur-md` + semi-transparent backgrounds + frosted borders |
| **Glow Effects** | Animated radial gradients (`pulseGlow` keyframes) with 15s infinite easing |
| **Micro-animations** | Framer Motion `layoutId` transitions for sidebar nav, spring-based tab switching |
| **Scrollbars** | Custom WebKit scrollbars with zinc-700 thumbs and rounded styling |
| **Status Indicators** | Animated ping dots (`animate-ping`) for active connection status |

**Global CSS Classes:**
- `.glow-bg` — Animated radial gradient background elements
- `.glass-panel` — Glassmorphic card with blur, border, and shadow
- `.terminal-scroll` — Thin custom scrollbar for terminal panels

---

## 🗄 Database Schema

Nexus uses **Supabase PostgreSQL** with the `pgvector` extension for vector similarity search.

### Tables

```sql
-- User profiles (linked to Supabase auth.users)
CREATE TABLE profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name   TEXT,
    avatar_url  TEXT,
    updated_at  TIMESTAMP
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
    level      VARCHAR NOT NULL,  -- INFO | THOUGHT | TOOL_CALL | SUCCESS | ERROR
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
    artifact_type VARCHAR,  -- 'markdown' | 'code'
    created_at    TIMESTAMP DEFAULT NOW()
);

-- Semantic memory (RAG vector store)
CREATE TABLE semantic_memory (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    embedding      vector(768),
    text           TEXT,
    metadata       JSONB,
    -- Denormalized fields for RLS
    user_id        UUID,
    document_name  TEXT,
    chunk_index    INT,
    created_at     TIMESTAMP DEFAULT NOW()
);
```

### Entity Relationship

```
profiles ──< agent_tasks ──< agent_logs
                    │
                    └──< artifacts

semantic_memory (standalone, user_id for multi-tenant isolation)
```

---

## 📡 API Reference

### Task Execution

| Method | Endpoint | Description | Response |
|:---|:---|:---|:---|
| `POST` | `/api/v1/tasks/execute` | Execute an agentic workflow | `202 { taskId }` |
| `POST` | `/api/v1/tasks/{taskId}/stop` | Stop/cancel an executing task | `200 { message }` |
| `GET` | `/api/v1/tasks` | List all tasks (newest first) | `200 [AgentTask]` |
| `GET` | `/api/v1/tasks/{taskId}` | Get task details + artifacts | `200 { task, artifacts }` |
| `GET` | `/api/v1/tasks/{taskId}/logs` | Get task execution logs | `200 [AgentLog]` |

#### Execute Task — Request Body

```json
{
  "userId": "d7b29a24-4f27-4632-bd88-5188f6fa9809",
  "prompt": "Analyze the security posture of the REST API endpoints"
}
```

### Knowledge (RAG)

| Method | Endpoint | Description | Response |
|:---|:---|:---|:---|
| `POST` | `/api/v1/knowledge/upload` | Upload a document for semantic memory | `202 { message, fileName }` |

Upload is `multipart/form-data` with fields `file` (the document) and `userId` (UUID).

### Chat

| Method | Endpoint | Description | Response |
|:---|:---|:---|:---|
| `POST` | `/api/v1/nexus/chat` | Direct chat with orchestrator agent | `200 text` |

---

## 🚀 Getting Started

### Prerequisites

- **JDK 21** or later
- **Maven 3.9+**
- **Node.js 20+** and **npm**
- **Supabase** project with PostgreSQL and the `pgvector` extension enabled
- **Google AI API Key** (for Gemini 2.5 Flash + text-embedding-004)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/nexus-ai.git
cd nexus-ai
```

### 2. Backend Setup

```bash
cd nexus-backend
```

Create environment variables (or configure `application-local.yml`):

```bash
# Required
export GOOGLE_AI_API_KEY=your_google_ai_api_key
export SPRING_DATASOURCE_URL=jdbc:postgresql://db.xxxx.supabase.co:5432/postgres?sslmode=require
export SPRING_DATASOURCE_PASSWORD=your_supabase_db_password

# Optional
export GOOGLE_AI_MODEL_NAME=gemini-2.5-flash   # default
export GOOGLE_AI_TEMPERATURE=0.7                # default
export PORT=8081                                # default
```

Enable pgvector in your Supabase SQL editor:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Build and run:

```bash
mvn clean compile
mvn spring-boot:run
```

The backend starts on `http://localhost:8081`. The `DatabaseSeeder` will automatically create the default test user.

### 3. Frontend Setup

```bash
cd nexus-ui
npm install
```

Configure `.env`:

```env
PORT=3000
VITE_BACKEND_URL=http://localhost:8081
```

Start the dev server:

```bash
npm run dev
```

The frontend starts on `http://localhost:3000` with automatic API proxying to the backend.

### 4. Test with Postman

A Postman collection is included at `nexus-backend/nexus_postman_collection.json`. Import it and test the API endpoints using the default user ID `d7b29a24-4f27-4632-bd88-5188f6fa9809`.

---

## 🐳 Docker Deployment

The backend includes a **multi-stage Dockerfile** with a Distroless runtime image for minimal attack surface:

```dockerfile
# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Distroless Runtime
FROM gcr.io/distroless/java21-debian12
WORKDIR /app
COPY --from=build /app/target/nexus-ai-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build and run:

```bash
cd nexus-backend
docker build -t nexus-backend .
docker run -p 8081:8080 \
  -e GOOGLE_AI_API_KEY=your_key \
  -e SPRING_DATASOURCE_URL=your_jdbc_url \
  -e SPRING_DATASOURCE_PASSWORD=your_password \
  nexus-backend
```

---

## 📁 Project Structure

```
Nexus/
├── README.md                                    # This file
├── NEXUS_ACHIEVEMENT_REPORT.md                  # Milestone & achievement documentation
├── Nexus_AI_RAG_Architecture_Research.md         # RAG architecture research & design doc
│
├── nexus-backend/                               # Spring Boot Backend
│   ├── pom.xml                                  # Maven dependencies & build config
│   ├── Dockerfile                               # Multi-stage Docker build
│   ├── nexus_postman_collection.json            # Postman API testing collection
│   └── src/main/
│       ├── java/com/nexus/                      # Java source packages
│       │   ├── agent/                           # Agent interfaces & MCP server
│       │   ├── ai/                              # Autonomous agent & tool definitions
│       │   ├── api/                             # REST controllers
│       │   ├── config/                          # Spring configuration beans
│       │   ├── model/                           # JPA entities & enums
│       │   ├── repository/                      # Spring Data JPA repositories
│       │   └── service/                         # Business logic & orchestration
│       └── resources/
│           ├── application.yml                  # Main configuration
│           └── application-local.yml            # Local dev overrides
│
└── nexus-ui/                                    # React Frontend
    ├── package.json                             # npm dependencies
    ├── vite.config.js                           # Vite build & proxy config
    ├── tailwind.config.js                       # TailwindCSS theme configuration
    ├── index.html                               # HTML entry point
    ├── .env                                     # Environment variables
    └── src/
        ├── App.jsx                              # Root component with tab routing
        ├── main.jsx                             # React DOM entry
        ├── index.css                            # Global styles & glassmorphism
        ├── components/                          # Reusable UI components
        ├── pages/                               # Full-page views
        ├── hooks/                               # Custom React hooks
        ├── store/                               # Zustand state stores
        └── services/                            # API client layer
```

---

## 🗺 Roadmap

| Phase | Feature | Status |
|:---|:---|:---|
| ✅ Phase 1 | Core agent orchestration with ReAct loops | Complete |
| ✅ Phase 1 | Dynamic `@Tool` invocation & self-correcting retries | Complete |
| ✅ Phase 1 | Real-time log streaming & artifact vault | Complete |
| ✅ Phase 1 | pgvector setup & document ingestion pipeline | Complete |
| ✅ Phase 1 | Glassmorphic dashboard with Framer Motion | Complete |
| 🔲 Phase 2 | RAG-augmented prompt injection (retrieval → context → generation) | Planned |
| 🔲 Phase 2 | Hybrid search (vector similarity + BM25 full-text) | Planned |
| 🔲 Phase 2 | Cross-encoder reranking for improved retrieval precision | Planned |
| 🔲 Phase 3 | Reflection memory (self-improving agent strategies) | Planned |
| 🔲 Phase 3 | Temporal memory with time-weighted relevance | Planned |
| 🔲 Phase 3 | Knowledge graph integration (Neo4j) | Planned |
| 🔲 Phase 3 | WebSocket real-time streaming (replace polling) | Planned |
| 🔲 Phase 3 | Multi-user authentication & RLS enforcement | Planned |

---

<div align="center">

**Built with** ☕ Java 21 · ⚛ React 19 · 🧠 Gemini 2.5 Flash · 🔗 LangChain4j · 🐘 PostgreSQL + pgvector

</div>
]]>
