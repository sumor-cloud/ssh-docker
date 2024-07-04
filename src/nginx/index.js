export default (ssh, docker) => {
  const run = async options => {
    options = options || {}
    const dockerId = options.name || 'sumor_nginx_' + Math.random().toString(36).substring(7)
    const ports = options.ports || [
      {
        from: 443,
        to: 443
      }
    ]
    const bindings = options.bindings || []
    await docker.run({
      name: dockerId,
      image: 'nginx',
      version: 'latest',
      ports,
      bindings,
      background: true
    })
  }

  const update = async dockerId => {
    await docker.exec(dockerId, 'nginx -s reload')
  }

  docker.runNginx = run
  docker.updateNginx = update
}
