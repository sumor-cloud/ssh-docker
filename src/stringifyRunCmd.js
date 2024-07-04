export default options => {
  const { image, version, ports, bindings, name, cmd, background } = options || {}
  const dockerRunStr = ['docker run']
  if (background !== false) {
    dockerRunStr.push('-itd')
    dockerRunStr.push('--restart=on-failure')
  } else {
    dockerRunStr.push('-it')
  }
  if (bindings) {
    for (const folder of bindings) {
      const readOnly = folder.readOnly ? ':ro' : ''
      dockerRunStr.push(`-v ${folder.to}:${folder.from}${readOnly}`)
    }
  }
  if (ports) {
    const portsStr = ports.map(o => `-p ${o.to}:${o.from}`).join(' ')
    dockerRunStr.push(portsStr)
  }
  if (name) {
    dockerRunStr.push(`--name ${name}`)
  }
  if (!image || !version) {
    throw new Error('Image and version are required')
  }
  dockerRunStr.push(`-d ${image}:${version}`)
  if (cmd) {
    const cmdString = JSON.stringify(cmd)
    dockerRunStr.push(`sh -c ${cmdString}`)
  }
  return dockerRunStr.join(' ')
}
