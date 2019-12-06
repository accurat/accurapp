const os = require('os')
const { Socket } = require('net')
const got = require('got')
const { Client } = require('ssh2')
const { extractCurrentRepo, extractCurrentBranch } = require('../utils/git-utils')

function noop() {}

function createClient(config, onReadyCb = noop, onConnectionCb = noop) {
  const conn = new Client()
  const errors = []

  conn.on('ready', () => {
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

const { USER, SSH_AUTH_SOCK, TUNNEL_DOMAIN = 'internal.accurat.io' } = process.env

function generateSubdomain() {
  const repo = extractCurrentRepo()
  const branch = extractCurrentBranch()
  if (!repo) return os.hostname()
  if (branch === 'master') return repo.trim()
  return `${branch.trim()}.${repo.trim()}`
}

function tunnelPort(localPort, subdomain) {
  return got
    .post(`https://${TUNNEL_DOMAIN}?subdomain=${subdomain}`, { json: true })
    .then(res => {
      const { port, error } = res.body
      if (error) throw error
      return port
    })
    .then(dstPort => {
      return new Promise((resolve, reject) => {
        return createClient(
          {
            host: TUNNEL_DOMAIN,
            port: 2222,
            dstHost: 'localhost',
            dstPort: dstPort,
            srcHost: 'localhost',
            srcPort: localPort,
            keepAlive: true,
            agent: SSH_AUTH_SOCK,
            username: USER,
          },
          () => resolve(`https://${subdomain}.${TUNNEL_DOMAIN}`)
        )
      })
    })
}

module.exports = { tunnelPort, generateSubdomain }
