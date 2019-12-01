const makeServer = require("../src/makeServer");

describe("makeServer", () => {
  const serverRuntime = Function.prototype;
  it("should be a function", () => expect(makeServer).toBeInstanceOf(Function));
  it("should return a promise that resolves when the server is listening", () =>
    makeServer({
      port: 8080,
      serverRuntime,
      httpApi: requestListener => ({
        listen: (props, resolve) => ({
          on: () => {
            expect(requestListener).toBe(serverRuntime);
            expect(props).toEqual({
              port: 8080
            });
            resolve();
          }
        })
      })
    }));
  it("should return a promise that rejects when the server has an error starting", () =>
    makeServer({
      port: 8080,
      serverRuntime,
      httpApi: requestListener => ({
        listen: props => ({
          on: (eventName, reject) => {
            expect(requestListener).toBe(serverRuntime);
            expect(props).toEqual({
              port: 8080
            });
            expect(eventName).toBe("error");
            reject("port busy");
          }
        })
      })
    }).catch(error => expect(error).toBe("port busy")));
});
