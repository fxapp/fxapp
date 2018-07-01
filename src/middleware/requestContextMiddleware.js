const { version } = require("../../package");
const { assign } = require("../utils");

const requestEffect = {
  effect: ({ dispatch, fxContext: { request: serverRequest } }) =>
    dispatch(({ request, response }) => ({
      request: assign([
        request,
        {
          method: serverRequest.method,
          url: serverRequest.url,
          headers: serverRequest.headers
        }
      ]),
      response: assign([
        response,
        {
          statusCode: 200,
          headers: {
            Server: `fxapp v${version}`
          }
        }
      ])
    }))
};

function requestContextMiddleware(actions) {
  return actions.concat(requestEffect);
}

module.exports = requestContextMiddleware;
