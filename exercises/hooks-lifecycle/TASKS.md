# Hooks lifecycle exercises

Do these in the existing Vite app. Use `src/App.tsx` as the experiment surface. Run `pnpm dev`, keep DevTools Console open, and keep `<StrictMode>` enabled in `src/main.tsx` unless a task says otherwise.

For every task:

1. Predict the exact log or visual result before running it.
2. Run it.
3. Write the observed result under the task.
4. Explain any difference using render → commit → paint.

## 1. Build the lifecycle probe

Add one component with:

- A log in the component body.
- One `useLayoutEffect` with setup and cleanup logs.
- One `useEffect` with setup and cleanup logs.
- A dependency controlled by a button.
- A parent button that mounts and unmounts the component.

Test these transitions:

1. Initial mount in Strict Mode.
2. Dependency change.
3. Unmount.
4. Mount without Strict Mode.

Acceptance checks:

- You can explain the extra development setup → cleanup → setup cycle.
- On dependency change, cleanup logs the old dependency before setup logs the new one.
- On unmount, each active Effect cleans up once.

## 2. Create and remove a visible layout flicker

Render a box whose position depends on its measured width:

1. Start with position `0`.
2. Read `getBoundingClientRect().width`.
3. Set state to center the box using the measured width.

First measure in `useEffect`. In DevTools Performance, enable CPU throttling and reload. Record whether the wrong position paints first.

Move only the measurement to `useLayoutEffect`. Repeat the recording.

Acceptance checks:

- The `useEffect` version may show an intermediate position.
- The `useLayoutEffect` version finishes its measurement update before paint.
- You can explain why the second version blocks paint and why it should be used only for visual pre-paint work.

## 3. Define a DOM ownership boundary with `<canvas>`

Render a `<canvas ref={canvasRef}>` and a sibling counter:

1. Draw into the canvas from an Effect.
2. Increment only the sibling counter.
3. Confirm whether the drawing survives.
4. Change the canvas `key` and confirm what happens.
5. Add Effect cleanup that clears or disposes any external resources.

Acceptance checks:

- A sibling render does not erase pixels React did not overwrite.
- Changing `key` replaces the canvas DOM node, so the old drawing disappears.
- You can name which part React owns (the canvas node and props) and which part your imperative code owns (the drawing context state).

## 4. Prove subscription cleanup

Create an Effect that subscribes to `window.resize` and logs the current `label` prop.

Test:

1. Change `label`.
2. Resize the window.
3. Unmount and resize again.
4. Temporarily remove cleanup and repeat.

Use the same function reference for `addEventListener` and `removeEventListener`.

Acceptance checks:

- With `[label]`, the old listener is removed before the new one is added.
- No log appears after unmount.
- Without cleanup, duplicate and stale listeners remain.

## 5. Separate reactive synchronization from current data

Create a connection Effect whose lifetime depends on `roomId`. It also logs the current `theme` when a simulated “connected” event fires.

First include both `[roomId, theme]`. Observe that changing the theme reconnects.

Then move the event-only logic into `useEffectEvent` and leave the Effect dependent on `[roomId]`.

Acceptance checks:

- Changing `roomId` reconnects.
- Changing `theme` does not reconnect.
- The event still reads the latest theme.
- You do not use `useEffectEvent` to hide a value that should restart synchronization.

Primary source: [React: Separating Events from Effects](https://react.dev/learn/separating-events-from-effects)

## 6. Optional: expose a small imperative API

Build a `SearchInput` that keeps its DOM input private and exposes only:

- `focus()`
- `selectAll()`

Use `useImperativeHandle` rather than passing the raw DOM node to the parent.

Acceptance checks:

- The parent can focus and select the input.
- The parent cannot directly replace the input value through the exposed handle.
- You can explain why this is a component API boundary, not a lifecycle mechanism.

Primary source: [React: `useImperativeHandle`](https://react.dev/reference/react/useImperativeHandle)

## Do not use `useInsertionEffect` for an app task

Read its reference and explain its purpose in one sentence. It exists for CSS-in-JS library authors who must insert styles before layout Effects. Application components should normally use `useEffect` or `useLayoutEffect`.

Primary source: [React: `useInsertionEffect`](https://react.dev/reference/react/useInsertionEffect)
