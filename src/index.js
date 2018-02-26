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
