# surveygizmo-dashboard
Simple Express + React application for viewing Survey Gizmo Responses outside of Survey Gizmo.
This utilizes SG API for fetching responses and question details.

# Getting Started
1. Export SG_KEY environment variable containing your SurveyGizmo API key
2. ```npm install```
3. ```npm start```
4. Go to http://localhost:3001

# Survey Gizmo API key
If SG_KEY env variable is not present, we serve data from json files in static folder. If we have SG_KEY, make sure to update survey ID in SurveyGizmo.js to fetch data from your survey.

# edX
This app authenticates users with edX OAuth2 provider. You need to have edX instance set up and LMS running with OAuth configuration for this app.
In edX Django Admin, create OAuth2 Client and add it to Trusted Clients. Now you should be able to authenticate with edX.
