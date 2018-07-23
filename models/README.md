### models

source: https://github.com/oarriaga/face_classification

### convert to tensorflow.js

```
$ pip install -r requirements
$ tensorflowjs_converter --input_format=keras src/emotion.hdf5 dist/emotion
$ tensorflowjs_converter --input_format=keras src/gender.hdf5 dist/gender
```
