# Welcome to my CDK TypeScript project  (Emmanuella NGOUGUE DJEUFA)

L'architecture implémentée est celle qui se trouve dans le dossier lib/Image_Infrastructure/Architecture_du_projet.vpd.png

Une stack finallement a été implémenté pour la gestion des événements, des stocks et des utilisateurs.
La partie implémentée sur le cognito est en rapport avec les rôles d'utilisateurs et le bucket permet de gérer les images.

D'après le design d'architecture du départ, 6 lambdas et 3 tables ont été crées en plus du bucket.


## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
