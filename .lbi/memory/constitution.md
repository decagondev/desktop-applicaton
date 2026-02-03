---
description: "Second Brain Desktop Application development principles and governance"
version: "1.0.0"
ratification_date: "2026-02-03"
last_amended: "2026-02-03"
---

# Second Brain Desktop Application Constitution

## Project Identity

**Name**: Second Brain Desktop Application

**Mission**: Provide a secure, local-first knowledge management system that enables users to ingest, organize, vectorize, and interact with diverse data sources through an AI-powered chat interface.

**Values**:
- **Privacy-First**: All data stored locally; no cloud dependencies for core functionality
- **Modularity**: Features are independent, composable modules
- **Type Safety**: Strict TypeScript throughout the codebase
- **Test-Driven Quality**: Comprehensive testing before deployment
- **Developer Experience**: Clear patterns, documentation, and tooling

---

## Core Principles

### Principle 1: SOLID Architecture

**Statement**: All code must adhere to SOLID principles for maintainability and extensibility.

**Rationale**: SOLID principles ensure the codebase remains flexible, testable, and easy to modify as requirements evolve.

**Enforcement**:
- **Single Responsibility (SRP)**: Each class/module has one reason to change. Maximum 300 lines per file.
- **Open/Closed (OCP)**: Use factory patterns and interfaces for extensibility without modification.
- **Liskov Substitution (LSP)**: Subtypes must be interchangeable with their base types.
- **Interface Segregation (ISP)**: Small, focused interfaces (e.g., `IDocumentParser`, `IVectorStore`).
- **Dependency Inversion (DIP)**: Depend on abstractions via React Context; inject services, don't import directly.

---

### Principle 2: Feature-Based Modular Structure

**Statement**: All features must follow the established module pattern under `src/features/`.

**Rationale**: Consistent structure enables predictable navigation, testing, and maintenance.

**Enforcement**: Each feature module must contain:

```
src/features/{feature-name}/
├── components/
│   └── __tests__/
├── hooks/
│   └── __tests__/
├── context/           (if stateful)
├── services/          (if applicable)
│   └── __tests__/
├── types/
│   └── {feature-name}.types.ts
├── constants/         (optional)
│   └── __tests__/
└── index.ts           (barrel export)
```

**Validation**: Run `/lbi.validate-architecture` to check compliance.

---

### Principle 3: Type Safety First

**Statement**: All code must pass TypeScript strict mode with zero errors.

**Rationale**: Static typing catches bugs at compile time and serves as living documentation.

**Enforcement**:
- TypeScript `strict: true` in `tsconfig.json`
- No `any` types unless explicitly justified with a comment
- All function parameters and return types must be typed
- Interfaces prefixed with `I` (e.g., `IMemoryStats`, `IVectorEntry`)
- Export types from feature `index.ts` barrel files

---

### Principle 4: Comprehensive Documentation

**Statement**: All public APIs must have JSDoc documentation.

**Rationale**: Documentation enables team collaboration and AI-assisted development.

**Enforcement**:
- JSDoc required for all exported functions, classes, and interfaces
- Include `@param`, `@returns`, `@throws`, `@example` where applicable
- Component props interfaces must have field-level JSDoc
- Update documentation when modifying code

---

### Principle 5: Electron Security Best Practices

**Statement**: All Electron code must follow security best practices.

**Rationale**: Desktop apps have system-level access; security vulnerabilities can be severe.

**Enforcement**:
- `nodeIntegration: false` always
- `contextIsolation: true` always
- All IPC handlers validate input
- Use `safeStorage` for sensitive data (API keys)
- CSP headers configured for production
- No `eval()` or dynamic code execution

---

## Quality Standards

### Testing

- **Framework**: Vitest for unit and integration tests
- **Coverage Target**: Minimum 80% code coverage for new code
- **Required Types**:
  - Unit tests for all services, hooks, and utilities
  - Component tests for React components
  - Integration tests for IPC handlers
- **Test Location**: `__tests__/` subfolder adjacent to source files
- **Naming**: `{filename}.test.ts` or `{filename}.test.tsx`

### Code Style

- **Formatter**: Prettier with project configuration
- **Linter**: ESLint with TypeScript rules
- **Type Checker**: TypeScript with strict mode
- **Pre-commit**: Lint, format, and type-check must pass

### Code Review

- All changes require self-review or peer review
- CI must pass before merge
- Documentation must be updated with code changes

---

## Git Workflow

### Branching Model

- **Main Branch**: `main` - production-ready code only
- **Feature Branches**: `feature/E{epic}-US{story}-{slug}` (e.g., `feature/E1-US1.1-vector-db`)
- **Fix Branches**: `fix/{description}` for bug fixes
- **Chore Branches**: `chore/{description}` for maintenance

### Commit Guidelines

- Use Conventional Commits format: `<type>: <description>`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Atomic commits: one logical change per commit
- Reference feature in commits when applicable

### PR Process

1. Create feature branch from `main`
2. Follow LBI workflow: `/lbi.request` → `/lbi.specify` → `/lbi.design` → `/lbi.plan` → `/lbi.implement`
3. Write tests (80% coverage minimum)
4. Run `npm run test` and `npm run lint` - must pass
5. Self-review or peer review
6. Merge via squash or rebase

---

## LBI Workflow

Follow the Spec-Driven Development workflow for all features:

```
/lbi.request → /lbi.specify → /lbi.design → /lbi.plan → /lbi.implement → /lbi.tests → /lbi.review → /lbi.push
```

**Artifacts Location**: `.lbi/specs/{feature-slug}/`
- `request.md` - Feature request
- `spec.md` - Technical specification
- `design.md` - Design document
- `plan.md` - Implementation plan

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Language | TypeScript | 5.x | Primary language |
| UI Framework | React | 18.x | User interface |
| Build Tool | Vite | 5.x | Development and bundling |
| Desktop Framework | Electron | 40+ | Cross-platform desktop |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Charts | Recharts | 2.x | Data visualization |
| Testing | Vitest | 1.x | Unit and integration tests |
| E2E Testing | Playwright | 1.x | End-to-end tests |
| Vector DB | SQLite-vss/FAISS.js | - | Vector storage |
| AI/RAG | LangChain.js | - | LLM orchestration |
| LLM | Groq SDK | - | Language model API |

---

## Governance

### Amendment Process

1. Propose changes via pull request to this file
2. All stakeholders must review
3. Unanimous consent required for principle changes
4. Simple majority for clarifications and additions

### Version Policy

- **MAJOR**: Principle additions, removals, or fundamental changes
- **MINOR**: New guidelines, expanded sections, or new standards
- **PATCH**: Clarifications, typo fixes, and formatting

### Compliance Verification

- Run `/lbi.validate-constitution` to check compliance
- CI pipeline enforces lint, type-check, and test requirements
- Architecture validation via `/lbi.validate-architecture`

---

## Exceptions

Document any exceptions to these rules in the relevant spec file with justification. Exceptions require review and must be temporary with a plan to resolve.
