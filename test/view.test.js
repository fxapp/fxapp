import { app } from "../src";

beforeEach(() => {
  document.body.innerHTML = "";
});

test("oncreate lifecycle event", done =>
  app({
    state: { message: "hello" },
    actions: {
      foo({ data }) {
        expect(data.outerHTML).toBe("<div>hello</div>");
        done();
      }
    },
    view: ({ state, fx }) => [
      "div",
      {
        oncreate: fx.event("foo")
      },
      state.message
    ]
  }));

test("components with lifecycle events", done => {
  const Component = ({ message, fx }) => [
    "div",
    { oncreate: fx.event("foo") },
    message
  ];
  app({
    actions: {
      foo({ data }) {
        expect(data.outerHTML).toBe("<div>hello world</div>");
        done();
      }
    },
    view: () => [
      Component,
      {
        message: "hello world"
      }
    ]
  });
});

test("attach fx to view", done => {
  app({
    actions: {
      foo: ({ fx }) => [fx.merge({ some: "value" }), fx.action("bar")],
      bar: () => done()
    },
    view: ({ fx }) => ["div", { onclick: fx.action("foo") }]
  });
  document.body.children[0].onclick({ button: 0 });
});

test("receive events from view in fx", done => {
  app({
    actions: {
      foo: ({ data }) => {
        expect(data).toEqual({ button: 0 });
        done();
      }
    },
    view: ({ fx }) => ["div", { onclick: fx.event("foo") }]
  });
  document.body.children[0].onclick({ button: 0 });
});
