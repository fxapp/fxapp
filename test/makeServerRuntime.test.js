const makeServerRuntime = require("../src/makeServerRuntime");

describe("makeServerRuntime", () => {
  it("should be a function", () =>
    expect(makeServerRuntime).toBeInstanceOf(Function));
  it("should initialize state", () => {
    const serverRuntime = makeServerRuntime({
      init: () => ({ count: 0 })
    });
    expect(
      serverRuntime(
        {
          url: ""
        },
        { setHeader: jest.fn(), end: jest.fn() }
      )[0]
    ).toEqual({ count: 0 });
  });
});
