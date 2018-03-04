import { isFn, assign, reduceByNameAndProp } from "./util";
import { runIfFx, makeIntrinsicFx, makeGetAction } from "./fxUtil";

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
