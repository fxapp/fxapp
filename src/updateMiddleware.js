const { isFn } = require("../src/utils");

const updateMiddleware = (action, inputs, outputs) => [
  action,
  inputs,
  outputs,
  isFn(action) && action
];

module.exports = updateMiddleware;
