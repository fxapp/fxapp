const mergeMiddleware = require("../src/mergeMiddleware");

describe("mergeMiddleware", () => {
  it("should be a function", () =>
    expect(mergeMiddleware).toBeInstanceOf(Function));
  it("should passthrough non actions", () => {
    expect(mergeMiddleware()).toEqual([undefined, undefined, false]);
    expect(mergeMiddleware(true, true)).toEqual([true, true, false]);
    expect(mergeMiddleware(666, 666)).toEqual([666, 666, false]);
    expect(mergeMiddleware("wat", "wat")).toEqual(["wat", "wat", false]);
    expect(mergeMiddleware([], [])).toEqual([[], [], false]);
  });
  it("should assign properties to result when called with action object and result", () =>
    expect(mergeMiddleware({ b: 2 }, { a: 1 })).toEqual([
      { b: 2 },
      { a: 1, b: 2 },
      false
    ]));
  it("should passthrough action functions that don't return new state", () =>
    expect(mergeMiddleware(() => [])[2]({ a: 1 })).toEqual([]));
  it("should return a merge action function when called with state and action function", () => {
    const incAction = state => ({ count: state.count + 1 });
    expect(mergeMiddleware(incAction)[2]({ count: 0, a: 1 })).toEqual({
      count: 1,
      a: 1
    });
  });
});
