const { isArray, isFn, isFx, isObj, assign, entries } = require("../utils");

const matchRoute = props => {
  const { routes = {}, path = [], params = {}, method = "" } = props;
  if (isFn(routes) || isFx(routes) || isArray(routes)) {
    return {
      run({ dispatch }) {
        dispatch({ request: { params } });
        dispatch(routes);
      }
    };
  } else if (isObj(routes)) {
    return entries(routes)
      .sort(([a], [b]) => a < b)
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

const routerEffect = ({ dispatch, routes }) =>
  dispatch(({ request: { path, method } }) =>
    matchRoute({ routes, path: path.split("/").slice(1), method })
  );

module.exports = routes => ({
  run: routerEffect,
  routes
});
