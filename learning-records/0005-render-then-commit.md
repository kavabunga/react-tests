# Render does not change the DOM

The learner can state the `createRoot` / `root.render` contract (DOM container vs React node) and the order trigger → render → commit → paint. They can also say why a counter still shows 0 during the render that computes count 1: the DOM is patched only at commit.

Future lessons can treat that pipeline as known and move to what a render _sees_: state as a snapshot, batching, and updater functions.
