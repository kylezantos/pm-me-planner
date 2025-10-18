# Google Calendar API v3 Documentation

> **Source:** Context7 - `/websites/developers_google_workspace_calendar_api`
> **Last Updated:** 2025-10-18

## Overview

The Google Calendar API is a RESTful API that allows developers to programmatically access and manage Google Calendar data, including events, calendars, and user settings.

## Quick Start

### Node.js Setup

**Installation:**
```bash
npm install googleapis @google-cloud/local-auth
```

**Basic Example:**
```javascript
import path from 'node:path';
import process from 'node:process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';

// Read-only calendar scope
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function listEvents() {
  // Authenticate with Google
  const auth = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });

  // Create Calendar API client
  const calendar = google.calendar({ version: 'v3', auth });

  // Get upcoming events
  const result = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = result.data.items;
  if (!events || events.length === 0) {
    console.log('No upcoming events found.');
    return;
  }

  console.log('Upcoming 10 events:');
  for (const event of events) {
    const start = event.start?.dateTime ?? event.start?.date;
    console.log(`${start} - ${event.summary}`);
  }
}

await listEvents();
```

### Python Setup

**Installation:**
```bash
pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

**Basic Example:**
```python
import datetime
import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]

def main():
    """Lists the next 10 events from the user's calendar."""
    creds = None

    # Check for existing token
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)

    # If no valid credentials, let user log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                "credentials.json", SCOPES
            )
            creds = flow.run_local_server(port=0)

        # Save credentials for next run
        with open("token.json", "w") as token:
            token.write(creds.to_json())

    try:
        service = build("calendar", "v3", credentials=creds)

        # Get upcoming events
        now = datetime.datetime.now(tz=datetime.timezone.utc).isoformat()
        events_result = (
            service.events()
            .list(
                calendarId="primary",
                timeMin=now,
                maxResults=10,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )
        events = events_result.get("items", [])

        if not events:
            print("No upcoming events found.")
            return

        # Print event details
        for event in events:
            start = event["start"].get("dateTime", event["start"].get("date"))
            print(start, event["summary"])

    except HttpError as error:
        print(f"An error occurred: {error}")

if __name__ == "__main__":
    main()
```

### Go Setup

**Installation:**
```bash
go get golang.org/x/oauth2/google
go get google.golang.org/api/calendar/v3
```

**Basic Example:**
```go
package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"
    "time"

    "golang.org/x/oauth2"
    "golang.org/x/oauth2/google"
    "google.golang.org/api/calendar/v3"
    "google.golang.org/api/option"
)

func getClient(config *oauth2.Config) *http.Client {
    tokFile := "token.json"
    tok, err := tokenFromFile(tokFile)
    if err != nil {
        tok = getTokenFromWeb(config)
        saveToken(tokFile, tok)
    }
    return config.Client(context.Background(), tok)
}

func main() {
    ctx := context.Background()
    b, err := os.ReadFile("credentials.json")
    if err != nil {
        log.Fatalf("Unable to read client secret file: %v", err)
    }

    config, err := google.ConfigFromJSON(b, calendar.CalendarReadonlyScope)
    if err != nil {
        log.Fatalf("Unable to parse client secret file to config: %v", err)
    }
    client := getClient(config)

    srv, err := calendar.NewService(ctx, option.WithHTTPClient(client))
    if err != nil {
        log.Fatalf("Unable to retrieve Calendar client: %v", err)
    }

    t := time.Now().Format(time.RFC3339)
    events, err := srv.Events.List("primary").ShowDeleted(false).
        SingleEvents(true).TimeMin(t).MaxResults(10).OrderBy("startTime").Do()
    if err != nil {
        log.Fatalf("Unable to retrieve events: %v", err)
    }

    fmt.Println("Upcoming events:")
    if len(events.Items) == 0 {
        fmt.Println("No upcoming events found.")
    } else {
        for _, item := range events.Items {
            date := item.Start.DateTime
            if date == "" {
                date = item.Start.Date
            }
            fmt.Printf("%v (%v)\n", item.Summary, date)
        }
    }
}
```

## Browser/JavaScript Setup

### HTML + JavaScript

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Google Calendar API Quickstart</title>
    <meta charset="utf-8" />
  </head>
  <body>
    <p>Google Calendar API Quickstart</p>
    <button id="authorize_button" onclick="handleAuthClick()">Authorize</button>
    <button id="signout_button" onclick="handleSignoutClick()">Sign Out</button>
    <pre id="content" style="white-space: pre-wrap;"></pre>

    <script type="text/javascript">
      const CLIENT_ID = '<YOUR_CLIENT_ID>';
      const API_KEY = '<YOUR_API_KEY>';
      const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
      const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

      let tokenClient;
      let gapiInited = false;
      let gisInited = false;

      // Initialize GAPI client
      function gapiLoaded() {
        gapi.load('client', initializeGapiClient);
      }

      async function initializeGapiClient() {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        maybeEnableButtons();
      }

      // Initialize Google Identity Services
      function gisLoaded() {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: '',
        });
        gisInited = true;
        maybeEnableButtons();
      }

      function maybeEnableButtons() {
        if (gapiInited && gisInited) {
          document.getElementById('authorize_button').style.visibility = 'visible';
        }
      }

      // Handle authorization
      function handleAuthClick() {
        tokenClient.callback = async (resp) => {
          if (resp.error !== undefined) {
            throw (resp);
          }
          document.getElementById('signout_button').style.visibility = 'visible';
          document.getElementById('authorize_button').innerText = 'Refresh';
          await listUpcomingEvents();
        };

        if (gapi.client.getToken() === null) {
          tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
          tokenClient.requestAccessToken({prompt: ''});
        }
      }

      // Handle sign out
      function handleSignoutClick() {
        const token = gapi.client.getToken();
        if (token !== null) {
          google.accounts.oauth2.revoke(token.access_token);
          gapi.client.setToken('');
          document.getElementById('content').innerText = '';
          document.getElementById('authorize_button').innerText = 'Authorize';
          document.getElementById('signout_button').style.visibility = 'hidden';
        }
      }

      // List upcoming events
      async function listUpcomingEvents() {
        let response;
        try {
          const request = {
            'calendarId': 'primary',
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 10,
            'orderBy': 'startTime',
          };
          response = await gapi.client.calendar.events.list(request);
        } catch (err) {
          document.getElementById('content').innerText = err.message;
          return;
        }

        const events = response.result.items;
        if (!events || events.length == 0) {
          document.getElementById('content').innerText = 'No upcoming events found.';
          return;
        }

        // Display events
        const output = events.map(event => {
          const start = event.start.dateTime || event.start.date;
          return `${start} - ${event.summary}`;
        }).join('\n');
        document.getElementById('content').innerText = output;
      }
    </script>
    <script async defer src="https://apis.google.com/js/api.js" onload="gapiLoaded()"></script>
    <script async defer src="https://accounts.google.com/gsi/client" onload="gisLoaded()"></script>
  </body>
</html>
```

## API Endpoints

### List Events

**Method:** GET
**Endpoint:** `/calendar/v3/calendars/{calendarId}/events`

**Parameters:**
- `calendarId` (string, required) - Calendar identifier (use 'primary' for user's primary calendar)
- `timeMin` (string, optional) - Lower bound for event start time (RFC3339)
- `timeMax` (string, optional) - Upper bound for event start time (RFC3339)
- `maxResults` (integer, optional) - Maximum number of events (default: 250)
- `singleEvents` (boolean, optional) - Expand recurring events into instances
- `orderBy` (string, optional) - Order results by 'startTime' or 'updated'

**Response:**
```json
{
  "items": [
    {
      "id": "event_id",
      "summary": "Event Title",
      "start": {
        "dateTime": "2025-08-29T10:00:00-07:00",
        "timeZone": "America/Los_Angeles"
      },
      "end": {
        "dateTime": "2025-08-29T11:00:00-07:00",
        "timeZone": "America/Los_Angeles"
      }
    }
  ]
}
```

## Authentication Scopes

### Read-Only Access
```
https://www.googleapis.com/auth/calendar.readonly
```

### Full Access
```
https://www.googleapis.com/auth/calendar
```

### Events Only
```
https://www.googleapis.com/auth/calendar.events
```

## Best Practices

1. **Store credentials securely** - Never commit `credentials.json` or `token.json`
2. **Handle rate limits** - Implement exponential backoff for retries
3. **Use appropriate scopes** - Request minimal permissions needed
4. **Cache responses** - Reduce API calls when possible
5. **Handle time zones properly** - Always use RFC3339 format
6. **Batch requests** - Use batch API for multiple operations

## Resources

- Official Documentation: https://developers.google.com/calendar
- API Reference: https://developers.google.com/calendar/api/v3/reference
- Google Cloud Console: https://console.cloud.google.com
