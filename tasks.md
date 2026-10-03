- Instrument a component to log the order of: render → commit → useLayoutEffect → paint (via requestAnimationFrame) → useEffect. Confirm it matches the model, then break it on purpose.

- Render a 5k-row list unvirtualized, profile it in DevTools Performance tab, note the layout/paint cost, then virtualize and diff the profile.

- Mount a raw <canvas> inside a component via a ref, draw something imperatively, then force a re-render from a sibling state change. Check whether the canvas content survives — and explain why in terms of what React does and doesn't own.

- Deliberately trigger forced synchronous layout (write in a loop, read offsetHeight between writes) and find the purple "Layout" bars in the Performance panel; then fix it by batching all reads before all writes.

- Compare render counts for the same setState call fired from inside a React event handler vs. a native setTimeout/promise callback, pre-18 semantics vs. 18.
