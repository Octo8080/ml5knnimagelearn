const ml5 = require("ml5");
const axios = require("axios");

let imageEl = document.getElementById("image");
let messageEl = document.getElementById("message");
let probabilityEl = document.getElementById("probability");

let KnnClassifier;
let featureExtractor;
let datalist = [];

let setup = async () => {
  console.log("[exe]", "setup");

  //データを準備
  datalist = await axios.get("/list.json").then(res => {
    return res.data.data;
  });
  console.table(datalist);

  //KNN分類器を作成
  KnnClassifier = ml5.KNNClassifier();
  featureExtractor = ml5.featureExtractor("MobileNet", culc);
};

let showresult = async results => {
  console.log("[exe]", "showresult");
  console.table(results);
  messageEl.innerText = `[判定結果]:${results.label}`;

  let text = (() => {
    let keys = Object.keys(results.confidencesByLabel);
    let tm = "判定確率\n";
    for (let i = 0; i < keys.length; i++) {
      tm += `[${keys[i]}]:${results.confidencesByLabel[keys[i]]}\n`;
    }
    return tm;
  })();

  probabilityEl.innerText = text;
};

let ch_image = function(el, path) {
  console.log("[exe]", "ch_image");
  el.src = "";
  el.src = path;
  return new Promise(resolve => {
    el.onload = () => {
      resolve();
    };
  });
};

let setlabel = async function(el, path, label) {
  console.log("[exe]", "setlabel");

  //画像差し替え
  await ch_image(el, path);
  //特徴量を取得し
  const features = featureExtractor.infer(imageEl);
  //knn分類機にlabelの名称で登録
  KnnClassifier.addExample(features, label);
};

let culc = async () => {
  console.log("[exe]", "culc");

  //モデル作成
  for (let i = 0; i < datalist.length; i++) {
    console.log("[img]", i);
    await setlabel(imageEl, datalist[i].path, datalist[i].tag);
  }

  //推論
  await ch_image(imageEl, "./img/test.jpg");
  const featuresTest1 = featureExtractor.infer(imageEl);
  console.log("推測開始:");
  // KNN分類器で分類を開始
  KnnClassifier.classify(featuresTest1, (err, result) => {
    // エラーを表示する
    if (err) {
      console.error(err);
    }
    console.log("結果");
    console.log(result);
    showresult(result);
  });

  enablebutton();
};

(async () => {
  await setup();
})();

let enablebutton = () => {
  document.getElementById("viewbutton").onclick = async () => {
    //KnnClassifier.save('x.json')
    const jsonstr = await Dataset2json();
    document.getElementById("jsonstr").innerText = jsonstr;  
  };
  document.getElementById("downloadbutton").onclick = async () => {
    KnnClassifier.save('get.json')
  };
  document.getElementById("viewbutton").disabled = false;
  document.getElementById("downloadbutton").disabled = false;
};

let Dataset2json = async () => {
  const dataset = KnnClassifier.knnClassifier.getClassifierDataset();
  console.log(dataset);

  if (KnnClassifier.mapStringToIndex.length > 0) {
    Object.keys(dataset).forEach(key => {
      if (KnnClassifier.mapStringToIndex[key]) {
        dataset[key].label = KnnClassifier.mapStringToIndex[key];
      }
    });
  }
  const tensors = Object.keys(dataset).map(key => {
    const t = dataset[key];
    if (t) {
      return t.dataSync();
    }
    return null;
  });
  const jsonstr = JSON.stringify({ dataset, tensors });
  return jsonstr
};
