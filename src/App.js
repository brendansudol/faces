import React, { Component } from 'react'
import * as tf from '@tensorflow/tfjs'

// const MODEL_PATH = 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json'
const MODEL_PATH = `${process.env.PUBLIC_URL}/static/model/emotion/model.json`

class App extends Component {
  componentDidMount() {
    this.loadModel()
  }

  loadModel = async () => {
    this.model = await tf.loadModel(MODEL_PATH)

    console.log('model loaded!')
    window.model = this.model // TODO: remove this

    const inShape = this.model.inputs[0].shape
    const outShape = this.model.outputs[0].shape
    console.log({ inShape, outShape })
  }

  render() {
    return (
      <div className="container">
        <p>stay tuned :)</p>
      </div>
    )
  }
}

export default App
