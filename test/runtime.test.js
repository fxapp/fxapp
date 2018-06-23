const makeRuntime = require("../src/makeRuntime");
const updateMiddleware = require("../src/updateMiddleware");

describe("makeRuntime", () => {
  it("should be a function", () =>
    expect(makeRuntime).toBeInstanceOf(Function));
  it("should return a function", () =>
    expect(makeRuntime()).toBeInstanceOf(Function));
  it("should start empty", () =>
    expect(makeRuntime()()).toEqual([
      undefined,
      undefined,
      undefined,
      undefined
    ]));
  it("should passthrough dispatched values", () =>
    expect(makeRuntime()({ key: "value" })).toEqual([
      { key: "value" },
      undefined,
      undefined,
      undefined
    ]));
  describe("with init and update middleware", () => {
    it("should have initial value and allow for updating", () => {
      const runtime = makeRuntime([updateMiddleware]);
      expect(runtime()).toEqual([undefined, undefined, undefined, {}]);
      runtime(() => ({ count: 0 }));
      expect(runtime()).toEqual([
        undefined,
        undefined,
        undefined,
        { count: 0 }
      ]);
      runtime(state => ({ count: state.count + 1 }));
      expect(runtime()).toEqual([
        undefined,
        undefined,
        undefined,
        { count: 1 }
      ]);
    });
    it("should perform multiple updates in an array", () => {
      const runtime = makeRuntime([updateMiddleware]);
      const inc = state => ({ count: state.count + 1 });
      runtime(() => ({ count: 0 }));
      runtime([inc, inc, inc]);
      expect(runtime()).toEqual([
        undefined,
        undefined,
        undefined,
        { count: 3 }
      ]);
    });
    it("should allow fx to update", () => {
      const effect = (state, currentEffect, dispatch) => {
        expect(state).toEqual({ count: 0 });
        expect(currentEffect).toEqual({
          props: {
            key: "value"
          },
          effect
        });
        dispatch(() => ({ count: 1 }));
      };
      const runtime = makeRuntime([updateMiddleware]);
      runtime(() => ({ count: 0 }));
      runtime({
        props: {
          key: "value"
        },
        effect
      });
      expect(runtime()).toEqual([
        undefined,
        undefined,
        undefined,
        { count: 1 }
      ]);
    });
  });
});
