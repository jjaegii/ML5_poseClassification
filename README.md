# ML5_poseClassification_Core

이 프로젝트는 [ml5.js](https://ml5js.org/)의 NeuralNetwork, PoseNet(버전에 따라 ObjectDetector도 추가)을 활용한 실시간 인간 행동 인식 프로젝트이다.

- **Versions**
    - [**Core**](https://github.com/jjaegii/ML5_poseClassification/tree/master)
        → 이 프로젝트에 들어가는 인공지능 모델의 핵심 코드(p5js+ml5js - NeuralNetwork + PoseNet)
       
    - [**webcam_version**](https://github.com/jjaegii/ML5_poseClassification/tree/webcam_version)
    → 웹캠을 웹서버(node.js express)에 띄워보는 버전(p5js+ml5js - NeuralNetwork + PoseNet)
	
    - [**rtsp_version**](https://github.com/jjaegii/ML5_poseClassification/tree/rtsp_version)
    → golang의 gin을 사용해 cctv 화면(rtsp)을 읽어와 여러 객체(사람)를 인식하나, 단일 객체(한 명의 사람)의 행동만 인식하는 버전(ml5js - NeuralNetwork + poseNet + ObjectDetector, singleClassify)
	
    - [**rtsp_version_multiple**](https://github.com/jjaegii/ML5_poseClassification/tree/rtsp_version_multiple)
    → rtsp_version과 같이 golang의 gin을 사용해 cctv 화면(rtsp)을 읽어와 여러 객체(사람)를 인식하고, 다중 객체(여러 사람)의 행동을 인식하는 버전(ml5js - NeuralNetwork + poseNet + ObjectDetector, multipleClassify)
    

## 1. Setup

html 파일에서 p5.js와 ml5.js를 script src 태그를 사용하여 가져온다.

```html
<!-- import scripts -->
<!-- p5js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.1/p5.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.1/addons/p5.sound.min.js"></script>
<!-- ml5js -->
<script src="https://unpkg.com/ml5@latest/dist/ml5.min.js"></script>
```

## 2. Key Codes

### common

- **options** - Neural Network에 들어갈 옵션(inputs, outputs, 활성화함수 등) 설정

```jsx
let options = {
    inputs: 34,
    outputs: 5,
    task: "classification",
    debug: true,
  };
```

### collect

동작 데이터 수집 [Google Teachable Machine]([https://teachablemachine.withgoogle.com/](https://teachablemachine.withgoogle.com/))으로도 가능

- **Demo**
    
    ![Untitled](https://user-images.githubusercontent.com/77189999/182130352-ed55703b-a2bc-42e1-8970-8f15faeb5e12.png)
    
    클래스(동작명)를 입력하고 자료수집 버튼을 누르면 일정시간 동안 비디오의 키포인트를 읽고 저장 버튼을 누르면 json 파일을 생성
    

- **gotPoses** - 웹캠으로 입력된 17개의 키포인트 데이터를 brain에 추가

```jsx
function gotPoses(poses) {
  //console.log(poses);
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
    if (state == "collecting") {
      let inputs = [];
      for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        inputs.push(x);
        inputs.push(y);
      }
      let target = [targetLabel];
      brain.addData(inputs, target);
    }
  }
}
```

- **saveCollected** - gotPoses에서 brain에 추가한 데이터를 json 파일로 저장

```jsx
function saveCollected() {
  brain.saveData();
}
```

### train

collect로부터 수집된 정보를 훈련시켜서 학습된 모델 파일 생성

- **Demo**
    
    ![Untitled 1](https://user-images.githubusercontent.com/77189999/182130343-e384f790-e22f-49fa-b12a-5e6845c6f82e.png)
    

- **setup** - collect에서 생성한 json 파일을 brain.loadData 함수로 불러오기

```jsx
function setup() {
  let options = {
    inputs: 34,
    outputs: 5,
    task: "classification",
    debug: true,
  };
  brain = ml5.neuralNetwork(options);
  brain.loadData("walk,sit,jump,stand,greeting.json", dataReady);
}
```

- **dataReady** - loadData의 콜백함수로 collect에서 생성한 json 파일을 brain.normalizeData 함수로 정규화를 거친 후, train 함수로 epochs 수를 지정 후 훈련

```jsx
function dataReady() {
  brain.normalizeData();
  brain.train({ epochs: 200 }, finished);
}
```

- **finished** - dataReady의 콜백함수로 훈련이 완료되면 brain.save 함수로 3개의 학습된 모델 파일(model_meta.json, model.json, model.weights.bin)을 생성

```jsx
function finished() {
  console.log("model trained");
  brain.save();
}
```

### inference

train으로부터 훈련시킨 모델(model_meta.json, model.json, model.weights.bin)을 불러와 동작을 판별함

- **Demo**
    
    ![Untitled 2](https://user-images.githubusercontent.com/77189999/182130349-bd4b3628-d482-47a0-bb09-1980e0551fdb.png)
    

- **modelInfo & brain.load** - train으로부터 훈련시킨 3개의 모델 파일을 지정하고,  Neural Network에 불러온다.

```jsx
brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: "model/model.json",
    metadata: "model/model_meta.json",
    weights: "model/model.weights.bin",
  };

  brain.load(modelInfo, brainLoaded);

function brainLoaded() {
  console.log("pose classification ready");
  classifyPose();
}
```

- **classifyPose** - 비디오로부터 읽어온 키포인트 값이 있다면 각 키포인트의 x, y 좌표값을 inputs에 삽입 후 동작을 분류하는 brain.classify 함수에 전달

```jsx
function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    brain.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 100);
  }
}
```

 

- **gotResult** - 분류 값(확률)이 가장 큰 동작의 신뢰성이 75% 이상일 경우 출력

```jsx
function gotResult(error, results) {
  if (results[0].confidence > 0.75) {
    poseLabel = results[0].label.toUpperCase();
  }
  classifyPose();
}
```
