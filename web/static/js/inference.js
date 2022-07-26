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
let result = document.getElementById("result");

// The detected positions will be inside an array
let poses = [];
let pose;

// A function to draw the video and poses into the canvas.
// This function is independent of the result of posenet
// This way the video will not seem slow if poseNet
// is not detecting a position

// video -> canvas
function drawCameraIntoCanvas() {
  console.log("drawing canvas called");
  // Draw the video element into the canvas
  ctx.drawImage(video, 0, 0, 640, 480);
  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  drawSkeleton();
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
    //console.log("pose : ", pose);
    //console.log("skeleton : ", skeleton);
  }
}

function modelReady() {
  console.log("model ready");
  poseNet.multiPose(video);
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i += 1) {
    // For each pose detected, loop through all the keypoints
    for (let j = 0; j < poses[i].pose.keypoints.length; j += 1) {
      let keypoint = poses[i].pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        ctx.beginPath();
        ctx.arc(keypoint.position.x, keypoint.position.y, 10, 0, 2 * Math.PI);
        ctx.stroke();
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
  model: "../model/model.json",
  metadata: "../model/model_meta.json",
  weights: "../model/model.weights.bin",
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
  console.log(poseLabel);
  result.innerHTML = poseLabel;
  classifyPose();
}

let btn = document.getElementById("btn");

btn.addEventListener("click", function () {
  console.log("hello");
});
