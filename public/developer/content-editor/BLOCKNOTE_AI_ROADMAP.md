# BlockNote & AI Integration Roadmap

## Overview
This document tracks the implementation of BlockNote editor and AI integration for the Content Editor's page writing functionality.

## ✅ Completed

### Phase 1: Setup & Foundation
- [x] Install BlockNote packages (`@blocknote/core`, `@blocknote/react`, `@blocknote/mantine`)
- [x] Install Vercel AI SDK (`ai`)
- [x] Add `pageNumber` field to Pages collection
- [x] Create DetailToolbar component with tabs (Detail, NarrativeThread, GameThread)
- [x] Replace basic editor with BlockNote in PageEditor
- [x] Add page numbering UI alongside titles

## 🚧 In Progress

### Phase 2: BlockNote Integration
- [ ] **BlockNote Content Persistence**
  - [ ] Ensure BlockNote JSON format is properly saved to Payload
  - [ ] Handle content loading from Payload (BlockNote vs Lexical format)
  - [ ] Add migration path for existing Lexical content
  - [ ] Test content round-trip (save → load → edit → save)

- [ ] **BlockNote Customization**
  - [ ] Customize toolbar to match app theme
  - [ ] Add custom block types if needed (character references, codex links)
  - [ ] Configure slash menu with relevant options
  - [ ] Style BlockNote to match dark fantasy aesthetic

- [ ] **Advanced BlockNote Features**
  - [ ] Image upload and embedding
  - [ ] Code block syntax highlighting
  - [ ] Table support
  - [ ] Inline formatting (bold, italic, underline, strikethrough)
  - [ ] Link support with custom link types (codex references)

## 📋 Planned

### Phase 3: AI Integration Setup

#### 3.1 LM Studio Backend Setup
- [ ] **API Route Creation**
  - [ ] Create `/api/ai/write` endpoint for text generation
  - [ ] Create `/api/ai/complete` endpoint for text completion
  - [ ] Create `/api/ai/edit` endpoint for text editing/rewriting
  - [ ] Create `/api/ai/suggest` endpoint for inline suggestions
  - [ ] Add error handling and rate limiting

- [ ] **LM Studio Integration**
  - [ ] Configure Vercel AI SDK to use LM Studio's OpenAI-compatible API
  - [ ] Set up connection to localhost LM Studio instance
  - [ ] Add model selection (if multiple models available)
  - [ ] Implement streaming responses for real-time generation
  - [ ] Add fallback handling if LM Studio is unavailable

#### 3.2 Context Management
- [ ] **Story Context System**
  - [ ] Create context builder that includes:
    - Current page content
    - Previous pages in chapter
    - Chapter summary
    - Act summary
    - Character names mentioned
    - Locations mentioned
    - Plot points/notes
  - [ ] Implement context window management (token limits)
  - [ ] Add context caching for performance

- [ ] **Codex Integration**
  - [ ] Allow AI to reference codex entries (characters, locations, objects)
  - [ ] Auto-detect codex references in generated text
  - [ ] Suggest codex entries based on content

### Phase 4: AI Features Implementation

#### 4.1 Inline AI Assistance
- [ ] **AI Suggestions**
  - [ ] Implement inline suggestion bubbles (like GitHub Copilot)
  - [ ] Show AI suggestions as user types
  - [ ] Allow accepting/rejecting suggestions
  - [ ] Add keyboard shortcuts (Tab to accept, Esc to dismiss)

- [ ] **AI Completion**
  - [ ] "Continue writing" feature (Ctrl+Space or similar)
  - [ ] Generate next paragraph based on context
  - [ ] Multiple completion options to choose from
  - [ ] Adjustable creativity/temperature setting

#### 4.2 AI Editing Features
- [ ] **Text Transformation**
  - [ ] Rewrite selected text (improve, expand, condense)
  - [ ] Change tone (formal, casual, dramatic, etc.)
  - [ ] Fix grammar and spelling
  - [ ] Improve clarity and flow

- [ ] **Content Generation**
  - [ ] Generate dialogue between characters
  - [ ] Create scene descriptions
  - [ ] Generate action sequences
  - [ ] Write transitions between scenes

#### 4.3 AI Prompt Templates
- [ ] **Pre-built Prompts**
  - [ ] "Continue the story"
  - [ ] "Expand this scene"
  - [ ] "Add more detail"
  - [ ] "Write dialogue for [character]"
  - [ ] "Describe [location]"
  - [ ] "Create a transition to [next scene]"
  - [ ] "Improve this paragraph"
  - [ ] "Make this more dramatic"

- [ ] **Custom Prompts**
  - [ ] Allow users to create custom prompt templates
  - [ ] Save frequently used prompts
  - [ ] Share prompts between projects

### Phase 5: Advanced AI Features

#### 5.1 Context-Aware AI
- [ ] **Character Consistency**
  - [ ] AI remembers character traits and speech patterns
  - [ ] Warns if generated text contradicts character info
  - [ ] Suggests character-appropriate dialogue

- [ ] **Plot Consistency**
  - [ ] AI tracks plot points and story arcs
  - [ ] Warns about plot holes or inconsistencies
  - [ ] Suggests connections to previous events

- [ ] **Style Consistency**
  - [ ] Learn writing style from existing pages
  - [ ] Maintain consistent tone throughout
  - [ ] Match pacing and structure

#### 5.2 Collaborative AI
- [ ] **AI Review & Feedback**
  - [ ] AI-powered suggestions for improvement
  - [ ] Highlight potential issues (pacing, clarity, etc.)
  - [ ] Suggest alternative phrasings
  - [ ] Word count and reading time estimates

- [ ] **AI Outlining**
  - [ ] Generate chapter outlines from summaries
  - [ ] Suggest scene breakdowns
  - [ ] Propose plot developments

## 🎯 Future Enhancements

### Phase 6: Advanced Writing Tools
- [ ] **Focus Mode**
  - [ ] Distraction-free writing interface
  - [ ] Typewriter mode (centered text)
  - [ ] Full-screen mode

- [ ] **Export & Publishing**
  - [ ] Export to PDF with formatting
  - [ ] Export to DOCX
  - [ ] Export to Markdown
  - [ ] Export to HTML
  - [ ] Print formatting

- [ ] **Version Control**
  - [ ] Version history with diffs
  - [ ] Branching (experimental versions)
  - [ ] Merge changes
  - [ ] Restore previous versions

- [ ] **Collaboration**
  - [ ] Real-time collaborative editing
  - [ ] Comments and suggestions
  - [ ] Track changes mode
  - [ ] User permissions

## 📝 Implementation Notes

### BlockNote Configuration
- Using `@blocknote/react` for React integration
- Dark theme to match app aesthetic
- Custom styling via CSS variables
- BlockNote stores content as JSON array of blocks

### AI Integration Architecture
```
User Action → BlockNote Editor → API Route → Vercel AI SDK → LM Studio → Response → BlockNote
```

### Key Files
- `components/content-editor/PageEditor.tsx` - Main BlockNote editor
- `components/content-editor/DetailToolbar.tsx` - Tab navigation
- `components/content-editor/DetailView.tsx` - View router
- `lib/payload/collections/Pages.ts` - Database schema
- `app/api/ai/*` - AI API routes (to be created)

### Dependencies
- `@blocknote/core` - Core editor functionality
- `@blocknote/react` - React components
- `@blocknote/mantine` - UI components (optional, for advanced features)
- `ai` - Vercel AI SDK for LLM integration

## 🔗 Related Documentation
- [BlockNote Documentation](https://www.blocknotejs.org/)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [LM Studio API Documentation](https://lmstudio.ai/docs)


