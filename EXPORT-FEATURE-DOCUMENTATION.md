# Survey Data Export Feature

## Overview

The CSV export feature allows administrators to export comprehensive survey analysis data in CSV format. This feature provides multiple export options to suit different analytical needs.

## Features

### Export Options

1. **Standard Analysis (CSV)** - Includes question analysis and respondent data
2. **Question Analysis Only** - Detailed question-by-question analytics
3. **Raw Response Data** - Complete raw response data with respondent details
4. **Complete Export** - All available data including question analysis, respondent data, and raw responses

### Data Included

#### Survey Overview

- Survey title, description, and ID
- Creation date and time
- Total responses and questions
- Overall completion rate

#### Question Analysis

- Question-by-question completion rates
- Rating statistics (average, median, min, max)
- Multiple choice option distributions
- Text response analytics (length, keywords)

#### Respondent Data

- Respondent demographics (authenticated vs anonymous)
- Submission timestamps
- Response counts per user

#### Raw Response Data

- Individual responses by question
- Respondent information
- Submission timestamps
- Rating values

## Usage

### Backend Implementation

The export functionality is implemented in:

- `ExportService.java` - Core export logic
- `ExportController.java` - REST endpoint at `/api/exports/surveys/{surveyId}/analysis/csv`

### Frontend Integration

- Export dropdown menu in Survey View page
- Multiple export options with different data combinations
- Automatic file download with timestamped filenames

### API Endpoint

```
GET /api/exports/surveys/{surveyId}/analysis/csv
```

#### Parameters

- `includeQuestionAnalysis` (boolean, default: true) - Include detailed question analytics
- `includeRespondentData` (boolean, default: true) - Include respondent information
- `includeRawResponses` (boolean, default: false) - Include raw response data

#### Example

```
GET /api/exports/surveys/123/analysis/csv?includeQuestionAnalysis=true&includeRespondentData=true&includeRawResponses=false
```

## File Format

- CSV format with proper escaping for special characters
- UTF-8 encoding
- Timestamped filename: `survey_analysis_{surveyId}_{timestamp}.csv`

## Security

- Admin-only access required (ADMIN role)
- Survey access validation
- Secure file generation and download

## Technical Notes

- Uses native Java CSV generation (no external dependencies)
- Proper CSV escaping for text containing commas, quotes, or newlines
- Memory-efficient streaming implementation
- Error handling for invalid survey IDs or access violations
