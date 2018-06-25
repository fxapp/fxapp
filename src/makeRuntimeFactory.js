const { isArray, isFn, isFx, assign } = require("./utils");

const makeRuntimeFactory = (contextKeys = []) => {
  let state = {};
  return fxContext => {
    let context = {};
    const dispatch = action => {
      if (isArray(action)) {
        action.forEach(dispatch);
      } else if (isFn(action)) {
        const actionResult = action(assign([state, context]));
        for (let key in actionResult) {
          if (contextKeys.includes(key)) {
            context[key] = actionResult[key];
          } else {
            state[key] = actionResult[key];
          }
        }
      } else if (isFx(action)) {
        action.effect({
          state,
          context,
          fxContext,
          action
        });
      }
      return [state, context];
    };
    return dispatch;
  };
};

module.exports = makeRuntimeFactory;
