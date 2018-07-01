const applyMiddleware = require("../src/applyMiddleware");

describe("applyMiddleware", () => {
  it("should be a function", () =>
    expect(applyMiddleware).toBeInstanceOf(Function));
  it("should treat no arguments as an empty action", () =>
    expect(applyMiddleware()).toEqual([]));
  describe("with middleware", () => {
    const incMiddleware = actions => [
      ...actions,
      ({ count }) => ({ count: count + 1 })
    ];
    it("should return actions from middleware", () => {
      const middlewareActions = applyMiddleware([incMiddleware, incMiddleware]);
      expect(middlewareActions[0]({ count: 0 })).toEqual({
        count: 1
      });
      expect(middlewareActions[1]({ count: 1 })).toEqual({
        count: 2
      });
    });
  });
});
