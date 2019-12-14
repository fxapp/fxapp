const { app } = require("../src");

describe("app", () => {
  it("should be a function", () => expect(app).toBeInstanceOf(Function));
  it("should wire together all the APIs", async () => {
    const httpApi = jest.fn();
    const initFx = jest.fn();
    const parseRequest = jest.fn();
    const parseBody = jest.fn();
    const sendResponse = jest.fn();
    const requestFx = jest.fn();
    const router = jest.fn();
    expect(
      await app({
        port: 666,
        httpApi,
        makeServer: options => Promise.resolve(options),
        makeServerRuntime: fx => Promise.resolve(fx),
        initFx,
        parseRequest,
        parseBody,
        requestFx,
        makeRouter: () => router,
        sendResponse
      })
    ).toEqual({
      port: 666,
      httpApi,
      serverRuntime: {
        initFx,
        requestFx: [parseRequest, parseBody, requestFx, router, sendResponse]
      }
    });
  });
});
