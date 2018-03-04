# FX App

[![Build Status](https://travis-ci.org/fxapp/fxapp.svg?branch=master)](https://travis-ci.org/fxapp/fxapp)
[![codecov](https://codecov.io/gh/fxapp/fxapp/branch/master/graph/badge.svg)](https://codecov.io/gh/fxapp/fxapp)
[![npm](https://img.shields.io/npm/v/fxapp.svg)](https://www.npmjs.org/package/fxapp)

Here is an example counter that can be incremented or decremented. Go ahead and [try it online](https://codepen.io/okwolf/pen/WMWBjR?editors=0010).

```js
fx.app({
  state: {
    count: 0
  },
  actions: {
    down: fx => fx.merge({ count: fx.get("count") - 1 }),
    up: fx => fx.merge({ count: fx.get("count") + 1 })
  },
  view: fx => [
    "main",
    ["h1", fx.get("count")],
    [
      "button",
      {
        onclick: fx.action("down"),
        disabled: fx.get("count") <= 0
      },
      "-"
    ],
    ["button", { onclick: fx.action("up") }, "+"]
  ]
});
```

## License

FX App is MIT licensed. See [LICENSE](LICENSE.md).
