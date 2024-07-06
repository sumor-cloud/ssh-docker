export default (callback, options) => {
  options = options || {}
  options.max = options.max || 600 // 600 times
  options.interval = options.interval || 100 // 100 milliseconds
  let retry = 0

  const ping = async () => {
    let response
    let pingError
    try {
      response = await callback()
    } catch (e) {
      pingError = e
    }
    if (pingError) {
      if (retry < options.max) {
        retry++
        await new Promise(resolve => {
          setTimeout(resolve, options.interval)
        })
        return await ping()
      } else {
        throw pingError
      }
    } else {
      return response
    }
  }

  return ping
}
