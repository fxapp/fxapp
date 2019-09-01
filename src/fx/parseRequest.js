const url = require("url");
const querystring = require("querystring");
const { version } = require("../../package");

const parseRequestEffect = ({ dispatch, serverRequest }) => {
  const parsedUrl = url.parse(serverRequest.url);
  dispatch({
    request: {
      headers: serverRequest.headers,
      method: serverRequest.method,
      url: serverRequest.url,
      path: parsedUrl.pathname,
      query: querystring.parse(parsedUrl.query)
    },
    response: {
      statusCode: 200,
      headers: {
        Server: `fxapp v${version}`
      }
    }
  });
};

module.exports = {
  run: parseRequestEffect
};
