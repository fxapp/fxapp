import { isFx } from "./fxUtils";

var lifecycleEvents = ["oncreate"];

export function patch(node, container, runFx) {
  function updateAttribute(element, name, value) {
    if (name === "style") {
      for (var i in value) {
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
        lifecycleEvents.indexOf(name) === -1
      ) {
        element.setAttribute(name, value);
      }
    }
  }

  function createElement(node, parent) {
    var nextElement;
    if (Array.isArray(node)) {
      var type = node[0];
      var props = node[1] || {};
      if (typeof type === "string") {
        nextElement = document.createElement(type);
        for (var i = 1; i < node.length; i++) {
          var childElement = createElement(node[i], nextElement);
          if (childElement) {
            nextElement.appendChild(childElement);
          }
        }
      } else {
        var resolvedNode = type(props, node[2]);
        nextElement = createElement(resolvedNode, parent);
      }
      // oncreate
      runFx(props[lifecycleEvents[0]], nextElement);
    } else if (typeof node === "string" || typeof node === "number") {
      nextElement = document.createTextNode(node);
    } else {
      for (var name in node) {
        updateAttribute(parent, name, node[name]);
      }
    }

    if (nextElement) {
      parent.appendChild(nextElement);
    }
    return nextElement;
  }

  // FIXME: make a real patch
  // instead of throwing away DOM each time
  container.innerHTML = "";
  createElement(node, container);
}
