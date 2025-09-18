import { getSoldiersDB } from "../DAL/soldierDAL.js";

export async function mapSoldiers(commanderId) {
  console.log(commanderId);
  const soldiersArrray = await getSoldiersDB();
  const stack = [commanderId];
  const result = [];

  while (stack.length > 0) {
    const currentCommander = stack.pop();
    const directSubs = soldiersArrray
      .filter((s) => s.commander === Number(currentCommander))
      .map((s) => s.personal_number)
      .filter((sub) => sub !== commanderId);
    result.push(...directSubs);
    stack.push(...directSubs);
  }
  // console.log("result: ", result);
  return result;
}


