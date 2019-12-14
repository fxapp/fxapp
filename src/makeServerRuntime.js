const { assign } = require("./utils");
const makeFxRuntime = require("./makeFxRuntime");

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

const makeServerRuntime = ({ initFx, requestFx }) => {
  const globalState = {};
  const mergeState = serverStateMerge.bind(null, globalState);
  const initRuntime = makeFxRuntime({
    mergeState
  });
  initRuntime.dispatch(initFx);
  return new Promise(resolve =>
    initRuntime.dispatch({
      after: true,
      run() {
        resolve((serverRequest, serverResponse) => {
          const requestRuntime = makeFxRuntime({
            state: globalState,
            mergeState,
            mapProps: props => assign(props, { serverRequest, serverResponse })
          });
          requestRuntime.dispatch(requestFx);
        });
      }
    })
  );
};

module.exports = makeServerRuntime;
