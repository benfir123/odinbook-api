# Odinbook API

Odinbook is a social media clone done as the final deliverable for the popular full stack web development course: The Odin Project.

[Live Demo](https://benfir123.github.io/odinbook-client/) :point_left:

[Client repository](https://github.com/benfir123/odinbook-client)

## Endpoints

### Users

| Description                 | Method | URL                           |
| --------------------------- | ------ | ----------------------------- |
| Signup                      | POST   | /api/auth/signup.             |
| Login                       | POST   | /api/users/login              |
| Logout from current session | POST   | /api/users/logout             |
| Logout from all sessions    | POST   | /api/users/logout/all         |
| Get current user data       | GET    | /api/users                    |
| Get other user profile      | GET    | /api/users/:id                |
| Search users                | GET    | /api/users/search             |
| Edit own profile            | PATCH  | /api/users                    |
| Request friend              | PATCH  | /api/users/:id/friend/request |
| Accept friend               | PATCH  | /api/users/:id/friend/accept  |
| Reject friend               | PATCH  | /api/users/:id/friend/reject  |
| Remove friend               | PATCH  | /api/users/:id/friend/remove  |

### Posts

| Description       | Method | URL                         |
| ----------------- | ------ | --------------------------- |
| Create post       | POST   | /api/posts                  |
| Get own feed      | GET    | /api/posts/feed             |
| Get user timeline | GET    | /api/posts/timeline/:userId |
| Like post         | PATCH  | /api/posts/:id/like         |
| Unlike post       | PATCH  | /api/posts/:id/unlike       |

### Comments

| Description       | Method | URL                   |
| ----------------- | ------ | --------------------- |
| Create comment    | POST   | /api/comments/:postId |
| Get post comments | GET    | /api/comments/:postId |

## Technologies used

- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/)
- [zod](https://zod.dev/)
- [supertest](https://github.com/visionmedia/supertest)
- [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server)
- [Postman](https://www.postman.com/)

### Authentication

For users authentication I used JWT tokens which are stored on client side as cookies (accessToken & refreshToken). The access token expires every 5 minutes and is used for short term authentication. The refresh token expires every year and is used to refresh access tokens.
