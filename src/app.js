const { createServer: httpApi } = require("http");
const { assign } = require("./utils");
const makeServer = require("./makeServer");
const makeServerRuntime = require("./makeServerRuntime");
const makeRouter = require("./fx/makeRouter");

module.exports = (options = {}) =>
  makeServer(
    assign(
      {
        httpApi,
        port: 8080,
        serverRuntime: makeServerRuntime([
          options.customFx,
          makeRouter(options.routes)
        ])
      },
      options
    )
  );
