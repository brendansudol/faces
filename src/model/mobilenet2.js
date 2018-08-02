import Model from './base'
import { IMAGENET_CLASSES } from './classes'

export const initMobileNet = () =>
  new Model({
    path:
      'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json',
    imageSize: 224,
    classes: IMAGENET_CLASSES
  })
