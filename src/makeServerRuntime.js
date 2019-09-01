const { assign, omit } = require("./utils");
const makeFxRuntime = require("./makeFxRuntime");
const parseRequest = require("./fx/parseRequest");
const sendResponse = require("./fx/sendResponse");

const serverStateMerge = (prevState, nextState) =>
  assign(prevState, omit("request", "response")(nextState), {
    request: assign(prevState.request, nextState.request),
    response: assign(prevState.response, nextState.response)
  });

const makeServerRuntime = customFx => {
  return (serverRequest, serverResponse) => {
    const { dispatch } = makeFxRuntime({
      mergeState: serverStateMerge,
      mapProps: props => assign(props, { serverRequest, serverResponse })
    });
    dispatch(parseRequest);
    dispatch(sendResponse);
    dispatch(customFx);
  };
};

module.exports = makeServerRuntime;
