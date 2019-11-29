const got = require('got')
const os = require('os')
const { createClient } = require('./reverse-tunnel')
const { extractCurrentRepo, extractCurrentBranch } = require('../utils/git-utils')

const { USER, SSH_AUTH_SOCK, BASE_DOMAIN = 'internal.accurat.io' } = process.env

function generateSubdomain() {
  const repo = extractCurrentRepo()
  const branch = extractCurrentBranch()
  if (!repo) return os.hostname()
  if (branch === 'master') return repo.trim()
  return `${branch.trim()}.${repo.trim()}`
}

function tunnelPort(localPort, subdomain) {
  return got
    .post(`https://${BASE_DOMAIN}?subdomain=${subdomain}`, { json: true })
    .then(res => {
      const { port, error } = res.body
      if (error) throw error
      return port
    })
    .then(dstPort => {
      return new Promise((resolve, reject) => {
        return createClient(
          {
            host: BASE_DOMAIN,
            port: 2222,
            dstHost: 'localhost',
            dstPort: dstPort,
            srcHost: 'localhost',
            srcPort: localPort,
            keepAlive: true,
            agent: SSH_AUTH_SOCK,
            username: USER,
          },
          () => resolve(`https://${subdomain}.${BASE_DOMAIN}`)
        )
      })
    })
}

module.exports = { tunnelPort, generateSubdomain }
