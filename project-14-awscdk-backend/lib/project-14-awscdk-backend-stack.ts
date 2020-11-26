import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as CodeBuild from '@aws-cdk/aws-codebuild'
import * as S3 from '@aws-cdk/aws-s3'
import * as CodePipeline from '@aws-cdk/aws-codepipeline'
import * as CodePipelineAction from '@aws-cdk/aws-codepipeline-actions'
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';

export class Project14AwscdkBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

     // Amazon S3 bucket to store CRA website
     const bucketWebsite = new S3.Bucket(this, 'Files', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: true,
    })

    const dist = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: { origin: new origins.S3Origin(bucketWebsite) },
    });

    
    // The code that defines your stack goes here
    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'cdk-lolly-appsync-api',
      schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365))
          }
        },
      },
    });

    // Prints out the AppSync GraphQL endpoint to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
     value: api.graphqlUrl
    });

    // Prints out the AppSync GraphQL API key to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || ''
    });

    // Prints out the stack region to the terminal
    new cdk.CfnOutput(this, "Stack Region", {
      value: this.region
    });

    const lollyLambda = new lambda.Function(this, 'AppSyncLollyHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'main.handler',
      code: lambda.Code.fromAsset('lambda-fns'),
      memorySize: 1024
    });
    
    // Set the new Lambda function as a data source for the AppSync API
    const lambdaDs = api.addLambdaDataSource('lambdaDatasource', lollyLambda);

    // lib/appsync-cdk-app-stack.ts
    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "getAllLollies"
    });

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "getLollyBySlug"
    });

    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "createLolly"
    });


    // lib/appsync-cdk-app-stack.ts
    const lolliesTable = new ddb.Table(this, 'CDKLolliesTable', {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'path',
        type: ddb.AttributeType.STRING,
      },
    });
    // enable the Lambda function to access the DynamoDB table (using IAM)
    lolliesTable.grantFullAccess(lollyLambda)

    // Create an environment variable that we will use in the function code
    lollyLambda.addEnvironment('NOTES_TABLE', lolliesTable.tableName);
  }
  }

