# HTML source and live DOM are separate

The learner can state that HTML is markup used to build a DOM, and that the DOM is a browser object model JS can hold and change. They confirmed `$0 instanceof Element` is true because the selected inspector node is a live DOM object. They correctly said a DOM mutation does not rewrite the original HTML source.

They did not retrieve the third piece: pixels. Paint is a later browser step that turns the live DOM (plus CSS) into what you see. Later lessons should keep paint as its own step, not as a synonym for “DOM update.”
