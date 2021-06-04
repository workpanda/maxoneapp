# NOTE
### wltg structure
* WLTG will still prompt for what app to launch ie. PGC/VNN/OSB/M1
* VNN launches into /vnn-app directory (as will all white labels off VNN)
* M1/OSB/PGC launches into maxone-app/ directory (as will all white labels off the main m1 app)   
    
/shared will still contain all shared resources.     
     
### BIG CHANGE
* Now each white label will have its OWN /navigation and /screens and /constants directories
* These are located at the top of the root directory in /brands/{APP_NAME} 
* This is where all custom functionality/screens will live.
* When running WLTG, everything in this folder will be copied into maxone-app/ or vnn-app/ as defined by the paths in wltg.config.js
* SO if you have been making changes in (maxone=app || vnn-app)/src/screens or (maxone-app || vnn-app)/src/navigation there WILL be merge conflicts.

# m1-mobile

1. Run yarn on the entire repo.
`yarn`

2. Run wltg to load a white labeled app.
`yarn wltg`

3. Select MaxOne


## CALENDAR COMPONENT

A Calendar based capability with the following features:

**all roles...**
1. Select one team.schedule, or all team.schedules from a dropdown menu above calendar

2. View selected team.schedule(s) on calendar

3. Select a calendar.day and view selected day's team.schedule.events in an event-list below calendar

4. Select a team.schedule.event from the event-list and view team.schedule.event detail

**user.role.coach...**

5. Add/Edit/Delete a team.schedule

6. Add/Edit/Delete a team.schedule.event

7. From #4 above, (view team.schedule.event detail), send a reminder push-notification/text-message/email message about team.schedule.event => go to MESSAGING COMPONENT

### MaxOne vs VNN

VNN is the system-of-record for a schedule named "VNN"...

1. Each VNN organization.team has a required and read-only schedule named "VNN"

2. Each MaxOne organization.team will not have this required, read-only "VNN" schedule   

The CALENDAR COMPONENT will target a different API endpoint for VNN, but the UI component should be the same:

1. readOnlyEevent indicator in UI is only used for VNN

2. readOnlyEevent property in database is only used for VNN events

Thus, the only difference in m1-mobile codebase is in `/config/` files:

`events => apiGatewayEvents`

vs

`events.vnn => apiGatewayEventsVnn`
