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

const get = ({ state }) => state;
const makeApp = () =>
  app({
    state,
    actions: {
      get,
      foo: {
        get,
        set: ({ data, fx }) => fx.merge(data.state, data.path),
        bar: {
          get,
          baz: {
            get,
            eat: ({ state, data, fx }) => {
              expect(state).toEqual({ value: 1 });
              expect(data).toBe("banana");
              return fx.merge({ food: data });
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

  expect(main.get()).toEqual(state);
  expect(main.foo.get(null)).toEqual(state.foo);
  expect(main.foo.bar.get("")).toEqual(state.foo.bar);
  expect(main.foo.bar.baz.get(".")).toEqual(state.foo.bar.baz);
});

it("merge deeply nested state slices", () => {
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
