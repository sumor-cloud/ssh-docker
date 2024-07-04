import { glob } from 'glob'
import fse from 'fs-extra'

export default async () => {
  const nginxPath = './test/assets/site/*.conf'
  const files = await glob.sync(nginxPath)
  const result = {}
  for (const file of files) {
    const name = file.split('/').pop().split('.').shift()
    result[name] = await fse.readFile(file, 'utf8')
  }
  return result
}
