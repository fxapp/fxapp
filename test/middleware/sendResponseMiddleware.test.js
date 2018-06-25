const sendResponseMiddleware = require("../../src/middleware/sendResponseMiddleware");

describe("sendResponseMiddleware", () => {
  it("should be a function", () =>
    expect(sendResponseMiddleware).toBeInstanceOf(Function));
  describe("returning an effect object", () => {
    const [response] = sendResponseMiddleware({}, []);
    it("should have an effect property", () => {
      expect(response.effect).toBeInstanceOf(Function);
    });
    it("should set status code and message", () => {
      const fxProps = {
        context: {
          response: {
            statusCode: 418,
            statusMessage: "I'm a teapot!"
          }
        },
        fxContext: { response: { end: jest.fn() } }
      };
      response.effect(fxProps);
      expect(fxProps.fxContext.response).toEqual({
        statusCode: 418,
        statusMessage: "I'm a teapot!",
        end: expect.any(Function)
      });
    });
    it("should set headers", () => {
      const fxProps = {
        context: {
          response: {
            headers: {
              Cookie: "yummy",
              "Content-Length": 666
            }
          }
        },
        fxContext: { response: { setHeader: jest.fn(), end: jest.fn() } }
      };
      response.effect(fxProps);
      expect(fxProps.fxContext.response.setHeader).toHaveBeenCalledWith(
        "Cookie",
        "yummy"
      );
      expect(fxProps.fxContext.response.setHeader).toHaveBeenCalledWith(
        "Content-Length",
        666
      );
    });
    it("should call response end unknown response type", () => {
      const fxProps = {
        context: { response: {} },
        fxContext: { response: { end: jest.fn() } }
      };
      response.effect(fxProps);
      expect(fxProps.fxContext.response.end).toBeCalled();
    });
    it("should set content type and end with text response", () => {
      const fxProps = {
        context: {
          response: {
            text: "hello world"
          }
        },
        fxContext: { response: { setHeader: jest.fn(), end: jest.fn() } }
      };
      response.effect(fxProps);
      expect(fxProps.fxContext.response.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "text/plain"
      );
      expect(fxProps.fxContext.response.end).toBeCalledWith("hello world");
    });
    it("should set content type and end with html response", () => {
      const fxProps = {
        context: {
          response: {
            html: "<h1>hello world<h1>"
          }
        },
        fxContext: { response: { setHeader: jest.fn(), end: jest.fn() } }
      };
      response.effect(fxProps);
      expect(fxProps.fxContext.response.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "text/html"
      );
      expect(fxProps.fxContext.response.end).toBeCalledWith(
        "<h1>hello world<h1>"
      );
    });
    it("should set content type and end with json response", () => {
      const fxProps = {
        context: {
          response: {
            json: { key: "value" }
          }
        },
        fxContext: { response: { setHeader: jest.fn(), end: jest.fn() } }
      };
      response.effect(fxProps);
      expect(fxProps.fxContext.response.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/json"
      );
      expect(fxProps.fxContext.response.end).toBeCalledWith('{"key":"value"}');
    });
  });
});
