// TODO remove this when it will be integrated in jsdom
// https://github.com/jsdom/jsdom/issues/1721
function noop() { }
if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', { value: noop })
}
