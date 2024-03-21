
import { DynamoDB } from 'aws-sdk';

const dynamoDB = new DynamoDB.DocumentClient();

export async function handler(user: any) {
  // l'événement est déclenché par Cognito (inscription ou connexion), récupérer les informations sur l'utilisateur
  if (user.request.userAttributes) {
    const userId = user.userName; // ID utilisateur
    const email = user.request.userAttributes.email; // Adresse e-mail de l'utilisateur

    // Enregistrer l'utilisateur dans la table DynamoDB
    await saveUser(userId, email);
  }

  //l'événement est déclenché par un appel API, (récupération des utilisateurs)
  if (user.httpMethod === 'GET') {
    // Récupérer tous les utilisateurs dans la table DynamoDB
    const users = await getUsers();
    return {
      statusCode: 200,
      body: JSON.stringify(users),
    };
  }

  return {
    statusCode: 400,
    body: 'Invalid request',
  };
}

async function saveUser(userId: string, email: string) {
  const params: DynamoDB.DocumentClient.PutItemInput = {
    TableName: process.env.TABLE_NAME!,
    Item: {
      userId: userId,
      email: email,
    },
  };

  await dynamoDB.put(params).promise();
}

async function getUsers() {
  const params: DynamoDB.DocumentClient.ScanInput = {
    TableName: process.env.TABLE_NAME!,
  };

  const result = await dynamoDB.scan(params).promise();

  return result.Items;
}
