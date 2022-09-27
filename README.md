# Odinbook API

Odinbook is a social media clone done as the final deliverable for the popular full stack web development course: The Odin Project.

[Live Demo](https://benfir123.github.io/odinbook-client/) :point_left:

[Client repository](https://github.com/benfir123/odinbook-client)

## Base URL
* The base URL is: https://odinbook-ben.herokuapp.com

## Endpoints

### Users

| Description                 | Method | URL                           |
| --------------------------- | ------ | ----------------------------- |
| Signup                      | POST   | /api/auth/signup              |
| Login                       | POST   | /api/auth/login               |
| Login as guest              | POST   | /api/auth/testdrive           |
| Login with Facebook         | POST   | /api/auth/facebook            |
| Get all users               | GET    | /api/users                    |
| Get own user profile        | GET    | /api/users/info               |
| Get one user profile        | GET    | /api/users/:userId            |

### Friends

| Description                 | Method | URL                           |
| --------------------------- | ------ | ----------------------------- |
| Request friend              | POST   | /api/friends/req              |
| Reject friend               | DELETE | /api/friends/cancel           |
| Accept friend               | PUT    | /api/friends/accept           |

### Posts

| Description       | Method | URL                         |
| ----------------- | ------ | --------------------------- |
| Create post       | POST   | /api/posts                  |
| Get own feed      | GET    | /api/posts                  |
| Get one post      | GET    | /api/posts/:id              |
| Like/unlike post  | PUT    | /api/posts/:postId/like     |

### Comments

| Description         | Method | URL                                         |
| ------------------- | ------ | ------------------------------------------- |
| Create comment      | POST   | /api/posts/:postId/comments/                |
| Like/unlike comment | PUT    | /api/posts/:postId/comments/:commentId/like |

## Technologies used

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/)
- [supertest](https://github.com/visionmedia/supertest)
- [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server)

### Authentication

Users are authenticated with JWT tokens each time they login to the service. The token is then stored in local storage and used to make all subsequent API calls until the user logs out.
