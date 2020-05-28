# Backend for IGI Testing Kiosk
Written using express

## Database
This web app uses PostgreSQL, along with the postgres-node package as a client.
For development, you can run `docker-compose up` from the `pgdev` directory in
order to start a development postgres server. The `.env.dev` file in the backend
directory contains environment variables for the development server, and is
automatically loaded by node when it detects that it is in a development environment.

## Deployment
### keys.js
Make sure to set up `config/keys.js` file with the format:
```
module.exports = {
    secretKey: 'change_me',
    email: {
        user: 'example@gmail.com',
        pass: 'gmailpass',
    },
    twilio: {
        accountSid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        authToken: 'your_auth_token'
    }
};
```
