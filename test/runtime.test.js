const makeRuntime = require("../src/makeRuntime");

describe("makeRuntime", () => {
  it("should be a function", () =>
    expect(makeRuntime).toBeInstanceOf(Function));
  it("should return a function", () =>
    expect(makeRuntime()).toBeInstanceOf(Function));
  it("should treat no arguments as an empty action", () =>
    expect(makeRuntime()()).toEqual([]));
  it("should passthrough dispatched actions", () =>
    expect(makeRuntime()({ key: "value" })).toEqual([{ key: "value" }]));
  describe("with middleware", () => {
    const incMiddleware = actions => [
      ...actions,
      state => ({ count: state.count + 1 })
    ];
    const runtime = makeRuntime([incMiddleware]);
    it("should return a function", () =>
      expect(runtime).toBeInstanceOf(Function));
    it("should be able to add actions", () => {
      const helloAction = () => ({ message: "hello" });
      const middlewareResults = runtime(helloAction);
      expect(middlewareResults[0]()).toEqual({ message: "hello" });
      expect(middlewareResults[1]({ count: 0 })).toEqual({ count: 1 });
    });
  });
});
