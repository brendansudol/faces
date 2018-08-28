import React from 'react'

const Header = ({ children }) => (
  <header className="my2">
    <h2 className="m0 h3">😄😐🙁</h2>
    <h1 className="my1 h2">Emotion Extractor</h1>
    <p className="m0">
      Upload a photo and see who’s happy to be there. This demo uses
      Tensorflow.js and neural networks to detect faces and analyze emotions.
      More details here.
    </p>
  </header>
)

export default Header
