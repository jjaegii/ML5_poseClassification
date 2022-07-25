// let video = document.getElementById("videoElem");
// let canvas = document.getElementById("canvas");
// let ctx = canvas.getContext("2d");
// let poseNet;
// let pose;
// let skeleton;

// let brain;
// let poseLabel = "";

// function setup() {
//   createCanvas(640, 480);
//   //video = createVideo(videotag);
//   //video.hide();
//   poseNet = ml5.poseNet(video, modelLoaded);
//   poseNet.on("pose", gotPoses);

//   let options = {
//     inputs: 34,
//     outputs: 4, // 종류
//     task: "classification",
//     debug: true,
//   };
//   brain = ml5.neuralNetwork(options);
//   const modelInfo = {
//     model: "../../static/model/model.json",
//     metadata: "../../static/model/model_meta.json",
//     weights: "../../static/model/model.weights.bin",
//   };

//   brain.load(modelInfo, brainLoaded);
// }

// // making skeleton
// function gotPoses(poses) {
//   if (poses.length > 0) {
//     pose = poses[0].pose;
//     skeleton = poses[0].skeleton;
//   }
// }

// function modelLoaded() {
//   console.log("poseNet ready");
// }

// function draw() {
//   push();
//   translate(video.width, 0);
//   scale(-1, 1);
//   image(video, 0, 0, video.width, video.height);

//   if (pose) {
//     for (let i = 0; i < skeleton.length; i++) {
//       let a = skeleton[i][0];
//       let b = skeleton[i][1];
//       strokeWeight(2);
//       stroke(0);
//       line(a.position.x, a.position.y, b.position.x, b.position.y);
//     }

//     for (let i = 0; i < pose.keypoints.length; i++) {
//       let x = pose.keypoints[i].position.x;
//       let y = pose.keypoints[i].position.y;
//       fill(0, 0, 0);
//       ellipse(x, y, 16, 16);
//     }
//   }
//   pop();

//   fill(255, 0, 255);
//   noStroke();
//   textSize(256);
//   textAlign(CENTER, CENTER);
//   text(poseLabel, width / 2, height / 2);
// }

// // 추론 파트
// function brainLoaded() {
//   console.log("pose classification ready");
//   classifyPose();
// }

// function classifyPose() {
//   if (pose) {
//     let inputs = [];
//     for (let i = 0; i < pose.keypoints.length; i++) {
//       let x = pose.keypoints[i].position.x;
//       let y = pose.keypoints[i].position.y;
//       inputs.push(x);
//       inputs.push(y);
//     }
//     brain.classify(inputs, gotResult);
//   } else {
//     setTimeout(classifyPose, 100);
//   }
// }

// function gotResult(error, results) {
//   if (results[0].confidence > 0.9) {
//     poseLabel = results[0].label.toUpperCase();
//   } else {
//     poseLabel = "";
//   }
//   //console.log(poseLabel);
//   classifyPose();
// }
