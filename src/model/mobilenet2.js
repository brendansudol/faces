import Model from './base'
import { IMAGENET_CLASSES } from './classes'

const config = {
  path:
    'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json',
  imageSize: 224,
  classes: IMAGENET_CLASSES
}

export const MobileNet = () => new Model(config)