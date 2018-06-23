const { isFn, isObj, assign } = require("./utils");

const mergeMiddleware = (action, result) => [
  action,
  isObj(action) ? assign([result, action]) : result,
  isFn(action) &&
    ((latestState, actionResult = action(latestState)) =>
      isObj(actionResult) ? assign([latestState, actionResult]) : actionResult)
];

module.exports = mergeMiddleware;
