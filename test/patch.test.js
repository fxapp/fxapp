import { patch } from "../src/patch";

test("empty div", () => {
  patch(["div"], document.body);
  expect(document.body.innerHTML).toBe("<div></div>");
});

test("span with text", () => {
  patch(["span", "hello world"], document.body);
  expect(document.body.innerHTML).toBe("<span>hello world</span>");
});

test("empty div with attributes", () => {
  patch(["div", { id: "my-id", class: "my-class" }], document.body);
  expect(document.body.innerHTML).toBe(
    '<div id="my-id" class="my-class"></div>'
  );
});

test("div with child", () => {
  patch(["div", ["div"]], document.body);
  expect(document.body.innerHTML).toBe("<div><div></div></div>");
});

test("div with styles", () => {
  patch(
    ["div", { style: { color: "red", fontSize: "1em", margin: null } }],
    document.body
  );
  expect(document.body.innerHTML).toBe(
    '<div style="color: red; font-size: 1em;"></div>'
  );
});

test("empty string for null attributes", () => {
  patch(["div", { id: null }], document.body);
  expect(document.body.innerHTML).toBe('<div id=""></div>');
});

test("custom attributes", () => {
  patch(["div", { "data-test": "value" }], document.body);
  expect(document.body.innerHTML).toBe('<div data-test="value"></div>');
});

test("null attributes", () => {
  patch(["div", { disabled: null }], document.body);
  expect(document.body.innerHTML).toBe("<div></div>");
});
