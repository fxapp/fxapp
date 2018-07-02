const { assign } = require("../utils");

const makeRouterMiddleware = (routes = {}) =>
  function routerMiddleware(actions) {
    return actions.concat(state => {
      const {
        request: { path }
      } = state;
      const matchingRouteKey = Object.keys(routes).find(route =>
        RegExp(`^${route}$`).test(path)
      );
      const matchedRoute = routes[matchingRouteKey];
      return matchedRoute && assign([state, matchedRoute(state)]);
    });
  };

module.exports = makeRouterMiddleware;
