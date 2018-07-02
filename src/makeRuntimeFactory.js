const { isArray, isFn, isFx, assign, omit, pick } = require("./utils");

const makeRuntimeFactory = (contextKeys = []) => {
  const stateOmitter = omit(contextKeys);
  const contextPicker = pick(contextKeys);
  let state = {};
  return fxContext => {
    let context = {};
    const dispatch = action => {
      if (isArray(action)) {
        action.forEach(dispatch);
      } else if (isFn(action)) {
        const actionResult = action(assign([state, context]));
        if (actionResult) {
          state = stateOmitter(actionResult);
          context = contextPicker(actionResult);
        }
      } else if (isFx(action)) {
        action.effect({
          action,
          dispatch,
          fxContext
        });
      }
      return [state, context];
    };
    return dispatch;
  };
};

module.exports = makeRuntimeFactory;
