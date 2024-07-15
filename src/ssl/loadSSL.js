import fse from 'fs-extra'
import os from 'os'
import generateSSL from './generateSSL.js'

export default async (domain, path) => {
  const tmpFolder = `${os.tmpdir()}/ssh-docker-ssl-${Date.now()}`
  await fse.ensureDir(tmpFolder)

  if ((await fse.exists(`${path}/domain.crt`)) && (await fse.exists(`${path}/domain.key`))) {
    await fse.ensureDir(`${tmpFolder}`)
    await fse.copy(`${path}/domain.crt`, `${tmpFolder}/domain.crt`)
    await fse.copy(`${path}/domain.key`, `${tmpFolder}/domain.key`)
  } else {
    await generateSSL(domain, `${tmpFolder}`)
  }

  return tmpFolder
}
