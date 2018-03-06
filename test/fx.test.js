import { app } from "../src";

test("ignore empty fx", () => {
  const main = app({
    actions: {
      empty: () => []
    }
  });
  expect(main.empty()).toEqual([]);
});

test("throw for invalid fx", () =>
  expect(() =>
    app({
      actions: {
        invalid: () => ["invalid"]
      }
    }).invalid()
  ).toThrow("no such fx type: invalid"));

test("allow adding new custom fx", () => {
  const externalState = { value: 2 };

  const main = app({
    fx: [
      {
        name: "set",
        creator: action => ({ action }),
        runner(props, getAction) {
          getAction(props.action)(externalState);
        }
      }
    ],
    state: {
      value: 0
    },
    actions: {
      foo: ({ fx }) => fx.set("set"),
      set: ({ data, fx }) => fx.merge(data),
      get: ({ state }) => state
    }
  });

  expect(main.get()).toEqual({
    value: 0
  });

  main.foo();
  expect(main.get()).toEqual({
    value: 2
  });

  externalState.value = 1;

  main.foo();
  expect(main.get()).toEqual({
    value: 1
  });
});
