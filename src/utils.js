export function isFn(value) {
  return typeof value === "function";
}

export function assign(from, assignments) {
  var i,
    obj = {};

  for (i in from) obj[i] = from[i];
  for (i in assignments) obj[i] = assignments[i];

  return obj;
}

export function set(prefixes, value, from) {
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

export function get(prefixes, from) {
  for (var i = 0; i < prefixes.length; i++) {
    from = from && from[prefixes[i]];
  }
  return from;
}

export function reduceByNameAndProp(items, prop) {
  return items.reduce(function(others, next) {
    others[next.name] = next[prop];
    return others;
  }, {});
}
