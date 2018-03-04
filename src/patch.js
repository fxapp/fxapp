import { assign } from "./utils";
import { isFx } from "./fxUtils";

export function patch(node, container, runFx) {
  function updateAttribute(element, name, value, oldValue) {
    if (name === "style") {
      for (var i in assign(oldValue, value)) {
        element[name][i] = value == null || value[i] == null ? "" : value[i];
      }
    } else {
      if (name in element) {
        if (isFx(value)) {
          // FIXME: only overwrite if fx changed
          element[name] = function() {
            // FIXME: provide event somehow
            runFx(value);
          };
        } else {
          element[name] = value == null ? "" : value;
        }
      } else if (value != null && value !== false) {
        element.setAttribute(name, value);
      }
    }
  }

  function createElement(node, parent) {
    var nextElement;
    if (Array.isArray(node) && typeof node[0] === "string") {
      nextElement = document.createElement(node[0]);
      for (var i = 1; i < node.length; i++) {
        var childElement = createElement(node[i], nextElement);
        if (childElement) {
          nextElement.appendChild(childElement);
        }
      }
    } else if (typeof node === "string" || typeof node === "number") {
      nextElement = document.createTextNode(node);
    } else {
      for (var name in node) {
        updateAttribute(parent, name, node[name], null, false);
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
