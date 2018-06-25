const makeRouterMiddleware = require("../../src/middleware/makeRouterMiddleware");

describe("makeRouterMiddleware", () => {
  it("should be a function", () =>
    expect(makeRouterMiddleware).toBeInstanceOf(Function));
  describe("without routes", () => {
    it("should return a middleware function", () =>
      expect(makeRouterMiddleware()).toBeInstanceOf(Function));
    it("should return empty actions", () =>
      expect(
        makeRouterMiddleware()(
          {
            request: {
              path: "/"
            }
          },
          []
        )
      ).toEqual([]));
  });
  describe("with routes", () => {
    const routerMiddleware = makeRouterMiddleware({
      "/test": () => ({
        response: {
          text: "just testing"
        }
      }),
      "/api/\\d+": () => ({
        response: {
          text: "just a number"
        }
      })
    });
    const expectEmptyRouter = path =>
      expect(routerMiddleware({ request: { path } }, [])).toEqual([]);
    const expectRouterToReturn = (path, text) =>
      expect(routerMiddleware({ request: { path } }, [])[0]()).toEqual({
        response: {
          text
        }
      });
    it("should match route exactly", () =>
      expectRouterToReturn("/test", "just testing"));
    it("should not match partial routes", () => expectEmptyRouter("/t"));
    it("should not match routes with extra characters", () =>
      expectEmptyRouter("/testing"));
    it("should match regex routes", () =>
      expectRouterToReturn("/api/123", "just a number"));
    it("should not match partial regex routes", () =>
      expectEmptyRouter("/api"));
    it("should not match regex routes with extra characters", () =>
      expectEmptyRouter("/api/123/abc"));
  });
});
