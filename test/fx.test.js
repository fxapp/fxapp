import { app } from "../src";

test("ignore empty fx", () => {
  const main = app({
    actions: {
      invalid: () => []
    }
  });
  expect(main.invalid()).toEqual([]);
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
        creator: action => ["set", { action }],
        runner(props, getAction) {
          getAction(props.action)(externalState);
        }
      }
    ],
    state: {
      value: 0
    },
    actions: {
      foo: fx => fx.set("set"),
      set: fx => fx.merge(fx.data),
      get: fx => fx.get()
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
