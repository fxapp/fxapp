const { assign } = require("./utils");
const makeFxRuntime = require("./makeFxRuntime");
const parseRequest = require("./fx/parseRequest");
const parseBody = require("./fx/parseBody");
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

const makeServerRuntime = ({ state, customFx } = {}) => {
  const globalState = assign(state);
  const mergeState = serverStateMerge.bind(null, globalState);
  return (serverRequest, serverResponse) => {
    const { dispatch } = makeFxRuntime({
      mergeState,
      mapProps: props => assign(props, { serverRequest, serverResponse })
    });
    dispatch(parseRequest);
    // TODO: add option for skipping body parsing?
    dispatch(parseBody);
    dispatch(sendResponse);
    dispatch(customFx);
  };
};

module.exports = makeServerRuntime;
