# UI Rules

- Use the MpMediaApiClient from api-clients for all API calls.
- No raw fetch() calls outside of lib/api-client/.
- Auth token stored in memory or secure cookie — never localStorage.
- All pages are protected except /login.
- Components are organized by domain under components/.
