import { fxapp } from "../src";

test("actions that can update state", () => {
  const actions = fxapp({
    state: {
      value: 0
    },
    actions: {
      get: fx => fx.get(),
      up: fx => {
        expect(fx.get()).toEqual({ value: 0 });
        expect(fx.data).toBe(2);
        return fx.merge({
          value: fx.get("value") + fx.data
        });
      },
      set: fx => {
        expect(fx.get()).toEqual({ value: 2 });
        expect(fx.data).toEqual({ merge: "properties" });
        return fx.merge(fx.data);
      }
    }
  });

  expect(actions.get()).toEqual({
    value: 0
  });

  expect(actions.up(2)).toEqual({
    value: 2
  });

  expect(actions.get()).toEqual({
    value: 2
  });

  expect(actions.set({ merge: "properties" })).toEqual({
    value: 2,
    merge: "properties"
  });

  expect(actions.get()).toEqual({
    value: 2,
    merge: "properties"
  });
});
