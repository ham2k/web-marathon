export function proxyFor(url) {
  return `https://marathon.ham2k.net/ham2k-proxy/${url.toString().replace('http://', '').replace('https://', '')}`
}
