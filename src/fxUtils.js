import { isFn, assign, set, get, reduceByNameAndProp } from "./utils";

export var isFx = Array.isArray;

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

export function runIfFx(maybeFx, currentEvent, fxRunners, getAction) {
  if (!isFx(maybeFx)) {
    // Not an effect
  } else if (isFx(maybeFx[0])) {
    // Run an array of effects
    for (var i in maybeFx) {
      runIfFx(maybeFx[i], currentEvent, fxRunners, getAction);
    }
  } else if (maybeFx.length) {
    // Run a single effect
    var fxType = maybeFx[0];
    var fxProps = assign(maybeFx[1], { event: currentEvent });
    var fxRunner = fxRunners[fxType];
    if (isFn(fxRunner)) {
      fxRunner(fxProps, getAction);
    } else {
      throw new Error("no such fx type: " + fxType);
    }
  }
}

export function makeIntrinsicFx(namespace, store) {
  return [
    {
      name: "merge",
      creator: function(partialState, path) {
        return {
          partialState: partialState,
          path: path
        };
      },
      runner: function(fxProps) {
        var fullNamespace = resolvePathInNamespace(namespace, fxProps.path);
        var updatedSlice = assign(
          get(fullNamespace, store.state),
          fxProps.partialState
        );
        store.state = set(fullNamespace, updatedSlice, store.state);
        if (isFn(store.onchange)) {
          store.onchange(store.state);
        }
      }
    },
    {
      name: "action",
      creator: function(path, data) {
        return {
          path: path,
          data: data
        };
      },
      runner: function(fxProps, getAction) {
        getAction(fxProps.path)(fxProps.data);
      }
    },
    {
      name: "event",
      creator: function(path) {
        return {
          path: path
        };
      },
      runner: function(fxProps, getAction) {
        getAction(fxProps.path)(fxProps.event);
      }
    }
  ];
}

export function makeGetAction(namespace, actions) {
  return function(path) {
    var fullNamespace = resolvePathInNamespace(namespace, path);
    var requestedAction = get(fullNamespace, actions);
    if (!isFn(requestedAction)) {
      throw new Error("couldn't find action: " + fullNamespace.join("."));
    }
    return requestedAction;
  };
}

function makeFxCreator(name, fxCreator) {
  return function() {
    return [name, fxCreator.apply(null, arguments)];
  };
}

export function makeFx(namespace, store, userFx) {
  var intrinsicFx = makeIntrinsicFx(namespace, store);
  var allFx = (userFx || []).concat(intrinsicFx);
  var fxCreators = reduceByNameAndProp(allFx, "creator");
  for (var name in fxCreators) {
    fxCreators[name] = makeFxCreator(name, fxCreators[name]);
  }
  var fxRunners = reduceByNameAndProp(allFx, "runner");
  var getAction = makeGetAction(namespace, store.actions);
  return {
    creators: fxCreators,
    run: function(maybeFx, currentEvent) {
      runIfFx(maybeFx, currentEvent, fxRunners, getAction);
    }
  };
}
