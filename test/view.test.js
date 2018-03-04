import { app } from "../src";

test("attach fx to view", done => {
  app({
    actions: {
      foo: fx => [fx.merge({ some: "value" }), fx.action("bar")],
      bar: () => done()
    },
    view: fx => ["div", { onclick: fx.action("foo") }]
  });
  document.body.children[0].onclick();
});
