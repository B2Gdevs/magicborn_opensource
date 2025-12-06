// lib/__tests__/data/environments.test.ts
// Smoke tests for environments repository

import { describe, it, expect, beforeEach } from "vitest";
import { getEnvironmentsRepository } from "@/lib/data/environmentsRepository";
import type { EnvironmentDefinition } from "@/lib/data/environments";

describe("EnvironmentsRepository", () => {
  const repo = getEnvironmentsRepository();

  beforeEach(() => {
    // Clean up test data (in a real scenario, you'd use a test database)
    // For now, we'll just test that the repository methods exist and work
  });

  it("should create and retrieve an environment", () => {
    const environment: EnvironmentDefinition = {
      id: "test-env",
      name: "Test Environment",
      description: "A test environment",
      storyIds: [],
      mapIds: [],
      metadata: {
        biome: "forest",
        climate: "temperate",
        dangerLevel: 1,
      },
    };

    repo.create(environment);
    const retrieved = repo.getById("test-env");

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe("test-env");
    expect(retrieved?.name).toBe("Test Environment");
    expect(retrieved?.metadata.biome).toBe("forest");

    // Cleanup
    repo.delete("test-env");
  });

  it("should list all environments", () => {
    const environments = repo.listAll();
    expect(Array.isArray(environments)).toBe(true);
  });

  it("should check if environment exists", () => {
    const environment: EnvironmentDefinition = {
      id: "exists-test",
      name: "Exists Test",
      description: "Test",
      storyIds: [],
      mapIds: [],
      metadata: {
        biome: "forest",
        climate: "temperate",
        dangerLevel: 1,
      },
    };

    repo.create(environment);
    expect(repo.exists("exists-test")).toBe(true);
    expect(repo.exists("non-existent")).toBe(false);

    // Cleanup
    repo.delete("exists-test");
  });
});

