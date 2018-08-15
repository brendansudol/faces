export const getImg = src =>
  new Promise(resolve => {
    const img = new Image()
    img.src = src
    img.crossOrigin = '*'
    img.onload = () => resolve(img)
  })

export const imgLoaded = img =>
  new Promise(resolve => {
    if (img && img.complete) resolve()
    img.onload = () => resolve()
  })

export const readFile = file =>
  new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => resolve({ file, url: reader.result })
    reader.readAsDataURL(file)
  })
