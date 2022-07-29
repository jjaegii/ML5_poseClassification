// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet using p5.js
=== */
/* eslint-disable */

// Grab elements, create settings, etc.
let video = document.getElementById("videoElem");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let objectDetector;
let objects = [];

// The detected positions will be inside an array
let poseNet;
let poses = [];
let pose;

let brain;
let text = [];

// A function to draw the video and poses into the canvas.
// This function is independent of the result of posenet
// This way the video will not seem slow if poseNet
// is not detecting a position

// model loading

function loadAllModels() {
  return new Promise((resolve, reject) => {
    objectDetector = ml5.objectDetector("cocossd", startDetecting);
    poseNet = ml5.poseNet(video, modelReady);
    poseNet.on("pose", gotPoses);
    drawCameraIntoCanvas();
    setTimeout(() => {
      resolve();
    }, 10000);
  });
}

function brainload() {
  let options = {
    inputs: 34,
    outputs: 4, // 종류
    task: "classification",
    debug: true,
  };
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: "../../static/model/model.json",
    metadata: "../../static/model/model_meta.json",
    weights: "../../static/model/model.weights.bin",
  };
  brain.load(modelInfo, brainLoaded);
}

loadAllModels().then(() => {
  console.log("then");
  brainload();
});

function startDetecting() {
  console.log("cocossd model ready");
}

// A function that gets called every time there's an update from the model
function gotPoses(results) {
  let person = [];
  if (results.length > 0) {
    for (let i = 0; i < results.length; i++) {
      for (let a = 0; a < objects.length; a++) {
        if (
          objects[a].label == "person" &&
          results[i].pose.score > 0.5 &&
          (isInBox(objects[a], results[i].pose.nose) ||
            isInBox(objects[a], results[i].pose.leftEar) ||
            isInBox(objects[a], results[i].pose.rightEar))
        ) {
          person.push(results[i]);
        }
      }
    }
    poses = person;
    // console.log(poses);
  }

  // poses = results; // 이 부분에서 bounding box안에 안들어가는 좌표는 다 지워버리고 poses에 넣기
  // if (poses.length > 0) {
  //   for (let i = 0; i < poses.length; i++) {}
  //   pose = poses[0].pose; // 아니면 이 부분?
  //   console.log(poses[0].pose.keypoints);
  //   console.log("pose 0 : ", poses[0].pose);
  //   console.log("pose 1 : ", poses[1].pose);
  //   console.log("pose : ", pose);
  //   console.log("skeleton : ", skeleton);
  // }
}

function modelReady() {
  console.log("poseNet model ready");
  poseNet.multiPose(video);
}

// video -> canvas
function drawCameraIntoCanvas() {
  // Draw the video element into the canvas
  ctx.drawImage(video, 0, 0, video.width, video.height);
  // We can call both functions to draw all keypoints and the skeletons
  detect();
  drawKeypoints();
  drawSkeleton();

  window.requestAnimationFrame(drawCameraIntoCanvas);
}

function detect() {
  objectDetector.detect(video, function (err, results) {
    if (err) {
      console.log(err);
      return;
    }
    objects = results;

    if (objects) {
      drawBox();
      // console.log(objects);
    }
  });
}

function drawBox() {
  for (let i = 0; i < objects.length; i += 1) {
    if (objects[i].label == "person") {
      ctx.lineWidth = 1;
      ctx.font = "16px Arial";
      ctx.fillStyle = "green";
      ctx.fillText(objects[i].label, objects[i].x + 4, objects[i].y + 16);

      ctx.beginPath();
      ctx.rect(objects[i].x, objects[i].y, objects[i].width, objects[i].height);
      ctx.strokeStyle = "green";
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.strokeStyle = "red";
      ctx.arc(objects[i].x, objects[i].y, 10, 0, 10 * Math.PI);
      ctx.stroke();
    }
  }
}

// objects[a], keypoint.position 입력 받음
function isInBox(object, position) {
  let left = object.x;
  let up = object.y;
  let right = object.x + object.width;
  let down = object.y + object.heigth;

  // 왼쪽 위
  if (!(left <= position.x || up <= position.y)) {
    return false;
  }
  // 오른쪽 위
  else if (!(right >= position.x || up <= position.y)) {
    return false;
  }
  // 왼쪽 아래
  else if (!(left <= position.x || down >= position.y)) {
    return false;
  }
  // 오른쪽 아래
  else if (!(right >= position.x || down >= position.y)) {
    return false;
  } else {
    return true;
  }
}

function drawFace(i, nose) {
  let lefteye_x = poses[i].pose.keypoints[1].position.x;
  let righteye_x = poses[i].pose.keypoints[2].position.x;
  let lefteye_y = poses[i].pose.keypoints[1].position.y;
  let righteye_y = poses[i].pose.keypoints[2].position.y;
  ctx.beginPath();
  let dis_x = lefteye_x - righteye_x;
  let dis_y = lefteye_y - righteye_y;
  let d = Math.sqrt(Math.abs(dis_x * dis_x) + Math.abs(dis_y * dis_y));
  ctx.strokeStyle = "black";
  ctx.fillStyle = "white";
  ctx.arc(nose.position.x, nose.position.y, d * 2.5, 0, 20 * Math.PI);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(
    nose.position.x + d,
    nose.position.y - d * 0.7,
    d * 0.5,
    0,
    20 * Math.PI
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(
    nose.position.x - d,
    nose.position.y - d * 0.7,
    d * 0.5,
    0,
    20 * Math.PI
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(nose.position.x, nose.position.y + d);
  ctx.arc(nose.position.x, nose.position.y + d, d, 0, (Math.PI / 180) * 180);
  ctx.closePath();
  ctx.stroke();
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  ctx.lineWidth = 5;
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i += 1) {
    // For each pose detected, loop through all the keypoints
    for (let j = 0; j < poses[i].pose.keypoints.length; j += 1) {
      if (j >= 1 && j <= 4) continue; // 왼쪽 눈, 오른쪽 눈, 왼쪽 귀, 오른쪽 귀 표시 x
      let keypoint = poses[i].pose.keypoints[j];

      if (keypoint.score > 0.2) {
        // 코 위치 얼굴 모양 만들기
        if (j == 0) {
          //drawFace(i, keypoint);
          ctx.strokeStyle = "black";
          ctx.font = "bold 48px sans-serif";
          ctx.lineWidth = 10;
          ctx.strokeText(
            text[i],
            poses[i].pose.keypoints[0].position.x,
            poses[i].pose.keypoints[0].position.y
          );
          ctx.fillStyle = "white";
          ctx.fillText(
            text[i],
            poses[i].pose.keypoints[0].position.x,
            poses[i].pose.keypoints[0].position.y
          );
        } else {
          ctx.beginPath();
          ctx.strokeStyle = "red";
          ctx.fillStyle = "white";
          ctx.arc(
            keypoint.position.x,
            keypoint.position.y,
            10,
            0,
            20 * Math.PI
          );
          ctx.fill();
          ctx.stroke();
        }
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i += 1) {
    // For every skeleton, loop through all body connections
    for (let j = 0; j < poses[i].skeleton.length; j += 1) {
      let partA = poses[i].skeleton[j][0];
      let partB = poses[i].skeleton[j][1];
      // console.log("partA : ", partA.position);
      // console.log("partB : ", partB.position);

      ctx.beginPath();
      ctx.moveTo(partA.position.x, partA.position.y);
      ctx.lineTo(partB.position.x, partB.position.y);
      ctx.lineWidth = 5;
      ctx.strokeStyle = "red";
      ctx.stroke();
    }
  }
}

/* inference */
// let options = {
//   inputs: 34,
//   outputs: 4, // 종류
//   task: "classification",
//   debug: true,
// };

// var brain = ml5.neuralNetwork(options);
// const modelInfo = {
//   model: "../../static/model/model.json",
//   metadata: "../../static/model/model_meta.json",
//   weights: "../../static/model/model.weights.bin",
// };

//brain.load(modelInfo, brainLoaded);

function brainLoaded() {
  console.log("pose classification ready");
  classifyPose();
}

function classifyPose() {
  // console.log("classifyPose has called");
  if (poses) {
    // console.log("poses are exist");
    for (let i = 0; i < poses.length; i++) {
      // console.log("pose index : ", i);
      let inputs = [];
      for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
        let x = poses[i].pose.keypoints[j].position.x;
        let y = poses[i].pose.keypoints[j].position.y;
        inputs.push(x);
        // console.log("x:", x);
        inputs.push(y);
        // console.log("y:", y);
      }
      // console.log("inputs:", inputs);
      setId(i);
      brain.classify(inputs, gotResult);
    }
    setTimeout(classifyPose, 10);
  } else {
    setTimeout(classifyPose, 10);
  }
}

let id;
function setId(i) {
  id = i;
}
function getId() {
  return id;
}

function gotResult(error, results) {
  let user = getId();
  let poseLabel;
  if (results[0].confidence > 0.9) {
    poseLabel = results[0].label.toUpperCase();
  } else {
    poseLabel = "";
  }

  text[user] = poseLabel;
  // console.log(text[user]);
  // ctx.strokeStyle = "black";
  // ctx.font = "bold 48px sans-serif";
  // ctx.lineWidth = 10;
  // ctx.strokeText(
  //   poseLabel,
  //   poses[user].pose.keypoints[0].position.x,
  //   poses[user].pose.keypoints[0].position.y
  // );
  // ctx.fillStyle = "white";
  // ctx.fillText(
  //   poseLabel,
  //   poses[user].pose.keypoints[0].position.x,
  //   poses[user].pose.keypoints[0].position.y
  // );
  // console.log(poseLabel);
  // classifyPose();
}
