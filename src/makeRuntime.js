const makeRuntime = (middleware = []) => (action = []) =>
  middleware.reduce(
    (prevActions, nextMiddleware) => nextMiddleware(prevActions),
    [].concat(action)
  );

module.exports = makeRuntime;
