const isArray = Array.isArray;
const isFn = value => typeof value === "function";
const isObj = value => typeof value === "object" && !isArray(value);
const assign = assignments => Object.assign({}, ...assignments);

module.exports = {
  isArray,
  isFn,
  isObj,
  assign
};
