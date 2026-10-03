# Timeout is a task, not a microtask

The learner retrieved the event-loop order as task, then microtasks, then paint, and named React `onClick` as an event listener. They also treated `setTimeout` as a microtask. It is a later task. Microtasks are `queueMicrotask` and Promise `then`. This mix-up will break later timing explanations, so the next lessons should keep timeout on the task side.
