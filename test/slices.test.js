import { app } from "../src";

const state = {
  foo: {
    bar: {
      baz: {
        value: 1
      }
    }
  },
  fizz: {
    buzz: "fizzbuzz"
  }
};

const get = fx => fx.get(fx.data);
const makeApp = () =>
  app({
    state,
    actions: {
      get,
      foo: {
        get,
        set: fx => fx.merge(fx.data.state, fx.data.path),
        bar: {
          get,
          baz: {
            get,
            eat: fx => {
              expect(fx.get()).toEqual({ value: 1 });
              expect(fx.data).toBe("banana");
              return fx.merge({ food: fx.data });
            }
          }
        }
      },
      fizz: {
        get
      }
    }
  });

it("get state slices by default path", () => {
  const main = makeApp();

  // get slices using default and path
  expect(main.get()).toEqual(state);
  expect(main.foo.get(null)).toEqual(state.foo);
  expect(main.foo.bar.get("")).toEqual(state.foo.bar);
  expect(main.foo.bar.baz.get(".")).toEqual(state.foo.bar.baz);
});

it("get state slices with custom path", () => {
  const main = makeApp();

  expect(main.get("foo")).toEqual(state.foo);
  expect(main.get("foo.bar")).toEqual(state.foo.bar);
  expect(main.get("foo.bar.baz")).toEqual(state.foo.bar.baz);
});

it("get state slices outside of current namespace", () => {
  const main = makeApp();

  // get other slice data with dot prefix
  expect(main.foo.bar.baz.get(".fizz")).toEqual(state.fizz);
  expect(main.foo.bar.baz.get(".fizz.buzz")).toEqual(state.fizz.buzz);
});

it("merge and get deeply nested state slices", () => {
  const main = makeApp();

  expect(main.foo.bar.baz.eat("banana")).toEqual([
    "merge",
    {
      partialState: {
        food: "banana"
      }
    }
  ]);

  expect(main.foo.bar.baz.get()).toEqual({
    value: 1,
    food: "banana"
  });
});

it("merge state slices with path", () => {
  const main = makeApp();
  expect(
    main.foo.set({
      state: {
        other: "junk"
      },
      path: "bar.baz"
    })
  ).toEqual([
    "merge",
    {
      path: "bar.baz",
      partialState: {
        other: "junk"
      }
    }
  ]);
  expect(main.foo.bar.baz.get()).toEqual({
    value: 1,
    other: "junk"
  });

  expect(
    main.foo.set({
      state: { buzzer: "buzzworthy" },
      path: ".fizz"
    })
  ).toEqual([
    "merge",
    {
      path: ".fizz",
      partialState: {
        buzzer: "buzzworthy"
      }
    }
  ]);
  expect(main.fizz.get()).toEqual({
    buzz: "fizzbuzz",
    buzzer: "buzzworthy"
  });
});
