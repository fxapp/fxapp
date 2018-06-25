const makeServerRuntime = require("./makeServerRuntime");

const makeServer = (
  { httpApi, port, init, routerMiddleware },
  serverRuntime = makeServerRuntime({ init, routerMiddleware })
) =>
  new Promise((resolve, reject) =>
    httpApi
      .createServer(serverRuntime)
      .listen({ port }, resolve)
      .on("error", reject)
  );

module.exports = makeServer;
