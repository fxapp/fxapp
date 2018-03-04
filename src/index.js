function assign(from, assignments) {
  var obj = {};

  for (var i in from) obj[i] = from[i];
  for (var i in assignments) obj[i] = assignments[i];

  return obj;
}

function set(prefixes, value, from) {
  var target = {};
  if (prefixes.length) {
    target[prefixes[0]] =
      prefixes.length > 1
        ? set(prefixes.slice(1), value, from[prefixes[0]])
        : value;
    return assign(from, target);
  }
  return value;
}

function get(prefixes, from) {
  for (var i = 0; i < prefixes.length; i++) {
    from = from[prefixes[i]];
  }
  return from;
}

function resolvePathInNamespace(namespace, path) {
  path = path || "";
  var splitPath = path.split(".").filter(function(part) {
    return part;
  });
  var fullNamespace =
    path.startsWith(".") && splitPath.length
      ? splitPath
      : namespace.concat(splitPath);
  return fullNamespace;
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

  function wireFx(namespace, state, actions) {
    var defaultFx = {
      get: function(path) {
        var prefixes = resolvePathInNamespace(namespace, path);
        return get(prefixes, globalState);
      },
      merge: function(partialState, path) {
        return [
          "merge",
          {
            partialState: partialState,
            path: path
          }
        ];
      }
    };
    var fxRunners = {
      merge: function(props) {
        var fullNamespace = resolvePathInNamespace(namespace, props.path);
        var updatedSlice = assign(
          get(fullNamespace, globalState),
          props.partialState
        );
        globalState = set(fullNamespace, updatedSlice, globalState);
        return updatedSlice;
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
                  return fxRunner(fxProps);
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
