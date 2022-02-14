import { gql } from "apollo-server";

export default `
  type Vocab {
    german: String!
    english: String!
  }
  type Query {
    vocabList(input: String!): [Vocab!]
    getRandomTenVocab: [Vocab!]
    search(input: String!): [Vocab!]
  }
`;
