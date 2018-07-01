const requestUrlMiddleware = require("../../src/middleware/requestUrlMiddleware");

describe("requestUrlMiddleware", () => {
  it("should be a function", () =>
    expect(requestUrlMiddleware).toBeInstanceOf(Function));
  it("should parse url request props", () => {
    const [middlewareAction] = requestUrlMiddleware([]);
    expect(
      middlewareAction({
        request: {
          method: "GET",
          url: "/test/route?param=value&multiple=true",
          headers: { "user-agent": "fxapp" }
        }
      })
    ).toEqual({
      request: {
        method: "GET",
        url: "/test/route?param=value&multiple=true",
        headers: { "user-agent": "fxapp" },
        path: "/test/route",
        query: {
          param: "value",
          multiple: "true"
        }
      }
    });
  });
});
