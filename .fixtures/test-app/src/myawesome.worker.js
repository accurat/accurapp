// Listen to message from the parent thread
self.addEventListener('message', event => {
  console.log(event.data)
  // Post data to parent thread
  self.postMessage('a maneta', '*')
})