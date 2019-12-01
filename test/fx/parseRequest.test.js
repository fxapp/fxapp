const parseRequest = require("../../src/fx/parseRequest");
const { version } = require("../../package");

describe("parseRequest", () => {
  it("should have a run function", () =>
    expect(parseRequest.run).toBeInstanceOf(Function));
  it("should parse server requests", () => {
    const dispatch = jest.fn();
    parseRequest.run({
      dispatch,
      serverRequest: {
        method: "GET",
        url: "/path/other/123?param=value&multiple=1&multiple=2",
        headers: {
          Host: "localhost:8080"
        }
      }
    });
    expect(dispatch).toBeCalledWith({
      request: {
        method: "GET",
        url: "/path/other/123?param=value&multiple=1&multiple=2",
        path: "/path/other/123",
        query: { param: "value", multiple: ["1", "2"] },
        headers: {
          Host: "localhost:8080"
        }
      },
      response: {
        statusCode: 200,
        headers: { Server: `fxapp v${version}` }
      }
    });
  });
});
