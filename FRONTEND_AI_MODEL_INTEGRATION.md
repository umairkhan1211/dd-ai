# Frontend Integration Guide - AI Model Selection

## Overview

Both Cast Members and Protocols now require AI model selection. This guide covers the API changes and frontend requirements.

## 🔧 Required API Changes

### 1. **Get Available AI Models**

```
GET /api/ai-models
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "bb5dc55a-a562-4fdd-af23-f953f1bb2c2a",
      "name": "gpt-4o-mini",
      "displayName": "GPT-4o Mini",
      "provider": "openai",
      "modelType": "text",
      "maxTokens": 128000,
      "capabilities": ["web_search", "code_execution"],
      "tierAccess": ["trial", "core", "pro"],
      "description": "Fast and efficient model for most tasks"
    }
  ]
}
```

### 2. **Create Cast Member (Updated)**

```
POST /api/cast
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Required Body:**

```json
{
  "name": "Assistant Name",
  "functionalRole": "Helper",
  "defaultTone": "friendly",
  "aiModelId": "bb5dc55a-a562-4fdd-af23-f953f1bb2c2a", //  ALWAYS REQUIRED FOR USER CAST MEMBERS
  "description": "Optional description",
  "invocationPhrases": ["hey assistant"],
  "priority": 1,
  "avatar": "avatar_url_or_blob"
  // Note: isSystem is automatically set to false for user-created cast members
}
```

**Error Responses:**

```json
// Missing AI Model
{
  "message": "AI Model selection is required. Please select an AI model for this cast member."
}

// Invalid AI Model
{
  "message": "Invalid AI model ID: xyz. Please select a valid AI model."
}
```

### 3. **Create Protocol (Updated)**

```
POST /api/protocols
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Required Body:**

```json
{
  "name": "Protocol Name",
  "description": "Protocol description",
  "level": 1,
  "type": "static",
  "promptTemplate": "Template content",
  "aiModelId": "bb5dc55a-a562-4fdd-af23-f953f1bb2c2a", //  NOW REQUIRED
  "category": "Optional category"
}
```

**Error Responses:**

```json
// Missing AI Model
{
  "message": "AI Model selection is required. Please select an AI model for this protocol."
}

// Invalid AI Model
{
  "message": "Invalid AI model ID: xyz. Please select a valid AI model."
}
```

## 🎨 Frontend UI Requirements

### 1. **AI Model Dropdown Component**

Create a reusable dropdown component that:

- Fetches AI models from `/api/ai-models`
- Displays `displayName` with provider info
- Shows model capabilities and tier access
- Handles loading and error states

**Example Component Structure:**

```tsx
interface AIModelOption {
  id: string;
  name: string;
  displayName: string;
  provider: string;
  modelType: string;
  capabilities: string[];
  tierAccess: string[];
  description: string;
}

const AIModelSelect = ({ value, onChange, required = true }) => {
  // Component implementation
};
```

### 2. **Cast Member Form Updates**

- Add `<AIModelSelect>` component to the form
- Make it a required field (show asterisk \*)
- Add validation error handling
- Display selected model info

### 3. **Protocol Form Updates**

- Add `<AIModelSelect>` component to the form
- Make it a required field (show asterisk \*)
- Add validation error handling
- Display selected model info

### 4. **Model Information Display**

Show model details to help users choose:

- **Provider:** OpenAI, Anthropic, etc.
- **Capabilities:** Code execution, web search, etc.
- **Tier Access:** Which subscription tiers can use it
- **Description:** Brief explanation of model strengths

## 🔄 Migration Path

### For Existing Records

Existing cast members and protocols without AI models will:

1. Still function in sessions (fallback to gpt-4o-mini)
2. Need to be updated through edit forms to add AI model selection
3. Show a warning/notice that AI model should be selected

### Implementation Steps

1. **Phase 1:** Add AI model dropdowns to create forms
2. **Phase 2:** Add validation and error handling
3. **Phase 3:** Update edit forms for existing records
4. **Phase 4:** Add bulk update option for existing records

## 🎯 User Experience

- **Clear Labeling:** "AI Model \*" (required field)
- **Default Selection:** Pre-select gpt-4o-mini for trial users
- **Helpful Tooltips:** Explain model differences
- **Error Feedback:** Clear validation messages
- **Loading States:** Show loading while fetching models

## 🧪 Testing Checklist

- [ ] AI models API returns data correctly
- [ ] Cast member creation fails without AI model
- [ ] Protocol creation fails without AI model
- [ ] Valid AI model IDs are accepted
- [ ] Invalid AI model IDs are rejected
- [ ] UI shows appropriate error messages
- [ ] Existing records still work in sessions
- [ ] Edit forms allow updating AI models

## 📝 API Response Examples

**Success - Cast Member Created:**

```json
{
  "id": "cast-uuid",
  "name": "Assistant Name",
  "functionalRole": "Helper",
  "aiModelId": "bb5dc55a-a562-4fdd-af23-f953f1bb2c2a",
  "aiModel": {
    "id": "bb5dc55a-a562-4fdd-af23-f953f1bb2c2a",
    "name": "gpt-4o-mini",
    "displayName": "GPT-4o Mini"
  }
}
```

**Error - Missing AI Model:**

```json
{
  "message": "AI Model selection is required. Please select an AI model for this cast member."
}
```

This ensures a consistent user experience where AI model selection is mandatory and properly validated across the entire application.
