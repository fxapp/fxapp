const { createServer } = require("http");
const { assign } = require("./utils");
const makeServer = require("./makeServer");
const makeServerRuntime = require("./makeServerRuntime");
const makeRouter = require("./fx/makeRouter");

module.exports = options => {
  const mergedOptions = assign(
    {
      port: 8080,
      httpApi: createServer,
      makeServer,
      makeServerRuntime,
      makeRouter
    },
    options
  );
  return mergedOptions.makeServer({
    port: mergedOptions.port,
    httpApi: mergedOptions.httpApi,
    serverRuntime: mergedOptions.makeServerRuntime([
      options.customFx,
      mergedOptions.makeRouter(options.routes)
    ])
  });
};
