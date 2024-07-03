import { describe, expect, it, beforeAll, afterAll } from '@jest/globals'
import SSH from './SSH.js'
import server from './server.js'
import stringifyRunCmd from '../src/stringifyRunCmd.js'

const sourceFolder = `${process.cwd()}/test/assets/app`
const configFolder = `${process.cwd()}/test/assets/config`
const version = '1.0.0'
let port
let imageName
let dockerId
let remoteFolder

describe('main', () => {
  beforeAll(
    async () => {
      const ssh = new SSH(server)
      await ssh.connect()
      port = await ssh.port.getPort()
      imageName = `test-ssh-docker-${port}`
      dockerId = `${imageName}_${version}_${port}`
      remoteFolder = `/tmp/sumor-ssh-docker-test/${dockerId}`

      // // clean up the image before testing
      // const existsImage = await ssh.docker.existsImage(imageName, version)
      // if (existsImage) {
      //   await ssh.docker.removeImage(imageName, version)
      // }

      await ssh.disconnect()
    },
    5 * 60 * 1000
  )
  afterAll(
    async () => {
      const ssh = new SSH(server)
      await ssh.connect()
      await ssh.file.remove(remoteFolder)
      await ssh.disconnect()
    },
    5 * 60 * 1000
  )
  it('Test Connect', async () => {
    const ssh = new SSH(server)
    await ssh.connect()

    let result
    try {
      result = await ssh.exec('echo "OK"')
      await ssh.disconnect()
    } catch (e) {
      await ssh.disconnect()
      throw e
    }
    expect(result).toStrictEqual('OK')
  })
  it(
    'Build Image',
    async () => {
      const ssh = new SSH(server)
      await ssh.connect()
      try {
        await ssh.docker.buildImage(sourceFolder, imageName, version)
        const existsImage = await ssh.docker.existsImage(imageName, version)
        expect(existsImage).toBeTruthy()

        await ssh.disconnect()
      } catch (e) {
        await ssh.disconnect()
        throw e
      }
    },
    5 * 60 * 1000
  )
  it('stringify run command', () => {
    let error
    try {
      stringifyRunCmd()
    } catch (e) {
      error = e
    }
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('Image and version are required')

    const cmd1 = stringifyRunCmd({
      image: 'test',
      version: '1.0.0'
    })
    expect(cmd1).toStrictEqual('docker run -itd --restart=on-failure -d test:1.0.0')

    const cmd2 = stringifyRunCmd({
      image: 'test',
      version: '1.0.0',
      ports: [{ from: 443, to: 30123 }],
      folders: [
        {
          from: '/usr/source/config',
          to: '/usr/demo/config',
          readOnly: true
        },
        {
          from: '/usr/source/logs',
          to: '/usr/demo/logs',
          readOnly: true
        }
      ],
      name: 'test'
    })
    expect(cmd2).toStrictEqual(
      'docker run -itd --restart=on-failure -v /usr/demo/config:/usr/source/config:ro -v /usr/demo/logs:/usr/source/logs:ro -p 30123:443 --name test -d test:1.0.0'
    )
  })
  it(
    'Run Image',
    async () => {
      const ssh = new SSH(server)
      await ssh.connect()
      try {
        await ssh.file.ensureDir(remoteFolder)
        await ssh.file.putFolder(configFolder, remoteFolder)

        await ssh.docker.run({
          name: dockerId,
          image: imageName,
          version,
          ports: [{ from: 443, to: port }],
          folders: [
            {
              from: '/usr/source/config',
              to: remoteFolder,
              readOnly: true
            }
          ]
        })

        const exists = await ssh.docker.exists(dockerId)
        expect(exists).toBeTruthy()
        console.log(`Docker running with ID: ${dockerId}`)

        let configData = await ssh.docker.exec(dockerId, 'cat /usr/source/config/config.json')

        await ssh.docker.remove(dockerId)
        await ssh.docker.remove(dockerId) // Just for testing docker remove error handling
        await ssh.docker.removeImage(imageName, version)

        configData = JSON.parse(configData)
        expect(configData.title).toBe('DEMO')
        await ssh.disconnect()
      } catch (e) {
        await ssh.disconnect()
        throw e
      }
    },
    5 * 60 * 1000
  )
  it(
    'Delete Image',
    async () => {
      const ssh = new SSH(server)
      await ssh.connect()
      try {
        await ssh.docker.removeImage(imageName, version)
        await ssh.docker.removeImage(imageName, version) // Just for testing docker remove image error handling

        const existsImage = await ssh.docker.existsImage(imageName, version)
        expect(existsImage).toBeFalsy()
        await ssh.disconnect()
      } catch (e) {
        await ssh.disconnect()
        throw e
      }
    },
    5 * 60 * 1000
  )
})
