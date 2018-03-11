import { isFn } from "./utils";

export function h(type, props, children) {
  var args = arguments;
  if (isFn(type)) {
    return type(props || {}, children);
  }
  var vnode = [].filter.call(args, function(node) {
    return node != null;
  });

  return vnode;
}
