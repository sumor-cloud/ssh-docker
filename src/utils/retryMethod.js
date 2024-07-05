export default (callback, options) => {
  options = options || {}
  options.max = options.max || 600 // 600 times
  options.interval = options.interval || 100 // 100 milliseconds
  let retry = 0

  const ping = async () => {
    let pingError
    try {
      await callback()
    } catch (e) {
      pingError = e
    }
    if (pingError) {
      if (retry < options.max) {
        retry++
        await new Promise(resolve => {
          setTimeout(resolve, options.interval)
        })
        await ping()
      } else {
        throw pingError
      }
    }
  }

  return ping
}
