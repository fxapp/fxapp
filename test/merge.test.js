import { app } from "../src";

test("merge can update state", () => {
  const main = app({
    state: {
      value: 0
    },
    actions: {
      get: ({ state }) => state,
      up: ({ state, data, fx }) => {
        expect(state).toEqual({ value: 0 });
        expect(data).toBe(2);
        return fx.merge({
          value: state.value + data
        });
      },
      set: ({ state, data, fx }) => {
        expect(state).toEqual({ value: 2 });
        expect(data).toEqual({ merge: "properties" });
        return fx.merge(data);
      }
    }
  });

  expect(main.get()).toEqual({
    value: 0
  });

  expect(main.up(2)).toEqual([
    "merge",
    {
      partialState: {
        value: 2
      }
    }
  ]);

  expect(main.get()).toEqual({
    value: 2
  });

  expect(main.set({ merge: "properties" })).toEqual([
    "merge",
    {
      partialState: {
        merge: "properties"
      }
    }
  ]);

  expect(main.get()).toEqual({
    value: 2,
    merge: "properties"
  });
});
