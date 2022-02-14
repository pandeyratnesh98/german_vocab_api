import { AuthenticationError } from "apollo-server";
import { __String } from "typescript";
import { combineData } from "./src/utils/data";
const utils = require("./src/utils");
const _ = require("lodash");
const getKeyValue = <T, K extends keyof T>(obj: T, key: K): T[K] => obj[key];
import * as admin from "firebase-admin";

const printError = () => {
  return new AuthenticationError(
    "You are not authorised to perform any action here."
  );
};

const vocabList = async (parent: any, args: any, context: any, info: any) => {
  let data: Array<{ english: string; german: string }> = [];
  if (context.err) {
    return printError();
  }
  await admin
    .auth()
    .getUser(context.res.locals.userId)
    .then((userRecord: any) => {
      console.log("logs: " + userRecord.customClaims["premium"]);
      // The claims can be accessed on the user record.
      if (userRecord.customClaims["premium"]) {
        data = _.sortBy(getKeyValue(combineData, args.input), [
          (obj: any) => obj.german,
        ]);
      } else {
        data = _.sortBy(getKeyValue(combineData, args.input), [
          (obj: any) => obj.german,
        ]).slice(0, 20);
      }
    })
    .catch((err) => {
      return (data = _.sortBy(getKeyValue(combineData, args.input), [
        (obj: any) => obj.german,
      ]).slice(0, 20));
    });

  return data;
};
const getRandomTenVocab = async (
  parent: any,
  args: any,
  context: any,
  info: any
) => {
  // if (context.err) {
  //   return printError();
  // }

  return utils.getRandom10Vocab(getKeyValue(combineData, utils.getRandomkey()));
};

const search = async (parent: any, args: any, context: any, info: any) => {
  if (context.err) {
    return printError();
  }

  return _.uniqWith(utils.getSearchResult(args.input), _.isEqual);
};
export default {
  Query: {
    vocabList,
    getRandomTenVocab,
    search,
  },
};
