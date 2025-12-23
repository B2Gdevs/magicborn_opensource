# Postman Collection for Magicborn API

This Postman collection provides a visual way to test all CRUD operations and verify that the refactoring didn't break anything.

## Quick Start

### Option 1: Import OpenAPI Spec (Recommended)
1. Open Postman
2. Click **Import** button
3. Select **Link** tab
4. Enter: `http://localhost:4300/api/openapi`
5. Click **Continue** → **Import**

This will automatically create a collection from your OpenAPI spec with all endpoints!

### Option 2: Import Collection Files
1. Open Postman
2. Click **Import** button
3. Drag and drop:
   - `Magicborn_API.postman_collection.json`
   - `Magicborn_API.postman_environment.json`
4. Click **Import**

## Setup

### 1. Select Environment
- In Postman, select **"Magicborn Local Dev"** environment from the dropdown (top right)

### 2. Update Base URL (if needed)
- If your dev server runs on a different port, edit the environment variable `base_url`

### 3. Get a Project ID
- Run **"Projects → List Projects"** request
- Copy a project ID from the response
- Set `project_id` in environment variables (or it will auto-set from the response)

## Testing Workflow

### 1. Test Authentication
- Run **"Authentication → Login"**
- Auth token will be automatically saved to `auth_token` variable
- Run **"Authentication → Get Current User"** to verify

### 2. Test Content Editor CRUD

#### Acts
1. **List Acts** - Verify you can fetch acts
2. **Create Act** - Create a new act
3. **Update Act** - Update the act you just created
4. **Delete Act** - Delete the act

#### Chapters
1. **List Chapters** - Verify you can fetch chapters
2. **Create Chapter** - Create a chapter (needs `act_id`)
3. **Update Chapter** - Update the chapter
4. **Delete Chapter** - Delete the chapter

#### Scenes
1. **List Scenes** - Verify you can fetch scenes
2. **Create Scene** - Create a scene (needs `chapter_id`)
3. **Update Scene** - Update the scene
4. **Delete Scene** - Delete the scene

### 3. Test Codex CRUD

#### Characters
1. **List Characters** - Verify you can fetch characters
2. **Create Character** - Create a new character
3. **Update Character** - Update the character
4. **Delete Character** - Delete the character

#### Spells, Runes, Effects (if Magicborn mode enabled)
- Test CRUD operations for each collection

### 4. Verify Enum Conversion

**Critical Test:** Check that enum values are sent as strings, not objects

1. Open Postman Console (View → Show Postman Console)
2. Run any CREATE or UPDATE request
3. In the console, check the **Request** tab
4. Verify that:
   - No enum objects are in the request body
   - All values are plain strings (e.g., `"plan"`, `"grid"`, `"characters"`)
   - Category IDs are strings, not enum values

### 5. Test AI Stack
- **Get Service Status** - Verify all services are detected
- **LM Studio - List Models** - Verify LM Studio connection works

## Using Postman Runner

You can run the entire collection automatically:

1. Click **Collections** → **Magicborn API - CRUD Testing**
2. Click **Run** button
3. Select requests to run (or run all)
4. Click **Run Magicborn API**

This will execute all requests in sequence and show you:
- ✅ Passed requests (green)
- ❌ Failed requests (red)
- Response times
- Test results

## Pre-request Scripts

Some requests automatically set environment variables:
- **List Projects** → Sets `project_id`
- **List Acts** → Sets `act_id`
- **Login** → Sets `auth_token`

## Test Scripts

The collection includes test scripts that:
- Auto-save IDs from responses
- Verify response status codes
- Check response structure

## Troubleshooting

### "Could not get any response"
- Make sure your dev server is running: `npm run dev`
- Check that `base_url` is correct in environment

### "401 Unauthorized"
- Run **Login** request first
- Make sure `auth_token` is set in environment

### "404 Not Found"
- Check that the collection ID exists
- Verify the endpoint path is correct

## Alternative Tools

If you prefer other tools:

### Insomnia
- Import OpenAPI spec: `http://localhost:4300/api/openapi`
- Or import the Postman collection (Insomnia supports Postman format)

### Bruno
- Create new collection
- Import from OpenAPI: `http://localhost:4300/api/openapi`

### Thunder Client (VS Code Extension)
- Install Thunder Client extension
- Import OpenAPI spec or Postman collection

## Swagger UI

You can also use the built-in Swagger UI:
- Navigate to: `http://localhost:4300/docs/swagger`
- Interactive API explorer with "Try it out" buttons
- No setup required!


