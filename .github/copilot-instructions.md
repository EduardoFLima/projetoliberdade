# AI Rules for projetoliberdade

Business website from Projeto Liberdade

## FRONTEND

### Guidelines for REACT

#### REACT_CODING_STANDARDS

- Use functional components with hooks instead of class components
- Implement React.memo() for expensive components that render often with the same props
- Utilize React.lazy() and Suspense for code-splitting and performance optimization
- Use the useCallback hook for event handlers passed to child components to prevent unnecessary re-renders
- Prefer useMemo for expensive calculations to avoid recomputation on every render
- Implement useId() for generating unique IDs for accessibility attributes
- Use the new use hook for data fetching in React 19+ projects
- Consider using the new useOptimistic hook for optimistic UI updates in forms
- Use useTransition for non-urgent state updates to keep the UI responsive

#### REACT_QUERY

- Use TanStack Query (formerly React Query) with appropriate staleTime and gcTime based on data freshness requirements
- Implement the useInfiniteQuery hook for pagination and infinite scrolling
- Use optimistic updates for mutations to make the UI feel more responsive
- Leverage queryClient.setQueryDefaults to establish consistent settings for query categories
- Use suspense mode with <Suspense> boundaries for a more declarative data fetching approach
- Implement retry logic with custom backoff algorithms for transient network issues
- Use the select option to transform and extract specific data from query results
- Implement mutations with onMutate, onError, and onSettled for robust error handling
- Use Query Keys structuring pattern ([entity, params]) for better organization and automatic refetching
- Implement query invalidation strategies to keep data fresh after mutations

## DEVOPS

### Guidelines for CI_CD

#### GITHUB_ACTIONS

- Check if `package.json` exists in project root and summarize key scripts
- Check if `.nvmrc` exists in project root
- Check if `.env.example` exists in project root to identify key `env:` variables
- Use `master` branch
- Always use `env:` variables and secrets attached to jobs instead of global workflows
- Always use `npm ci` for Node-based dependency setup
- Extract common steps into composite actions in separate files

## CODING_PRACTICES

### Guidelines for STATIC_ANALYSIS

#### ESLINT

- Configure project-specific rules in eslint.config.js to enforce consistent coding standards
- Use eslint-config-airbnb as a foundation
- Configure integration with Prettier to avoid rule conflicts for code formatting
- Use the --fix flag in CI/CD pipelines to automatically correct fixable issues
- Implement staged linting with husky and lint-staged to prevent committing non-compliant code

## TESTING

### Guidelines for UNIT

#### JEST

- Use Jest with TypeScript for type checking in tests
- Implement Testing Library for component testing instead of enzyme
- Use snapshot testing sparingly and only for stable UI components
- Leverage mock functions and spies for isolating units of code
- Implement test setup and teardown with beforeEach and afterEach
- Use describe blocks for organizing related tests
- Leverage expect assertions with specific matchers
- Implement code coverage reporting with meaningful targets
- Use mockResolvedValue and mockRejectedValue for async testing
- Leverage fake timers for testing time-dependent functionality


### Guidelines for E2E

#### PLAYWRIGHT

- Initialize configuration only with Chromium/Desktop Chrome browser
- Use browser contexts for isolating test environments
- Implement the Page Object Model for maintainable tests
- Use locators for resilient element selection
- Implement visual comparison with expect(page).toHaveScreenshot()
- Use the codegen tool for test recording
- Leverage trace viewer for debugging test failures
- Implement test hooks for setup and teardown
- Use expect assertions with specific matchers
- Leverage parallel execution for faster test runs