const isArray = Array.isArray;
const isFn = value => typeof value === "function";
const isObj = value => typeof value === "object" && !isArray(value);
const isFx = value => isObj(value) && isFn(value.effect);

const assign = assignments => Object.assign({}, ...assignments);

const entries = obj => Object.keys(obj).map(key => [key, obj[key]]);

module.exports = {
  isArray,
  isFn,
  isObj,
  isFx,
  assign,
  entries
};
