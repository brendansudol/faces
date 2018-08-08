import * as core from '@tensorflow/tfjs-core'
import * as converter from '@tensorflow/tfjs-converter'
import * as layers from '@tensorflow/tfjs-layers'

export const tf = { ...core, ...converter, ...layers }
