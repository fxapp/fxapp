import { isObj, isFn, assign } from "./utils.js";
import { isFx } from "./fxUtils";

var lifecycleEventNames = ["oncreate"];

export function patch(rootNode, container, runFx) {
  var stack = [];
  function updateAttribute(element, name, value, oldValue) {
    if (name === "style" && isObj(value)) {
      for (var i in assign(oldValue, value)) {
        element[name][i] = value == null || value[i] == null ? "" : value[i];
      }
    } else {
      if (name in element) {
        if (isFx(value)) {
          // TODO: only overwrite if fx changed
          element[name] = function(event) {
            runFx(value, event);
          };
        } else {
          element[name] = value == null ? "" : value;
        }
      } else if (
        value != null &&
        value !== false &&
        lifecycleEventNames.indexOf(name) === -1
      ) {
        element.setAttribute(name, value);
      }

      if (value == null || value === false) {
        element.removeAttribute(name);
      }
    }
  }

  function createElement(node, propsNode) {
    var element =
      typeof node === "string" || typeof node === "number"
        ? document.createTextNode(node)
        : document.createElement(node[0]);
    element.vnode = node;
    stack.push(function() {
      // oncreate
      runFx((propsNode[1] || {})[lifecycleEventNames[0]], element);
    });

    return element;
  }

  function patchElement(parent, element, node, propsNode) {
    propsNode = propsNode || node;
    var newElement;
    if (Array.isArray(node) && isFn(node[0])) {
      var resolvedNode = node[0](node[1]);
      element = patchElement(parent, element, resolvedNode, node);
    } else {
      if (!element) {
        newElement = createElement(node, propsNode);
        parent.appendChild(newElement);
        element = newElement;
      }
      var lastVnode = element.vnode || [];
      var lastProps = isObj(lastVnode[1]) ? lastVnode[1] : {};
      var existingChildren = element.childNodes;
      var i;
      if (Array.isArray(node)) {
        var type = node[0];
        if (typeof type === "string") {
          if (type !== lastVnode[0]) {
            newElement = createElement(node, propsNode);
            parent.insertBefore(newElement, element);
            parent.removeChild(element);
            element = newElement;
          }

          var newProps = isObj(node[1]) ? node[1] : {};
          for (i in assign(lastProps, newProps)) {
            updateAttribute(element, i, newProps[i], lastProps[i]);
          }
          var childCount = 0;
          for (i = 1; i < node.length; i++) {
            var child = node[i];
            if (
              !isObj(child) &&
              child != null &&
              child !== true &&
              child !== false
            ) {
              childCount++;
              patchElement(element, existingChildren[i - 1], child);
            }
          }
          while (existingChildren.length > childCount && !newElement) {
            element.removeChild(existingChildren[childCount]);
          }
        } else {
          for (i = 0; i < node.length; i++) {
            patchElement(element, existingChildren[i], node[i]);
          }
        }
      } else {
        element.nodeValue = node;
      }
    }

    element.vnode = node;
    return element;
  }

  patchElement(
    container.parentNode,
    container,
    Array.isArray(rootNode) &&
    (typeof rootNode[0] === "string" || isFn(rootNode[0]))
      ? [rootNode]
      : rootNode
  );
  while (stack.length) stack.pop()();
}
