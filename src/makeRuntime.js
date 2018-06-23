const { isArray, isObj, isFn } = require("./utils");
const { makeStateAtom, getState } = require("./stateAtom");

const makeRuntime = (middleware = []) => {
  const atom = makeStateAtom();
  const runtime = action => {
    if (isArray(action)) {
      return action.map(runtime);
    }
    const [lastAction, lastResult, lastState] = middleware.reduce(
      ([prevAction, prevResult], nextMiddleware) => {
        const currentState = atom(getState);
        const [nextAction, nextResult, updater] = nextMiddleware(
          prevAction,
          prevResult,
          currentState
        );
        atom(updater);
        const nextState = atom(getState);
        return [nextAction, nextResult, nextState];
      },
      [action]
    );
    if (isObj(lastAction) && isFn(lastAction.effect)) {
      lastAction.effect(lastState, runtime);
    }
    return [lastAction, lastResult, lastState];
  };

  return runtime;
};

module.exports = makeRuntime;
