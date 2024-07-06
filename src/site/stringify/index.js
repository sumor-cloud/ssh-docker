import stringifyConf from './stringifyConf.js'
import stringifyHttp from './stringifyHttp.js'
import stringifyServer from './stringifyServer.js'

export default options => {
  options = options || {}
  const domains = options.domains || []
  const servers = []
  domains.forEach(domain => {
    const result = stringifyServer(domain)
    servers.push(result)
  })

  const httpContent = servers.join('\n')
  const httpString = stringifyHttp({
    content: httpContent
  })

  return stringifyConf({
    workerProcesses: options.workerProcesses,
    workerConnections: options.workerConnections,
    content: httpString
  })
}
