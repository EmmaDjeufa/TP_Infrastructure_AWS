import * as AWS from 'aws-sdk';

const db = new AWS.DynamoDB.DocumentClient();

const TABLE = process.env.TABLE;

exports.handler = async(stock:any) => {

    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        switch (stock.httpMethod) {
            case 'DELETE':
                body = await db.delete(JSON.parse(stock.body));
                break;
            case 'GET':
                body = await db.scan({ TableName: stock.queryStringParameters.TableName });
                break;
            case 'POST':
                body = await db.put(JSON.parse(stock.body));
                break;
            case 'PUT':
                body = await db.update(JSON.parse(stock.body));
                break;
            default:
                throw new Error(`Unsupported method "${stock.httpMethod}"`);
        }
    } catch (err:any) {
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
}