const makeServer = require("../src/makeServer");

describe("makeServer", () => {
  it("should be a function", () => expect(makeServer).toBeInstanceOf(Function));
  it("should return a promise that resolves when the server is listening", () =>
    makeServer({
      port: 8080,
      httpApi: {
        createServer: () => ({
          listen: (props, resolve) => ({
            on: () => {
              expect(props).toEqual({
                port: 8080
              });
              resolve();
            }
          })
        })
      }
    }));
  it("should return a promise that rejects when the server has an error starting", () =>
    makeServer({
      port: 8080,
      httpApi: {
        createServer: () => ({
          listen: props => ({
            on: (_, reject) => {
              expect(props).toEqual({
                port: 8080
              });
              reject("port busy");
            }
          })
        })
      }
    }).catch(error => expect(error).toBe("port busy")));
});
