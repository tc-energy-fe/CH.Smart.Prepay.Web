export default function (href, fileName) {
  let link = document.createElement('a')
  link.style.display = 'none'
  link.href = href
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
