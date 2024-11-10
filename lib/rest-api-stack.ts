import * as cdk from "aws-cdk-lib";
import * as apig from "aws-cdk-lib/aws-apigateway";
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as custom from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { AuthApi } from './auth-api'
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { generateBatch } from "../shared/util";
import { clubs, clubPlayers } from "../seed/clubs";

export class RestAPIStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new UserPool(this, "UserPool", {
      signInAliases: { username: true, email: true },
      selfSignUpEnabled: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const appClient = userPool.addClient("AppClient", {
      authFlows: { userPassword: true },
    });

    const userPoolId = userPool.userPoolId;
    const userPoolClientId = appClient.userPoolClientId;

    new AuthApi(this, 'AuthServiceApi', {
      userPoolId: userPoolId,
      userPoolClientId: userPoolClientId,
    });

    // Tables 
    const clubsTable = new dynamodb.Table(this, "ClubsTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "id", type: dynamodb.AttributeType.NUMBER },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "Clubs",
    });

    const clubPlayersTable = new dynamodb.Table(this, "ClubPlayerTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "clubId", type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: "playerName", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "ClubPlayer",
    });

    clubPlayersTable.addLocalSecondaryIndex({
      indexName: "clubIx",
      sortKey: { name: "club", type: dynamodb.AttributeType.STRING },
    });

    
    // Functions 

    const getClubByIdFn = new lambdanode.NodejsFunction(
      this,
      "GetClubByIdFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: `${__dirname}/../lambdas/getClubById.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: clubsTable.tableName,
          CAST_TABLE_NAME: clubPlayersTable.tableName,
          REGION: 'eu-west-1',
        },
      }
      );
      
      const getAllClubsFn = new lambdanode.NodejsFunction(
        this,
        "GetAllClubsFn",
        {
          architecture: lambda.Architecture.ARM_64,
          runtime: lambda.Runtime.NODEJS_18_X,
          entry: `${__dirname}/../lambdas/getAllClubs.ts`,
          timeout: cdk.Duration.seconds(10),
          memorySize: 128,
          environment: {
            TABLE_NAME: clubsTable.tableName,
            REGION: 'eu-west-1',
          },
        }
        );

        const newClubFn = new lambdanode.NodejsFunction(this, "AddClubFn", {
          architecture: lambda.Architecture.ARM_64,
          runtime: lambda.Runtime.NODEJS_18_X,
          entry: `${__dirname}/../lambdas/addClub.ts`,
          timeout: cdk.Duration.seconds(10),
          memorySize: 128,
          environment: {
            TABLE_NAME: clubsTable.tableName,
            REGION: "eu-west-1",
          },
        });

        const deleteClubFn = new lambdanode.NodejsFunction(this, "DeleteClubFn", {
          architecture: lambda.Architecture.ARM_64,
          runtime: lambda.Runtime.NODEJS_18_X,
          entry: `${__dirname}/../lambdas/deleteClub.ts`,
          timeout: cdk.Duration.seconds(10),
          memorySize: 128,
          environment: {
            TABLE_NAME: clubsTable.tableName,
            REGION: "eu-west-1",
          },
        });

        const getClubPlayerFn = new lambdanode.NodejsFunction(
          this,
          "GetClubPlayerFn",
          {
            architecture: lambda.Architecture.ARM_64,
            runtime: lambda.Runtime.NODEJS_18_X,
            entry: `${__dirname}/../lambdas/getClubPlayer.ts`,
            timeout: cdk.Duration.seconds(10),
            memorySize: 128,
            environment: {
              TABLE_NAME: clubPlayersTable.tableName,
              REGION: "eu-west-1",
            },
          }
        );
        
        new custom.AwsCustomResource(this, "clubsddbInitData", {
          onCreate: {
            service: "DynamoDB",
            action: "batchWriteItem",
            parameters: {
              RequestItems: {
                [clubsTable.tableName]: generateBatch(clubs),
                [clubPlayersTable.tableName]: generateBatch(clubPlayers),  // Added
              },
            },
            physicalResourceId: custom.PhysicalResourceId.of("clubsddbInitData"), //.of(Date.now().toString()),
          },
          policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
            resources: [clubsTable.tableArn, clubPlayersTable.tableArn],
          }),
        });
        
        // Permissions 
        clubsTable.grantReadData(getClubByIdFn)
        clubsTable.grantReadData(getAllClubsFn)
        clubsTable.grantReadWriteData(newClubFn)
        clubsTable.grantReadWriteData(deleteClubFn);
        clubPlayersTable.grantReadData(getClubPlayerFn);
        clubPlayersTable.grantReadData(getClubByIdFn);

        // REST API
        const api = new apig.RestApi(this, "RestAPI", {
          description: "demo api",
          deployOptions: {
            stageName: "dev",
          },
          defaultCorsPreflightOptions: {
            allowHeaders: ["Content-Type", "X-Amz-Date"],
            allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
            allowCredentials: true,
            allowOrigins: ["*"],
          },
        });

        const authorizer = new apig.CognitoUserPoolsAuthorizer(this, "CognitoAuthorizer", {
          cognitoUserPools: [userPool],
        });
    
        const clubsEndpoint = api.root.addResource("clubs");
        clubsEndpoint.addMethod(
          "GET",
          new apig.LambdaIntegration(getAllClubsFn, { proxy: true }),
          { authorizer, authorizationType: apig.AuthorizationType.COGNITO }
        );

        clubsEndpoint.addMethod(
          "POST",
          new apig.LambdaIntegration(newClubFn, { proxy: true })
        );
    
        const clubEndpoint = clubsEndpoint.addResource("{clubId}");

        clubEndpoint.addMethod(
          "GET",
          new apig.LambdaIntegration(getClubByIdFn, { proxy: true })
        );
        clubEndpoint.addMethod(
          "DELETE",
          new apig.LambdaIntegration(deleteClubFn, { proxy: true }),
          { authorizer, authorizationType: apig.AuthorizationType.COGNITO }
        );
        
        const clubPlayerEndpoint = clubsEndpoint.addResource("players");
clubPlayerEndpoint.addMethod(
    "GET",
    new apig.LambdaIntegration(getClubPlayerFn, { proxy: true })
);

      }
    }
    