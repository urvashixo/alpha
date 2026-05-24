'use client';

import { AppSettings, DEFAULT_SETTINGS } from "../types/settings";

const SETTINGS_KEY = "alpha-settings";

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      profile: {
        ...DEFAULT_SETTINGS.profile,
        ...(parsed.profile ?? {}),
      },
      preferences: {
        ...DEFAULT_SETTINGS.preferences,
        ...(parsed.preferences ?? {}),
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
