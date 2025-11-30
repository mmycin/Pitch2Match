CONTEXT:
=======
In sequel to `BACKEND_PROMPT.md` and `FRONTEND_PROMPT.md`, there will a change in the application.

CHANGES:
========
1. After the scan, the QRCode will give a URL (frontend) to the user. The URL will consist of the ID of the scanned user.
2. On the URL, user can see the details of the scanned user. NO LOGIN IS REQUIRED. After the user views the details, the user will see a match button. 
3. If the user clicks on the match button, we will see the localstorage if the user is logged in, else, we will hold the state where we are now, redirect to login page/register page, after login, go to the scanned user's profile, and click on the match button and stuff afteralls.
4. There will be a copy url button under the generated QRCode. When the user clicks on the copy url button, the URL will be copied to the clipboard.
5. There won't be any accept feature. The user will directly match with the scanned user.

TASK:
====
Change anything you want from backend and frontend to make the feature work. The url will point to frontends dynamic page. Note that properly. Handle errors properly and write bug free code.