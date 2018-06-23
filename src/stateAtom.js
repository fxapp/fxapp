const { isFn } = require("./utils");

const makeStateAtom = (currentState = {}) =>
  function atom(action) {
    if (isFn(action)) {
      currentState = action(currentState);
      return currentState;
    }
    return action;
  };

const getState = state => state;

module.exports = {
  makeStateAtom,
  getState
};
