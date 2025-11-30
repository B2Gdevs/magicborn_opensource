"use client";

import type { ReactNode } from "react";
import { GameStateProvider } from "@components/providers/GameStateProvider";

export function GameProviders({ children }: { children: ReactNode }) {
  return <GameStateProvider>{children}</GameStateProvider>;
}
