import * as AWS from 'aws-sdk';

const db = new AWS.DynamoDB.DocumentClient();

const TABLE = process.env.TABLE;

exports.handler = async (stock: any) => {
    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        switch (stock.httpMethod) {
            case 'POST':
                body = await db.put(JSON.parse(stock.body)).promise();
                break;
            default:
                throw new Error(`Unsupported method "${stock.httpMethod}"`);
        }
    } catch (err: any) {
        statusCode = '400';
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};