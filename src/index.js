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
  function isValidChild(child) {
    return child != null && true !== child && false !== child;
  }
  function addChild(child) {
    if (Array.isArray(child)) {
      children.push(child.filter(isValidChild));
    } else if (isValidChild(child)) {
      children.push(child);
    }
  }
  for (; index < arguments.length; index++) {
    addChild(arguments[index]);
  }
  vnode.push(children);

  return vnode;
}

export function fxapp(props) {
  var globalState = assign(props.state);
  var wiredActions = assign(props.actions);

  function wireStateToActions(path, state, actions) {
    for (var key in actions) {
      typeof actions[key] === "function"
        ? (function(key, action) {
            actions[key] = function(data) {
              var actionResult = action(get(path, globalState), data);
              if (
                actionResult &&
                actionResult !== (state = get(path, globalState))
              ) {
                globalState = set(
                  path,
                  assign(state, actionResult),
                  globalState
                );
              }

              return actionResult;
            };
          })(key, actions[key])
        : wireStateToActions(
            path.concat(key),
            (state[key] = assign(state[key])),
            (actions[key] = assign(actions[key]))
          );
    }
  }
  wireStateToActions([], globalState, wiredActions);

  return wiredActions;
}
