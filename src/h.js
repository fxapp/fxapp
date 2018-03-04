import { isFn } from "./util";

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
