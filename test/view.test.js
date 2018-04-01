import { app } from "../src";

beforeEach(() => {
  document.body.innerHTML = "";
});

test("oncreate lifecycle event", done =>
  app({
    state: { message: "hello" },
    actions: {
      foo({ data, fx }) {
        expect(data).toEqual({
          class: "hello-container",
          oncreate: fx.event("foo")
        });
        done();
      }
    },
    view: ({ state, fx }) => [
      "div",
      {
        class: "hello-container",
        oncreate: fx.event("foo")
      },
      state.message
    ]
  }));

test("custom oncreate lifecycle event", done =>
  app({
    fx: [
      {
        name: "create",
        runner({ event }) {
          expect(event.props).toEqual({
            class: "hello-container",
            oncreate: ["create", {}]
          });
          expect(event.element.outerHTML).toBe(
            '<div class="hello-container">hello</div>'
          );
          done();
        }
      }
    ],
    state: { message: "hello" },
    view: ({ state, fx }) => [
      "div",
      {
        class: "hello-container",
        oncreate: fx.create()
      },
      state.message
    ]
  }));

test("components with lifecycle events", done => {
  const Component = ({ props: { name }, state, fx }) => [
    "div",
    { oncreate: fx.event("foo") },
    `${state.message} ${name}`
  ];
  app({
    state: { message: "hello" },
    actions: {
      foo({ data, fx }) {
        expect(data).toEqual({
          oncreate: fx.event("foo")
        });
        expect(document.body.innerHTML).toBe("<div>hello world</div>");
        done();
      }
    },
    view: () => [
      Component,
      {
        name: "world"
      }
    ]
  });
});

test("components with custom lifecycle events", done => {
  const Component = ({ props: { name }, state, fx }) => [
    "div",
    { oncreate: fx.create() },
    `${state.message} ${name}`
  ];
  app({
    fx: [
      {
        name: "create",
        runner({ event }) {
          expect(event.props).toEqual({
            oncreate: ["create", {}]
          });
          expect(event.element.outerHTML).toBe("<div>hello world</div>");
          done();
        }
      }
    ],
    state: { message: "hello" },
    view: () => [
      Component,
      {
        name: "world"
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
