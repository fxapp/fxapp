const afterTicks = require("./afterTicks");
const makeServerRuntime = require("../src/makeServerRuntime");
const { version } = require("../package");

describe("makeServerRuntime", () => {
  it("should be a function", () =>
    expect(makeServerRuntime).toBeInstanceOf(Function));
  it("should parse request and send response", async () => {
    const runtime = makeServerRuntime();
    const setHeader = jest.fn();
    const end = jest.fn();
    const serverResponse = { setHeader, end };
    runtime({ url: "" }, serverResponse);

    await afterTicks(3);

    expect(serverResponse.statusCode).toBe(200);
    expect(setHeader).toBeCalledWith("Server", `fxapp v${version}`);
    expect(end).toBeCalledWith();
  });
  it("should run custom fx and merge request/response state", async () => {
    const runtime = makeServerRuntime([
      ({ response }) => ({ request: { custom: response.statusCode + 1 } }),
      ({ request }) => ({ response: { statusCode: request.custom } })
    ]);
    const end = jest.fn();
    const serverResponse = { setHeader: jest.fn(), end };
    runtime({ url: "" }, serverResponse);

    await afterTicks(3);

    expect(serverResponse.statusCode).toBe(201);
  });
  it("should treat state outside of request/response as global to all requests", async () => {
    const runtime = makeServerRuntime([
      ({ count = 0 }) => ({
        count: count + 1,
        response: { text: String(count) }
      })
    ]);
    const end1 = jest.fn();
    runtime({ url: "" }, { setHeader: jest.fn(), end: end1 });
    await afterTicks(3);
    expect(end1).toBeCalledWith("0");

    const end2 = jest.fn();
    runtime({ url: "" }, { setHeader: jest.fn(), end: end2 });
    await afterTicks(3);
    expect(end2).toBeCalledWith("1");
  });
});
