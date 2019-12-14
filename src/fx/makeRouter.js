const { isArray, isFn, isFx, isObj, assign } = require("../utils");

const matchRoute = props => {
  const { path, method, routes = {}, params = {} } = props;
  if (isFn(routes) || isFx(routes) || isArray(routes)) {
    return [{ request: { params } }, routes];
  } else if (isObj(routes)) {
    return Object.entries(routes)
      .sort(([a], [b]) => {
        if (a[0] === "$" || b === "_") return -1;
        else if (a === "_" || b[0] === "$") return 1;
        return a < b ? -1 : 1;
      })
      .reduce((matched, [subRoutePath, subRoute]) => {
        if (matched) return matched;
        if (subRoutePath === path[0])
          return matchRoute(
            assign(props, {
              routes: subRoute,
              path: path.slice(1)
            })
          );
        if (subRoutePath[0] === "$" && path[0])
          return matchRoute(
            assign(props, {
              routes: subRoute,
              path: path.slice(1),
              params: assign(params, { [subRoutePath.slice(1)]: path[0] })
            })
          );
        if (
          subRoutePath === "_" ||
          subRoutePath.toLowerCase() === method.toLowerCase()
        )
          return matchRoute(assign(props, { routes: subRoute }));
      }, null);
  }
};

module.exports = routes => ({ request: { method, path = "" } }) =>
  matchRoute({ routes, path: path.split("/").slice(1), method });
