# Order API Spec

## Add Order
Endpoint: POST /api/v1/orders

Request Header:
- Authorization: Bearer {accessToken}

Request Type: multipart/form-data

Request Body:
```json
pictures: [], //png or jpg
metadata: "{
  "size": 12,
  "layer": null,
  "isUseTopper": false,
  "pickupTime": 1730952000000,
  "text": "Happy Birthday",
  "textColor": "black",
  "price": 200000,
  "downPayment": 100000,
  "remainingPayment": 100000,
  "telp": "6289898888",
  "notes": null
}"
```

Response Body (Success):
```json
{
  "status": "success",
  "data": {
    "id": "e6314752-c753-47dc-bc82-eae480d1b094"
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

## Get All Order
Endpoint: GET /api/v1/orders

Request Header:
- Authorization: Bearer {accessToken}

Query Param:
- key: limit\
  type: number\
  required: false
- key: page\
  type: number\
  required: false

Response Body (Success):
```json
{
  "status": "success",
  "limit": 10,
  "totalPage": 1,
  "page": 1,
  "totalResult": 2,
  "data": [
    {
      "id": "e6314752-c753-47dc-bc82-eae480d1b094",
      "size": 12,
      "layer": null,
      "isUseTopper": false,
      "pickupTime": 1730952000000,
      "status": "Proses",
      "text":" Happy Birthday",
      "textColor": "Black",
      "price": 200000,
      "downPayment": 100000,
      "remainingPayment": 100000,
      "telp": "6289898888",
      "notes": null,
      "pictures": [
        {
          "id": "hajdnaskdasj",
          "url": "https://drive.google.com/uc?export=view&id=hajdnaskdasj"
        }
      ]
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

## Get Order By Id
Endpoint: GET /api/v1/orders/{id}

Request Header:
- Authorization: Bearer {accessToken}

Response Body (Success):
```json
{
  "status": "success",
  "data": {
    "id": "e6314752-c753-47dc-bc82-eae480d1b094",
    "size": 12,
    "layer": null,
    "isUseTopper": false,
    "pickupTime": 1730952000000,
    "status": "Proses",
    "text":" Happy Birthday",
    "textColor": "Black",
    "price": 200000,
    "downPayment": 100000,
    "remainingPayment": 100000,
    "telp": "6289898888",
    "notes": null,
    "pictures": [
      {
        "id": "hajdnaskdasj",
        "url": "https://drive.google.com/uc?export=view&id=hajdnaskdasj"
      }
    ]
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

## Edit Order By Id
Endpoint: PUT /api/v1/orders/{id}

Request Header:
- Authorization: Bearer {accessToken}

Request Type: multipart/form-data

Request Body:
```json
addPictures: [], // png or jpg
metadata: "{
  "size": 12,
  "layer": null,
  "isUseTopper": false,
  "pickupTime": 1730952000000,
  "text": "Happy Birthday",
  "textColor": "black",
  "price": 200000,
  "downPayment": 100000,
  "remainingPayment": 100000,
  "telp": "6289898888",
  "notes": null,
  "deletedPictures": ["picture-id"],
}"
```

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

## Delete Order By Id
Endpoint: DELETE /api/v1/orders/{id}

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

## Edit Order Progress By Id
Endpoint: PATCH /api/v1/orders/{id}/progresses/{progressId}

Request Header:
- Authorization: Bearer {accessToken}

Request Type: application/json

Request Body:
```json
{
  "isFinish": true
}
```

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
