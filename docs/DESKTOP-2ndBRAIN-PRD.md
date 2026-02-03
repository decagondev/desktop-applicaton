# Product Requirements Document (PRD) for Second Brain Desktop Application

## 1. Overview

### 1.1 Project Purpose
This desktop application serves as a "second brain" tool, enabling users to ingest, organize, vectorize, and interact with various data sources through a chat interface powered by Groq AI. It supports Retrieval-Augmented Generation (RAG) for contextual querying, with a focus on knowledge management, note-taking, and analysis. The application builds upon the provided starter repository (Deca Dash: https://github.com/decagondev/desktop-applicaton), retaining its dashboard feature for system monitoring as an optional module. The architecture emphasizes modularity, adherence to SOLID principles (Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion), and granular components to facilitate extensibility and maintainability.

Key goals:
- Provide a secure, local-first data management system with in-memory vector storage backed by SQLite for persistence.
- Enable seamless ingestion of diverse data types (documents, web content, voice notes, GitHub repositories).
- Support intelligent querying via chat, with optional multimodal capabilities.
- Integrate external APIs (e.g., Tavily for search, Groq for LLM) configurable via settings.
- Enforce a structured Git workflow for development to ensure high-quality, testable code.

### 1.2 Target Audience
- Knowledge workers, researchers, developers, and students seeking a personal knowledge base.
- Users comfortable with desktop apps, API configurations, and basic technical concepts (e.g., vector databases, RAG).

### 1.3 High-Level Features
- **Data Ingestion**: Upload and process files (PDF, HTML, Markdown, DOCX), web URLs, voice notes, and GitHub repositories.
- **Vectorization and Storage**: Local in-memory vector database with SQLite backup, extensive metadata tracking, and classification.
- **Chat Interface**: Groq-powered conversational querying with RAG for context-aware responses.
- **Note-Taking**: Markdown editor for written notes and voice transcription with cleaning.
- **Search and Analysis**: Keyword search, web search via Tavily, and GitHub-specific vectorization (code, diffs, PRs, issues).
- **Settings**: API key management and feature toggles (e.g., multimodal RAG).
- **Dashboard**: Retained from starter for system monitoring (customizable or toggleable).
- **Modular Design**: Features as independent modules for easy addition/removal.

### 1.4 Non-Functional Requirements
- **Performance**: In-memory operations for speed; SQLite for persistence without external dependencies.
- **Security**: Store API keys securely (e.g., using Electron's safeStorage); handle data locally to avoid cloud leaks.
- **Compatibility**: Cross-platform (Windows, macOS, Linux) via Electron.
- **Scalability**: Handle up to 10,000 vector entries in-memory; graceful degradation for larger datasets.
- **Testing**: 80% code coverage; unit, integration, and E2E tests.
- **Accessibility**: Basic WCAG compliance (e.g., keyboard navigation, alt text for visuals).
- **Dependencies**: Build on starter's stack (React, TypeScript, Vite, Electron); add libraries like LangChain.js for RAG, Chroma.js or similar for vectors, Whisper.js or API for transcription.

### 1.5 Assumptions and Constraints
- Users have internet for API calls (e.g., Groq, Tavily) but core functionality (local vectors) works offline.
- No cloud vector DBs like Pinecone unless toggled (focus on local-first).
- Multimodal RAG limited to images/text initially; expand later.
- GitHub integration requires user token; no automated cloning without consent.
- Starter repo's dashboard remains as-is unless modified in future epics.

## 2. Architecture and Design Principles

### 2.1 High-Level Architecture
The application extends the starter's modular setup:
- **Electron Main Process**: Handles file I/O, API integrations, vector DB management, GitHub cloning, and IPC for secure communication.
- **Preload Script**: Exposes safe APIs (e.g., for vector queries, transcription) to renderer, maintaining context isolation.
- **Renderer Process (React)**: UI components for chat, editor, settings, and dashboard. Uses hooks for state, contexts for shared data.
- **Data Layer**: In-memory vector store (e.g., using @xenon-ai/chroma or FAISS.js bindings) synced to SQLite via periodic backups or on app close.
- **Modules**: Feature-based folders under `src/features/` (e.g., `chat/`, `ingestion/`, `notes/`, `github/`, `settings/`, `dashboard/` from starter).
- **Communication**: IPC for main-renderer interactions; Redux or Context API for UI state.

Adherence to SOLID:
- **Single Responsibility**: Each module handles one concern (e.g., ingestion module only processes uploads).
- **Open-Closed**: Interfaces for extensibility (e.g., add new file parsers without modifying core).
- **Liskov Substitution**: Subclasses (e.g., document parsers) interchangeable.
- **Interface Segregation**: Small, focused interfaces (e.g., IVectorStore vs. full DB API).
- **Dependency Inversion**: Inject dependencies (e.g., API clients) via DI.

### 2.2 Key Technologies and Libraries
- **Core Stack**: From starter (React, Vite, TS, Electron, Tailwind, Recharts).
- **AI/RAG**: Groq SDK for LLM, LangChain.js for chains/orchestration.
- **Vector DB**: In-memory with SQLite backup (e.g., SQLite-vss for vector extensions, or simple embedding storage with KNN queries).
- **Embeddings**: Use local models (e.g., via Transformers.js) or API-based (OpenAI/Groq) configurable in settings.
- **Transcription**: OpenAI Whisper API or local via whisper.cpp bindings.
- **File Parsing**: pdf.js (PDF), mammoth (DOCX), marked (Markdown), cheerio (HTML).
- **Web Search**: Tavily API client.
- **GitHub**: Octokit for API, simple-git for cloning.
- **Multimodal**: Handle images via canvas or Tesseract for OCR; vectorize with CLIP-like embeddings.
- **Storage**: SQLite via better-sqlite3; repos in `~/AppData/SecondBrain/repos/` (user's app data dir).
- **Metadata**: JSON blobs in DB with fields like source_type, timestamp, tags, classification (auto via LLM), original_url/file_path.

### 2.3 Data Flow
1. User uploads/inputs data → Ingestion module parses, embeds, classifies, stores with metadata.
2. Vector DB syncs in-memory to SQLite.
3. Chat query → RAG retrieves relevant vectors → Groq generates response.
4. GitHub: Clone repo, fetch issues/PRs/diffs via API, vectorize contents.
5. Voice/Notes: Record → Transcribe/clean → Vectorize as Markdown.

## 3. Git Workflow Enforcement

To ensure structured development:
- **Branching Model**: Main branch for production-ready code. Feature branches named `feature/<epic-id>-<story-id>` (e.g., `feature/E1-US1-chat-interface`).
- **Commit Guidelines**: Atomic commits with messages like `<type>: <description>` (e.g., `feat: add vector store interface`). Use Conventional Commits.
- **PR Process**:
  1. Create feature branch from main.
  2. Implement feature/sub-tasks.
  3. Write unit/integration tests (Vitest).
  4. Run tests (`npm run test`), lint (`npm run lint`), ensure 100% pass.
  5. Commit and push.
  6. Open PR to main; require at least one approval (self or peer).
  7. Merge via squash/rebase only if tests pass in CI (GitHub Actions from starter).
- **Epics/User Stories**: Track in GitHub Issues/Projects. Link PRs to stories.
- **Sub-Tasks**: Break stories into checklists in issues.
- **Tools**: GitHub Actions for CI/CD, including build/test on PRs.

## 4. Epics, User Stories, and Breakdown

The PRD is broken into Epics (high-level themes), User Stories (functional requirements), Sub-Tasks (implementation steps), and associated PRs/Branches. Each story includes acceptance criteria, estimates (in story points), and dependencies.

### Epic 1: Core Infrastructure and Setup (E1)
Focus: Extend starter repo with base modules, vector DB, and settings.

- **User Story 1.1 (US1.1)**: As a developer, I want to set up the vector database so that data can be stored locally. (Points: 8)
  - Acceptance: In-memory store with SQLite backup; CRUD operations; metadata support.
  - Sub-Tasks:
    - Integrate SQLite-vss or similar.
    - Create VectorStore interface (SOLID).
    - Implement backup on app events (close, periodic).
    - Test: Insert/retrieve vectors with metadata.
  - Branch/PR: `feature/E1-US1.1-vector-db`

- **User Story 1.2 (US1.2)**: As a user, I want a settings page to configure API keys and toggles. (Points: 5)
  - Acceptance: Secure storage; fields for Groq, OpenAI, Anthropic, Tavily, GitHub, etc.; toggle for multimodal.
  - Sub-Tasks:
    - Add `src/features/settings/` module.
    - Use Electron safeStorage for keys.
    - React form with validation.
    - Test: Save/load keys; toggle effects.
  - Branch/PR: `feature/E1-US1.2-settings-page`
  - Dependencies: US1.1 (for any DB configs).

- **User Story 1.3 (US1.3)**: As a developer, I want modular architecture extensions. (Points: 3)
  - Acceptance: Add new feature folders; update IPC/preload for new APIs.
  - Sub-Tasks: Mirror starter's dashboard structure for new modules.
  - Branch/PR: `feature/E1-US1.3-modular-setup`

### Epic 2: Data Ingestion and Vectorization (E2)
Focus: Handle uploads, web searches, classification, and metadata.

- **User Story 2.1 (US2.1)**: As a user, I want to upload and vectorize documents (PDF, HTML, MD, DOCX). (Points: 8)
  - Acceptance: Parse content; generate embeddings; store with metadata (type, path, timestamp, classification via LLM).
  - Sub-Tasks:
    - Implement parsers in `src/features/ingestion/parsers/`.
    - Embed via configurable API (Groq/OpenAI).
    - Classify (e.g., topics) using LLM prompt.
    - UI: Drag-drop uploader in sidebar.
    - Test: End-to-end upload/query.
  - Branch/PR: `feature/E2-US2.1-document-upload`

- **User Story 2.2 (US2.2)**: As a user, I want to ingest web URLs and search via Tavily. (Points: 7)
  - Acceptance: Fetch content; vectorize; integrate Tavily for queries.
  - Sub-Tasks:
    - Add Tavily client in main process.
    - Parse HTML; store as chunks with metadata.
    - UI: Input field for URLs/searches.
    - Test: Mock API responses.
  - Branch/PR: `feature/E2-US2.2-web-ingestion`
  - Dependencies: US1.2 (API key).

- **User Story 2.3 (US2.3)**: As a user, I want GitHub repo vectorization. (Points: 10)
  - Acceptance: Clone repo to `repos/`; fetch/vectorize code, issues, PRs, diffs; support keyword search.
  - Sub-Tasks:
    - Use Octokit for API; simple-git for clone.
    - Parse code files; embed descriptions/diffs.
    - Metadata: repo_url, commit_hash, etc.
    - UI: Add repo URL form; view cloned repos.
    - Test: Integration with mock GitHub.
  - Branch/PR: `feature/E2-US2.3-github-ingestion`
  - Dependencies: US1.2 (GitHub token).

- **User Story 2.4 (US2.4)**: As a developer, I want multimodal support. (Points: 6)
  - Acceptance: Vectorize images (if toggle on); use CLIP embeddings.
  - Sub-Tasks: Add image parser; conditional logic in ingestion.
  - Branch/PR: `feature/E2-US2.4-multimodal`
  - Dependencies: US1.2 (toggle).

### Epic 3: Interaction and Querying (E3)
Focus: Chat, notes, and analysis.

- **User Story 3.1 (US3.1)**: As a user, I want a chat interface with RAG. (Points: 8)
  - Acceptance: Groq-powered responses; retrieve from vectors; history persistence.
  - Sub-Tasks:
    - Add `src/features/chat/` with React components.
    - LangChain for RAG chain.
    - UI: Sidebar for data sources; chat window.
    - Test: Mock queries/responses.
  - Branch/PR: `feature/E3-US3.1-chat-interface`
  - Dependencies: E1, E2.

- **User Story 3.2 (US3.2)**: As a user, I want to take and vectorize voice notes. (Points: 7)
  - Acceptance: Record audio; transcribe/clean (remove fillers like "um"); save as MD and vectorize.
  - Sub-Tasks:
    - Use MediaRecorder API; transcribe via OpenAI/Anthropic.
    - Cleaning prompt: LLM to refine text.
    - UI: Button in notes page.
    - Test: Audio mocks.
  - Branch/PR: `feature/E3-US3.2-voice-notes`
  - Dependencies: US1.2 (API keys).

- **User Story 3.3 (US3.3)**: As a user, I want a Markdown editor for notes. (Points: 5)
  - Acceptance: Edit/create MD files; auto-vectorize on save.
  - Sub-Tasks:
    - Integrate React-Markdown or Monaco editor.
    - Add `src/features/notes/` module.
    - UI: Dedicated page with preview.
    - Test: Edit/save cycle.
  - Branch/PR: `feature/E3-US3.3-markdown-editor`
  - Dependencies: US2.1 (MD parsing).

### Epic 4: Enhancements and Integrations (E4)
Focus: Dashboard retention, advanced features.

- **User Story 4.1 (US4.1)**: As a user, I want the existing dashboard feature. (Points: 2)
  - Acceptance: Integrate as toggleable module; no changes initially.
  - Sub-Tasks: Move to optional route in settings.
  - Branch/PR: `feature/E4-US4.1-dashboard-integration`

- **User Story 4.2 (US4.2)**: As a developer, I want full testing and deployment. (Points: 5)
  - Acceptance: Update CI/CD; build scripts for releases.
  - Sub-Tasks: Extend starter's workflows.
  - Branch/PR: `feature/E4-US4.2-testing-deployment`

## 5. Roadmap and Prioritization
- Phase 1: E1 (Setup) → 2 weeks.
- Phase 2: E2 (Ingestion) → 3 weeks.
- Phase 3: E3 (Interaction) → 3 weeks.
- Phase 4: E4 (Enhancements) + Testing → 2 weeks.
- Total: ~10 weeks for MVP.
- Risks: API rate limits; local embedding performance → Mitigate with caching/offline fallbacks.
- Metrics: User satisfaction via feedback; query accuracy >85%.

This PRD provides a granular, modular plan. Development starts with cloning the starter, applying the git workflow, and implementing epics sequentially.
