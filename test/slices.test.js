import { fxapp } from "../src";

it("support state slices", done => {
  const get = state => state;
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
  const actions = fxapp({
    state,
    actions: {
      get,
      foo: {
        get,
        bar: {
          get,
          baz: {
            get,
            eat: (state, food) => ({ food })
          }
        }
      },
      end: () => {
        done();
      }
    }
  });

  expect(actions.get()).toEqual(state);
  expect(actions.foo.get()).toEqual(state.foo);
  expect(actions.foo.bar.get()).toEqual(state.foo.bar);
  expect(actions.foo.bar.baz.get()).toEqual(state.foo.bar.baz);

  expect(actions.foo.bar.baz.eat("banana")).toEqual({
    food: "banana"
  });

  expect(actions.foo.bar.baz.get()).toEqual({
    value: 1,
    food: "banana"
  });

  actions.end();
});
