---
applyTo: "application/frontend/**"
description: "React 19 + Vite SPA best practices for Pleey frontend"
---

# React Frontend Best Practices — Pleey

> **Architecture, layers, dependency rules, DI, styling, testing, and coding standards** are documented in the project docs. Do not duplicate — refer to:
>
> - `docs/technical/architecture/frontend.md` — layers, Inversify DI, facades, routing, GraphQL codegen, Biome boundaries
> - `docs/technical/architecture/index.md` — cross-cutting architecture, ports & adapters, error handling
> - `docs/technical/development/frontend.md` — commands, lint pipeline, testing conventions, component organization, styling rules, performance basics
> - `docs/technical/development/index.md` — naming conventions, commit standards, i18n, dead code policy

This file adds **React 19.2 patterns and performance optimization rules** not covered by the project docs.

---

## React 19 Modern Patterns

### Ref as Prop (no forwardRef)

```tsx
function CustomInput({
  placeholder,
  ref,
}: {
  placeholder?: string;
  ref?: React.Ref<HTMLInputElement>;
}) {
  return <input ref={ref} placeholder={placeholder} />;
}
```

### Context Without Provider

```tsx
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function App() {
  return (
    <ThemeContext value={themeValue}>
      <Content />
    </ThemeContext>
  );
}
```

### use() Hook for Promises

```tsx
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);
  return <div>{user.name}</div>;
}
```

### useEffectEvent for Stable Callbacks

```tsx
const onMessage = useEffectEvent((message: string) => {
  showNotification(message, theme); // accesses latest theme without dependency
});

useEffect(() => {
  connection.on("message", onMessage);
  return () => connection.off("message", onMessage);
}, [roomId]); // theme not in dependencies
```

### Activity Component for Show/Hide

```tsx
import { Activity } from "react";

<Activity mode={isVisible ? "visible" : "hidden"}>
  <ExpensivePanel />
</Activity>;
```

### Ref Callback Cleanup

```tsx
const nodeRef = (element: HTMLElement | null) => {
  if (element) {
    const observer = new IntersectionObserver(/* ... */);
    observer.observe(element);
    return () => observer.disconnect(); // cleanup on unmount
  }
};
```

### Form Handling (React 19)

- Use `@tanstack/react-form` for form state
- Use `useFormStatus` for submission loading states
- Use `useOptimistic` for optimistic UI updates during async operations
- Use `useActionState` for managing action state and form submissions

---

## 1. Eliminating Waterfalls — CRITICAL

### 1.1 Check Cheap Conditions Before Async Work

```tsx
// WRONG
const flag = await getFlag();
if (flag && cheapCondition) {
  /* ... */
}

// RIGHT
if (cheapCondition) {
  const flag = await getFlag();
  if (flag) {
    /* ... */
  }
}
```

### 1.2 Defer Await Until Needed

Move `await` into the branch that uses it. Early-return branches skip the cost.

```tsx
async function handleRequest(userId: string, skip: boolean) {
  if (skip) return { skipped: true };
  const data = await fetchData(userId);
  return processData(data);
}
```

### 1.3 Promise.all() for Independent Operations

```tsx
// WRONG: sequential
const user = await fetchUser();
const posts = await fetchPosts();

// RIGHT: parallel
const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);
```

### 1.4 Dependency-Based Parallelization

```tsx
const userPromise = fetchUser();
const profilePromise = userPromise.then((user) => fetchProfile(user.id));
const [user, config, profile] = await Promise.all([
  userPromise,
  fetchConfig(),
  profilePromise,
]);
```

---

## 2. Bundle Size Optimization — CRITICAL

### 2.1 Avoid Barrel File Imports

Import directly from source files. Barrel files force bundlers to load thousands of unused modules.

```tsx
// WRONG (loads entire library)
import { IconCheck, IconX } from "@tabler/icons-react";

// RIGHT (direct imports for non-Next.js projects)
import IconCheck from "@tabler/icons-react/dist/esm/icons/IconCheck";
```

> **Note:** Vite tree-shakes well for most libraries, but `@tabler/icons-react` and `@mantine/core` benefit from direct imports or `optimizeDeps` config.

### 2.2 Dynamic Imports for Heavy Components

```tsx
const MonacoEditor = lazy(() =>
  import("./monaco-editor").then((m) => ({ default: m.MonacoEditor })),
);

function CodePanel({ code }: { code: string }) {
  return (
    <Suspense fallback={<Skeleton />}>
      <MonacoEditor value={code} />
    </Suspense>
  );
}
```

### 2.3 Prefer Statically Analyzable Paths

Use explicit maps so Vite/Rollup can analyze imports at build time.

```tsx
// WRONG
const Page = await import(PAGE_MODULES[pageName]);

// RIGHT
const PAGE_MODULES = {
  home: () => import("./pages/home"),
  settings: () => import("./pages/settings"),
} as const;
const Page = await PAGE_MODULES[pageName]();
```

### 2.4 Preload Based on User Intent

```tsx
function EditorButton({ onClick }: { onClick: () => void }) {
  const preload = () => void import("./monaco-editor");
  return (
    <button onMouseEnter={preload} onFocus={preload} onClick={onClick}>
      Open Editor
    </button>
  );
}
```

---

## 3. Apollo Client Data Fetching — HIGH

### 3.1 Prefer useQuery/useSuspenseQuery Over Manual Fetch

Apollo Client deduplicates and caches automatically.

```tsx
const { data, loading } = useQuery(GET_USERS);
const { data } = useSuspenseQuery(GET_USERS);
```

### 3.2 Optimistic Updates for Mutations

```tsx
const [updateTodo] = useMutation(UPDATE_TODO, {
  optimisticResponse: {
    updateTodo: { id, completed: true, __typename: "Todo" },
  },
});
```

### 3.3 Deduplicate Global Event Listeners

Use a shared hook or module-level Map to avoid N instances = N listeners.

---

## 4. Re-render Optimization — MEDIUM

### 4.1 Calculate Derived State During Rendering

```tsx
// WRONG: redundant state + effect
const [fullName, setFullName] = useState("");
useEffect(() => setFullName(first + " " + last), [first, last]);

// RIGHT: derive during render
const fullName = first + " " + last;
```

### 4.2 Don't Define Components Inside Components

Defining a component inside another remounts it every render, destroying state.

### 4.3 Use Functional setState Updates

```tsx
// WRONG: stale closure risk
setItems([...items, newItem]);

// RIGHT: always latest state
setItems((curr) => [...curr, newItem]);
```

### 4.4 Use Lazy State Initialization

```tsx
// WRONG: runs on every render
const [settings] = useState(
  JSON.parse(localStorage.getItem("settings") || "{}"),
);

// RIGHT: runs only once
const [settings] = useState(() =>
  JSON.parse(localStorage.getItem("settings") || "{}"),
);
```

### 4.5 Narrow Effect Dependencies

```tsx
// WRONG: re-runs on any user field change
useEffect(() => {
  console.log(user.id);
}, [user]);

// RIGHT: re-runs only when id changes
useEffect(() => {
  console.log(user.id);
}, [user.id]);
```

### 4.6 Split Combined Hook Computations

Split independent memos/effects so they don't re-run when unrelated deps change.

### 4.7 Use Transitions for Non-Urgent Updates

```tsx
const handler = () => startTransition(() => setScrollY(window.scrollY));
```

### 4.8 useDeferredValue for Expensive Derived Renders

```tsx
const deferredQuery = useDeferredValue(query);
const filtered = useMemo(
  () => items.filter((i) => fuzzyMatch(i, deferredQuery)),
  [items, deferredQuery],
);
```

### 4.9 useRef for Transient Values

Store values that change frequently but don't need re-renders (mouse position, timers) in refs.

### 4.10 Do Not Wrap Simple Primitive Expressions in useMemo

```tsx
// WRONG
const isLoading = useMemo(
  () => user.isLoading || notifications.isLoading,
  [user.isLoading, notifications.isLoading],
);

// RIGHT
const isLoading = user.isLoading || notifications.isLoading;
```

### 4.11 Extract Default Non-Primitive Parameter Value to Constant

```tsx
const NOOP = () => {};
const UserAvatar = memo(function UserAvatar({
  onClick = NOOP,
}: {
  onClick?: () => void;
}) {
  // ...
});
```

---

## 5. Rendering Performance — MEDIUM

### 5.1 CSS content-visibility for Long Lists

```css
.message-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}
```

### 5.2 Hoist Static JSX Elements

Extract static JSX outside components to avoid re-creation on every render. Especially helpful for large SVG nodes.

### 5.3 Use Explicit Conditional Rendering

```tsx
// WRONG: renders "0" when count is 0
{
  count && <Badge>{count}</Badge>;
}

// RIGHT
{
  count > 0 ? <Badge>{count}</Badge> : null;
}
```

### 5.4 Animate SVG Wrapper Instead of SVG Element

Wrap SVG in `<div>` and animate the wrapper for hardware acceleration.

---

## 6. JavaScript Performance — LOW-MEDIUM

### 6.1 Build Index Maps for Repeated Lookups

```tsx
const userById = new Map(users.map((u) => [u.id, u]));
```

### 6.2 Use Set/Map for O(1) Lookups

```tsx
const allowedIds = new Set(["a", "b", "c"]);
items.filter((item) => allowedIds.has(item.id));
```

### 6.3 Use toSorted() Instead of sort()

`.sort()` mutates the array. Use `.toSorted()` to prevent mutation bugs with React state. Same for `.toReversed()`, `.toSpliced()`, `.with()`.

### 6.4 Use flatMap to Map and Filter in One Pass

```tsx
const names = users.flatMap((u) => (u.isActive ? [u.name] : []));
```

### 6.5 Early Return from Functions

Return immediately when the result is determined. Skip unnecessary processing.

### 6.6 Hoist regular expression Creation

Don't create regular expression inside render. Hoist to module scope or memoize.

### 6.7 Avoid Layout Thrashing

Batch DOM writes, then read. Prefer CSS classes over inline style mutations.

### 6.8 Defer Non-Critical Work with requestIdleCallback

```tsx
requestIdleCallback(() => analytics.track("page_view"));
```

---

## 7. Advanced Patterns

### 7.1 Do Not Put Effect Events in Dependency Arrays

`useEffectEvent` functions change identity every render. Keep reactive values as dependencies, call the effect event inside.

### 7.2 Initialize App Once, Not Per Mount

```tsx
let didInit = false;
function App() {
  useEffect(() => {
    if (didInit) return;
    didInit = true;
    loadFromStorage();
  }, []);
}
```

### 7.3 Put Interaction Logic in Event Handlers

If a side effect is triggered by a user action, run it in the handler — not in a state + effect combo.

---

## References

- [React 19 docs](https://react.dev)
- [Vercel React Best Practices (40+ rules)](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)
- [Apollo Client docs](https://www.apollographql.com/docs/react)
- [Mantine docs](https://mantine.dev)
