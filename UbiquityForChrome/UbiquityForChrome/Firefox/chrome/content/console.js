Components.utils.import("resource://ubiquity/modules/sandboxfactory.js");

function maybeFixUpUbiquityMessage(target) {
  var href = target && target.getAttribute("href");
  if (href && href != (href = SandboxFactory.unmungeUrl(href)))
    target.setAttribute("href", href);
}

{
  let box = document.getElementById("ConsoleBox");
  Array.forEach((box.mConsoleRowBox || box /* Console2 */).children,
                maybeFixUpUbiquityMessage);
  box.addEventListener("DOMNodeInserted", function onNewRow(ev) {
    maybeFixUpUbiquityMessage(ev.originalTarget);
  }, false);
}
