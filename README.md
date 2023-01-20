# RateMyClass
Web application that provides student reviews for the courses being offered at UF. Built with Node.js, Express, Bootstrap, and Mongodb.

## Features
- User Authentication and Authorization
- Persistent Cloud Database
- Dynamic and Responsive Web Pages

## Deployment
To deploy this project locally clone and run:

```bash
git clone https://github.com/navidali/ratemyclass.git
```
```bash
npm install .
```
```bash
npm start
```

Alternatively, build and run through docker:

```bash
docker build -t ratemyclass .
```
```bash
docker run -p 3000:3000 -d ratemyclass
```