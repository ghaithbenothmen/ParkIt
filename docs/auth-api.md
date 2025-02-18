# API Documentation for Authentication

## Overview

This API handles user authentication, including registration, login, logout, and retrieving the user profile. All endpoints are secured with JWT for authorized users.

---

## POST api/auth/register

**Description**:
Registers a new user by providing the required user details.

### Request Body:

```json
{
  "firstname": "John",
  "lastname": "Doe",
  "phone": "123456789",
  "email": "johndoe@example.com",
  "password": "securepassword123"
}
```

### Response Body:

* **201 Created:** User successfully registered.

```js
{
  "message": "User registered successfully",
  "user": {
    "_id": "user-id",
    "firstname": "John",
    "lastname": "Doe",
    "phone": "123456789",
    "email": "johndoe@example.com"
  }
}

```

* **400 Bad Request**: Email already exists.
  ```j
  {
    "message": "Email already exists"
  }

  ```
* 400 Bad Request.
  ```js
  {
    "message": "Validation errors",
    "errors": [
      "Please enter a valid Tunisian mobile phone number.",
      "Please provide a valid email address.",
      "Path `password` is invalid"
    ]
  }

  ```

## POST api/auth/login

**Description**:
Logs in an existing user and returns a JWT token for authentication.Registers a new user by providing the required user details.

### Request Body:

```json{
{
"email": "johndoe@example.com",
"password": "securepassword123"
}
```

### Response:

* **200 OK**: User successfully logged in.

```json
{
"token": "jwt-token",
"user": {
"_id": "user-id",
"firstname": "John",
"lastname": "Doe",
"phone": "123456789",
"email": "johndoe@example.com",
"role": "user"
}
}
```

* **400 Bad Request**: Invalid credentials (incorrect email or password).

```json
{
"message": "Invalid credentials"
}
```

## POST api/auth/logout

**Description**:
Logs the user out by clearing the JWT token stored in the cookies.

### Request:

No request body is required.

### Response:

* **200 OK**: User successfully logged out.

```json
{
"message": "Logout successful"
}
```

## GET api/auth/profile

**Description**:
Retrieves the user profile information of the authenticated user.

### Request:

* Authorization: Bearer `JWT_TOKEN`

### Response:

* **200 OK**: Successfully fetched user profile (excluding password).

```json
{
"_id": "user-id",
"firstname": "John",
"lastname": "Doe",
"phone": "123456789",
"email": "johndoe@example.com",
"role": "user"
}

```

* **404 Not Found**: User not found.

```json
{
"message": "User not found"
}
```
