# Identity and keys exercises

Use `src/App.tsx` as the experiment surface again. Keep DevTools Console open.

For each task:

1. Predict what stays and what resets.
2. Run it.
3. Name the identity rule: type, position, or key.

## 1. Preserve state at the same position

Render one `Counter` in one place and toggle only its `person` prop between `"Taylor"` and `"Sarah"`.

Acceptance checks:

- The local counter state stays.
- The DOM node is reused.
- You can explain that the identity did not change because type and position stayed the same.

## 2. Reset with `key`

Keep the component in the same place, but give it `key={person}`.

Acceptance checks:

- Switching person resets local state.
- Effect cleanup runs for the old identity and setup runs for the new one.
- A ref points to a new DOM node after commit.

## 3. Prove index-key bugs

Render three rows with local input state in each row:

- One list uses `key={item.id}`
- One list uses `key={index}`

Reverse the list after editing the middle and last rows.

Acceptance checks:

- The stable-key list keeps the edited values on the same logical items.
- The index-key list moves state to the wrong rows.
- You can describe this as mistaken identity, not “React losing data.”

## 4. Force a reset on purpose

Build a `Form` with uncontrolled or local state input. Add a `version` state in the parent and render `Form key={version}`.

Acceptance checks:

- Changing `version` clears the form.
- You can explain why this is useful for “Reset form” but dangerous if it happens by accident.

## 5. Watch refs across remount

Attach a ref callback or `useRef` to a keyed subtree and log:

- current node id on setup
- cleanup
- current node id after the new key

Acceptance checks:

- Same key means same node may be reused.
- Different key means old node is removed and a new node is committed.

## 6. Canvas ownership follow-up

Repeat the canvas task from the hooks exercises, but this time change only the canvas `key`.

Acceptance checks:

- Same key preserves the DOM canvas node, so previous drawing can remain.
- New key remounts the canvas node, so the drawing disappears unless you redraw it.
- You can explain the result with identity, not with Effects timing.
