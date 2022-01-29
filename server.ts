require("dotenv").config();
import { ApolloServer, AuthenticationError } from "apollo-server";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import { ApolloServerPluginLandingPageDisabled } from "apollo-server-core";
const bcrypt = require("bcrypt");
let server = null;

if (!server) {
  server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const arrayAuth = req.headers.authorization?.split(" ");
      if (arrayAuth && arrayAuth.includes("bearer")) {
        const res = await bcrypt.compare(
          arrayAuth[1],
          process.env.HASH_PASSWORD
        );
        if (!res) {
          return {
            authorised: false,
            err: true,
          };
        } else {
          return {
            authorised: true,
            err: false,
          };
        }
      } else {
        return {
          authorised: false,
          err: true,
        };
      }
    },
    // plugins: [ApolloServerPluginLandingPageDisabled],
  });
  server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
}
