import { tf } from './tf'

const NORMALIZATION_OFFSET = tf.scalar(127.5)

export const prepImg = (img, size) => {
  // Convert to tensor
  const imgTensor = tf.fromPixels(img)

  // Normalize from [0, 255] to [-1, 1].
  const normalized = imgTensor
    .toFloat()
    .sub(NORMALIZATION_OFFSET)
    .div(NORMALIZATION_OFFSET)

  if (imgTensor.shape[0] === size && imgTensor.shape[1] === size) {
    return normalized
  }

  // Resize image to proper dimensions
  const alignCorners = true
  return tf.image.resizeBilinear(normalized, [size, size], alignCorners)
}

export const rgbToGrayscale = async imgTensor => {
  const minTensor = imgTensor.min()
  const maxTensor = imgTensor.max()
  const min = (await minTensor.data())[0]
  const max = (await maxTensor.data())[0]
  minTensor.dispose()
  maxTensor.dispose()

  // Normalize to [0, 1]
  const normalized = imgTensor.sub(tf.scalar(min)).div(tf.scalar(max - min))

  // Compute mean of R, G, and B values
  let grayscale = normalized.mean(2)

  // Expand dimensions to get proper shape: (h, w, 1)
  return grayscale.expandDims(2)
}
