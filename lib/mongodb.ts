// Adapted from https://github.com/vercel/next.js/blob/canary/examples/with-mongodb/lib/mongodb.ts
import { MongoClient, ServerApiVersion } from "mongodb";

if (!process.env["SINGLESTORE_KAI_CONNECTION_STRING"]) {
  throw new Error('Invalid/Missing environment variable: "SINGLESTORE_KAI_CONNECTION_STRING"');
}

const uri = process.env["SINGLESTORE_KAI_CONNECTION_STRING"];
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
