import { isFn, assign, get } from "./utils";
import { makeFx } from "./fxUtils";
import { patch } from "./patch";

export function app(props) {
  var store = {
    state: assign(props.state),
    actions: assign(props.actions)
  };

  function wireFx(namespace, state, actions) {
    var sliceFx = makeFx(namespace, store, props.fx);

    for (var key in actions) {
      isFn(actions[key])
        ? (function(key, action) {
            actions[key] = function(data) {
              var actionResult = action({
                state: get(namespace, store.state),
                data: data,
                fx: sliceFx.creators
              });
              sliceFx.run(actionResult);
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

  var rootFx = makeFx([], store, props.fx);
  var container = props.container || document.body;
  function render() {
    var nextNode = props.view({
      state: store.state,
      fx: rootFx.creators
    });
    patch(nextNode, container, rootFx.run);
  }

  if (isFn(props.view)) {
    store.onchange = render;
    render();
  }

  return store.actions;
}
