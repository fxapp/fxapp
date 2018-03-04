function assign(from, assignments) {
  var obj = {};

  for (var i in from) obj[i] = from[i];
  for (var i in assignments) obj[i] = assignments[i];

  return obj;
}

function set(path, value, from) {
  var target = {};
  if (path.length) {
    target[path[0]] =
      path.length > 1 ? set(path.slice(1), value, from[path[0]]) : value;
    return assign(from, target);
  }
  return value;
}

function get(path, from) {
  for (var i = 0; i < path.length; i++) {
    from = from[path[i]];
  }
  return from;
}

export function h() {
  if (typeof arguments[0] === "function") {
    return arguments[0](arguments[1] || {}, arguments[2]);
  }
  var vnode = [arguments[0]];
  var index = 1;
  if (
    arguments[index] === Object(arguments[index]) &&
    !Array.isArray(arguments[index])
  ) {
    vnode.push(arguments[index]);
    index++;
  }
  var children = [];
  for (; index < arguments.length; index++) {
    var child = arguments[index];
    if (child !== undefined) {
      children.push(child);
    }
  }
  if (children.length) {
    vnode.push(children);
  }

  return vnode;
}

export function fxapp(props) {
  var globalState = assign(props.state);
  var wiredActions = assign(props.actions);

  function getState(namespace, path) {
    var path = path || "";
    var splitPath = path.split(".").filter(function(part) {
      return part;
    });
    var fullPath =
      path.startsWith(".") && splitPath.length
        ? splitPath
        : namespace.concat(splitPath);
    return get(fullPath, globalState);
  }

  function mergeState(namespace, props) {
    var partialState = props.partialState;
    var path = props.path.length ? props.path.split(".") : [];
    var fullNamespace = namespace.concat(path);
    var updatedSlice = assign(get(fullNamespace, globalState), partialState);
    globalState = set(fullNamespace, updatedSlice, globalState);
    return updatedSlice;
  }

  function wireFx(namespace, state, actions) {
    var defaultFx = {
      get: getState.bind(null, namespace),
      merge: function(partialState, path) {
        return [
          "merge",
          {
            partialState: partialState,
            path: path || ""
          }
        ];
      }
    };
    var fxRunners = {
      merge: function(namespace, props) {
        return mergeState(namespace, props);
      }
    };
    for (var key in actions) {
      typeof actions[key] === "function"
        ? (function(key, action) {
            actions[key] = function(data) {
              var actionFx = assign(defaultFx, {
                data: data
              });
              var actionResult = action(actionFx);
              if (Array.isArray(actionResult)) {
                var fxType = actionResult[0];
                var fxProps = actionResult[1];
                var fxRunner = fxRunners[fxType];
                if (typeof fxRunner === "function") {
                  return fxRunner(namespace, fxProps);
                }
              }
              return actionResult;
            };
          })(key, actions[key])
        : wireFx(
            namespace.concat(key),
            (state[key] = assign(state[key])),
            (actions[key] = assign(actions[key]))
          );
    }
  }
  wireFx([], globalState, wiredActions);

  return wiredActions;
}
