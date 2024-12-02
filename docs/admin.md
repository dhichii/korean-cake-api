# Admin API Spec

## Add Admin
Endpoint: POST /api/v1/admins\
*super only\

Request Header:
- Authorization: Bearer {accessToken}

Request Type: application/json

Request Body:
```json
{
  "name": "example",
  "username": "example",
  "email": "example1@gmail.com"
}
```

Response Body (Success):
```json
{
  "status": "success",
  "data": {
    "password": "sadkjcsad"
  }
}
```

Response Body (Failed):
```json
{
  "errors": [
    {
      "message": "Internal Server Error"
    }
  ]
}
```

## Get All Admin
Endpoint: GET /api/v1/admins\
*super only

Request Header:
- Authorization: Bearer {accessToken}

Response Body (Success):
```json
{
  "status": "success",
  "data": [
    {
      "id": "e6314752-c753-47dc-bc82-eae480d1b094",
      "name": "example",
      "username": "example",
      "email": "example1@gmail.com",
      "created_at": "2024-04-07T06:53:09.538Z",
      "updated_at": "2024-04-07T06:53:09.538Z"
    }
  ]
}
```

Response Body (Failed):
```json
{
  "errors": [
    {
      "message": "Internal Server Error"
    }
  ]
}
```

## Delete Admin By Id
Endpoint: DELETE /api/v1/admins/{id}\
*super only\
Login: required

Response Body (Success):
```json
{
  "status": "success"
}
```

Response Body (Failed):
```json
{
  "errors": [
    {
      "message": "Internal Server Error"
    }
  ]
}
```
