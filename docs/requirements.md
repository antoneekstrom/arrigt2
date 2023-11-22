
## High-level Description

The main purpose of the system is to aid organizers in managing and publishing events for students. The system is a web-based application that should be accessible and suitable for both desktop and mobile browsers. There is a view for browsing upcoming events, and also a separate view for presenting detailed information on a given event. Logged in users can see which events they have signed up for, and administrative users can publish and manage events as well.

### Goals

- **G1**: Streamline the process of planning, booking and managing events for student organizers. Thereby reducing the workload and required expertise for organizers.
- **G2**: Eliminate the need for organizers to use multiple services to achieve their goals.
- **G3**: Make events more accessible to all students at the division, which may in turn increase participants.
- **G4**: Reduce maintenance work for administrators (styrIT, P.R.I.T.) and maintainers (digIT).

### Scope

It is important to note that arrIT delegates certain functionality to other services. Therefore, arrIT does not:

- Provide user authentication or authorization

## Business case

At the software engineering student division there is an obvious need for a comprehensive solution that enables organizers to plan, book, publish and manage their events. For organizers, the current process is a burden that consumes time and energy that could be spent more productively. For students, it is difficult and confusing to find and keep track of the events that are relevant to them. This document specifies the requirements for an event management system called arrIT, which aims to solve all these issues.

### Stakeholders

| Name            | Relationship                                    | Sentiment                                                                 |
| --------------- | ----------------------------------------------- | ------------------------------------------------------------------------- |
| Students        | Primary target audience                         | Will surely love it                                                       |
| Active students | Secondary target audience                       | Already loves the idea of it                                              |
| digIT           | Also develops services for the student division | Would probably appreciate it, may already be working on something similar |
| styrIT          | Student division board                          | May have plans to enact other changes, influence on public opinion        |

### Existing Solutions

At the time of creating this document, the information channels are several:

- Two different Google Calendars (IT, FKIT) for keeping track of events and preventing interfering events
- An internal tool (bookIT) for booking the student division locale
- Our own website for publishing events
- Slack channel (`#news`, `#nyheter`) for publishing events
- The university-wide student union application for publishing events

## Use Cases

- Manage events
	- Publish events
		- Notify users
	- Inspect events
		- View sign ups
		- Distribute seats
	- Edit events
		- Manage attendees
	- Remove events
- View events
	- Subscribe to events
	- Sign up for events
	- Pay for events
	- Get notified of updates

| Use Case | Name         | Description                                                                        |
| -------- | ------------ | ---------------------------------------------------------------------------------- |
| UC1      | View events  | As a viewer, I want to view the feed of events, and examine events in more detail. |
| UC2      | Sign up      | As an attendee, I want to sign up for events that I am interested in.              |
| UC3      | Create event | As an authenticated user, I want to create and publish events for others to see.   |
| UC4      | Edit event   | As an authenticated user, I want to edit the details of events.                    | 

## Quality Attributes

| Attribute       | Critical | Important | As usual | Less important | Ignore |
| --------------- | -------- | --------- | -------- | -------------- | ------ |
| Maintainability | X        |           |          |                |        |
| Compatibility   |          | X         |          |                |        |
| Suitability     |          | X         |          |                |        |
| Reliability     |          |           | X        |                |        |
| Portability     |          |           |          |                | X      |

### Compatibility

There are many services maintained by digIT, some of these are responsible for booking, managing userand authorization. Therefore, it is important that the product is interopable and can easily be integrated with other services. It should provide a clear interface for other services to use the API, and it should also be flexible enough to delegate and replace different components of the system with other services.

### Maintainability

The administrators and maintainers of the system change often and regularily, on a yearly basis. It is vital for the long term viability of the system to be easily maintained.

### Suitability

If the system is to replace several other services, it needs to provide the needed functionality that is expected of it, and that already exists in other products.

## Data Requirements

## Functional Requirements
