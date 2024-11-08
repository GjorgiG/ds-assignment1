import { marshall } from "@aws-sdk/util-dynamodb";
import { Club, ClubPlayer } from "./types";

type Entity = Club | ClubPlayer;  // NEW
export const generateItem = (entity: Entity) => {
  return {
    PutRequest: {
      Item: marshall(entity),
    },
  };
};

export const generateBatch = (data: Entity[]) => {
  return data.map((e) => {
    return generateItem(e);
  });
};