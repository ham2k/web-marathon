export function proxyFor (url) {
  return `/ham2k-proxy/${url.toString().replace('http://', '').replace('https://', '')}`
}
