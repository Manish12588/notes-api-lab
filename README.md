# Notes API Lab

Practice target for API testing: Express REST API + MySQL `notes` table.

## Run

1. Start MySQL + phpMyAdmin (DB viewer):
   `docker compose up -d`
2. Install and start the API:
   `npm install`
   `npm start`
3. API base URL: http://localhost:3000/api/notes

## View the database table

Open http://localhost:8081 (phpMyAdmin). Log in:

- Username: root
- Password: root123

Click `notesdb` > `notes` > Browse. Refresh after each API call.

Or from terminal:
`docker exec -it notes-mysql mysql -uroot -proot123 notesdb -e "SELECT * FROM notes;"`

## Endpoints

| Method | URL             | Body                  | Success  | Errors          |
| ------ | --------------- | --------------------- | -------- | --------------- |
| GET    | /api/notes      | -                     | 200 list | -               |
| GET    | /api/notes/{id} | -                     | 200      | 400 bad id, 404 |
| POST   | /api/notes      | title, content        | 201      | 400             |
| PUT    | /api/notes/{id} | title, content (both) | 200      | 400, 404        |
| PATCH  | /api/notes/{id} | title and/or content  | 200      | 400, 404        |
| DELETE | /api/notes/{id} | -                     | 204      | 400, 404        |

## Sample requests

POST body:
{ "title": "My note", "content": "Some text" }

PATCH body:
{ "content": "Only content changed" }

curl:
curl -X POST localhost:3000/api/notes -H "Content-Type: application/json" -d '{"title":"t","content":"c"}'

## Things to practice

- Status codes and response bodies for each method
- PUT (full replace) vs PATCH (partial) behaviour
- Negative cases: missing fields, empty strings, id=abc, id=9999
- Verify each call in the DB table, not only in the response
- Reset data: `docker compose down -v && docker compose up -d`
