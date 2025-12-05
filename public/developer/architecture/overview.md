# Architecture Overview

Magicborn uses a modular service-based architecture with clear separation of concerns.

## Core Principles

- **Separation of Concerns**: Core game logic is separated from UI
- **Repository Pattern**: Data persistence is handled through repositories
- **Service Layer**: Business logic is encapsulated in services
- **Type Safety**: Full TypeScript coverage for type safety

## Architecture Layers

1. **Core Layer** (`lib/core/`): Game types, enums, and fundamental data structures
2. **Package Layer** (`lib/packages/`): Game logic services (combat, evolution, affinity, etc.)
3. **Data Layer** (`lib/data/`): Data definitions and repositories
4. **UI Layer** (`components/`): React UI components
5. **API Layer** (`app/api/`): Next.js API routes for data operations

## Data Flow

Content data flows from source files (TypeScript definitions or SQLite databases) through repositories to the game services. The Developer Workbench provides a UI for managing this content without directly editing source files.

