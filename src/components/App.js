import * as faceapi from 'face-api.js'
import React, { Component } from 'react'

import img from '../img/faces.jpg'
import cat from '../img/cat.jpg'

import { EmotionNet, GenderNet, MobileNet } from '../ml/models'
import { getImg } from '../ml/img'

class App2 extends Component {
  componentDidMount() {
    this.initModel2()
    // this.tryMobileNet()
  }

  initModel = async () => {
    const model = new faceapi.FaceDetectionNet()
    const path =
      `${process.env.PUBLIC_URL}/static/models/face/` +
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
      `${process.env.PUBLIC_URL}/static/models/face/` +
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

    this.tryEmotionNet(faceImgs)
    this.tryGenderNet(faceImgs)
  }

  tryEmotionNet = async imgs => {
    console.log(imgs)

    const img = imgs[0]
    console.log(img)

    const model = new EmotionNet()
    await model.load()

    const results = await model.classify(img)
    console.log(JSON.stringify(results, null, 2))
  }

  tryGenderNet = async imgs => {
    console.log(imgs)

    const img = imgs[0]
    console.log(img)

    const model = new GenderNet()
    await model.load()

    const results = await model.classify(img)
    console.log(JSON.stringify(results, null, 2))
  }

  tryMobileNet = async () => {
    const model = new MobileNet()
    await model.load()
    const img = await getImg(cat)
    const results = await model.classify(img)
    console.log(JSON.stringify(results, null, 2))
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
