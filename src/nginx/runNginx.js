import runNginxConfig from './runNginxConfig.js'
export default async (ssh, options) => {
  options = runNginxConfig(options)
  await ssh.docker.run({
    name: options.name,
    image: 'nginx',
    version: 'latest',
    ports: options.ports,
    bindings: options.bindings,
    background: true
  })
}
