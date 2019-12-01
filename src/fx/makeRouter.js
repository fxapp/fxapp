const { isArray, isFn, isFx, isObj, assign } = require("../utils");

const matchRoute = props => {
  const { path, method, routes = {}, params = {} } = props;
  if (isFn(routes) || isFx(routes) || isArray(routes)) {
    return [{ request: { params } }, routes];
  } else if (isObj(routes)) {
    return Object.entries(routes)
      .sort(([a], [b]) => (b === "_" ? -1 : a < b))
      .reduce((matched, [subRoutePath, subRoute]) => {
        if (matched) return matched;
        if (
          subRoutePath === "_" ||
          subRoutePath.toLowerCase() === method.toLowerCase()
        )
          return matchRoute(assign(props, { routes: subRoute }));
        if (subRoutePath === path[0])
          return matchRoute(
            assign(props, {
              routes: subRoute,
              path: path.slice(1)
            })
          );
        if (subRoutePath[0] === "$")
          return matchRoute(
            assign(props, {
              routes: subRoute,
              path: path.slice(1),
              params: assign(params, { [subRoutePath.slice(1)]: path[0] })
            })
          );
      }, null);
  }
};

module.exports = routes => ({ request: { method, path = "" } }) =>
  matchRoute({ routes, path: path.split("/").slice(1), method });
