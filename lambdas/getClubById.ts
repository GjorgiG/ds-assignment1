import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    // Print Event
    console.log("[EVENT]", JSON.stringify(event));
    const {pathParameters, queryStringParameters}  = event;
    const clubId = pathParameters?.clubId ? parseInt(pathParameters.clubId) : undefined;
    const includeClubPlayer = event.queryStringParameters?.ClubPlayer === 'true';

    if (!clubId) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ Message: "Missing club Id" }),
      };
    }

    const commandOutput = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: { id: clubId },
      })
    );

    console.log("GetCommand response: ", commandOutput);
    if (!commandOutput.Item) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ Message: "Invalid club Id" }),
      };
    }

    const body: { data: Record<string, any>; clubPlayer?: any[] } = {
      data: commandOutput.Item,
    };

    if (includeClubPlayer) {
      const clubPlayerCommandOutput = await ddbDocClient.send(
        new QueryCommand({
          TableName: process.env.CAST_TABLE_NAME,
          KeyConditionExpression: "clubId = :clubId",
          ExpressionAttributeValues: {
            ":clubId": clubId,
          },
        })
      );

      console.log("QueryCommand response: ", clubPlayerCommandOutput);
      
      
      body.clubPlayer = clubPlayerCommandOutput.Items || [];
    }

    // Return Response
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    };
  } catch (error: any) {
    console.log(JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ error }),
    };
  }
};

function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = {
    wrapNumbers: false,
  };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}