import React, { Component } from 'react'
import * as faceapi from 'face-api.js/dist/face-api.js'

import img from './img/faces.jpg'

class App2 extends Component {
  componentDidMount() {
    this.go()
  }

  go = async () => {
    console.log(faceapi)
    // await faceapi.loadFaceDetectionModel('/models')
  }

  render() {
    return (
      <div className="container">
        <img src={img} alt="demo" />
        <canvas ref={el => (this.canvas = el)} />
      </div>
    )
  }
}

export default App2
