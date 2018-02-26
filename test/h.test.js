import { h } from "../src";

test("empty vnode", () => expect(h("div")).toEqual(["div", []]));

test("vnode with a single child", () => {
  expect(h("div", "foo")).toEqual(["div", ["foo"]]);
});

test("positional String/Number children", () => {
  expect(h("div", "foo", "bar", "baz")).toEqual(["div", ["foo", "bar", "baz"]]);

  expect(h("div", 0, "foo", 1, "baz", 2)).toEqual([
    "div",
    [0, "foo", 1, "baz", 2]
  ]);

  expect(h("div", "foo", h("div", "bar"), "baz", "quux")).toEqual([
    "div",
    ["foo", ["div", ["bar"]], "baz", "quux"]
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

  expect(h("div", props, "baz")).toEqual(["div", props, ["baz"]]);
});

test("skip null and Boolean children", () => {
  const expected = ["div", []];

  expect(h("div", true)).toEqual(expected);
  expect(h("div", false)).toEqual(expected);
  expect(h("div", null)).toEqual(expected);
});

test("components", () => {
  const Component = (props, children) => h("div", props, children);

  expect(h(Component, { id: "foo" }, "bar")).toEqual([
    "div",
    { id: "foo" },
    ["bar"]
  ]);

  expect(h(Component, { id: "foo" }, h(Component, { id: "bar" }))).toEqual([
    "div",
    { id: "foo" },
    [["div", { id: "bar" }, []]]
  ]);
});

test("component with no props", () => {
  const Component = ({ name = "world" }, children) => h("div", "Hello " + name);

  expect(h(Component)).toEqual(["div", ["Hello world"]]);
});
