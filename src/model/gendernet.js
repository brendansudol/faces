import Model from './base'
import { GENDER_CLASSES } from './classes'

export class GenderNet extends Model {
  constructor() {
    super({
      path: `${process.env.PUBLIC_URL}/static/model/gender/model.json`,
      imageSize: 48,
      classes: GENDER_CLASSES
    })
  }
}
