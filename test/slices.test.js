import { fxapp } from "../src";

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
const getActions = () =>
  fxapp({
    state,
    actions: {
      get,
      foo: {
        get,
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
      }
    }
  });

it("get state slices by default path", () => {
  const actions = getActions();

  // get slices using default and path
  expect(actions.get()).toEqual(state);
  expect(actions.foo.get(null)).toEqual(state.foo);
  expect(actions.foo.bar.get("")).toEqual(state.foo.bar);
  expect(actions.foo.bar.baz.get(".")).toEqual(state.foo.bar.baz);
});

it("get state slices with custom path", () => {
  const actions = getActions();

  expect(actions.get("foo")).toEqual(state.foo);
  expect(actions.get("foo.bar")).toEqual(state.foo.bar);
  expect(actions.get("foo.bar.baz")).toEqual(state.foo.bar.baz);
});

it("get state slices outside of current namespace", () => {
  const actions = getActions();

  // get other slice data with dot prefix
  expect(actions.foo.bar.baz.get(".fizz")).toEqual(state.fizz);
  expect(actions.foo.bar.baz.get(".fizz.buzz")).toEqual(state.fizz.buzz);
});

it("merge and get deeply nested state slices", () => {
  const actions = getActions();

  expect(actions.foo.bar.baz.eat("banana")).toEqual({
    value: 1,
    food: "banana"
  });

  expect(actions.foo.bar.baz.get()).toEqual({
    value: 1,
    food: "banana"
  });
});
