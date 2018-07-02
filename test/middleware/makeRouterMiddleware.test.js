const makeRouterMiddleware = require("../../src/middleware/makeRouterMiddleware");

describe("makeRouterMiddleware", () => {
  it("should be a function", () =>
    expect(makeRouterMiddleware).toBeInstanceOf(Function));
  describe("without routes", () => {
    it("should return a middleware function", () =>
      expect(makeRouterMiddleware()).toBeInstanceOf(Function));
    it("should return empty actions", () => {
      const [middlewareAction] = makeRouterMiddleware()([]);
      expect(
        middlewareAction({
          request: {
            path: "/"
          }
        })
      ).toBeFalsy();
    });
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
    const expectEmptyRouter = path => {
      const [middlewareAction] = routerMiddleware([]);
      expect(middlewareAction({ request: { path } })).toBeFalsy();
    };
    const expectRouterToReturn = (path, text) => {
      const [middlewareAction] = routerMiddleware([]);
      expect(middlewareAction({ request: { path } })).toEqual({
        request: { path },
        response: {
          text
        }
      });
    };
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
