const { version } = require("../../package");
const { assign } = require("../utils");

const requestContextMiddleware = (action, resultActions) =>
  resultActions.concat(({ request, response }) => ({
    request: assign([
      request,
      {
        method: action.method,
        url: action.url,
        headers: action.headers
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
  }));

module.exports = requestContextMiddleware;
