const makeRuntimeFactory = require("./makeRuntimeFactory");
const makeApplyMiddleware = require("./makeApplyMiddleware");
const requestContextMiddleware = require("./middleware/requestContextMiddleware");
const requestUrlMiddleware = require("./middleware/requestUrlMiddleware");
const sendResponseMiddleware = require("./middleware/sendResponseMiddleware");

const makeServerRuntime = ({
  init,
  requestMiddleware = [],
  routerMiddleware = [],
  responseMiddleware = []
}) => {
  const runtimeFactory = makeRuntimeFactory(["request", "response"]);
  runtimeFactory()(init);

  const applyRequestMiddleware = makeApplyMiddleware([
    requestContextMiddleware,
    requestUrlMiddleware,
    ...requestMiddleware
  ]);
  const applyRouterMiddleware = makeApplyMiddleware(routerMiddleware);
  const applyResponseMiddleware = makeApplyMiddleware([
    ...responseMiddleware,
    sendResponseMiddleware
  ]);
  return (serverRequest, serverResponse) => {
    const runtime = runtimeFactory({
      request: serverRequest,
      response: serverResponse
    });

    const requestActions = applyRequestMiddleware(serverRequest);
    const [, requestContext] = runtime(requestActions);
    const routerActions = applyRouterMiddleware(requestContext);
    const [, routerContext] = runtime(routerActions);
    const responseActions = applyResponseMiddleware(routerContext);
    const responseResults = runtime(responseActions);

    return responseResults;
  };
};

module.exports = makeServerRuntime;
