const parseBodyEffect = ({ dispatch, serverRequest }) =>
  new Promise(resolve => {
    let contentLength;
    try {
      contentLength = parseInt(serverRequest.headers["content-length"]);
    } catch (e) {
      // we can't optimize the body buffer if we don't know how big to make it
    }
    let body = contentLength ? Buffer.alloc(contentLength) : Buffer.alloc(0);
    let currentBodyPosition = 0;
    serverRequest.on("data", chunk => {
      if (contentLength) {
        currentBodyPosition += chunk.copy(body, currentBodyPosition);
      } else {
        body = Buffer.concat([body, chunk]);
      }
      // TODO: limit memory usage to prevent dos attacks?
    });
    serverRequest.on("end", () => {
      let jsonBody;
      try {
        // TODO: still attempt parse if the body starts with a valid JSON character?
        if (serverRequest.headers["content-type"] === "application/json") {
          jsonBody = JSON.parse(body);
        }
      } catch (e) {
        // TODO: error here or leave up to app code?
      }
      dispatch({
        request: {
          body: body.toString(),
          jsonBody
        }
      });
      resolve();
    });
  });

module.exports = {
  run: parseBodyEffect
};
