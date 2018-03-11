import { h } from "../src";

test("empty vnode", () => expect(h("div")).toEqual(["div"]));

test("vnode with a single child", () =>
  expect(h("div", "foo")).toEqual(["div", "foo"]));

test("positional String/Number children", () => {
  expect(h("div", "foo", "bar", "baz")).toEqual(["div", "foo", "bar", "baz"]);

  expect(h("div", 0, "foo", 1, "baz", 2)).toEqual([
    "div",
    0,
    "foo",
    1,
    "baz",
    2
  ]);

  expect(h("div", "foo", h("div", "bar"), "baz", "quux")).toEqual([
    "div",
    "foo",
    ["div", "bar"],
    "baz",
    "quux"
  ]);
});

test("vnode with props", () => {
  const props = {
    id: "foo",
    class: "bar",
    style: {
      color: "red"
    }
  };

  expect(h("div", props, "baz")).toEqual(["div", props, "baz"]);
});

test("pass through Boolean children", () => {
  expect(h("div", true)).toEqual(["div", true]);
  expect(h("div", false)).toEqual(["div", false]);
});

test("skip null children", () => expect(h("div", null)).toEqual(["div"]));

test("skip undefined children", () =>
  expect(h("div", undefined)).toEqual(["div"]));

test("pass through other falsy children", () => {
  expect(h("div", 0)).toEqual(["div", 0]);
  expect(h("div", NaN)).toEqual(["div", NaN]);
  expect(h("div", "")).toEqual(["div", ""]);
});

test("component with no props", () => {
  const Component = ({ name = "world" }) => h("div", "Hello " + name);
  expect(h(Component)).toEqual(["div", "Hello world"]);
});

const Component = h.bind(null, "div");

test("component with props", () =>
  expect(h(Component, { id: "foo" }, "bar")).toEqual([
    "div",
    { id: "foo" },
    "bar"
  ]));

test("nested components with props", () => {
  expect(h(Component, { id: "foo" }, h(Component, { id: "bar" }))).toEqual([
    "div",
    { id: "foo" },
    ["div", { id: "bar" }]
  ]);
});

test("JSX output", () =>
  expect(
    h(
      "main",
      null,
      h("h1", null, 1),
      h(
        "button",
        {
          onclick: [
            "action",
            {
              path: "down"
            }
          ]
        },
        "-"
      ),
      h(
        "button",
        {
          onclick: [
            "action",
            {
              path: "up"
            }
          ]
        },
        "+"
      )
    )
  ).toEqual([
    "main",
    ["h1", 1],
    ["button", { onclick: ["action", { path: "down" }] }, "-"],
    [
      "button",
      {
        onclick: ["action", { path: "up" }]
      },
      "+"
    ]
  ]));
