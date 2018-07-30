import React, { Component } from 'react'
import * as tf from '@tensorflow/tfjs'

import {
  EMOTION_CLASSES as emotion,
  GENDER_CLASSES as gender,
  IMAGENET_CLASSES as imagenet
} from './imgLabels'

import cat from './img/cat.jpg'
import dog from './img/dog.jpg'
import faceHappy from './img/face-happy.png'
import faceSurprise from './img/face-surprise.png'

const imgs = { cat, dog, faceHappy, faceSurprise }
const labels = { emotion, gender, imagenet }

const getImg = imgSrc =>
  new Promise(resolve => {
    const img = new Image()
    img.src = imgSrc
    img.crossOrigin = '*'
    img.onload = () => resolve(img)
  })

const NORM_OFFSET = tf.scalar(127.5)

// TODO: abstract this away
const DIMS = 3

const MODEL_PATH =
  'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json'
const IMAGE_SIZE = 224

// const MODEL_PATH = `${process.env.PUBLIC_URL}/static/model/emotion/model.json`
// const IMAGE_SIZE = 48

// const MODEL_PATH = `${process.env.PUBLIC_URL}/static/model/gender/model.json`
// const IMAGE_SIZE = 48

const SAMPLE_IMG = imgs.dog
const CLASSES = labels.imagenet

class App extends Component {
  componentDidMount() {
    this.loadModel()
  }

  prepImg = async imgSrc => {
    let img = await getImg(imgSrc)

    // Convert to tensor
    img = tf.fromPixels(img)

    // Normalize the image from [0, 255] to [-1, 1].
    const normalized = img
      .toFloat()
      .sub(NORM_OFFSET)
      .div(NORM_OFFSET)

    // Resize the image to
    let resized = normalized
    if (img.shape[0] !== IMAGE_SIZE || img.shape[1] !== IMAGE_SIZE) {
      const alignCorners = true
      resized = tf.image.resizeBilinear(
        normalized,
        [IMAGE_SIZE, IMAGE_SIZE],
        alignCorners
      )
    }

    // TODO: this is just for testing, remove soon
    const gs = await this.toGreyScale(resized)
    tf.toPixels(gs, this.canvas)

    if (DIMS === 1) return gs.reshape([1, IMAGE_SIZE, IMAGE_SIZE, DIMS])

    // Reshape to a single-element batch so we can pass it to predict.
    const batched = resized.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3])
    return batched
  }

  toGreyScale = async t3d => {
    const minTensor = t3d.min()
    const maxTensor = t3d.max()
    const min = (await minTensor.data())[0]
    const max = (await maxTensor.data())[0]
    minTensor.dispose()
    maxTensor.dispose()
    console.log({ min, max })

    // normalize to [0, 1]
    const rescaled = t3d.sub(min).div(max - min)
    let gs = rescaled.mean(2)
    gs = gs.expandDims(2)

    return gs
  }

  loadModel = async () => {
    this.model = await tf.loadModel(MODEL_PATH)

    console.log('model loaded!')
    window.model = this.model // TODO: remove this

    // warmup model
    const result = tf.tidy(() =>
      this.model.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, DIMS]))
    )
    await result.data()

    // model input / output shape
    const inShape = this.model.inputs[0].shape
    const outShape = this.model.outputs[0].shape
    console.log({ inShape, outShape })

    // predict!
    const inputs = await this.prepImg(SAMPLE_IMG)
    const logits = this.model.predict(inputs).dataSync()
    console.log('logits', logits)
    const maxProb = Math.max.apply(null, logits)
    const topClass = CLASSES[logits.indexOf(maxProb)]
    console.log(topClass)
  }

  render() {
    return (
      <div className="container">
        <p>stay tuned :)</p>
        <img
          src={SAMPLE_IMG}
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
          alt="demo"
        />
        <canvas ref={el => (this.canvas = el)} />
      </div>
    )
  }
}

export default App
