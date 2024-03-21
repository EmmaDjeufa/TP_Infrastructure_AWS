import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';


// Configuration de DynamoDB
const dynamoDB = new DynamoDB.DocumentClient();
const tableName = 'cy-Emma-feast-events';

// Fonction principale de la lambda
export const handler = async(event:any) => {
  try {
    const eventData = JSON.parse(event.body || '{}');

    if (!eventData.eventId || !eventData.participants) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Mauvaise requête. Assurez-vous que eventId et participants sont fournis.' }),
      };
    }

    // Vérifier si l'événement existe dans la table DynamoDB
    const eventRecord = await dynamoDB.get({
      TableName: tableName,
      Key: { 'event-id': eventData.eventId },
    }).promise();

    if (!eventRecord.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Événement non trouvé.' }),
      };
    }

    const participants = eventData.participants;

    // Enregistrer chaque participant dans la table DynamoDB
    for (const participantName of participants) {
      await dynamoDB.put({
        TableName: tableName,
        Item: {
          'event-id': eventData.eventId,
          'participant-name': participantName,
        },
      }).promise();
    }

      // Répondre avec succès
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Inscription réussie.' }),
    };
  } catch (error) {
    console.error("Erreur lors de l'inscription à l'événement:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur interne du serveur.' }),
    };
  }
};
