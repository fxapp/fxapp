const { isFn, isObj, assign } = require("./utils");

const mergeMiddleware = (actions = []) =>
  actions.map(
    action =>
      isFn(action)
        ? (latestState, actionResult = action(latestState)) =>
            isObj(actionResult)
              ? assign([latestState, actionResult])
              : actionResult
        : action
  );

module.exports = mergeMiddleware;
