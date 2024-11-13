## Serverless REST Assignment - Distributed Systems.

__Name:__ Gjorgi Gjorgiev

__Demo:__ ... https://youtu.be/QB-HI1yM0P4 ......

### Context.

I used a serverless REST API for this assignment where users can store football clubs and players within those football clubs. The main database (Clubs) stores basic information like 'year_founded', 'id', 'name' and 'city' while players stores more information like 'player value', 'appearances' or 'position' etc.

### App API endpoints.
 
+ POST /clubs - Adds a new club to the database.
+ GET /clubs/{clubId} - Get all clubs with the specified clubId.
+ GET /clubs - Gets all clubs.
+ PUT /club/{clubId} - Update an existing club.
+ GET /clubs/player?{clubId}=attributeX=value - Get player by specific club while also querying attribute.
+ GET /clubs/{clubId}/translation?language={language} - Get a club and translate the name of the club.
+ DELETE /clubs/{clubId} - Delete a club from the database.

### Translation persistence (if relevant).

This design checks if the translation exists for the target language in 'translationCache' in the DynamoDB database. If it doesn't exist it will make a call to Amazon translate to get it translated. In the future, it will use that cached translation instead of making a new call to Amazon translate.

###  Extra (If relevant).

This is multi-stack as one stack handles with the signup and authentication of users while the other stack handles the databases and all the funcionality associated with that.




