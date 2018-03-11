import { patch } from "../src/patch";

const htmlTrim = html => html.replace(/\s{2,}/g, "");

const testPatch = (name, tests) => {
  test(name, () => {
    document.body.innerHTML = "";
    tests.forEach(([vdom, html]) => {
      patch(vdom, document.body, Function.prototype);
      expect(htmlTrim(document.body.innerHTML)).toBe(htmlTrim(html));
    });
  });
};

testPatch("empty div", [[["div"], "<div></div>"]]);

testPatch("span with text", [
  [["span", "hello world"], "<span>hello world</span>"]
]);

testPatch("empty div with attributes", [
  [
    ["div", { id: "my-id", class: "my-class" }],
    '<div id="my-id" class="my-class"></div>'
  ]
]);

testPatch("div with child", [[["div", ["div"]], "<div><div></div></div>"]]);

testPatch("div with styles", [
  [
    ["div", { style: { color: "red", fontSize: "1em", margin: null } }],
    '<div style="color: red; font-size: 1em;"></div>'
  ]
]);

testPatch("empty string for null attributes", [
  [["div", { id: null }], '<div id=""></div>']
]);

testPatch("custom attributes", [
  [["div", { "data-test": "value" }], '<div data-test="value"></div>']
]);

testPatch("null attributes", [[["div", { disabled: null }], "<div></div>"]]);
