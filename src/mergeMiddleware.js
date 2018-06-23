const { isFn, isObj, assign } = require("./utils");

const mergeMiddleware = (action, inputs, outputs) => [
  action,
  inputs,
  outputs,
  isFn(action) &&
    ((latestState, actionResult = action(latestState)) =>
      isObj(actionResult) ? assign([latestState, actionResult]) : actionResult)
];

module.exports = mergeMiddleware;
