const mergeMiddleware = require("../src/mergeMiddleware");

describe("mergeMiddleware", () => {
  it("should be a function", () =>
    expect(mergeMiddleware).toBeInstanceOf(Function));
  it("should passthrough non actions", () => {
    expect(mergeMiddleware()).toEqual([undefined, undefined, undefined, false]);
    expect(mergeMiddleware(true, true)).toEqual([true, true, undefined, false]);
    expect(mergeMiddleware(666, 666)).toEqual([666, 666, undefined, false]);
    expect(mergeMiddleware("wat", "wat")).toEqual([
      "wat",
      "wat",
      undefined,
      false
    ]);
    expect(mergeMiddleware([], [])).toEqual([[], [], undefined, false]);
  });
  it("should passthrough action functions that don't return new state", () =>
    expect(mergeMiddleware(() => [])[3]({ a: 1 })).toEqual([]));
  it("should return a merge action function when called with state and action function", () => {
    const incAction = state => ({ count: state.count + 1 });
    expect(mergeMiddleware(incAction)[3]({ count: 0, a: 1 })).toEqual({
      count: 1,
      a: 1
    });
  });
});
