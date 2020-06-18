const afterTicks = require("./afterTicks");
const makeFxRuntime = require("../src/makeFxRuntime");

const mergeState = (prevState, nextState) => ({
  ...prevState,
  ...nextState
});

describe("makeFxRuntime", () => {
  it("should be a function", () =>
    expect(makeFxRuntime).toBeInstanceOf(Function));
  it("should provide a dispatch function", () => {
    const { dispatch } = makeFxRuntime();
    expect(dispatch).toBeInstanceOf(Function);
  });
  it("should provide a getState function", () => {
    const { getState } = makeFxRuntime();
    expect(getState).toBeInstanceOf(Function);
    expect(getState()).toEqual({});
  });
  it("should allow setting initial state", () => {
    const { getState } = makeFxRuntime({ state: { initial: "state" } });
    expect(getState()).toEqual({ initial: "state" });
  });
  it("should handle dispatching new states", () => {
    const { dispatch, getState } = makeFxRuntime();
    dispatch({ new: "state" });
    expect(getState()).toEqual({ new: "state" });
  });
  it("should handle dispatching state update functions", async () => {
    const { dispatch, getState } = makeFxRuntime({ state: { count: 0 } });
    dispatch(({ count }) => ({ count: count + 1 }));

    await afterTicks(1);

    expect(getState()).toEqual({ count: 1 });
  });
  it("should handle dispatching tuples of state update function and props", async () => {
    const { dispatch, getState } = makeFxRuntime({ state: { count: 0 } });
    dispatch([({ count }, { upBy }) => ({ count: count + upBy }), { upBy: 2 }]);

    await afterTicks(1);

    expect(getState()).toEqual({ count: 2 });
  });
  it("should support custom mergeState", async () => {
    const { dispatch, getState } = makeFxRuntime({
      state: { original: "state" },
      mergeState
    });
    dispatch({ new: "state" });

    await afterTicks(1);

    expect(getState()).toEqual({ original: "state", new: "state" });
  });
  it("should handle dispatching arrays of state and update functions", async () => {
    const { dispatch, getState } = makeFxRuntime();
    dispatch([{ count: 0 }, ({ count }) => ({ count: count + 1 })]);

    await afterTicks(1);

    expect(getState()).toEqual({ count: 1 });
  });
  it("should handle dispatching serial sync fx", async () => {
    const { dispatch, getState } = makeFxRuntime({ state: { ranFx: false } });
    dispatch({
      run({ dispatch, hasProps }) {
        expect(hasProps).toEqual(true);
        dispatch({ ranFx: true });
      },
      hasProps: true
    });

    await afterTicks(1);

    expect(getState()).toEqual({ ranFx: true });
  });
  it("should support cancel before dispatching sync fx", async () => {
    const { dispatch, getState } = makeFxRuntime({
      state: { ranFx: false, ranCancel: false },
      mergeState
    });

    dispatch({
      cancel: true,
      run({ dispatch }) {
        dispatch({ ranCancel: true });
      }
    });
    dispatch({
      run({ dispatch }) {
        dispatch({ ranFx: true });
      }
    });

    await afterTicks(1);

    expect(getState()).toEqual({ ranFx: false, ranCancel: true });
  });
  it("should support cancel after dispatching sync fx", async () => {
    const { dispatch, getState } = makeFxRuntime({
      state: { ranFx: false, ranCancel: false },
      mergeState
    });

    dispatch({
      run({ dispatch }) {
        dispatch({ ranFx: true });
      }
    });
    dispatch({
      cancel: true,
      run({ dispatch }) {
        dispatch({ ranCancel: true });
      }
    });

    await afterTicks(1);

    expect(getState()).toEqual({ ranFx: false, ranCancel: true });
  });
  it("should support cancel before dispatching async fx", async () => {
    let triggerDispatch;
    const { dispatch, getState } = makeFxRuntime({
      state: { ranAsync: false, ranCancel: false },
      mergeState
    });
    dispatch({
      cancel: true,
      run({ dispatch }) {
        dispatch({ ranCancel: true });
      }
    });
    dispatch({
      run({ dispatch }) {
        return new Promise(resolve => {
          triggerDispatch = () => {
            dispatch({ ranAsync: true });
            resolve();
          };
        });
      }
    });

    await afterTicks(1);
    expect(triggerDispatch).toBeUndefined();

    expect(getState()).toEqual({ ranAsync: false, ranCancel: true });
  });
  it("should support cancel after dispatching async fx", async () => {
    let triggerDispatch;
    const { dispatch, getState } = makeFxRuntime({
      state: { ranAsync: false, ranCancel: false },
      mergeState
    });
    dispatch({
      run({ dispatch }) {
        return new Promise(resolve => {
          triggerDispatch = () => {
            dispatch({ ranAsync: true });
            resolve();
          };
        });
      }
    });
    process.nextTick(() =>
      dispatch({
        cancel: true,
        run({ dispatch }) {
          dispatch({ ranCancel: true });
        }
      })
    );

    await afterTicks(1);
    expect(triggerDispatch).toBeInstanceOf(Function);
    triggerDispatch();

    expect(getState()).toEqual({ ranAsync: false, ranCancel: true });
  });
  it("should support custom mapProps for fx", async () => {
    const { dispatch, getState } = makeFxRuntime({
      state: { ranFx: false },
      mapProps: props => ({
        ...props,
        addedProp: true
      })
    });
    dispatch({
      run({ dispatch, hasProps, addedProp }) {
        expect(hasProps).toEqual(true);
        expect(addedProp).toEqual(true);
        dispatch({ ranFx: true });
      },
      hasProps: true
    });

    await afterTicks(1);

    expect(getState()).toEqual({ ranFx: true });
  });
  it("should handle dispatching serial async fx", async () => {
    let triggerDispatch;
    const { dispatch, getState } = makeFxRuntime({
      state: { ranAsync: false }
    });
    dispatch({
      run({ dispatch }) {
        return new Promise(resolve => {
          triggerDispatch = () => {
            dispatch({ ranAsync: true });
            resolve();
          };
        });
      }
    });

    await afterTicks(1);
    expect(triggerDispatch).toBeInstanceOf(Function);
    triggerDispatch();

    expect(getState()).toEqual({ ranAsync: true });
  });
  it("should run all concurrent fx before serial fx followed by after fx", async () => {
    const { dispatch, getState } = makeFxRuntime({
      state: { ranFx: [] },
      mergeState: ({ ranFx }, { name }) => ({
        ranFx: [...ranFx, name]
      })
    });

    dispatch({
      after: true,
      run({ dispatch }) {
        dispatch({ name: "after" });
      }
    });
    dispatch({
      run({ dispatch }) {
        dispatch({ name: "serial" });
      }
    });
    dispatch({
      concurrent: true,
      run({ dispatch }) {
        dispatch({ name: "concurrent1" });
      }
    });
    dispatch({
      concurrent: true,
      run({ dispatch }) {
        dispatch({ name: "concurrent2" });
      }
    });

    await afterTicks(3);

    expect(getState()).toEqual({
      ranFx: ["concurrent1", "concurrent2", "serial", "after"]
    });
  });
  it("should cancel concurrent and serial fx but run after fx", async () => {
    const { dispatch, getState } = makeFxRuntime({
      state: {
        ranSerial: false,
        ranConcurrent: false,
        ranAfter: false,
        ranCancel: false
      },
      mergeState
    });

    dispatch({
      after: true,
      run({ dispatch }) {
        dispatch({ ranAfter: true });
      }
    });
    dispatch({
      run({ dispatch }) {
        dispatch({ ranSerial: true });
      }
    });
    dispatch({
      concurrent: true,
      run({ dispatch }) {
        dispatch({ ranConcurrent: true });
      }
    });
    dispatch({
      cancel: true,
      run({ dispatch }) {
        dispatch({ ranCancel: true });
      }
    });

    await afterTicks(3);

    expect(getState()).toEqual({
      ranSerial: false,
      ranConcurrent: false,
      ranAfter: true,
      ranCancel: true
    });
  });
  it("should handle dispatching tuples of fx and props and merge the props", async () => {
    const { dispatch, getState } = makeFxRuntime({ state: { ranFx: false } });
    const fx = {
      run({ dispatch, hasFxProps, hasDispatchProps }) {
        expect(hasFxProps).toEqual(true);
        expect(hasDispatchProps).toEqual(true);
        dispatch({ ranFx: true });
      },
      hasFxProps: true
    };
    dispatch([fx, { hasDispatchProps: true }]);

    await afterTicks(1);

    expect(getState()).toEqual({ ranFx: true });
  });
  it("should ignore unsupported dispatch types", () => {
    const { dispatch, getState } = makeFxRuntime({});
    dispatch();
    dispatch(666);
    dispatch(true);
    dispatch("bad");
    dispatch(Symbol());
    expect(getState()).toEqual({});
  });
});
