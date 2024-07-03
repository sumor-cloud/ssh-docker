export default options => {
  const { image, version, ports, folders, name } = options || {}
  const dockerRunStr = ['docker run -itd --restart=on-failure']
  if (folders) {
    for (const folder of folders) {
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
  return dockerRunStr.join(' ')
}
