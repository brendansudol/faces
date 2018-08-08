import { IMAGENET_CLASSES } from './classes'
import { prepImg } from '../util/img'
import { tf } from '../util/tf'

const IMAGE_SIZE = 224
const MODEL_PATH =
  'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json'

export class MobileNet {
  async load() {
    this.model = await tf.loadModel(MODEL_PATH)

    // Warmup model
    const inputShape = this.model.inputs[0].shape.slice(1)
    const result = tf.tidy(() =>
      this.model.predict(tf.zeros([1, ...inputShape]))
    )

    await result.data()
    result.dispose()
  }

  async classify(img, topK = 10) {
    // Convert to tensor & resize if necessary
    const imgNorm = await prepImg(img, IMAGE_SIZE)

    // Reshape to a single-element batch so we can pass it to predict.
    const inputs = imgNorm.reshape([1, ...imgNorm.shape])

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
