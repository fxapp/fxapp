const isArray = Array.isArray;
const isFn = value => typeof value === "function";
const isObj = value => value && typeof value === "object" && !isArray(value);
const isPropsTuple = value =>
  value.length === 2 &&
  (isFn(value[0]) || isFx(value[0])) &&
  isObj(value[1]) &&
  !isFx(value[1]);
const isFx = value => isObj(value) && isFn(value.run);

const assign = (...args) => Object.assign({}, ...args);

module.exports = {
  isArray,
  isFn,
  isObj,
  isPropsTuple,
  isFx,
  assign
};
