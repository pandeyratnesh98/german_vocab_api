import { gql } from "apollo-server";

export default gql`
  type Vocab {
    german: String!
    english: String!
  }
  type Query {
    vocabList(input: String!): [Vocab!]
    getRandomTenVocab: [Vocab!]
    getTwentyVocab(input: String!): [Vocab!]
    search(input: String!): [Vocab!]
  }
`;
