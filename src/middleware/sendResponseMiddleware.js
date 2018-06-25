const { entries } = require("../utils");

const responseEffect = {
  effect({
    context: { response: contextResponse },
    fxContext: { response: serverResponse }
  }) {
    serverResponse.statusCode = contextResponse.statusCode;
    serverResponse.statusMessage = contextResponse.statusMessage;
    entries(contextResponse.headers || {}).forEach(([name, value]) =>
      serverResponse.setHeader(name, value)
    );
    const setContentType = contentType =>
      serverResponse.setHeader("Content-Type", contentType);
    if (contextResponse.json) {
      setContentType("application/json");
      serverResponse.end(JSON.stringify(contextResponse.json));
    } else if (contextResponse.html) {
      setContentType("text/html");
      serverResponse.end(contextResponse.html);
    } else if (contextResponse.text) {
      setContentType("text/plain");
      serverResponse.end(contextResponse.text);
    } else {
      serverResponse.end();
    }
  }
};

const sendResponseMiddleware = (_, actions) => actions.concat(responseEffect);

module.exports = sendResponseMiddleware;
