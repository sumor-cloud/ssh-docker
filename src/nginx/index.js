import runNginx from './runNginx.js'
import updateNginx from './updateNginx.js'
export default (ssh, docker) => {
  const run = async options => {
    return await runNginx(ssh, options)
  }

  const update = async dockerId => {
    return await updateNginx(ssh, dockerId)
  }

  docker.runNginx = run
  docker.updateNginx = update
}
