const url = require("url");
const querystring = require("querystring");
const { assign } = require("../utils");

function requestUrlMiddleware(actions) {
  return actions.concat(state => {
    const parsedUrl = url.parse(state.request.url);
    return assign([
      state,
      {
        request: assign([
          state.request,
          {
            path: parsedUrl.pathname,
            query: querystring.parse(parsedUrl.query)
          }
        ])
      }
    ]);
  });
}

module.exports = requestUrlMiddleware;
