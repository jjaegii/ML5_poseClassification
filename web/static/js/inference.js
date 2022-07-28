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
let text = "";

// A function to draw the video and poses into the canvas.
// This function is independent of the result of posenet
// This way the video will not seem slow if poseNet
// is not detecting a position

objectDetector = ml5.objectDetector("cocossd", startDetecting);

function startDetecting() {
  console.log("cocossd model ready");
  drawCameraIntoCanvas();
}

// Create a new poseNet method with a single detection
poseNet = ml5.poseNet(video, modelReady);
poseNet.on("pose", gotPoses);

// A function that gets called every time there's an update from the model
function gotPoses(results) {
  poses = results; // 이 부분에서 bounding box안에 안들어가는 좌표는 다 지워버리고 poses에 넣기
  if (poses.length > 0) {
    pose = poses[0].pose; // 아니면 이 부분?
    skeleton = poses[0].skeleton;
    // console.log("pose : ", pose);
    // console.log("skeleton : ", skeleton);
  }
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

  ctx.strokeStyle = "black";
  ctx.font = "bold 48px sans-serif";
  ctx.lineWidth = 10;
  ctx.strokeText(text, 30, 100);
  ctx.fillStyle = "white";
  ctx.fillText(text, 30, 100);

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

      for (let a = 0; a < objects.length; a++) {
        if (
          objects[a].label == "person" &&
          isInBox(objects[a], keypoint.position) == true
        ) {
          if (keypoint.score > 0.5) {
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
      console.log("partA : ", partA.position);
      console.log("partB : ", partB.position);
      for (let a = 0; a < objects.length; a++) {
        if (
          objects[a].label == "person" &&
          isInBox(objects[a], partA.position) == true &&
          isInBox(objects[a], partB.position) == true
        ) {
          console.log("if문 통과");
          ctx.beginPath();
          ctx.moveTo(partA.position.x, partA.position.y);
          ctx.lineTo(partB.position.x, partB.position.y);
          ctx.lineWidth = 5;
          ctx.strokeStyle = "red";
          ctx.stroke();
        }
      }
    }
  }
}

/* inference */
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
