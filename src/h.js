export function h() {
  var vnode = [].filter.call(arguments, function(node) {
    return node != null;
  });

  return vnode;
}
