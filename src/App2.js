import React, { Component } from 'react'
import * as faceapi from 'face-api.js/dist/face-api.js'

import img from './img/faces2.jpg'

const getImg = src =>
  new Promise(resolve => {
    const img = new Image()
    img.src = src
    img.crossOrigin = '*'
    img.onload = () => resolve(img)
  })

class App2 extends Component {
  componentDidMount() {
    this.initModel2()
  }

  initModel = async () => {
    const model = new faceapi.FaceDetectionNet()
    const path =
      `${process.env.PUBLIC_URL}/static/model/face/` +
      'ssd_mobilenetv1_model-weights_manifest.json'

    await model.load(path)

    const myImg = await getImg(img)
    const detections = await model.locateFaces(myImg, 0.4, 50)
    console.log(detections)

    this.canvas.width = myImg.width
    this.canvas.height = myImg.height
    faceapi.drawDetection(this.canvas, detections, { withScore: true })
  }

  initModel2 = async () => {
    const model = new faceapi.Mtcnn()
    const path =
      `${process.env.PUBLIC_URL}/static/model/face/` +
      'mtcnn_model-weights_manifest.json'

    await model.load(path)

    const myImg = await getImg(img)
    const input = await faceapi.toNetInput(myImg, false, true)

    const params = {
      minFaceSize: 50,
      scaleFactor: 0.709,
      maxNumScales: 10,
      scoreThresholds: [0.7, 0.7, 0.7]
    }

    const results = await model.forward(input, params)
    const detections = results.map(res => res.faceDetection)
    console.log(results)

    this.canvas.width = myImg.width
    this.canvas.height = myImg.height
    faceapi.drawDetection(this.canvas, detections)

    const faceImgs = await faceapi.extractFaces(input.inputs[0], detections)
    faceImgs.forEach(canvas => this.facesContainer.appendChild(canvas))
  }

  render() {
    return (
      <div className="container">
        <div className="relative">
          <img src={img} alt="demo" />
          <canvas ref={el => (this.canvas = el)} className="overlay" />
          <div ref={el => (this.facesContainer = el)} className="faces" />
        </div>
      </div>
    )
  }
}

export default App2
