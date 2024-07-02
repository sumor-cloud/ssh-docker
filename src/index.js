import dockerCmd from './dockerCmd.js'
import stringifyRunCmd from './stringifyRunCmd.js'
export default ssh => ({
  async cmd(cmd, options) {
    return await dockerCmd(ssh, cmd, options)
  },
  async run(options) {
    return await this.cmd(stringifyRunCmd(options))
  },
  async exists(id) {
    const instances = await this.instances()
    const exists = instances.filter(instance => instance.instanceId === id)
    return exists.length > 0
  },
  async remove(id) {
    try {
      return await this.cmd(`docker rm -f ${id}`)
    } catch (e) {
      if (e.message.indexOf('No such container') < 0) {
        throw e
      }
    }
  },
  async exec(id, cmd, options) {
    options = options || {}
    cmd = JSON.stringify(cmd)
    return await this.cmd(`docker exec ${id} sh -c ${cmd}`, {
      options: { pty: true }
    })
  },
  async instances() {
    const list = await this.cmd('docker ps -a', {
      fields: ['Names', 'CreatedAt', 'Status', 'Ports', 'Size']
    })
    for (const i in list) {
      list[i].instanceId = list[i].Names
      const createAt = list[i].CreatedAt.split(' ')
      createAt.pop()
      list[i].createdTime = new Date(createAt.join(' '))
    }
    return list
  },
  async images() {
    return await this.cmd('docker images', {
      fields: ['Repository', 'Tag', 'Size']
    })
  },
  async buildImage(source, image, version) {
    const remotePath = `/tmp/sumor-ssh-docker-version/${image}_${version}`
    await ssh.file.remove(remotePath)
    await ssh.file.ensureDir(remotePath)
    await ssh.file.putFolder(source, remotePath)
    const logs = await this.cmd(`docker build -t ${image}:${version} .`, {
      cwd: remotePath
    })
    console.log(logs)
    await ssh.file.remove(remotePath)
    return logs
  },
  async removeImage(image, version) {
    return await this.cmd(`docker image rmi -f ${image}:${version}`)
  },
  async imageExists(image, version) {
    const images = await ssh.docker.images()
    return !!images.find(o => o.Repository === image && o.Tag === version)
  }
})
