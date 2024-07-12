import stringify from './stringify/index.js'
import loadSSLs from '../ssl/loadSSLs.js'

export default (ssh, docker) => {
  const run = async options => {
    const nginxConfig = stringify(options)

    const port = options.port || 443
    const remotePath = `/usr/sites/site_${port}`

    await ssh.file.ensureDir(remotePath)
    await ssh.file.writeFile(`${remotePath}/nginx.conf`, nginxConfig)
    const sslPath = await loadSSLs(options)
    await ssh.file.putFolder(sslPath, `${remotePath}/ssl`)

    const dockerId = `sumor_site_${port}`
    const ports = [
      {
        from: 443,
        to: port
      }
    ]
    if (port === 443) {
      ports.push({
        from: 80,
        to: 80
      })
    }

    const existsInstance = await docker.exists(dockerId)
    if (!existsInstance) {
      await ssh.docker.runNginx({
        name: dockerId,
        ports,
        bindings: [
          {
            from: '/etc/nginx/nginx.conf',
            to: `${remotePath}/nginx.conf`
          },
          {
            from: '/etc/nginx/ssl',
            to: `${remotePath}/ssl`
          }
        ]
      })
    } else {
      await ssh.docker.updateNginx(dockerId)
    }
  }

  docker.runSite = run
}
