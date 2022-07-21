let video;
let poseNet;
let pose;
let skeleton;

let brain;

let targetLabel;
let state = "waiting";

function collecting() {
  targetLabel = document.getElementById("class").value;
  console.log(targetLabel);
  setTimeout(function () {
    console.log("collecting");
    state = "collecting";
    setTimeout(function () {
      console.log("not collecting");
      alert("not collecting");
      state = "waiting";
    }, 10000);
  }, 1000);
}

function saveCollected() {
  brain.saveData();
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", gotPoses);

  let options = {
    inputs: 34,
    outputs: 4, // 종류
    task: "classification",
    debug: true,
  };
  brain = ml5.neuralNetwork(options);
}

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

function modelLoaded() {
  console.log("poseNet ready");
}

function draw() {
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);
  image(video, 0, 0);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(0);
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }

    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0, 0, 0);
      ellipse(x, y, 16, 16);
    }
  }
}
