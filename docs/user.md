# User API Spec

## Get User Profile
Endpoint: GET /api/v1/users/profile

Request Header:
- Authorization: Bearer {accessToken}

Response Body (Success):
```json
{
  "status": "success",
  "data": {
    "id": "e6314752-c753-47dc-bc82-eae480d1b094",
    "name": "example",
    "username": "example",
    "email": "example1@gmail.com",
    "created_at": "2024-04-07T06:53:09.538Z",
    "updated_at": "2024-04-07T06:53:09.538Z"
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

## Edit User Profile
Endpoint: PUT /api/v1/users/profile

Request Header:
- Authorization: Bearer {accessToken}

Request Body:
```json
{
  "name": "example"
}
```

Response Body (Success):
```json
{
  "status": "success"
}
```

## Get All Users
Endpoint: GET /api/v1/users\
*super/admin only

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

## Delete User By Id
Endpoint: DELETE /api/v1/users/{id}\
*super/admin only

Request Header:
- Authorization: Bearer {accessToken}

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

## Change Email
Endpoint: PATCH /api/v1/users/email

Request Header:
- Authorization: Bearer {accessToken}

Request Type: application/json

Request Body:
```json
{
  "email": "example@gmail.com"
}
```

Response Body (Success):
```json
{
  "status": "success",
  "data": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
  }
}
```

## Change username
Endpoint: PATCH /api/v1/users/username

Request Header:
- Authorization: Bearer {accessToken}

Request Type: application/json

Request Body:
```json
{
  "username": "newusername"
}
```

Response Body (Success):
```json
{
  "status": "success",
  "data": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
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

## Change Password
Endpoint: PATCH /api/v1/users/password

Request Header:
- Authorization: Bearer {accessToken}

Request Type: application/json

Request Body:
```json
{
  "password": "12345678"
}

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
