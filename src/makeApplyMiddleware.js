const makeApplyMiddleware = (middleware = []) => action =>
  middleware.reduce(
    (prevActions, nextMiddleware) => nextMiddleware(action, prevActions),
    []
  );

module.exports = makeApplyMiddleware;
