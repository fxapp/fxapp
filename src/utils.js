const isArray = Array.isArray;
const isFn = value => typeof value === "function";
const isObj = value => value && typeof value === "object" && !isArray(value);
const isFx = value => isObj(value) && isFn(value.run);

const assign = (...args) => Object.assign({}, ...args);

module.exports = {
  isArray,
  isFn,
  isObj,
  isFx,
  assign
};
