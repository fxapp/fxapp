const { isArray, isObj, isFn } = require("./utils");
const { makeStateAtom, getState } = require("./stateAtom");

const makeRuntime = (middleware = []) => {
  const atom = makeStateAtom();
  const runtime = action => {
    if (isArray(action)) {
      return action.map(runtime);
    }
    const [lastAction, lastInputs, lastOutputs, lastState] = middleware.reduce(
      ([prevAction, prevInputs, prevOutputs], nextMiddleware) => {
        const currentState = atom(getState);
        const [nextAction, nextInputs, nextOutputs, updater] = nextMiddleware(
          prevAction,
          prevInputs,
          prevOutputs,
          currentState
        );
        atom(updater);
        const nextState = atom(getState);
        return [nextAction, nextInputs, nextOutputs, nextState];
      },
      [action]
    );
    if (isObj(lastAction) && isFn(lastAction.effect)) {
      lastAction.effect(lastState, lastAction, runtime);
    }
    return [lastAction, lastInputs, lastOutputs, lastState];
  };

  return runtime;
};

module.exports = makeRuntime;
