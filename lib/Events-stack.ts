import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'; // Table Dynamodb et les attributs de sa clé de partition
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'; // Créer une Lambda NodeJS
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { UserPool, UserPoolClient, CfnIdentityPool, CfnIdentityPoolRoleAttachment } from 'aws-cdk-lib/aws-cognito';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as lambdaEventSources from '@aws-cdk/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3'; // Importez la classe Bucket depuis aws-s3


// Outils Node
declare const __dirname: string;
import { join } from 'path'; // Simplifier la gestion des adresses vers les fichiers internes
import { RestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';



//-------------------Première DynamoDB sur la gestion des événements---------------------

export class EventsStack extends cdk.Stack {

  //pour les événements
  eventsAPI:RestApi; // API du projet (pour récupérer les événements)
  eventsTb:Table; // Table des événements et participants
  getEventsLambda:NodejsFunction; // Lambda d'origine
  postEventsLambda:NodejsFunction; // Lambda d'origine
  InscriptionEventsLambda:NodejsFunction; // Lambda d'origine
  
  // Pour les stocks
  stocksAPI:RestApi; // API du projet
  stocksTb:Table; // Table des stocks
  getStocksLambda:NodejsFunction;
  postStocksLambda:NodejsFunction; // Lambda d'origine

  // Pour les utilisateurs
  usersAPI: RestApi; // API du projet (pour récupérer les utilisateurs)
  userPool: UserPool;
  userPoolClient: UserPoolClient;
  userPoolClientID: UserPoolClient
  identityPool: CfnIdentityPool;
  publicRole: Role;
  userRole: Role;
  organizerRole: Role;
  adminRole: Role;
  usersTb: Table;
  usersLambda: NodejsFunction;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Créez un bucket S3 pour stocker les images
    const imageBucket = new Bucket(this, 'ImageBucket', {
      bucketName: 'cy-feast-bucket', 
      removalPolicy: cdk.RemovalPolicy.DESTROY, 
      autoDeleteObjects: true, 
    });

    

    //-------------------Première DynamoDB sur la gestion des stocks---------------------
    // Ma stack va créer une table dans DynamoDB pour la gestion des évènements et participants
    this.eventsTb = new Table(this, 'tableEvents', {
      partitionKey:{
        name:'event-id',
        type:AttributeType.STRING
      },
      tableName:'cy-Emma-feast-events',
      readCapacity:1,
      writeCapacity:1
    });

    // Créer une lambda de récupération d'évènements
    this.getEventsLambda = new NodejsFunction(this, 'getEvents', {
      memorySize:128,
      description:"Appeler une liste d'événements",
      entry:join(__dirname, '../lambdas/Events/getEventsLambda.ts'),
      environment:{
        TABLE:this.eventsTb.tableName
      },
      runtime:lambda.Runtime.NODEJS_18_X
    });

    // Créer une lambda d'affichage des évènements d'évènements
    this.postEventsLambda = new NodejsFunction(this, 'postEvents', {
      memorySize:128,
      description:"Appeler une liste d'événements",
      entry:join(__dirname, '../lambdas/Events/postEventsLambda.ts'),
      environment:{
        TABLE:this.eventsTb.tableName
      },
      runtime:lambda.Runtime.NODEJS_18_X
    });

    // Créer une lambda d'inscription des participants aux évènements gérés dans la BD eventsTb (Correspondant au shéma d'architecture conçu au préalable)
    this.InscriptionEventsLambda = new NodejsFunction(this, 'inscriptionParticipants', {
      memorySize:128,
      description:"Appeler une liste de participants aux évènements",
      entry:join(__dirname, '../lambdas/Events/InscriptionEventsLambda.ts'),
      environment:{
        TABLE:this.eventsTb.tableName
      },
      runtime:lambda.Runtime.NODEJS_18_X
    });
    


    // Donner des permissions pour lire ou écrire dans une table
    // this.eventsTb.grantReadWriteData(getEventsLambda);
    this.eventsTb.grantReadData(this.getEventsLambda);
    this.eventsTb.grantWriteData(this.postEventsLambda);
    this.eventsTb.grantWriteData(this.InscriptionEventsLambda);

    // Création d'une API pour accéder aux événements
    this.eventsAPI = new RestApi(this, 'eventsAPI',{
      restApiName : 'Accéder aux informations sur les événements',
      description : 'Gestion des événements depuis le CY Feast'
    });


    // Intégration des lambda pour les connecter aux méthodes d'API
    const getEventsLambdaIntegration = new LambdaIntegration(this.getEventsLambda);
    const postEventsLambdaIntegration = new LambdaIntegration(this.postEventsLambda);
    const InscriptionEventsLambdaIntegration = new LambdaIntegration(this.InscriptionEventsLambda);



    const apiEvents = this.eventsAPI.root.addResource('events');
    const apiParticipants = this.eventsAPI.root.addResource('participants');
    
    apiEvents.addMethod('get', getEventsLambdaIntegration);
    apiEvents.addMethod('post', postEventsLambdaIntegration);
    apiEvents.addMethod('put');

    

    


//-------------------Deuxième DynamoDB sur la gestion des stocks---------------------


 

    // Ma stack va créer une table dans DynamoDB
    this.stocksTb = new Table(this, 'tableStocks', {
      partitionKey:{
        name:'stocks-id',
        type:AttributeType.STRING
      },
      tableName:'CY-Emma-Feast-Stocks',
      readCapacity:1,
      writeCapacity:1
    });

    // Créer une lambda de récupération pour les stocks
    this.getStocksLambda = new NodejsFunction(this, 'getStocks', {
      memorySize:128,
      description:"Appeler une liste de stocks",
      entry:join(__dirname, '../lambdas/Stocks/getStocksLambda.ts'),
      environment:{
        TABLE:this.stocksTb.tableName
      },
      runtime:lambda.Runtime.NODEJS_18_X
    });
    
     // Créer une lambda pour retourner des stocks
     this.postStocksLambda = new NodejsFunction(this, 'postStocks', {
      memorySize:128,
      description:"Retourner une liste de stocks",
      entry:join(__dirname, '../lambdas/Stocks/postStocksLambda.ts'),
      environment:{
        TABLE:this.stocksTb.tableName
      },
    });

    // Donner des permissions pour lire ou écrire dans une table
    this.stocksTb.grantReadData(this.getStocksLambda);
    this.stocksTb.grantWriteData(this.postStocksLambda);

    // Création d'une API pour accéder aux stocks
    this.stocksAPI = new RestApi(this, 'stocksAPI',{
      restApiName : 'Accéder aux stocks',
      description : 'Gestion des événements depuis le CY Feast'
    });

    // Intégration de la lambda pour la connecter à une méthode de l'API
    const getStocksLambdaIntegration = new LambdaIntegration(this.getStocksLambda);
    const postStocksLambdaIntegration = new LambdaIntegration(this.postStocksLambda);

    this.stocksAPI.root.addMethod('get', getStocksLambdaIntegration);
    this.stocksAPI.root.addMethod('post', postStocksLambdaIntegration);
    const apiStocks = this.stocksAPI.root.addResource('stocks');

    apiStocks.addMethod('get', getStocksLambdaIntegration);
    apiStocks.addMethod('post', postStocksLambdaIntegration);
    apiStocks.addMethod('put');


//-------------------Troisième DynamoDB sur la gestion des Utilisateurs----------------------------

     // Créer une table dans DynamoDB pour les utilisateurs
     this.usersTb = new Table(this, 'tableUsers', {
      partitionKey: {
        name: 'user-id',
        type: AttributeType.STRING,
      },
      tableName: 'CY-Emma-Feast-Users',
      readCapacity: 1,
      writeCapacity: 1,
    });
    
    // Création du pool d'utilisateurs Cognito
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'MyUserPool',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
    });


    //La lambda pour Charger les utilisateurs 
this.usersLambda = new NodejsFunction(this, 'usersLambda', {
  memorySize: 128,
  entry: join(__dirname, '../lambdas/Users/usersLambda.ts'),
  environment: {
    TABLE: this.usersTb.tableName,
  },
  role: this.userRole,
});

    // Donner des permissions à la lambda pour accéder à la table DynamoDB
    this.usersTb.grantReadWriteData(this.usersLambda);
   

    // Créer une instance de UserPoolClient et l'assigner à this.userPoolClient
this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
  userPool: this.userPool,
});

// Créer un pool d'identités Cognito pour fournir des identifiants temporaires
this.identityPool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
  allowUnauthenticatedIdentities: false,
  cognitoIdentityProviders: [{
    clientId: this.userPoolClient.userPoolClientId,
    providerName: this.userPool.userPoolProviderName,
  }],
});

    
    
    

    // Créer des rôles IAM pour chaque rôle
    this.publicRole = new Role(this, 'PublicRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });

    this.userRole = new Role(this, 'UserRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });

    this.organizerRole = new Role(this, 'OrganizerRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });

    this.adminRole = new Role(this, 'AdminRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });

    // Attacher les rôles IAM au pool d'identités Cognito
    new CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoles', {
      identityPoolId: this.identityPool.ref,
      roles: {
        'unauthenticated': this.publicRole.roleArn,
        'authenticatedUser': this.userRole.roleArn,
        'authenticatedOrganizer': this.organizerRole.roleArn,
        'authenticatedAdmin': this.adminRole.roleArn, 
      },
    });


// Créer une API pour accéder aux utilisateurs
this.usersAPI = new RestApi(this, 'usersAPI', {
  restApiName: 'Accéder aux utilisateurs',
  description: 'Gestion des utilisateurs depuis le CY Feast',
});

// Intégration des lambdas pour les connecter aux méthodes d'API
const usersLambdaIntegration = new LambdaIntegration(this.usersLambda);

const userResource = this.usersAPI.root.addResource('user');
userResource.addMethod('get', usersLambdaIntegration); 
userResource.addMethod('post', usersLambdaIntegration); 

}
}
