export default function isJavascript(scriptTag) {
  // TODO: add a console warning if the script tag doesn't have an attribute?
  // seems like it's required for some parts of ember consumption
  let type = scriptTag.attributes.type ? scriptTag.attributes.type.value : 'text/javascript';
  return /(?:application|text)\/javascript/i.test(type);
}
