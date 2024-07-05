export default options => {
  options = options || {}

  options.name = options.name || 'sumor_nginx_' + Math.random().toString(36).substring(7)
  options.ports = options.ports || [
    {
      from: 443,
      to: 443
    }
  ]
  options.bindings = options.bindings || []

  return options
}
