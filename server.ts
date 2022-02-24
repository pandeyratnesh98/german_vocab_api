require("dotenv").config();
const express = require("express");
// import { ApolloServer, AuthenticationError } from "apollo-server";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
// import { ApolloServerPluginLandingPageDisabled } from "apollo-server-core";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
// const bcrypt = require("bcrypt");
// let server = null;
const expressPlayground =
  require("graphql-playground-middleware-express").default;
const app = express();
const stripe = require("stripe")(
  "sk_test_51KNJ2FSBPFLa6VsBCMITKY4e4Oq4V3yl7FMQGRYf1PYXMxKUCFjCN5yjrQ72Znb6yiOduJtEiTr253mIO3rnRiBQ00TH5btEGA"
);
import * as admin from "firebase-admin";
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.PROJECT_ID,
    privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
    clientEmail: process.env.CLIENT_EMAIL,
  }),
});

// if (!server) {
//   server = new ApolloServer({
//     typeDefs,
//     resolvers,
//     context: async ({ req }) => {
//       console.log(req.headers.authorization);
//       const arrayAuth = req.headers.authorization?.split(" ");
//       return {
//         authorised: true,
//         err: false,
//       };
//     },
//     // plugins: [ApolloServerPluginLandingPageDisabled],
//   });}
const verifyIdToken = async (idToken: string) => {
  return await admin.auth().verifyIdToken(idToken);
};
const loggingMiddleware = (req: any, res: any, next: any) => {
  const authorization = req.headers.authorization;
  console.log(authorization);
  if (!authorization) {
    return res.status(401).send("You are not authorised to make any request.");
  }
  const idToken = authorization.split(" ")[1];
  verifyIdToken(idToken)
    .then((decodedToken) => {
      res.locals.userId = decodedToken.uid;
      return next();
    })
    .catch((err) => {
      return res
        .status(401)
        .send("You are not authorised to make any request.");
    });
};
app.use("/checkout", loggingMiddleware);
app.use("/graphql", loggingMiddleware);
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

//checkout payment
app.post("/checkout", async (req: any, res: any) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 19900,
    currency: "inr",
    metadata: {
      uid: res.locals.userId,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return res.json({
    paymentIntent: paymentIntent.client_secret,
    publishableKey: process.env.PUBLISABLE_KEY,
  });
});

//after payment making person with premium previllages
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request: any, response: any) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        sig,
        process.env.WEBHOOK_SIGN_KEY
      );
    } catch (err: any) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        if (!paymentIntent.metadata.uid) {
          response.status(401).send(`Authentication Failed`);
          return;
        }
        admin
          .auth()
          .setCustomUserClaims(paymentIntent.metadata.uid, { premium: true })
          .then(() => {
            admin
              .auth()
              .revokeRefreshTokens(paymentIntent.metadata.uid)
              .then(() => {
                response.send("Payment Successfull! You are prime User Now");
              });
          })
          .catch((err) => {
            response.status(401).send(`Authentication Failed: ${err.message}`);
          });

        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      // ... handle other event types
      default:
        response.status(400).send(`Unhandled event type ${event.type}`);
    }
  }
);

//listening server
app.listen(process.env.PORT || 4000, () => {
  console.log("server is running...");
});
