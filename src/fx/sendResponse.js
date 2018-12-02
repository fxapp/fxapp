const { entries } = require("../utils");

const responseEffect = (dispatch, { serverResponse }) => {
  dispatch(
    ({
      response: { statusCode, statusMessage, headers, json, html, text }
    }) => {
      serverResponse.statusCode = statusCode;
      serverResponse.statusMessage = statusMessage;
      entries(headers || {}).forEach(([name, value]) =>
        serverResponse.setHeader(name, value)
      );
      const setContentType = contentType =>
        serverResponse.setHeader("Content-Type", contentType);
      if (json) {
        setContentType("application/json");
        serverResponse.end(JSON.stringify(json));
      } else if (html) {
        setContentType("text/html");
        serverResponse.end(html);
      } else if (text) {
        setContentType("text/plain");
        serverResponse.end(text);
      } else {
        serverResponse.end();
      }
    }
  );
};

module.exports = {
  run: responseEffect,
  props: { after: true }
};
