const { assign } = require("./utils");
const makeFxRuntime = require("./makeFxRuntime");
const parseRequest = require("./fx/parseRequest");
const sendResponse = require("./fx/sendResponse");

const serverStateMerge = (globalState, prevState, nextState) => {
  // mutation for performance
  for (const globalKey in nextState) {
    if (globalKey !== "request" && globalKey !== "response") {
      globalState[globalKey] = nextState[globalKey];
    }
  }
  return assign(globalState, prevState, nextState, {
    request: assign(prevState.request, nextState.request),
    response: assign(prevState.response, nextState.response)
  });
};

const makeServerRuntime = customFx => {
  const globalState = {};
  const mergeState = serverStateMerge.bind(null, globalState);
  return (serverRequest, serverResponse) => {
    const { dispatch } = makeFxRuntime({
      mergeState,
      mapProps: props => assign(props, { serverRequest, serverResponse })
    });
    dispatch(parseRequest);
    dispatch(sendResponse);
    dispatch(customFx);
  };
};

module.exports = makeServerRuntime;
