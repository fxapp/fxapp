const url = require("url");
const querystring = require("querystring");
const { assign } = require("../utils");

const requestContextMiddleware = (action, resultActions) => {
  const parsedUrl = url.parse(action.url);
  return resultActions.concat(({ request }) => ({
    request: assign([
      request,
      {
        path: parsedUrl.pathname,
        query: querystring.parse(parsedUrl.query)
      }
    ])
  }));
};

module.exports = requestContextMiddleware;
