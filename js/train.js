let brain;

function setup() {
  let options = {
    inputs: 34,
    outputs: 2,
    task: "classification",
    debug: true,
  };
  brain = ml5.neuralNetwork(options);
  brain.loadData("walk,sit,jump,stand,greeting.json", dataReady);
}

function dataReady() {
  brain.normalizeData();
  brain.train({ epochs: 200 }, finished);
}

function finished() {
  console.log("model trained");
  brain.save();
}
