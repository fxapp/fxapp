const parseBody = require("../../src/fx/parseBody");

describe("parseBody", () => {
  it("should have a run function", () =>
    expect(parseBody.run).toBeInstanceOf(Function));
  it("should handle empty body", () => {
    let onDataEnd;
    const serverRequest = {
      on(eventName, callback) {
        if (eventName === "end") {
          onDataEnd = callback;
        }
      }
    };
    const dispatch = jest.fn();
    parseBody.run({ serverRequest, dispatch });
    expect(onDataEnd).toBeInstanceOf(Function);
    onDataEnd();

    expect(dispatch).toBeCalledWith({ request: { body: "" } });
  });
  it("should handle raw body without content length", () => {
    let onData;
    let onDataEnd;
    const serverRequest = {
      on(eventName, callback) {
        if (eventName === "data") {
          onData = callback;
        } else if (eventName === "end") {
          onDataEnd = callback;
        }
      }
    };
    const dispatch = jest.fn();
    parseBody.run({ serverRequest, dispatch });
    expect(onData).toBeInstanceOf(Function);
    onData(Buffer.from("hello"));
    onData(Buffer.from(" world"));
    expect(onDataEnd).toBeInstanceOf(Function);
    onDataEnd();

    expect(dispatch).toBeCalledWith({ request: { body: "hello world" } });
  });
  it("should handle raw body with correct content length", () => {
    let onData;
    let onDataEnd;
    const serverRequest = {
      headers: {
        "content-length": "11"
      },
      on(eventName, callback) {
        if (eventName === "data") {
          onData = callback;
        } else if (eventName === "end") {
          onDataEnd = callback;
        }
      }
    };
    const dispatch = jest.fn();
    parseBody.run({ serverRequest, dispatch });
    expect(onData).toBeInstanceOf(Function);
    onData(Buffer.from("hello"));
    onData(Buffer.from(" world"));
    expect(onDataEnd).toBeInstanceOf(Function);
    onDataEnd();

    expect(dispatch).toBeCalledWith({ request: { body: "hello world" } });
  });
  it("should truncate raw body with wrong content length", () => {
    let onData;
    let onDataEnd;
    const serverRequest = {
      headers: {
        "content-length": "8"
      },
      on(eventName, callback) {
        if (eventName === "data") {
          onData = callback;
        } else if (eventName === "end") {
          onDataEnd = callback;
        }
      }
    };
    const dispatch = jest.fn();
    parseBody.run({ serverRequest, dispatch });
    expect(onData).toBeInstanceOf(Function);
    onData(Buffer.from("hello"));
    onData(Buffer.from(" world"));
    expect(onDataEnd).toBeInstanceOf(Function);
    onDataEnd();

    expect(dispatch).toBeCalledWith({ request: { body: "hello wo" } });
  });
  it("should handle proper json body", () => {
    let onData;
    let onDataEnd;
    const serverRequest = {
      headers: {
        "content-type": "application/json"
      },
      on(eventName, callback) {
        if (eventName === "data") {
          onData = callback;
        } else if (eventName === "end") {
          onDataEnd = callback;
        }
      }
    };
    const dispatch = jest.fn();
    parseBody.run({ serverRequest, dispatch });
    expect(onData).toBeInstanceOf(Function);
    onData(Buffer.from(`{"test":"object"}`));
    expect(onDataEnd).toBeInstanceOf(Function);
    onDataEnd();

    expect(dispatch).toBeCalledWith({
      request: { body: `{"test":"object"}`, jsonBody: { test: "object" } }
    });
  });
  it("should handle invalid json body", () => {
    let onData;
    let onDataEnd;
    const serverRequest = {
      headers: {
        "content-type": "application/json"
      },
      on(eventName, callback) {
        if (eventName === "data") {
          onData = callback;
        } else if (eventName === "end") {
          onDataEnd = callback;
        }
      }
    };
    const dispatch = jest.fn();
    parseBody.run({ serverRequest, dispatch });
    expect(onData).toBeInstanceOf(Function);
    onData(Buffer.from(`{"test":"object}`));
    expect(onDataEnd).toBeInstanceOf(Function);
    onDataEnd();

    expect(dispatch).toBeCalledWith({
      request: { body: `{"test":"object}` }
    });
  });
});
