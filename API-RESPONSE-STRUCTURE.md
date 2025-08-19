# API Response Structure Documentation

## Overview

This document describes the standardized API response structure implemented across all endpoints in the Feedback Tool application. All endpoints now return consistent response formats that include proper error handling, status codes, and descriptive messages.

## Response Structure

### Success Response

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {
    /* actual response data */
  },
  "timestamp": "2025-08-20T10:30:45.123Z",
  "status": 200
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error message 1", "Detailed error message 2"],
  "timestamp": "2025-08-20T10:30:45.123Z",
  "status": 400,
  "path": "/api/surveys"
}
```

## Field Descriptions

| Field       | Type    | Description                                                  |
| ----------- | ------- | ------------------------------------------------------------ |
| `success`   | boolean | Indicates whether the request was successful                 |
| `message`   | string  | Human-readable description of the result                     |
| `data`      | any     | The actual response data (only present in success responses) |
| `errors`    | array   | List of error messages (only present in error responses)     |
| `timestamp` | string  | ISO 8601 timestamp of when the response was generated        |
| `status`    | number  | HTTP status code                                             |
| `path`      | string  | Request path (only present in error responses)               |

## Examples

### Successful List Response

```json
{
  "success": true,
  "message": "Successfully retrieved 5 surveys",
  "data": [
    {
      "id": 1,
      "title": "Customer Satisfaction Survey",
      "description": "Please share your feedback about our services",
      "status": "ACTIVE",
      "createdAt": "2025-08-18T13:12:34.870325Z",
      "updatedAt": "2025-08-18T13:12:34.870325Z",
      "totalQuestions": 5,
      "totalResponses": 2,
      "completionRate": 62
    }
  ],
  "timestamp": "2025-08-20T10:30:45.123Z",
  "status": 200
}
```

### Error Response (Not Found)

```json
{
  "success": false,
  "message": "Survey not found with ID: 999",
  "errors": ["Survey not found with ID: 999"],
  "timestamp": "2025-08-20T10:30:45.123Z",
  "status": 404,
  "path": "/api/surveys/999"
}
```

### Validation Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "title: Title cannot be empty",
    "description: Description must be at least 10 characters"
  ],
  "timestamp": "2025-08-20T10:30:45.123Z",
  "status": 400,
  "path": "/api/surveys"
}
```

## HTTP Status Codes

The API uses standard HTTP status codes:

| Status Code | Meaning               | Usage                                              |
| ----------- | --------------------- | -------------------------------------------------- |
| 200         | OK                    | Successful GET, PUT, PATCH requests                |
| 201         | Created               | Successful POST requests that create new resources |
| 400         | Bad Request           | Invalid request data, validation errors            |
| 401         | Unauthorized          | Authentication required or invalid credentials     |
| 403         | Forbidden             | Authenticated but insufficient permissions         |
| 404         | Not Found             | Resource not found                                 |
| 409         | Conflict              | Resource conflict (e.g., duplicate data)           |
| 500         | Internal Server Error | Unexpected server errors                           |

## Updated Endpoints

All the following controllers have been updated with the new response structure:

### AuthController

- `POST /api/auth/login`

### SurveyController

- `GET /api/surveys` - List all surveys
- `POST /api/surveys` - Create new survey
- `GET /api/surveys/{id}/public` - Get public survey
- `GET /api/surveys/{id}/results` - Get survey results

### UserController

- `POST /api/users/create` - Create new user

### AnswersController

- `GET /api/answers` - Get all answers
- `POST /api/answers` - Create new answer

### ResponsesController

- `GET /api/responses/debug` - Debug authentication
- `GET /api/responses/count` - Get response count
- `GET /api/responses/survey/{surveyId}` - Get responses by survey
- `GET /api/responses/list` - Get all responses
- `GET /api/responses/{id}` - Get response by ID
- `POST /api/responses` - Create new response
- `DELETE /api/responses/{id}` - Delete response

### PublicSurveyController

- `GET /api/public/surveys/{id}` - Get public survey
- `POST /api/public/surveys/{id}/responses` - Submit survey response

## Error Handling

The application includes a global exception handler that automatically converts exceptions into the standardized response format:

- `IllegalArgumentException` → 400 Bad Request
- `MethodArgumentNotValidException` → 400 Bad Request (with detailed validation errors)
- `RuntimeException` → 500 Internal Server Error
- `Exception` → 500 Internal Server Error

## Utility Classes

### ApiResponse<T>

Generic response wrapper that provides a consistent structure for all API responses.

### ResponseUtils

Utility class that provides helper methods for common controller patterns:

- `handleServiceCall()` - Execute service operations with automatic error handling
- `handleOptionalResult()` - Handle Optional results from repository calls
- `handleListResult()` - Handle list results with appropriate empty messages
- `handleDelete()` - Handle delete operations

### PaginationUtils

Utility class for handling paginated responses (ready for future pagination implementation).

## Migration Notes

When updating frontend code to work with the new response structure:

1. Access actual data from the `data` property instead of directly from the response
2. Check the `success` property to determine if the request was successful
3. Use the `message` property for user-friendly feedback
4. Handle error arrays in the `errors` property for detailed error information

### Before (Old Structure)

```javascript
// Direct array access
const surveys = response.data; // This was the raw array
```

### After (New Structure)

```javascript
// Access through data property
const surveys = response.data.data; // Now wrapped in ApiResponse
const message = response.data.message;
const isSuccess = response.data.success;
```
