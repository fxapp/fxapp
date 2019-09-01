const makeRouter = require("../../src/fx/makeRouter");

describe("makeRouter", () => {
  it("should be a function", () => expect(makeRouter).toBeInstanceOf(Function));
  it("should match fallback case", () => {
    const fallbackRoute = jest.fn();
    const routes = {
      _: fallbackRoute
    };
    const router = makeRouter(routes);
    const matchedRoute = router({
      request: { path: "/", method: "GET" }
    });
    expect(matchedRoute).toEqual([{ request: { params: {} } }, fallbackRoute]);
  });
});
