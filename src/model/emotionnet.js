import Model from './base'
import { EMOTION_CLASSES } from './classes'

export class EmotionNet extends Model {
  constructor() {
    super({
      path: `${process.env.PUBLIC_URL}/static/model/emotion/model.json`,
      imageSize: 48,
      classes: EMOTION_CLASSES,
      isGrayscale: true
    })
  }
}
