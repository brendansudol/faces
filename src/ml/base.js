import { prepImg, rgbToGrayscale } from './img'
import { tf } from './tf'

class Model {
  constructor({ path, imageSize, classes, isGrayscale = false }) {
    this.path = path
    this.imageSize = imageSize
    this.classes = classes
    this.isGrayscale = isGrayscale
  }

  async load() {
    this.model = await tf.loadModel(this.path)

    // Warmup model
    const inShape = this.model.inputs[0].shape.slice(1)
    const result = tf.tidy(() => this.model.predict(tf.zeros([1, ...inShape])))
    await result.data()
    result.dispose()
  }

  async imgToInputs(img) {
    // Convert to tensor & resize if necessary
    let norm = await prepImg(img, this.imageSize)

    // TODO: infer whether this is needed based on model & img shapes
    if (this.isGrayscale) {
      norm = await rgbToGrayscale(norm)
    }

    // Reshape to a single-element batch so we can pass it to predict.
    return norm.reshape([1, ...norm.shape])
  }

  async classify(img, topK = 10) {
    const inputs = await this.imgToInputs(img)
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
      return { label: this.classes[x.index], value: x.value }
    })
  }
}

export default Model
