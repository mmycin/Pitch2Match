SYSTEM:
========
You are a frontend web developer who is a master at Next.js and TypeScript. You can build modern responsive web UIs with ease and implement the backend into the frontend by reading the API docs.

CONTEXT:
========
In sequel to the backend stated before in `BACKEND_PROMPT.md` for `backend/` directory, now we have to implement the frontend for this application using Next.js. We want an app where people can scan a user and get mached with them. The name for the app is `Picth2Match`

FEATURES:
=========
1. A user has to login/register to use this app. 
2. After login, he goes to a dashboard. There will be several options:
    i. **My Info**: On click on this, it will hit on `BACKEND_URL/api/user` and get the user info as json and make a QRCode using the `qrcode` package(installed). And a save button that will download the qrcode as image.
    ii. **Scan Code**: Open a camera to scan the qrcode, after scan, decode and show the user info. There will be a button named `Make Match`, on clicked, it will ask for a 'reason'(optional). After entered, the user will hit the `BACKEND_URL/api/matches/scan` url with proper headers and body, then make a match. 
    iii. **Notification Bar**: This will hit the `BACKEND_URL/api/notifications` url and get the show the notifications. If the 'type' is 'Scanner', just show the notification. If the 'type' is 'Scanned', that means it is a notification to accept the match, there will be an accept button that will hit the `BACKEND_API/api/matches/{id}/accept`. After both the types of notification, there will be a button looking  like a tick mark appearing mark as read that will hit `BACKEND_API/api/notifications/{id}/read` and update the state and notifications.
    iv. **My Matches**: This will hit the `BACKEND_API/api/matches` url and get all the matches, There will be two segments; *My Matches* and *Matched By* and group them by these. On click on each matches, show the full user detail from the API response on screen. To be noted that, `scans` may have 'reason' property, but `scanned_by` won't.

TASK:
====
1. Implement all the feature stated above pixel perfect with proper code.
2. Visit `backend` directory for the APIDocs. 
3. Use tailwind to make modern, RESPONSIVE, beautiful and appropriate UI with appropriate theme, color, gradient etc.
4. A user can only visit the dashboard IF he is logged in. 
5. Proper use of component based architecture. KEEP IT IN MIND
6. Write the types(tables, requests, responses) `frontend/src/model` directory and use them.
7. Get the backend URL from `.env` file
8. Write necessary hooks in `frontend/src/hooks` directory and use them.
9. Write necessary components in `frontend/src/components` directory and use them.
10. Write necessary utilities and helpers and libs in `frontend/src/lib` & `frontend/src/utils` directory.
11. Use Zustand to manage state in `frontend/src/store` directory. Strict
12. Write tests in `frontend/src/tests` and apply the TDD format
13. Write proper clean code with JSDocs for better understanding.
14. Follow DRY method and use OOP where necessary.
15. Break the codes into componentns and smartly use them.
16. Make the best UI/UX possible as well as maintaining Responsiveness. Don't forget to use Navbar, Footer etc.
17. Show proper toast notification using `notifier-mycin` from https://npmjs.com/package/notifier-mycin
18. Show proper error messages and Error pages
Source Code: `frontend` directory

NOTES:
======
Use whatever packages and stuffs you need. Understand the backend and implement the frontend. Write code like a senior engineer so that people cant say a word to this. Production ready code of course. 