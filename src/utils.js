const isArray = Array.isArray;
const isFn = value => typeof value === "function";
const isObj = value => typeof value === "object" && !isArray(value);
const isFx = value => isObj(value) && isFn(value.effect);

const assign = assignments => Object.assign({}, ...assignments);

const entries = obj => Object.keys(obj).map(key => [key, obj[key]]);

const omit = props => object =>
  assign(
    Object.keys(object)
      .filter(key => !props.includes(key))
      .map(key => ({ [key]: object[key] }))
  );
const pick = props => object =>
  assign(props.map(prop => ({ [prop]: object[prop] })));

module.exports = {
  isArray,
  isFn,
  isObj,
  isFx,
  assign,
  entries,
  omit,
  pick
};
