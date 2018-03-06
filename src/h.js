import { isFn } from "./utils";

export function h() {
  if (isFn(arguments[0])) {
    return arguments[0](arguments[1] || {}, arguments[2]);
  }
  var vnode = [].filter.call(arguments, function(node) {
    return node !== undefined;
  });

  return vnode;
}
