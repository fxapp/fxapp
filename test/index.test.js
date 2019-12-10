const { app } = require("../src");

describe("app", () => {
  it("should be a function", () => expect(app).toBeInstanceOf(Function));
  it("should wire together all the APIs", () => {
    const httpApi = jest.fn();
    const customFx = jest.fn();
    const router = jest.fn();
    expect(
      app({
        port: 666,
        customFx,
        httpApi,
        makeServer: options => options,
        makeServerRuntime: fx => fx,
        makeRouter: () => router,
        state: { initial: "state" }
      })
    ).toEqual({
      port: 666,
      httpApi,
      serverRuntime: {
        state: { initial: "state" },
        customFx: [customFx, router]
      }
    });
  });
});
