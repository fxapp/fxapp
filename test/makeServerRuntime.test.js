const afterTicks = require("./afterTicks");
const makeServerRuntime = require("../src/makeServerRuntime");

describe("makeServerRuntime", () => {
  it("should be a function", () =>
    expect(makeServerRuntime).toBeInstanceOf(Function));
  it("should dispatch init fx", async () => {
    const initFx = jest.fn();
    makeServerRuntime({ initFx });
    await afterTicks(1);

    expect(initFx).toBeCalled();
  });
  it("should dispatch request fx when called", async () => {
    const requestFx = jest.fn();
    const serverRuntime = await makeServerRuntime({ requestFx });
    serverRuntime();
    await afterTicks(1);

    expect(requestFx).toBeCalled();
  });
  it("should merge request state", async () => {
    const serverResponse = {
      send: jest.fn()
    };
    const requestFx = [
      {
        run({ dispatch, serverRequest }) {
          dispatch({
            request: { count: serverRequest.count },
            response: { method: "send" }
          });
        }
      },
      ({ request: { count } }) => ({
        request: { count: count + 1 },
        response: { text: count + 1 }
      }),
      {
        run({ dispatch, serverResponse }) {
          dispatch(({ response: { method, text } }) => {
            expect(method).toBe("send");
            serverResponse[method](text);
          });
        }
      }
    ];
    const serverRuntime = await makeServerRuntime({ requestFx });
    serverRuntime({ count: 0 }, serverResponse);
    await afterTicks(4);

    expect(serverResponse.send).toBeCalledWith(1);
  });
  it("should preserve state outside of request/response as global", async () => {
    const requestFx = [
      ({ count }) => ({
        count: count + 1
      }),
      {
        run({ dispatch, serverResponse }) {
          dispatch(({ count }) => {
            serverResponse.send(count);
          });
        }
      }
    ];
    const serverRuntime = await makeServerRuntime({
      initFx: { count: 0 },
      requestFx
    });
    const serverResponse1 = {
      send: jest.fn()
    };
    serverRuntime({}, serverResponse1);
    await afterTicks(5);
    expect(serverResponse1.send).toBeCalledWith(1);
  });
});
