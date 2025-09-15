# Section-Wise Quiz Creator

## Overview
The Section-Wise Quiz Creator allows users to create quizzes with multiple sections, each having their own:
- Time limits
- Difficulty levels
- Negative marking rules
- Questions

## Features

### 1. Section Management
- **Add/Remove Sections**: Create as many sections as needed
- **Section Settings**: Each section can have different configurations
- **Collapsible Interface**: Expand/collapse sections for better organization

### 2. Section-Specific Settings
- **Time Limit**: Set individual time limits for each section (5-180 minutes)
- **Difficulty Level**: Choose from Easy, Medium, Hard, or Expert
- **Negative Marking**: Enable/disable and configure negative marking per section

### 3. Negative Marking Options
- **Fractional**: Deduct a fraction of marks (e.g., 0.25 marks)
- **Fixed**: Deduct a fixed number of marks
- **Section Level**: Set default negative marking for all questions in a section
- **Question Level**: Override section settings for specific questions

### 4. Question Management
- **Add Questions**: Add multiple questions to each section
- **Multiple Choice**: Support for 4 answer options
- **Correct Answer**: Mark the correct option
- **Explanations**: Add explanations for correct answers
- **Individual Negative Marking**: Override section negative marking per question

## Usage

### Accessing the Creator
1. Go to the AI Quiz Generator
2. Click on the "Section-Wise" tab
3. Click "Open Section-Wise Quiz Creator"

### Creating a Quiz
1. **Set Quiz Details**:
   - Enter quiz title (required)
   - Add description (optional)

2. **Add Sections**:
   - Click "Add New Section" to create sections
   - Configure section settings (time, difficulty, negative marking)
   - Add questions to each section

3. **Configure Negative Marking**:
   - Enable/disable at section level
   - Choose marking type (fractional or fixed)
   - Set marking value
   - Override at question level if needed

4. **Add Questions**:
   - Write question text
   - Add 4 answer options
   - Mark correct answer
   - Add explanation
   - Configure question-specific negative marking

5. **Create Quiz**:
   - Click "Create Section-Wise Quiz"
   - Quiz will be saved to the database

## Data Structure

### Quiz Object
```json
{
  "title": "Quiz Title",
  "description": "Quiz Description",
  "sections": [...],
  "createdBy": "user_id",
  "createdAt": "timestamp",
  "totalSections": 3,
  "totalQuestions": 15
}
```

### Section Object
```json
{
  "id": "section_id",
  "name": "Section Name",
  "description": "Section Description",
  "questions": [...],
  "negativeMarking": {
    "enabled": true,
    "type": "fractional",
    "value": 0.25
  },
  "timeLimit": 30,
  "difficulty": "medium"
}
```

### Question Object
```json
{
  "id": "question_id",
  "question": "Question text?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Explanation text",
  "negativeMarking": {
    "enabled": false,
    "type": "fractional",
    "value": 0.25
  }
}
```

## Benefits

1. **Flexibility**: Different sections can have different rules
2. **Customization**: Fine-grained control over negative marking
3. **Organization**: Better structure for complex exams
4. **Time Management**: Section-specific time limits
5. **Difficulty Control**: Vary difficulty across sections

## Technical Implementation

- **Frontend**: React components with state management
- **Database**: Firestore with structured data
- **Routing**: React Router for navigation
- **Styling**: Tailwind CSS with custom components
- **Icons**: React Icons (Feather icons)

## Future Enhancements

- **Section Templates**: Pre-defined section configurations
- **Bulk Question Import**: Import questions from CSV/Excel
- **Question Bank**: Reuse questions across sections
- **Advanced Scoring**: Complex scoring algorithms
- **Section Dependencies**: Conditional section visibility
