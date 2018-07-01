const sendResponseMiddleware = require("../../src/middleware/sendResponseMiddleware");

describe("sendResponseMiddleware", () => {
  it("should be a function", () =>
    expect(sendResponseMiddleware).toBeInstanceOf(Function));
  describe("returning an effect object", () => {
    const [responseEffect] = sendResponseMiddleware([]);
    it("should have an effect property", () => {
      expect(responseEffect.effect).toBeInstanceOf(Function);
    });
    it("should set status code and message", () => {
      const fxContext = {
        response: { end: jest.fn() }
      };
      responseEffect.effect({
        fxContext,
        dispatch: action =>
          action({
            response: {
              statusCode: 418,
              statusMessage: "I'm a teapot!"
            }
          })
      });
      expect(fxContext.response).toEqual({
        statusCode: 418,
        statusMessage: "I'm a teapot!",
        end: expect.any(Function)
      });
    });
    it("should set headers", () => {
      const fxContext = { response: { setHeader: jest.fn(), end: jest.fn() } };
      responseEffect.effect({
        fxContext,
        dispatch: action =>
          action({
            response: {
              headers: {
                Cookie: "yummy",
                "Content-Length": 666
              }
            }
          })
      });
      expect(fxContext.response.setHeader).toHaveBeenCalledWith(
        "Cookie",
        "yummy"
      );
      expect(fxContext.response.setHeader).toHaveBeenCalledWith(
        "Content-Length",
        666
      );
    });
    it("should call response end unknown response type", () => {
      const fxContext = { response: { end: jest.fn() } };
      responseEffect.effect({
        fxContext,
        dispatch: action =>
          action({
            response: {}
          })
      });
      expect(fxContext.response.end).toBeCalled();
    });
    it("should set content type and end with text response", () => {
      const fxContext = { response: { setHeader: jest.fn(), end: jest.fn() } };
      responseEffect.effect({
        fxContext,
        dispatch: action =>
          action({
            response: {
              text: "hello world"
            }
          })
      });
      expect(fxContext.response.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "text/plain"
      );
      expect(fxContext.response.end).toBeCalledWith("hello world");
    });
    it("should set content type and end with html response", () => {
      const fxContext = { response: { setHeader: jest.fn(), end: jest.fn() } };
      responseEffect.effect({
        fxContext,
        dispatch: action =>
          action({
            response: {
              html: "<h1>hello world<h1>"
            }
          })
      });
      expect(fxContext.response.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "text/html"
      );
      expect(fxContext.response.end).toBeCalledWith("<h1>hello world<h1>");
    });
    it("should set content type and end with json response", () => {
      const fxContext = { response: { setHeader: jest.fn(), end: jest.fn() } };
      responseEffect.effect({
        fxContext,
        dispatch: action =>
          action({
            response: {
              json: { key: "value" }
            }
          })
      });
      expect(fxContext.response.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/json"
      );
      expect(fxContext.response.end).toBeCalledWith('{"key":"value"}');
    });
  });
});
