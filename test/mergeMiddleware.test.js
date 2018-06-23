const mergeMiddleware = require("../src/mergeMiddleware");

describe("mergeMiddleware", () => {
  it("should be a function", () =>
    expect(mergeMiddleware).toBeInstanceOf(Function));
  it("should passthrough non actions", () => {
    expect(mergeMiddleware()).toEqual([]);
    expect(mergeMiddleware([true])).toEqual([true]);
    expect(mergeMiddleware([666])).toEqual([666]);
    expect(mergeMiddleware(["wat"])).toEqual(["wat"]);
    expect(mergeMiddleware([[]])).toEqual([[]]);
  });
  it("should passthrough action functions that don't return partial state objects", () =>
    expect(mergeMiddleware([() => []])[0]({ a: 1 })).toEqual([]));
  it("should return a merge action function when called with action functions", () => {
    const incAction = state => ({ count: state.count + 1 });
    expect(
      mergeMiddleware([incAction, incAction])[1]({ count: 0, a: 1 })
    ).toEqual({
      count: 1,
      a: 1
    });
  });
});
