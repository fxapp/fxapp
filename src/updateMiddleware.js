const { isFn } = require("../src/utils");

const updateMiddleware = (action, result) => [
  action,
  result,
  isFn(action) && action
];

module.exports = updateMiddleware;
