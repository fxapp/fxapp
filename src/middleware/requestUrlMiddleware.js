const url = require("url");
const querystring = require("querystring");
const { assign } = require("../utils");

function requestUrlMiddleware(actions) {
  return actions.concat(({ request }) => {
    const parsedUrl = url.parse(request.url);
    return {
      request: assign([
        request,
        {
          path: parsedUrl.pathname,
          query: querystring.parse(parsedUrl.query)
        }
      ])
    };
  });
}

module.exports = requestUrlMiddleware;
