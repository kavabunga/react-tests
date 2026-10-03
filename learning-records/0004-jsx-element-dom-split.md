# JSX, React elements, and the root container

The learner can separate JSX (syntax that becomes a function call), a React element (a JS object with type, props, children), and a DOM node (a browser object). They correctly named `#root` as the node React owns.

They could not yet say the `createRoot` / `root.render` contract: `createRoot` takes a live DOM node; `root.render` takes a React node (JSX / element). Lesson 4 should keep repeating that split while teaching trigger → render → commit.
