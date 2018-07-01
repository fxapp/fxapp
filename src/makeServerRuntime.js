const makeRuntimeFactory = require("./makeRuntimeFactory");
const applyMiddleware = require("./applyMiddleware");
const requestContextMiddleware = require("./middleware/requestContextMiddleware");
const requestUrlMiddleware = require("./middleware/requestUrlMiddleware");
const sendResponseMiddleware = require("./middleware/sendResponseMiddleware");

const makeServerRuntime = ({
  init,
  requestMiddleware = [requestContextMiddleware, requestUrlMiddleware],
  routerMiddleware = [],
  responseMiddleware = [sendResponseMiddleware]
}) => {
  const runtimeFactory = makeRuntimeFactory(["request", "response"]);
  runtimeFactory()(init);

  const middlewareActions = applyMiddleware([
    ...requestMiddleware,
    ...routerMiddleware,
    ...responseMiddleware
  ]);
  return (serverRequest, serverResponse) => {
    const runtime = runtimeFactory({
      request: serverRequest,
      response: serverResponse
    });

    const runtimeResults = runtime(middlewareActions);

    return runtimeResults;
  };
};

module.exports = makeServerRuntime;
