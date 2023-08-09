<details>
<summary>Base URL</summary>
<br>
The base URL for the API is: http://localhost:5000/api

</details>
<details>
<summary>GET /places</summary>
<br>
Get a list of all places.

Response:
  Copy code
  [
    {
      "_id": "place_id",
      "title": "Place Title",
      "description": "Place description",
      "image": "place_image_url.jpg",
      "address": "Place address",
      "location": {
        "lat": 40.712776,
        "lng": -74.005974
      },
      "creator": "user_id"
    },
    // ...more places
  ]
</details>
<details>
<summary>GET /places/:pid</summary>
<br>
Get details of a specific place by its ID.

Response:


Copy code
  {
    "_id": "place_id",
    "title": "Place Title",
    "description": "Place description",
    "image": "place_image_url.jpg",
    "address": "Place address",
    "location": {
      "lat": 40.712776,
      "lng": -74.005974
    },
    "creator": "user_id"
  }
</details>
<details>
<summary>POST /places</summary>
<br>
Create a new place.

Request:


Copy code
  {
    "title": "Place Title",
    "description": "Place description",
    "address": "Place address",
    "location": {
      "lat": 40.712776,
      "lng": -74.005974
    },
    "creator": "user_id"
  }
Response:
  Copy code
  {
    "_id": "new_place_id",
    "title": "Place Title",
    "description": "Place description",
    "address": "Place address",
    "location": {
      "lat": 40.712776,
      "lng": -74.005974
    },
    "creator": "user_id"
  }
</details>
<details>
<summary>PATCH /places/:pid</summary>
<br>
Update details of a specific place by its ID.

Request:
  Copy code
  {
    "title": "Updated Place Title",
    "description": "Updated place description"
  }
Response:
  Copy code
  {
    "_id": "place_id",
    "title": "Updated Place Title",
    "description": "Updated place description",
    "address": "Place address",
    "location": {
      "lat": 40.712776,
      "lng": -74.005974
    },
    "creator": "user_id"
  }
</details>
<details>
<summary>DELETE /places/:pid</summary>
<br>
Delete a specific place by its ID.

Response:
  Copy code
  {
    "message": "Place deleted successfully."
  }
  </details>
  <details>
  <summary>Authentication Endpoints</summary>
  <br>
  POST /api/users/signup
  
  Register a new user.

Request:
  Copy code
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "user_password"
  }
Response:
  Copy code
  {
    "userId": "user_id",
    "email": "user@example.com",
    "token": "access_token"
  }
  POST /api/users/login
  
  Log in an existing user.

Request:
  Copy code
  {
    "email": "user@example.com",
    "password": "user_password"
  }
Response:
  Copy code
  {
    "userId": "user_id",
    "email": "user@example.com",
    "token": "access_token"
  }
</details>
<details>
<summary>Error Responses</summary>
<br>
If an error occurs, the response will include an error object with a message property describing the error.

Example:
  Copy code
  {
    "error": {
      "message": "Place not found."
    }
  }
For more details on error messages, refer to the source code or consult the backend developers.

