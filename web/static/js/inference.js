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

// The detected positions will be inside an array
let poses = [];
let pose;
let text = "";

// A function to draw the video and poses into the canvas.
// This function is independent of the result of posenet
// This way the video will not seem slow if poseNet
// is not detecting a position

// video -> canvas
function drawCameraIntoCanvas() {
  // Draw the video element into the canvas
  ctx.drawImage(video, 0, 0, video.width, video.height);
  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  drawSkeleton();

  ctx.strokeStyle = "black";
  ctx.font = "bold 48px sans-serif";
  ctx.lineWidth = 10;
  ctx.strokeText(text, 30, 100);
  ctx.fillStyle = "white";
  ctx.fillText(text, 30, 100);

  window.requestAnimationFrame(drawCameraIntoCanvas);
}
drawCameraIntoCanvas();

// Create a new poseNet method with a single detection
const poseNet = ml5.poseNet(video, modelReady);
poseNet.on("pose", gotPoses);

// A function that gets called every time there's an update from the model
function gotPoses(results) {
  poses = results;
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
    // console.log("pose : ", pose);
    // console.log("skeleton : ", skeleton);
  }
}

function modelReady() {
  console.log("model ready");
  poseNet.multiPose(video);
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
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i += 1) {
    // For each pose detected, loop through all the keypoints
    for (let j = 0; j < poses[i].pose.keypoints.length; j += 1) {
      if (j >= 1 && j <= 4) continue; // 왼쪽 눈, 오른쪽 눈, 왼쪽 귀, 오른쪽 귀 표시 x
      let keypoint = poses[i].pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.9) {
        // 코 위치 얼굴 모양 만들기
        if (j == 0) {
          drawFace(i, keypoint);
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
      ctx.beginPath();
      ctx.moveTo(partA.position.x, partA.position.y);
      ctx.lineTo(partB.position.x, partB.position.y);
      ctx.lineWidth = 5;
      ctx.strokeStyle = "red";
      ctx.stroke();
    }
  }
}

// inference
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

function brainLoaded() {
  console.log("pose classification ready");
  classifyPose();
}

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

function gotResult(error, results) {
  if (results[0].confidence > 0.9) {
    poseLabel = results[0].label.toUpperCase();
  } else {
    poseLabel = "";
  }

  if (poseLabel == "") {
    text = "Pose is ...";
  } else {
    text = "Pose is " + poseLabel;
  }
  // console.log(poseLabel);
  classifyPose();
}
