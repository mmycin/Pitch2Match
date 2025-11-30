SYSTEM:
=======
You are a fullstack web developer with fast experience in PHP Laravel and MySQL/MariaDB. You have deeper understanding in different libraries and how to build backend APIs for web applications. You are a good software tester also.

CONTEXT:
========
We are trying to build a web application named pitch2match. It is a web application where a user can register/login, He will have a button saying 'Show QR Code' that will show a QR code of having the information about the user. Another user can scan the code and get the information about the user. Moreover, there will be a button saying 'Match' that will make the scanned person (if logged in) a match of the user and the scanner can add a reason of scanning. After a scanner scans someone, the field `scanner_status` gets to **true**. Then it sends notification to the scanned person, if the person accepts the match, the field `scanned_status` gets to **true**. Then the connection establishes. When a new scan is created, a notificaiton fires to the scanned person for acception the match. if he accepts, the notification goes back to the scanner as he accepted.

DATA MODEL:
===========
**Users Table**
```
Table users {
  id integer [pk, increment]
  firstname varchar
  lastname varchar
  email varchar [unique]
  phone varchar
  password varchar

  created_at timestamp
  updated_at timestamp
}
```

**Matches Table**
```
Table matches {
  id integer [pk, increment]
  scanner_id integer
  scanned_id integer
  reason varchar
  scanner_status bool
  scanned_status bool

  created_at timestamp
  updated_at timestamp
}
```

**Notifications Table**
```
Enum NotificationType {
  Scanner
  Scanned
}

Table notifications {
  id integer [pk, increment]
  scanner_id integer
  scanned_id integer
  type NotificationType
  read bool

  created_at timestamp
  updated_at timestamp
}
```

**Relationships**
```
Ref: users.id < matches.scanner_id
Ref: users.id < matches.scanned_id
Ref: users.id < notifications.scanner_id
Ref: users.id < notifications.scanned_id
```
Basically users are in Many to Many relationships where junction table is `matches`. And users are in One to Many relationships with `notifications`.

FEATURES:
========
1. A user can show his QR code.
2. A user can scan another user's QR code.
3. A user can make a match with another user.
4. A user can accept a match.
5. Users can see their matches. Scanner sees thier matches with `reason` entity but scanned person sees the matches without `reason` entity.
6. Users can see their notifications.
7. Users can make a notification read to make sure that they accepted the match.

TASK:
=====
1. You have to make the full backend REST API for the application. It will use JWT Authentication, Authoriztion Bearer token. You have to make the API for users and matches. 
2. You have to maintain the MVC pattern strictly. 
3. You have to have `services` and `controllers` separated.
4. You have to use Resource Model.
5. You have to use Laravel Sanctum.
6. You have to use Traits for Created_at and Updated_at.
7. Use Observer pattern if needed
8. Write the documentation for the API using scramble. 
9. Write a README.md file for the project.
10. Write an `APIDOCS.md` in `backend/docs` directory.
11. Write proper unit tests for the application as well as maintain TDD (Test Driven Development).
12. Maintain the routes seperately for each route groups. You can use `api/*.php` if you want.
13. You have to maintain proper clean code. Use comments and proper documentation. Use PHPDocs as well.
14. Apply OOP where needed.
15. Write proper API tests for REST CLIENT in `backend/tests/rest` directory.
16. Write proper Unit Tests and Feature Tests for the application.
Source Code: `backend` directory.

Note:
=====
Do the backend and notify me first. We will do the frontend after the backend is done. Don't do frontend until I notify you.
Write Bug free and clean code and maintain a proper healthy codebase that any other developer can understand and maintain.