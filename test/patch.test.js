import { patch } from "../src/patch";

const htmlTrim = html => html.replace(/\s{2,}/g, "");
const stubFx = { run: Function.prototype };

const testPatch = (name, tests) => {
  test(name, () => {
    document.body.innerHTML = "";
    tests.forEach(([vdom, html]) => {
      patch(vdom, document.body, stubFx);
      expect(htmlTrim(document.body.innerHTML)).toBe(htmlTrim(html));
    });
  });
};

testPatch("noop", [], "");

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

testPatch("boolean/falsy children", [
  [["div", undefined, null, true, false, "", 0], "<div>0</div>"]
]);

testPatch("styles", [
  [["div"], "<div></div>"],
  [
    ["div", { style: { color: "red", fontSize: "1em" } }],
    '<div style="color: red; font-size: 1em;"></div>'
  ],
  [
    ["div", { style: { color: "blue", float: "left" } }],
    '<div style="color: blue; float: left;"></div>'
  ],
  [
    ["div", { style: { color: "blue", float: "left", margin: null } }],
    '<div style="color: blue; float: left;"></div>'
  ],
  [["div", { style: "" }], '<div style=""></div>']
]);

testPatch("true attributes", [
  [["div", { enabled: true }], '<div enabled="true"></div>']
]);

testPatch("custom attributes", [
  [["div", { "data-test": "value" }], '<div data-test="value"></div>']
]);

testPatch("null attributes", [[["div", { disabled: null }], "<div></div>"]]);

testPatch("input list attribute", [
  [["input", { list: "foobar" }], '<input list="foobar">']
]);

testPatch("skip lifecycle", [[["div", { oncreate: [] }], "<div></div>"]]);

testPatch("replace element", [
  [["main"], "<main></main>"],
  [["div"], "<div></div>"]
]);

testPatch("replace child", [
  [
    ["main", ["div", "foo"]],
    `
      <main>
        <div>foo</div>
      </main>
    `
  ],
  [
    ["main", ["div", "bar"]],
    `
      <main>
        <div>bar</div>
      </main>
    `
  ]
]);

testPatch("insert child at top", [
  [
    ["main", ["div", "A"]],
    `
      <main>
        <div>A</div>
      </main>
    `
  ],
  [
    ["main", ["div", "B"], ["div", "A"]],
    `
      <main>
        <div>B</div>
        <div>A</div>
      </main>
    `
  ],
  [
    ["main", ["div", "C"], ["div", "B"], ["div", "A"]],
    `
      <main>
        <div>C</div>
        <div>B</div>
        <div>A</div>
      </main>
    `
  ]
]);

testPatch("remove text node", [
  [
    ["main", ["div", "foo"], "bar"],
    `
      <main>
        <div>foo</div>
        bar
      </main>
    `
  ],
  [
    ["main", ["div", "foo"]],
    `
      <main>
        <div>foo</div>
      </main>
    `
  ]
]);

testPatch("update element data", [
  [["div", { id: "foo", class: "bar" }], '<div id="foo" class="bar"></div>'],
  [["div", { id: "foo", class: "baz" }], '<div id="foo" class="baz"></div>']
]);

testPatch("remove attributes", [
  [["div", { id: "foo", class: "bar" }], '<div id="foo" class="bar"></div>'],
  [["div"], "<div></div>"]
]);

testPatch("a list with empty text nodes", [
  [
    ["ul", ["li"], ["div", "foo"]],
    `
      <ul>
        <li></li>
        <div>foo</div>
      </ul>
    `
  ],
  [
    ["ul", ["li"], ["li"], ["div", "foo"]],
    `
      <ul>
        <li></li>
        <li></li>
        <div>foo</div>
      </ul>
    `
  ],
  [
    ["ul", ["li"], ["li"], ["li"], ["div", "foo"]],
    `
      <ul>
        <li></li>
        <li></li>
        <li></li>
        <div>foo</div>
      </ul>
    `
  ]
]);

testPatch("reorder children", [
  [
    [
      "main",
      ["div", "A"],
      ["div", "B"],
      ["div", "C"],
      ["div", "D"],
      ["div", "E"]
    ],
    `
      <main>
        <div>A</div>
        <div>B</div>
        <div>C</div>
        <div>D</div>
        <div>E</div>
      </main>
    `
  ],
  [
    [
      "main",
      ["div", "E"],
      ["div", "A"],
      ["div", "B"],
      ["div", "C"],
      ["div", "D"]
    ],
    `
      <main>
        <div>E</div>
        <div>A</div>
        <div>B</div>
        <div>C</div>
        <div>D</div>
      </main>
    `
  ],
  [
    [
      "main",
      ["div", "E"],
      ["div", "D"],
      ["div", "A"],
      ["div", "C"],
      ["div", "B"]
    ],
    `
      <main>
        <div>E</div>
        <div>D</div>
        <div>A</div>
        <div>C</div>
        <div>B</div>
      </main>
    `
  ],
  [
    [
      "main",
      ["div", "C"],
      ["div", "E"],
      ["div", "B"],
      ["div", "A"],
      ["div", "D"]
    ],
    `
      <main>
        <div>C</div>
        <div>E</div>
        <div>B</div>
        <div>A</div>
        <div>D</div>
      </main>
    `
  ]
]);

testPatch("grow/shrink", [
  [
    [
      "main",
      ["div", "A"],
      ["div", "B"],
      ["div", "C"],
      ["div", "D"],
      ["div", "E"]
    ],
    `
      <main>
        <div>A</div>
        <div>B</div>
        <div>C</div>
        <div>D</div>
        <div>E</div>
      </main>
    `
  ],
  [
    ["main", ["div", "A"], ["div", "C"], ["div", "D"]],
    `
      <main>
        <div>A</div>
        <div>C</div>
        <div>D</div>
      </main>
    `
  ],
  [
    ["main", ["div", "D"]],
    `
      <main>
        <div>D</div>
      </main>
    `
  ],
  [
    [
      "main",
      ["div", "A"],
      ["div", "B"],
      ["div", "C"],
      ["div", "D"],
      ["div", "E"]
    ],
    `
      <main>
        <div>A</div>
        <div>B</div>
        <div>C</div>
        <div>D</div>
        <div>E</div>
      </main>
    `
  ],
  [
    ["main", ["div", "D"], ["div", "C"], ["div", "B"], ["div", "A"]],
    `
      <main>
        <div>D</div>
        <div>C</div>
        <div>B</div>
        <div>A</div>
      </main>
    `
  ]
]);

testPatch("multiple root nodes", [
  [
    [["div", "A"], ["div", "B"], ["div", "C"]],
    "<div>A</div><div>B</div><div>C</div>"
  ]
]);
