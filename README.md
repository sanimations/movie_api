# MyFlix Movie API

This is an API for MyFlix, a movie application. This API allows users to access and manage movie data, user information, and favorites lists.

## Prerequisites

- Node.js
- npm
- MongoDB

## Installation

1. Clone the repository: 

```bash
git clone <repository-url>
```

2. Install dependencies: 

```bash
npm install
```

3.Set up environment variables and
Create a .env file in the root directory and add the following:

```bash
CONNECTION_URI=<your-mongodb-connection-uri> 
PORT=8080
```
Replace <your-mongodb-connection-uri> with your MongoDB connection string.


4. Start the server: 

```bash
npm start
```

   ## Endpoints

### Get list of all movies

- **URL:** `/movies`
- **Method:** `GET`
- **Authentication:** Required
- **Description:** Returns a list of all movies.

### Get list of all users

- **URL:** `/users`
- **Method:** `GET`
- **Authentication:** Not required
- **Description:** Returns a list of all users.

### Get one movie by title

- **URL:** `/movies/:Title`
- **Method:** `GET`
- **Authentication:** Required
- **Description:** Returns data of a specific movie based on the title.

### Get director's data by name

- **URL:** `/movies/directors/:Director`
- **Method:** `GET`
- **Authentication:** Required
- **Description:** Returns data of a director by their name.

### Get genre description

- **URL:** `/movies/genres/:Genre`
- **Method:** `GET`
- **Authentication:** Required
- **Description:** Returns the description of a genre.

### Register new user

- **URL:** `/users`
- **Method:** `POST`
- **Authentication:** Not required
- **Description:** Allows a new user to register.

### Update user information

- **URL:** `/users/:Username`
- **Method:** `PUT`
- **Authentication:** Required
- **Description:** Allows users to update their information.

### Delete user profile

- **URL:** `/users/:Username`
- **Method:** `DELETE`
- **Authentication:** Required
- **Description:** Allows users to delete their profile.

### Add movie to favorites

- **URL:** `/users/:Username/movies/:MovieID`
- **Method:** `POST`
- **Authentication:** Required
- **Description:** Adds a movie to a user's favorites list.

### Remove movie from favorites

- **URL:** `/users/:Username/movies/:MovieID`
- **Method:** `DELETE`
- **Authentication:** Required
- **Description:** Removes a movie from a user's favorites list.

## Error Handling

- The API handles errors gracefully and returns appropriate status codes and error messages.

## Authors

- Samuel Martucci
