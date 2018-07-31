import * as tf from '@tensorflow/tfjs'

import { IMAGENET_CLASSES } from './classes'

const IMAGE_SIZE = 224
const NORM_OFFSET = tf.scalar(127.5)
const MODEL_PATH =
  'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json'

export class MobileNet {
  constructor() {
    this.path = MODEL_PATH
    this.normalizationOffset = tf.scalar(127.5)
  }

  async load() {
    this.model = await tf.loadModel(this.path)

    // warmup model
    const result = tf.tidy(() =>
      this.model.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3]))
    )
    await result.data()
    result.dispose()
  }

  async prepImg(img) {
    // Convert to tensor
    const imgTensor = tf.fromPixels(img)

    // Normalize from [0, 255] to [-1, 1].
    const normalized = imgTensor
      .toFloat()
      .sub(NORM_OFFSET)
      .div(NORM_OFFSET)

    // Resize image if necessary
    let resized = normalized
    if (
      imgTensor.shape[0] !== IMAGE_SIZE ||
      imgTensor.shape[1] !== IMAGE_SIZE
    ) {
      const alignCorners = true
      resized = tf.image.resizeBilinear(
        normalized,
        [IMAGE_SIZE, IMAGE_SIZE],
        alignCorners
      )
    }

    // Reshape to a single-element batch so we can pass it to predict.
    return resized.reshape([1, ...resized.shape])
  }

  async classify(img, topK = 10) {
    const inputs = await this.prepImg(img)
    const logits = this.model.predict(inputs)
    const classes = await this.getTopKClasses(logits, topK)

    return classes
  }

  async getTopKClasses(logits, topK = 10) {
    const values = await logits.data()
    let predictionList = []

    for (let i = 0; i < values.length; i++) {
      predictionList.push({ value: values[i], index: i })
    }

    predictionList = predictionList
      .sort((a, b) => b.value - a.value)
      .slice(0, topK)

    return predictionList.map(x => {
      return { label: IMAGENET_CLASSES[x.index], value: x.value }
    })
  }
}
