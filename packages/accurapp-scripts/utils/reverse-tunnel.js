const { Client } = require('ssh2')
const { Socket } = require('net')

function noop() {}

function createClient(config, onReadyCb = noop, onConnectionCb = noop) {
  const conn = new Client()
  const errors = []

  conn.on('ready', function() {
    onReadyCb()
    conn.forwardIn(config.dstHost, config.dstPort, (err, port) => {
      if (err) return errors.push(err)
      conn.emit('forward-in', port)
    })
  })

  conn.on('tcp connection', (info, accept, reject) => {
    let remote
    const srcSocket = new Socket()

    srcSocket.on('error', err => {
      errors.push(err)
      if (remote === undefined) {
        reject()
      } else {
        remote.end()
      }
    })

    srcSocket.connect(config.srcPort, config.srcHost, () => {
      remote = accept()
      srcSocket.pipe(remote).pipe(srcSocket)
      if (errors.length === 0) {
        onConnectionCb(null, conn)
      } else {
        onConnectionCb(errors, null)
      }
    })
  })
  conn.connect(config)
  return conn
}

module.exports = { createClient }
