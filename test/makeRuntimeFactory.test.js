const makeRuntimeFactory = require("../src/makeRuntimeFactory");

const getState = state => state;

describe("makeRuntimeFactory", () => {
  it("should be a function", () => {
    expect(makeRuntimeFactory).toBeInstanceOf(Function);
  });
  describe("without context keys", () => {
    it("should return a function", () => {
      expect(makeRuntimeFactory()).toBeInstanceOf(Function);
    });
    it("should return empty state and context with identity action", () => {
      const runtime = makeRuntimeFactory()();
      expect(runtime(getState)).toEqual([{}, {}]);
    });
    it("should update state when dispatching functions", () => {
      const runtime = makeRuntimeFactory()();
      expect(runtime(() => ({ key: "value" }))).toEqual([{ key: "value" }, {}]);
      expect(runtime(getState)).toEqual([{ key: "value" }, {}]);
    });
    it("should not update state when dispatching objects but the state and context should be returned", () => {
      const runtime = makeRuntimeFactory()();
      expect(runtime(() => ({ key: "value" }))).toEqual([{ key: "value" }, {}]);
      expect(runtime({ a: 1 })).toEqual([{ key: "value" }, {}]);
    });
    it("should run fx", () => {
      const api = jest.fn();
      const runtime = makeRuntimeFactory()({
        api
      });
      runtime(() => ({ count: 1 }));
      runtime({
        props: {
          key: "value"
        },
        effect({ state, context, fxContext, action }) {
          expect(state).toEqual({ count: 1 });
          expect(context).toEqual({});
          expect(fxContext).toEqual({
            api: expect.any(Function)
          });
          expect(action).toEqual({
            props: {
              key: "value"
            },
            effect: expect.any(Function)
          });
          fxContext.api();
        }
      });
      expect(api).toBeCalled();
    });
  });
  describe("with context keys", () => {
    const contextKeys = ["a", "b"];
    it("should return a function", () => {
      expect(makeRuntimeFactory(contextKeys)).toBeInstanceOf(Function);
    });
    it("should return empty state and context with identity action", () => {
      const runtime = makeRuntimeFactory(contextKeys)();
      expect(runtime(getState)).toEqual([{}, {}]);
    });
    it("should update state when dispatching action functions", () => {
      const runtime = makeRuntimeFactory(contextKeys)();
      expect(runtime(() => ({ count: 0, a: 1, b: 2 }))).toEqual([
        { count: 0 },
        { a: 1, b: 2 }
      ]);
      expect(runtime(state => ({ count: state.count + 1 }))).toEqual([
        { count: 1 },
        { a: 1, b: 2 }
      ]);
      expect(runtime(getState)).toEqual([{ count: 1 }, { a: 1, b: 2 }]);
    });
    it("should not update state when dispatching objects but the state and context should be returned", () => {
      const runtime = makeRuntimeFactory(contextKeys)();
      runtime(() => ({ key: "value", a: 1, b: 2 }));
      expect(runtime({ count: 1 })).toEqual([{ key: "value" }, { a: 1, b: 2 }]);
    });
    it("should update state when dispatching array of action functions", () => {
      const incAction = ({ count }) => ({ count: count + 1 });
      const runtime = makeRuntimeFactory(contextKeys)();
      runtime(() => ({ count: 0, a: 1, b: 2 }));
      expect(runtime([incAction, incAction, incAction])).toEqual([
        { count: 3 },
        { a: 1, b: 2 }
      ]);
    });
    it("should run fx", () => {
      const api = jest.fn();
      const runtime = makeRuntimeFactory(contextKeys)({
        api
      });
      runtime(() => ({ count: 1, a: 1, b: 2 }));
      runtime({
        props: {
          key: "value"
        },
        effect({ state, context, fxContext, action }) {
          expect(state).toEqual({ count: 1 });
          expect(context).toEqual({ a: 1, b: 2 });
          expect(fxContext).toEqual({
            api: expect.any(Function)
          });
          expect(action).toEqual({
            props: {
              key: "value"
            },
            effect: expect.any(Function)
          });
          fxContext.api();
        }
      });
      expect(api).toBeCalled();
    });
  });
});
