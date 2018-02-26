import { fxapp } from "../src";

test("actions that can update state", done => {
  const actions = fxapp({
    state: {
      value: 0
    },
    actions: {
      get: state => state,
      up: (state, by) => {
        expect(state).toEqual({ value: 0 });
        return {
          value: state.value + by
        };
      },
      set: (state, newState) => {
        expect(state).toEqual({ value: 2 });
        return newState;
      },
      end: state => {
        expect(state).toEqual({
          value: 2,
          merge: "properties"
        });
        done();
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
    merge: "properties"
  });

  expect(actions.get()).toEqual({
    value: 2,
    merge: "properties"
  });

  actions.end();
});
