import retryMethod from '../utils/retryMethod.js'
import randomName from '../utils/randomName.js'

export default (ssh, docker) => {
  const build = async remoteFolder => {
    const dockerId = randomName('sumor-docker-build-')

    await docker.run({
      name: dockerId,
      image: 'node',
      version: 'latest',
      bindings: [
        {
          from: '/usr/source',
          to: remoteFolder
        }
      ]
    })

    let logs = ''
    const installLogs = await docker.exec(dockerId, 'cd /usr/source && npm install')
    logs += installLogs

    // check if there is a build script
    const packageJson = await ssh.exec('cat package.json', {
      cwd: remoteFolder
    })
    const packageJsonParsed = JSON.parse(packageJson)
    if (packageJsonParsed.scripts && packageJsonParsed.scripts.build) {
      const buildLogs = await docker.exec(dockerId, 'cd /usr/source && npm run build')
      logs += buildLogs
    }

    await docker.remove(dockerId)

    return logs
  }

  const run = async (dockerId, remoteFolder, options) => {
    const port = options.port

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
      bindings: [
        {
          from: '/usr/source',
          to: remoteFolder
        }
      ],
      cmd: 'cd /usr/source && npm start'
    })

    const ping = retryMethod(async () => {
      await ssh.exec(`curl --insecure https://localhost:${port}`, {
        cwd: '/'
      })
    })
    await ping()
  }

  docker.buildNode = build
  docker.runNode = run
}
