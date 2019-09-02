const makeRouter = require("../../src/fx/makeRouter");

describe("makeRouter", () => {
  it("should be a function", () => expect(makeRouter).toBeInstanceOf(Function));
  it("should handle invalid routes", () => {
    const router = makeRouter(42);
    const matchedRoute = router({ request: {} });
    expect(matchedRoute).toBeUndefined();
  });
  it("should handle empty routes", () => {
    const router = makeRouter();
    const matchedRoute = router({ request: {} });
    expect(matchedRoute).toBeNull();
  });
  describe("with example routes", () => {
    const rootFallbackAction = jest.fn();
    const pathFallbackAction = jest.fn();
    const someReadAction = jest.fn();
    const someAddAction = jest.fn();
    const otherAction = jest.fn();
    const routes = {
      _: rootFallbackAction,
      path: {
        _: pathFallbackAction,
        some: {
          GET: someReadAction,
          POST: someAddAction
        },
        other: {
          $id: otherAction
        }
      }
    };
    const router = makeRouter(routes);
    it("should use root fallback", () =>
      expect(
        router({
          request: { path: "/unknown/path", method: "GET" }
        })
      ).toEqual([{ request: { params: {} } }, rootFallbackAction]));
    it("should use nested fallback", () =>
      expect(
        router({
          request: { path: "/path/unknown", method: "GET" }
        })
      ).toEqual([{ request: { params: {} } }, pathFallbackAction]));
    it("should match nested GET request", () =>
      expect(
        router({
          request: { path: "/path/some", method: "GET" }
        })
      ).toEqual([{ request: { params: {} } }, someReadAction]));
    it("should match nested POST request", () =>
      expect(
        router({
          request: { path: "/path/some", method: "POST" }
        })
      ).toEqual([{ request: { params: {} } }, someAddAction]));
    it("should match request with params", () =>
      expect(
        router({
          request: { path: "/path/other/123", method: "GET" }
        })
      ).toEqual([{ request: { params: { id: "123" } } }, otherAction]));
  });
});
