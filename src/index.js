var isFx = Array.isArray;
var isFn = function(value) {
  return typeof value === "function";
};

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
    from = from && from[prefixes[i]];
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

function reduceByNameAndProp(items, prop) {
  return items.reduce(function(others, next) {
    others[next.name] = next[prop];
    return others;
  }, {});
}

export function h() {
  if (isFn(arguments[0])) {
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

function runIfFx(maybeFx, fxRunners, getAction) {
  if (!isFx(maybeFx)) {
    // Not an effect
  } else if (isFx(maybeFx[0])) {
    // Run an array of effects
    for (var i in maybeFx) {
      runIfFx(maybeFx[i], fxRunners, getAction);
    }
  } else if (maybeFx.length) {
    // Run a single effect
    var fxType = maybeFx[0];
    var fxProps = maybeFx[1];
    var fxRunner = fxRunners[fxType];
    if (isFn(fxRunner)) {
      fxRunner(fxProps, getAction);
    } else {
      throw new Error("no such fx type: " + fxType);
    }
  }
}

function makeIntrinsicFx(namespace, store) {
  return [
    {
      name: "get",
      creator: function(path) {
        var prefixes = resolvePathInNamespace(namespace, path);
        return get(prefixes, store.state);
      }
    },
    {
      name: "merge",
      creator: function(partialState, path) {
        return [
          "merge",
          {
            partialState: partialState,
            path: path
          }
        ];
      },
      runner: function(fxProps) {
        var fullNamespace = resolvePathInNamespace(namespace, fxProps.path);
        var updatedSlice = assign(
          get(fullNamespace, store.state),
          fxProps.partialState
        );
        store.state = set(fullNamespace, updatedSlice, store.state);
      }
    },
    {
      name: "action",
      creator: function(path, data) {
        return [
          "action",
          {
            path: path,
            data: data
          }
        ];
      },
      runner: function(fxProps, getAction) {
        var requestedAction = getAction(fxProps.path);
        requestedAction(fxProps.data);
      }
    }
  ];
}

function makeGetAction(namespace, actions) {
  return function(path) {
    var fullNamespace = resolvePathInNamespace(namespace, path);
    var requestedAction = get(fullNamespace, actions);
    if (!isFn(requestedAction)) {
      throw new Error("couldn't find action: " + fullNamespace.join("."));
    }
    return requestedAction;
  };
}

export function fxapp(props) {
  var store = {
    state: assign(props.state),
    actions: assign(props.actions)
  };

  function wireFx(namespace, state, actions) {
    var intrinsicFx = makeIntrinsicFx(namespace, store);
    var allFx = (props.fx || []).concat(intrinsicFx);
    var fxCreators = reduceByNameAndProp(allFx, "creator");
    var fxRunners = reduceByNameAndProp(allFx, "runner");
    var getAction = makeGetAction(namespace, store.actions);

    for (var key in actions) {
      isFn(actions[key])
        ? (function(key, action) {
            actions[key] = function(data) {
              var actionFx = assign(fxCreators, {
                data: data
              });
              var actionResult = action(actionFx);
              runIfFx(actionResult, fxRunners, getAction);
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
  wireFx([], store.state, store.actions);

  return store.actions;
}
