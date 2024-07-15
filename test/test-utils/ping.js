import retryMethod from '../../src/utils/retryMethod.js'
export default async (ssh, url) => {
  const ping = retryMethod(
    async () => {
      return await ssh.exec(`curl --insecure ${url}`, {
        cwd: '/'
      })
    },
    {
      max: 5,
      interval: 1000
    }
  )
  return await ping()
}
