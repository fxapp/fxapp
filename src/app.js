const { createServer } = require("http");
const { assign } = require("./utils");
const makeServer = require("./makeServer");
const makeServerRuntime = require("./makeServerRuntime");
const parseRequest = require("./fx/parseRequest");
const parseBody = require("./fx/parseBody");
const sendResponse = require("./fx/sendResponse");
const makeRouter = require("./fx/makeRouter");

module.exports = options => {
  const mergedOptions = assign(
    {
      port: 8080,
      httpApi: createServer,
      makeServer,
      makeServerRuntime,
      parseRequest,
      parseBody,
      sendResponse,
      makeRouter
    },
    options
  );
  return mergedOptions
    .makeServerRuntime({
      initFx: options.initFx,
      requestFx: [
        mergedOptions.parseRequest,
        mergedOptions.parseBody,
        options.requestFx,
        mergedOptions.makeRouter(options.routes),
        mergedOptions.sendResponse
      ]
    })
    .then(serverRuntime =>
      mergedOptions.makeServer({
        port: mergedOptions.port,
        httpApi: mergedOptions.httpApi,
        serverRuntime
      })
    );
};
