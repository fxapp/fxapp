const applyMiddleware = (middleware = []) =>
  middleware.reduce(
    (prevActions, nextMiddleware) => nextMiddleware(prevActions),
    []
  );

module.exports = applyMiddleware;
