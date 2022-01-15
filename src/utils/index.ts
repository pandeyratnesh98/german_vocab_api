import { allInOneArrayForSearch, combineData } from "./data";
const _ = require("lodash");

module.exports.getRandomkey = () => {
  const keys = Object.keys(combineData);
  return keys[Math.floor(Math.random() * keys.length)];
};
interface vocabList {
  english: String;
  german: String;
}

module.exports.getRandom10Vocab = (data: Array<vocabList>) => {
  let vocabList = [];
  for (let i = 0; i < 10; i++) {
    const uniqIndex = _.random(0, data.length - 1);
    vocabList.push(data[uniqIndex]);
  }
  return vocabList;
};

module.exports.getSearchResult = (searchTerm: string) => {
  interface vocabList {
    english: String;
    german: String;
  }
  return _.filter(allInOneArrayForSearch, (vocab: vocabList) =>
    vocab.german.includes(searchTerm)
  );
};
