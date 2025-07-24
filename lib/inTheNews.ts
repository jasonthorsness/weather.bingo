import clientPromise from "lib/mongodb";
import { getName } from "app/e/getName";

export type InTheNewsItem = {
  lk: number;
};

export async function getInTheNews() {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<InTheNewsItem>("inTheNews");
  const response = await collection.find().toArray();
  let names: string[] = [];
  try {
    const namePromises = response.map((item) => getName(item.lk));
    names = await Promise.all(namePromises);
  } catch (error) {
    return [];
  }
  const result = response.map((item, index) => ({ ...item, name: names[index] }));
  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}
