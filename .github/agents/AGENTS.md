---
name: Node.js backend
description: Describe what this custom agent does and when to use it.
argument-hint: The inputs this agent expects, e.g., "a task to implement" or "a question to answer".
# tools: ['vscode', 'execute', 'read', 'agent', 'edit', 'search', 'web', 'todo'] # specify the tools this agent can use. If not set, all enabled tools are allowed.
---

# Copilot Instructions — Node.js Backend

You are working in a Node.js backend repository. Your job is to make small, correct, maintainable changes that follow the existing codebase conventions.

## Core Goals
- Prefer TypeScript for all new backend code.
- Prefer Jest for testing.
- Optimize for code quality, correctness, readability, and performance.
- Keep changes minimal, reviewable, and aligned with the existing architecture.
- Prefer mature, stable, well-maintained dependencies only.
- Avoid unnecessary, novel, experimental, or trendy technologies.

## Technology Preferences
- Prefer Node.js built-in features before adding dependencies.
- Prefer the built-in `fetch` API over Axios or other HTTP clients unless there is a strong, documented reason not to.
- Prefer standard library APIs for HTTP, URL parsing, crypto, streams, timers, and filesystem operations when they are sufficient.
- Do not introduce a dependency if the same result can be achieved cleanly with native Node.js features.

## Dependency Policy
- Only add a new dependency when there is a clear need.
- When proposing a new dependency, prefer:
  - widely adopted packages,
  - active maintenance,
  - recent releases,
  - good TypeScript support,
  - a clear security posture,
  - minimal transitive dependency bloat.
- Avoid stale, unmaintained, or niche packages unless explicitly requested.
- Avoid replacing stable built-in behavior with a package just for convenience.

## Testing Requirements
- Use Jest for unit and integration tests unless the repository already uses a different approved pattern.
- Write or update tests for every meaningful behavior change.
- Prefer deterministic tests that do not depend on network access, clocks, or shared state.
- Mock external services and HTTP calls.
- Cover edge cases, error paths, and success paths.
- Keep tests fast and easy to understand.

## Code Quality Rules
- Follow existing linting, formatting, naming, and folder conventions.
- Prefer simple, explicit code over clever abstractions.
- Avoid premature optimization, but do consider algorithmic efficiency and unnecessary allocations in hot paths.
- Prefer small, composable functions with clear responsibilities.
- Preserve backward compatibility unless the task explicitly requires a breaking change.
- Do not refactor unrelated code.

## API and HTTP Rules
- Prefer the built-in `fetch` API for outbound HTTP requests.
- Always handle timeouts, non-2xx responses, malformed payloads, and network failures explicitly.
- Validate request and response shapes where appropriate.
- Avoid Axios, request wrappers, or other HTTP clients unless there is a compelling reason and the tradeoff is explained.

## TypeScript Rules
- Use strict typing.
- Avoid `any` unless absolutely necessary and justified.
- Prefer well-defined interfaces, discriminated unions, and narrow types.
- Keep type assertions to a minimum.
- Make nullability and optional values explicit.

## Work Style
- Make the smallest change that solves the problem.
- If requirements are unclear, ask before making broad changes.
- If the task can be solved with existing code, reuse it rather than inventing new abstractions.
- Do not introduce new patterns unless they improve the codebase clearly.

## Validation
Before finishing a change:
- Ensure tests are added or updated.
- Ensure linting and formatting expectations are satisfied.
- Ensure the solution is consistent with the repository’s architecture.
- Ensure the final code is easy to maintain and explain.

## Default Approach
When in doubt:
1. Prefer built-in Node.js capabilities.
2. Prefer existing codebase patterns.
3. Prefer Jest tests.
4. Prefer stable dependencies over new ones.
5. Prefer clarity over cleverness.