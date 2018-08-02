import React, { Component } from 'react'
import * as tf from '@tensorflow/tfjs'

import {
  EMOTION_CLASSES as emotion,
  GENDER_CLASSES as gender,
  IMAGENET_CLASSES as imagenet
} from './imgLabels'

import { initMobileNet } from './model/mobilenet2'
import { getImg, prepImg, rgbToGrayscale } from './model/util'

import cat from './img/cat.jpg'
import dog from './img/dog.jpg'
import faceHappy from './img/face-happy.png'
import faceSurprise from './img/face-surprise.png'

const imgs = { cat, dog, faceHappy, faceSurprise }
const labels = { emotion, gender, imagenet }

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
    // this.go()
    this.loadModel()
  }

  go = async () => {
    const model = initMobileNet()
    await model.load()

    const img = await getImg(SAMPLE_IMG)
    const results = await model.classify(img)
    console.log(JSON.stringify(results, null, 2))
  }

  imgToInput = async imgSrc => {
    const img = await getImg(imgSrc)
    const norm = await prepImg(img, IMAGE_SIZE)

    // TODO: this is just for testing, remove soon
    const gs = await rgbToGrayscale(norm)
    tf.toPixels(gs, this.canvas)

    if (DIMS === 1) return gs.reshape([1, IMAGE_SIZE, IMAGE_SIZE, DIMS])

    // Reshape to a single-element batch so we can pass it to predict.
    const batched = norm.reshape([1, ...norm.shape])
    return batched
  }

  loadModel = async () => {
    this.model = await tf.loadModel(MODEL_PATH)

    console.log('model loaded!')
    window.model = this.model // TODO: remove this

    // warmup model
    const inShape = this.model.inputs[0].shape.slice(1)
    const result = tf.tidy(() => this.model.predict(tf.zeros([1, ...inShape])))
    await result.data()

    // predict!
    const inputs = await this.imgToInput(SAMPLE_IMG)
    const logits = this.model.predict(inputs).dataSync()
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
