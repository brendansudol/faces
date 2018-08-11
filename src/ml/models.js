import Model from './base'
import * as classes from './classes'

export class EmotionNet extends Model {
  constructor() {
    super({
      path: `${process.env.PUBLIC_URL}/static/models/emotion/model.json`,
      imageSize: 48,
      classes: classes.EMOTION,
      isGrayscale: true
    })
  }
}

export class GenderNet extends Model {
  constructor() {
    super({
      path: `${process.env.PUBLIC_URL}/static/models/gender/model.json`,
      imageSize: 48,
      classes: classes.GENDER
    })
  }
}

export class MobileNet extends Model {
  constructor() {
    super({
      path:
        'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json',
      imageSize: 224,
      classes: classes.IMAGENET
    })
  }
}
