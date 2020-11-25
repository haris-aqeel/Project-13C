// lambda-fns/createLolly.ts
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

type Lolly  = {
    recipientName: string
    senderName: string
    message: string
    topColor: string
    mediumColor: string
    bottomColor: string
    path: string
  }



async function createLolly(lolly: Lolly) {
    const params = {
        TableName: process.env.NOTES_TABLE,
        Item: lolly
    }
    try {
        await docClient.put(params).promise();
        return lolly;
    } catch (err) {
        console.log('DynamoDB error: ', err);
        return null;
    }
}

export default createLolly;