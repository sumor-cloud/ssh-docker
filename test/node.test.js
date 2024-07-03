import { describe, expect, it, beforeAll, afterAll } from '@jest/globals'
import SSH from './SSH.js'
import server from './server.js'

const sourceFolder = `${process.cwd()}/test/assets/app`
const configFolder = `${process.cwd()}/test/assets/config`
let port
let dockerId
let remoteFolder

describe('Node.JS related', () => {
  beforeAll(
    async () => {
      const ssh = new SSH(server)
      await ssh.connect()
      port = await ssh.port.getPort()
      dockerId = `test-ssh-docker-node-${port}`
      remoteFolder = `/tmp/sumor-ssh-docker-test/${dockerId}`
      await ssh.file.remove(remoteFolder)

      // copy the source folder to the remote server
      await ssh.file.ensureDir(remoteFolder)
      await ssh.file.putFolder(sourceFolder, remoteFolder)
      await ssh.file.putFolder(configFolder, remoteFolder + '/config')

      await ssh.disconnect()
    },
    5 * 60 * 1000
  )
  afterAll(
    async () => {
      const ssh = new SSH(server)
      await ssh.connect()
      await ssh.docker.remove(dockerId)
      await ssh.file.remove(remoteFolder)
      await ssh.disconnect()
    },
    5 * 60 * 1000
  )
  it(
    'build',
    async () => {
      const ssh = new SSH(server)
      await ssh.connect()
      try {
        // check if node_modules folder exists
        const existsNodeModules1 = await ssh.file.exists(`${remoteFolder}/node_modules`)
        expect(existsNodeModules1).toBeFalsy()

        // build the node.js image
        const logs = await ssh.docker.buildNode(remoteFolder)
        console.log(logs)

        // check if node_modules folder exists
        const existsNodeModules2 = await ssh.file.exists(`${remoteFolder}/node_modules`)
        expect(existsNodeModules2).toBeTruthy()

        const demoFile = await ssh.file.readFile(`${remoteFolder}/demo.js`, 'utf8')
        expect(demoFile).toBe('export default "OK"')

        await ssh.disconnect()
      } catch (e) {
        await ssh.disconnect()
        throw e
      }
    },
    5 * 60 * 1000
  )

  it(
    'run',
    async () => {
      const ssh = new SSH(server)
      await ssh.connect()
      try {
        const logs = await ssh.docker.runNode(dockerId, remoteFolder, {
          port
        })
        console.log(logs)

        let response
        let pingError
        try {
          response = await ssh.exec(`curl --insecure https://localhost:${port}`, {
            cwd: '/'
          })
          response = JSON.parse(response)
        } catch (e) {
          pingError = e
        }

        if (pingError) {
          throw pingError
        }

        expect(response.status).toBe('OK')
        expect(response.config.title).toBe('DEMO')

        await ssh.disconnect()
      } catch (e) {
        await ssh.disconnect()
        throw e
      }
    },
    5 * 60 * 1000
  )
})
