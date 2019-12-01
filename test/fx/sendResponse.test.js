const fs = require("fs");
const sendResponse = require("../../src/fx/sendResponse");

jest.mock("fs");

const runServerResponse = response => {
  const dispatch = jest.fn(fn =>
    fn({
      response
    })
  );
  const serverResponse = {
    end: jest.fn(),
    setHeader: jest.fn()
  };
  sendResponse.run({ dispatch, serverResponse });
  return serverResponse;
};

describe("sendResponse", () => {
  it("should have a run function", () =>
    expect(sendResponse.run).toBeInstanceOf(Function));
  it("should call empty end by default", () => {
    const serverResponse = runServerResponse({});
    expect(serverResponse.end).toBeCalledWith();
  });
  it("should set status code", () => {
    const serverResponse = runServerResponse({ statusCode: 418 });
    expect(serverResponse.statusCode).toEqual(418);
  });
  it("should set status message", () => {
    const serverResponse = runServerResponse({ statusMessage: "hello world" });
    expect(serverResponse.statusMessage).toEqual("hello world");
  });
  it("should set headers", () => {
    const serverResponse = runServerResponse({ headers: { Server: "fxapp" } });
    expect(serverResponse.setHeader).toBeCalledWith("Server", "fxapp");
  });
  it("should not call end with custom response", () => {
    const serverResponse = runServerResponse({ custom: true });
    expect(serverResponse.end).not.toBeCalled();
  });
  it("should send json responses", () => {
    const serverResponse = runServerResponse({ json: { some: "object" } });
    expect(serverResponse.end).toBeCalledWith(
      JSON.stringify({ some: "object" })
    );
    expect(serverResponse.setHeader).toBeCalledWith(
      "Content-Type",
      "application/json"
    );
  });
  it("should send html responses", () => {
    const serverResponse = runServerResponse({ html: "<html>hi</html>" });
    expect(serverResponse.end).toBeCalledWith("<html>hi</html>");
    expect(serverResponse.setHeader).toBeCalledWith(
      "Content-Type",
      "text/html"
    );
  });
  it("should send text responses", () => {
    const serverResponse = runServerResponse({ text: "hello world" });
    expect(serverResponse.end).toBeCalledWith("hello world");
    expect(serverResponse.setHeader).toBeCalledWith(
      "Content-Type",
      "text/plain"
    );
  });
  it("should send text responses with custom content types", () => {
    const serverResponse = runServerResponse({
      text: "1,2,3",
      contentType: "text/csv"
    });
    expect(serverResponse.end).toBeCalledWith("1,2,3");
    expect(serverResponse.setHeader).toBeCalledWith("Content-Type", "text/csv");
  });
  it("should pipe file streams without content type", () => {
    let serverResponse;
    const pipe = jest.fn();
    fs.createReadStream.mockReset();
    fs.createReadStream.mockReturnValue({
      on: jest.fn((type, fn) => {
        if (type === "open") {
          fn();
        }
      }),
      pipe
    });
    serverResponse = runServerResponse({
      filePath: "/some/path"
    });

    expect(fs.createReadStream).toBeCalledWith("/some/path");
    expect(pipe).toBeCalledWith(serverResponse);
    expect(serverResponse.setHeader).toBeCalledWith(
      "Content-Type",
      "application/octet-stream"
    );
  });
  it("should pipe file streams with content type", () => {
    let serverResponse;
    const pipe = jest.fn();
    fs.createReadStream.mockReset();
    fs.createReadStream.mockReturnValue({
      on: jest.fn((type, fn) => {
        if (type === "open") {
          fn();
        }
      }),
      pipe
    });
    serverResponse = runServerResponse({
      filePath: "/some/path",
      contentType: "video/mp4"
    });

    expect(fs.createReadStream).toBeCalledWith("/some/path");
    expect(pipe).toBeCalledWith(serverResponse);
    expect(serverResponse.setHeader).toBeCalledWith(
      "Content-Type",
      "video/mp4"
    );
  });
  it("should respond with 404 on error opening file", () => {
    let serverResponse;
    const pipe = jest.fn();
    fs.createReadStream.mockReset();
    fs.createReadStream.mockReturnValue({
      on: jest.fn((type, fn) => {
        if (type === "error") {
          fn();
        }
      }),
      pipe
    });
    serverResponse = runServerResponse({
      filePath: "/nope/not/even"
    });

    expect(fs.createReadStream).toBeCalledWith("/nope/not/even");
    expect(serverResponse.statusCode).toEqual(404);
    expect(serverResponse.end).toBeCalledWith(" ");
  });
});
