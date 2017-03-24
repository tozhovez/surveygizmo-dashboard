# surveygizmo-dashboard
Simple Express + React application for viewing Survey Gizmo Responses outside of Survey Gizmo.
This utilizes SG API for fetching responses and question details.

# Getting Started
1. Export SG_KEY environment variable containing your SurveyGizmo API key
2. ```npm install```
3. ```npm start```
4. Go to http://localhost:3001

# Survey Gizmo API key
```export SG_KEY=<your_survey_gizmo_api_key>```
Also make sure to update sgSurveyId in config.json to fetch data from your survey.

# edX
This app authenticates users with edX OAuth2 provider. You need to have edX instance set up and LMS running with OAuth configuration for this app.
In edX Django Admin, create OAuth2 Client and add it to Trusted Clients. Now you should be able to authenticate with edX.
