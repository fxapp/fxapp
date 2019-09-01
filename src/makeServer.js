const makeServer = ({ httpApi, port, serverRuntime }) =>
  new Promise((resolve, reject) =>
    httpApi(serverRuntime)
      .listen({ port }, resolve)
      .on("error", reject)
  );

module.exports = makeServer;
