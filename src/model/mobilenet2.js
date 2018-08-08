import Model from './base'
import { IMAGENET_CLASSES } from './classes'

const MODEL_PATH =
  'https://storage.googleapis.com/tfjs-models/tfjs/' +
  'mobilenet_v1_0.25_224/model.json'

export class MobileNet extends Model {
  constructor() {
    super({
      path: MODEL_PATH,
      imageSize: 224,
      classes: IMAGENET_CLASSES
    })
  }
}
