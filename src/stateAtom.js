const { isFn } = require("./utils");

const makeStateAtom = (currentState = {}) => action =>
  isFn(action) ? (currentState = action(currentState)) : action;

const getState = state => state;

module.exports = {
  makeStateAtom,
  getState
};
