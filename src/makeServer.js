const makeServer = ({ httpApi, port, serverRuntime }) =>
  new Promise((resolve, reject) =>
    httpApi
      .createServer(serverRuntime)
      .listen({ port }, resolve)
      .on("error", reject)
  );

module.exports = makeServer;
