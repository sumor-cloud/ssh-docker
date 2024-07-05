export default prefix => {
  prefix = prefix || 'sumor-docker-'
  return prefix + Math.random().toString(36).substring(7)
}
