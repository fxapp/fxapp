const makeRouterMiddleware = (routes = {}) => (
  { request: { path } },
  resultActions
) => {
  const matchingRouteKey = Object.keys(routes).find(route =>
    RegExp(`^${route}$`).test(path)
  );
  const matchedRoute = routes[matchingRouteKey];
  return resultActions.concat(matchedRoute ? matchedRoute : []);
};

module.exports = makeRouterMiddleware;
