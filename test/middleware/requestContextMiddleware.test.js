const { version } = require("../../package");

const requestContextMiddleware = require("../../src/middleware/requestContextMiddleware");

describe("requestContextMiddleware", () => {
  it("should be a function", () =>
    expect(requestContextMiddleware).toBeInstanceOf(Function));
  it("should extract the proper request properties and populate the initial response properties", () => {
    const [middlewareAction] = requestContextMiddleware(
      {
        method: "GET",
        url: "/",
        headers: { "user-agent": "fxapp" }
      },
      []
    );
    expect(
      middlewareAction({
        request: {
          length: 0
        },
        response: {
          length: 666
        }
      })
    ).toEqual({
      request: {
        length: 0,
        method: "GET",
        url: "/",
        headers: {
          "user-agent": "fxapp"
        }
      },
      response: {
        length: 666,
        statusCode: 200,
        headers: {
          Server: `fxapp v${version}`
        }
      }
    });
  });
});
