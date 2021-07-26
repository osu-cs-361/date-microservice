# date-microservice
Date/time manipulation and appointment microservice.  

# API

All supplied datetimes, whether supplied as query paramters or as JSON payloads, can be supplied as any string that can be parsed by the [JavaScript Date constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date).  

## Public Endpoints
These endpoints are available publicly and require no authorization to access.  

### Health Check

```
/healthcheck GET
```

Returns HTTP 200. Use to check if server is running and able to serve responses.  

### Interval Calculator

```
/datetime/interval/:interval_length GET
query params: 
  start (Date string)
  end (Date string, optional)
```

Returns the time interval between `start` and `end` query parameters and the provided interval length. Interval is in units given by `interval_length` url parameter. If no `end` param is passed, interval from `start` param until now is returned.  

Example:

```
GET
/datetime/interval/days?start="2020-07-01"&end="2020-08-16"

Response:
{
    "interval_length": "days",
    "interval": 46
}
```

### Add Interval

```
/datetime/add/:duration_interval GET
query params:
  start (Date string)
  amount (integer)
```

Returns an ISO datetime string representing the `start` datetime plus the given `amount` of `duration_interval`s.  

Example:

```
GET
/datetime/add/months?start="2020-07-01"&amount=3

Response:
{
    "date": "2020-10-01T00:00:00.000+00:00"
}
```

### Subtract Interval
```
/datetime/subtract/:duration_interval GET
query params:
  start (Date string)
  amount (integer)
```

Returns an ISO datetime string representing the `start` datetime minus the given `amount` of `duration_interval`s.  

Example:

```
GET
/datetime/subtract/days?start="2020-07-01"&amount=15

Response:
{
    "date": "2020-06-16T00:00:00.000+00:00"
}
```

## Private Endpoints
These endpoints require an authorization token to access. The token must be passed in the `Authorization` HTTP header when accessing the endpoints. The token can be passed alone as the header value or prepended with the string "`Bearer `", e.g. "`Bearer {token}`".  

These endpoints deal primarily with the manipulation of events. Events are objects in the form `{id, name, start, end}`.  

### Get Events

```
/events GET
```

Returns a JSON list of all events.  

Example:

```
GET
/events

Response:
[
    {
        "id": 1,
        "name": "The 21st Night of September",
        "start": "2021-09-21T07:00:00.000Z",
        "end": "2021-09-21T09:00:00.000Z"
    },
    ...
]
```

### Add New Event

```
/new-event POST
```

Saves new event. Takes a new event (`{name, start, end}`) as request JSON payload. Returns JSON payload containing the details of the event that was added.

Example:

```
POST
/new-event
{
    "name": "The 21st Night of September",
    "start": "2021-09-21T07:00:00.000Z",
    "end": "2021-09-21T09:00:00.000Z"
}

Response:
{
    "id": 1,
    "name": "The 21st Night of September",
    "start": "2021-09-21T07:00:00.000Z",
    "end": "2021-09-21T09:00:00.000Z"
}
```


### Edit Event

```
/edit-event/:id PUT
```

Edits event with given ID. Takes any combination of event attributes (`name`, `start`, and/or `end`) as request JSON payload. Returns JSON payload with `success` field indicating successful edit and passed attributes.

Example:

```
PUT
/edit-event/1
{
    "name": "September 21 Party",
    "end": "2021-09-22T12:00:00.000Z"
}

Response:
{
    "success": true,
    "name": "September 21 Party",
    "end": "2021-09-22T12:00:00.000Z"
}
```

### Delete Event

```
/delete-event/:id DELETE
```

Deletes event with given ID. Returns JSON payload with `success` field indicating successful event deletion.

```
DELETE
/delete-event/1

Response:
{
    "success": true
}
```

## Building Locally

This microservice includes Docker files to build a local copy. To run a development version, run the following command from the `docker` directory:

```
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

To run a more production-oriented deploy, simply run `docker-compose up`. This will read the `DATE_SERVICE_DB_PASSWORD` environment variable on the host system and assign it as the password to the root user in MariaDB.
