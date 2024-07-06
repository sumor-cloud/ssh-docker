import fse from 'fs-extra'
import os from 'os'
import generateSSL from './generateSSL.js'

export default async options => {
  const tmpFolder = `${os.tmpdir()}/ssh-docker-ssl-${Date.now()}`
  await fse.ensureDir(tmpFolder)

  const domainNames = []
  for (const domain of options.domains) {
    domainNames.push(domain.domain)
  }

  for (const domain of domainNames) {
    const sslPath = options.ssl
    if (
      sslPath &&
      (await fse.exists(`${sslPath}/${domain}/domain.crt`)) &&
      (await fse.exists(`${sslPath}/${domain}/domain.key`))
    ) {
      await fse.ensureDir(`${tmpFolder}/${domain}`)
      await fse.copy(`${sslPath}/${domain}/domain.crt`, `${tmpFolder}/${domain}/domain.crt`)
      await fse.copy(`${sslPath}/${domain}/domain.key`, `${tmpFolder}/${domain}/domain.key`)
    } else {
      await generateSSL(domain, tmpFolder)
    }
  }

  return tmpFolder
}
