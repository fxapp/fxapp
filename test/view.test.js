import { app } from "../src";

beforeEach(() => {
  document.body.innerHTML = "";
});

test("oncreate lifecycle event", done =>
  app({
    actions: {
      foo({ data }) {
        expect(data.outerHTML).toBe("<div>hello</div>");
        done();
      }
    },
    view: ({ fx }) => [
      "div",
      {
        oncreate: fx.event("foo")
      },
      "hello"
    ]
  }));

test("components with lifecycle events", done => {
  const Component = ({ message }) => ["div", message];
  app({
    actions: {
      foo({ data }) {
        expect(data.outerHTML).toBe("<div>hello world</div>");
        done();
      }
    },
    view: ({ fx }) => [
      Component,
      {
        message: "hello world",
        oncreate: fx.event("foo")
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
