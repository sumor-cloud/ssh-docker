export default async (ssh, cmd, options) => {
  options = options || {}
  options.cwd = options.cwd || '/'
  await ssh.install('docker.io')

  if (options.fields) {
    const formatArr = []
    for (const i in options.fields) {
      formatArr.push(`{{.${options.fields[i]}}}`)
    }
    const stdout = await ssh.exec(`${cmd} --format "${formatArr.join('|')}"`, options)
    const result = []
    if (stdout !== '') {
      const item = stdout.split('\n')
      for (const i in item) {
        const fieldValues = item[i].split('|')
        const obj = {}
        for (let j = 0; j < options.fields.length; j++) {
          obj[options.fields[j]] = fieldValues[j]
        }
        result.push(obj)
      }
    }
    return result
  } else {
    return await ssh.exec(cmd, options)
  }
}
