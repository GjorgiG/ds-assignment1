import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { TranslateClient, TranslateTextCommand } from '@aws-sdk/client-translate';

const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));
const translateClient = new TranslateClient({ region: process.env.REGION });

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const clubId = event.pathParameters?.clubId;
    const targetLanguage = event.queryStringParameters?.language;

    if (!clubId) {
      return { statusCode: 400, body: JSON.stringify({ message: "clubId is required" }) };
    }

    // retrieve data from DynamoDB
    const { Item: club } = await ddbClient.send(new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: { id: parseInt(clubId) },
    }));

    if (!club) {
      return { statusCode: 404, body: JSON.stringify({ message: "Club not found" }) };
    }

    
    if (!targetLanguage) {
      return { statusCode: 200, body: JSON.stringify({ data: club }) };
    }

    const translations = club.translationCache || {};

    // translate if the translation does not exist in the cache
    if (!translations[targetLanguage]) {
      const translationResult = await translateClient.send(
        new TranslateTextCommand({
          Text: club.name,
          SourceLanguageCode: 'en',
          TargetLanguageCode: targetLanguage,
        })
      );

      const translatedName = translationResult.TranslatedText || '';

      // update DynamoDB to cache the translation
      const updatedTranslations = { ...translations, [targetLanguage]: { name: translatedName } };
      await ddbClient.send(new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: { id: parseInt(clubId) },
        UpdateExpression: "SET translationCache = :updatedTranslations",
        ExpressionAttributeValues: { ":updatedTranslations": updatedTranslations },
      }));

      club.translationCache = updatedTranslations;
    }

    const responseClub = { ...club, name: club.translationCache[targetLanguage]?.name || club.name };

    return { statusCode: 200, body: JSON.stringify({ data: responseClub }) };

  } catch (error) {
    console.error("Error in translating club:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ message: "An error occurred during translation", error }) 
    };
  }
};

