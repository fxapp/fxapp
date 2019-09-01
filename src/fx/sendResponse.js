const fs = require("fs");
const { entries } = require("../utils");

const responseEffect = ({ dispatch, serverResponse }) => {
  dispatch(
    ({
      response: {
        statusCode,
        statusMessage,
        headers,
        custom,
        json,
        html,
        filePath,
        text,
        contentType
      }
    }) => {
      serverResponse.statusCode = statusCode;
      serverResponse.statusMessage = statusMessage;
      entries(headers || {}).forEach(([name, value]) =>
        serverResponse.setHeader(name, value)
      );
      if (custom) return;
      const setContentType = type =>
        serverResponse.setHeader("Content-Type", type);
      if (json) {
        setContentType("application/json");
        serverResponse.end(JSON.stringify(json));
      } else if (html) {
        setContentType("text/html");
        serverResponse.end(html);
      } else if (filePath) {
        const fileStream = fs.createReadStream(filePath);
        fileStream.on("open", () => {
          if (contentType) {
            setContentType(contentType);
          }
          fs.createReadStream(filePath).pipe(serverResponse);
        });
        fileStream.on("error", e => {
          // eslint-disable-next-line no-console
          console.error(e);
          serverResponse.statusCode = 500;
          serverResponse.end(" ");
        });
      } else if (text) {
        if (contentType) {
          setContentType(contentType);
        } else {
          setContentType("text/plain");
        }
        serverResponse.end(text);
      } else {
        serverResponse.end();
      }
    }
  );
};

module.exports = {
  run: responseEffect,
  after: true
};
