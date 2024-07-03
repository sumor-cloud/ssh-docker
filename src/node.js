const randomName = () => {
  const prefix = 'sumor-docker-build-'
  return prefix + Math.random().toString(36).substring(7)
}
export default (ssh, docker) => {
  const build = async (remoteFolder, options) => {
    options = options || {}

    const dockerId = randomName()

    await docker.run({
      name: dockerId,
      image: 'node',
      version: 'latest',
      folders: [
        {
          from: '/usr/source',
          to: remoteFolder
        }
      ]
    })

    const logs = await docker.exec(dockerId, 'cd /usr/source && npm install && npm run build')

    await docker.remove(dockerId)

    return logs
  }

  const run = async (dockerId, remoteFolder, options) => {
    options = options || {}

    const port = options.port || 3000

    await docker.run({
      name: dockerId,
      image: 'node',
      version: 'latest',
      ports: [
        {
          from: 443,
          to: port
        }
      ],
      folders: [
        {
          from: '/usr/source',
          to: remoteFolder
        }
      ],
      cmd: 'cd /usr/source && npm start'
    })

    let retry = 0
    const maxRetry = 60 * 10 // 60 seconds

    const ping = async () => {
      let pingError
      try {
        await ssh.exec(`curl --insecure https://localhost:${port}`, {
          cwd: '/'
        })
      } catch (e) {
        pingError = e
      }
      if (pingError) {
        if (retry < maxRetry) {
          retry++
          await new Promise(resolve => {
            setTimeout(resolve, 100)
          })
          await ping()
        } else {
          throw pingError
        }
      }
    }

    await ping()
  }

  docker.buildNode = build
  docker.runNode = run
}
