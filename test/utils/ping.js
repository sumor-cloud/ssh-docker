export default async (ssh, url) => {
  let response
  try {
    response = await ssh.exec(`curl --insecure ${url}`, {
      cwd: '/'
    })
  } catch (e) {
    console.log(e)
  }
  return response
}
