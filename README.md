# REST Api Mock

Read a json file and use it for APIs.

## Usage

### Make Data

Make a JSON file, for example "db.json", like:

```js
{
    "tasks": [
        { "id":"1", "subject":"Buy milk", "finished":false },
        { "id":"2", "subject":"Fix my bike", "finished":true },
        { "id":"3", "subject":"Post a mail", "finished":false }
    ]
}
```

### Run

Start this mock server.

```bash
$ node rest-api-mock --db=db.json
Started at http://localhost:8000.
Waiting...
```

### Request

Access to server.

Any creation and changes are served on the server.

`GET http://localhost:8000/tasks` returns:

```js
[
        { "id":1, "subject":"Buy milk", "finished":false },
        { "id":2, "subject":"Fix my bike", "finished":true },
        { "id":3, "subject":"Post a mail", "finished":false }
]
```

`POST http://localhost:8000/tasks` with `{"subject":"Say hello!"}` returns:

```js
{ "id":4, "subject":"Say hello!" }
```

Then `GET http://localhost:8000/tasks/4` returns:

```js
{ "id":4, "subject":"Say hello!" }
```

Next `PATCH http://localhost:8000/tasks/4` with `{"title":"Say goodby!", "finished":true}` returns:

```js
{ "id":4, "subject":"Say goodby!", "finished":true }
```

Finally `DELETE http://localhost:8000/tasks/4` returns no content.

And now, `GET http://localhost:8000/tasks/4` returns `404`.

### Stop

Use Ctrl+C.

Then all changed data has gone! You will see data written in JSON file again when run server.

