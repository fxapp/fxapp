# FX App

[![Build Status](https://travis-ci.org/fxapp/fxapp.svg?branch=master)](https://travis-ci.org/fxapp/fxapp)
[![codecov](https://codecov.io/gh/fxapp/fxapp/branch/master/graph/badge.svg)](https://codecov.io/gh/fxapp/fxapp)
[![npm](https://img.shields.io/npm/v/fxapp.svg)](https://www.npmjs.org/package/fxapp)

Build JavaScript server apps using _effects as data_.

## Getting Started

```console
$ npm i fxapp
```

```js
const { app } = require("fxapp");

app({
  routes: () => ({
    response: {
      text: "Hello World"
    }
  })
});
```

[http://localhost:8080](http://localhost:8080)

## `app` Options

### `port`

Default: `8080`

The port on which the server will listen.

### `routes`

Default: `{}`

Routes are defined as a nested object structure with some properties having special meanings. The first matching route value will be dispatched.

Example:

```js
app({
  routes: {
    _: fallbackAction,
    path: {
      some: {
        GET: someReadAction,
        POST: someAddAction
      },
      other: {
        $id: otherAction
      }
    }
  }
});
```

#### Default Routes

The special wildcard `_` route is reserved for routes that match in the absence of a more specific route. Useful for 404 and related behaviors. Sending a `GET` request to `/unknown/path` will respond with the results of `fallbackAction`.

#### HTTP Method Routes

Routes with the name of an [HTTP request method](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods) will match any requests with that method. Sending a `GET` request to `/path/some` with the example route will respond with the results of `someReadAction`. A `POST` request to `/path/some` will respond with the results of `someAddAction`.

#### Path Params

Routes beginning with `$` are reserved and define a path parameter for matching at that position. In the example above sending a `GET` request to `/path/other/123` will respond with the results of passing `{id: "123"}` as the `request.params` to `otherAction`.

### Advanced: `httpApi`

### Advanced: `serverRuntime`

## State Shape

```js
{
  request: {
    method: "GET",
    url: "/test/route?param=value&multiple=1&multiple=2",
    path: "/test/route",
    query: { param: "value", multiple: ["1", "2"] },
    params: { id: "route" },
    headers: {
      Host: "localhost:8080"
    }
  },
  response: {
    statusCode: 200,
    headers: { Server: "fxapp" },
    text: "Hello World"
  }
}
```

### `request`

Normalized data parsed from the [HTTP request](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_message) that is currently being processed.

#### `request.method`

Examples: `GET`, `HEAD`, `POST`, `PUT`, `DELETE`, `CONNECT`, `OPTIONS`, `TRACE`, `PATCH`

The [HTTP request method](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods) used to make the request.

#### `request.url`

The full request URL, including query parameters.

#### `request.path`

The request path, omitting query parameters.

#### `request.query`

An object containing the request query parameters. Multiple instances of the same parameter are stored as an array.

#### `request.params`

An object containing path parameters from the router.

#### `request.headers`

An object containing all [HTTP request headers](https://en.wikipedia.org/wiki/List_of_HTTP_header_fields#Standard_request_fields).

### `response`

Data representing the [HTTP response](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Response_message) that will be sent to the client once all FX are done running.

#### `response.statusCode`

Default: `200`

The [HTTP status code](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes) to send in the response.

#### `response.headers`

The [HTTP response headers](https://en.wikipedia.org/wiki/List_of_HTTP_header_fields#Response_fields) to send.

#### `response.json`

The HTTP response body that will be sent as `application/json`. Value will be formatted using `JSON.stringify`.

#### `response.html`

The HTTP response body that will be sent as `text/html`.

#### `response.text`

The HTTP response body that will be sent as `text/plain`.

## Dispatchable Types

### State Mapping Function `state => newState`

Perform an immutable state update by receiving the current state as a parameter and returning the new state. Automatically shallow merges root properties in addition to one level under `request` and `response`.

### FX

_FX as data_ are represented with an object containing a `run` function and `props` object that will be passed to the `run` function.

```js
{
  run: (dispatch: function(Dispatchable), props: {}) => Promise?
  props: {
    concurrent: boolean,
    after: boolean,
    cancel: boolean,
    serverRequest: IncomingMessage,
    serverResponse: ServerResponse
    ...
  }
}
```

The `run` function returns a `Promise` if the effect is async. Async FX are considered still running until resolved or rejected. Otherwise FX are considered sync and done once the `run` function returns.

Some `props` are reserved and have special meaning:

#### `concurrent`

Default: `false`

Used for running multiple FX in parallel where the results are unrelated. These FX will take priority and must all complete before running any nonconcurrent FX.

#### `after`

Default: `false`

Run FX after all others are complete. Use this for logging, cleanup, or providing custom response-sending logic.

#### `cancel`

Default: `false`

Cancel all other FX immediately. Cancelled FX are no longer able to dispatch. FX already dispatched with `after` will still be run to allow for the response to be sent. Use this to enforce timeouts for sending responses.

#### `serverRequest`

The internal [http.IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage) used by the Node HTTP server implementation. Allows for FX to interact with the request object to get additional data.

#### `serverResponse`

The internal [http.ServerResponse](https://nodejs.org/api/http.html#http_class_http_serverresponse) used by the Node HTTP server implementation. Allows for FX to send other types of responses.

### Arrays

A batch of state mapping functions and/or FX may be dispatched by wrapping them in an array.

## License

FX App is MIT licensed. See [LICENSE](LICENSE.md).
