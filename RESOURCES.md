# React and DOM Resources

## Knowledge

- [MDN: Document Object Model](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
  Defines the DOM as a browser API and explains documents, nodes, and JavaScript access. Use for: browser-side fundamentals.
- [MDN: DOM scripting introduction](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting)
  Covers inspecting, creating, changing, and removing DOM nodes. Use for: direct DOM exercises before React.
- [WHATWG DOM Standard](https://dom.spec.whatwg.org/)
  The living standard for node trees, events, and DOM operations. Use for: precise definitions and edge cases.
- [MDN: Introduction to events](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events)
  Covers event targets, listeners, and the event object. Use for: how the DOM notifies JavaScript.
- [MDN: Using microtasks](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide)
  Defines tasks, microtasks, and when the browser may paint. Use for: click vs `setTimeout` vs Promise order.
- [React: Responding to events](https://react.dev/learn/responding-to-events)
  Explains React event handlers as functions React calls in response to DOM events. Use for: connecting `onClick` to the browser event loop.
- [React: `createElement`](https://react.dev/reference/react/createElement)
  Shows that JSX is a React element object with `type`, `props`, and children. Use for: proving JSX is not a DOM node.
- [React: `createRoot`](https://react.dev/reference/react-dom/client/createRoot)
  Documents how React takes a DOM container and commits UI inside it. Use for: root ownership of the host DOM.
- [React: Render and Commit](https://react.dev/learn/render-and-commit)
  Defines React's trigger, render, and commit steps. Use for: reasoning about component calls and DOM updates.
- [React: State as a Snapshot](https://react.dev/learn/state-as-a-snapshot)
  Explains that each render has its own frozen state and event handlers. Use for: stale closures and delayed alerts.
- [React: Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates)
  Shows batching and updater functions (`n => n + 1`). Use for: multiple `setState` calls in one event.
- [React: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
  Explains Effects as synchronization with external systems after a commit. Use for: deciding whether code belongs in an Effect.
- [React: Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects)
  Separates component lifecycle language from each Effect's start/stop cycle. Use for: dependencies and cleanup.
- [React: `useEffect`](https://react.dev/reference/react/useEffect)
  Defines passive Effect timing, dependencies, cleanup, and Strict Mode behavior. Use for: external-system synchronization after commit.
- [React: `useLayoutEffect`](https://react.dev/reference/react/useLayoutEffect)
  Defines pre-paint layout Effects and their performance cost. Use for: measurement and flicker problems.
- [React: Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs)
  Explains when refs receive DOM nodes and safe imperative operations. Use for: focus, scrolling, measurement, and non-React widgets.
- [React: `useInsertionEffect`](https://react.dev/reference/react/useInsertionEffect)
  Documents the CSS-in-JS library hook that runs before layout Effects. Use for: recognizing the hook, not application code.
- [React: `useImperativeHandle`](https://react.dev/reference/react/useImperativeHandle)
  Shows how a component exposes a small imperative API instead of its full DOM node. Use for: reusable input and widget boundaries.
- [React: `useEffectEvent`](https://react.dev/reference/react/useEffectEvent)
  Separates non-reactive logic from Effect synchronization. Use for: reading current values without restarting an Effect.
- [React: Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)
  Explains component identity by tree position and `key`. Use for: predicting when state, DOM nodes, refs, and Effects survive or reset.
- [React: Rendering Lists](https://react.dev/learn/rendering-lists)
  Explains stable keys in dynamic collections. Use for: preventing state from moving to the wrong item during reorder, insert, or delete.

## Wisdom (Communities)

- [Reactiflux](https://www.reactiflux.com/)
  Volunteer-run React and JavaScript community on Discord. Use for: testing runtime explanations against production experience.
