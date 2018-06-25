const makeApplyMiddleware = require("../src/makeApplyMiddleware");

describe("makeApplyMiddleware", () => {
  it("should be a function", () =>
    expect(makeApplyMiddleware).toBeInstanceOf(Function));
  it("should return a function", () =>
    expect(makeApplyMiddleware()).toBeInstanceOf(Function));
  it("should treat no arguments as an empty action", () =>
    expect(makeApplyMiddleware()()).toEqual([]));
  describe("with middleware", () => {
    const incMiddleware = (action, actions) => [
      ...actions,
      ({ count }) => ({ count: count + action.by })
    ];
    const applyMiddleware = makeApplyMiddleware([incMiddleware, incMiddleware]);
    it("should return a function", () =>
      expect(applyMiddleware).toBeInstanceOf(Function));
    it("should be able to return actions that reference the original action", () => {
      const middlewareResults = applyMiddleware({ by: 1 });
      expect(middlewareResults[0]({ count: 0 })).toEqual({
        count: 1
      });
      expect(middlewareResults[1]({ count: 1 })).toEqual({
        count: 2
      });
    });
  });
});
