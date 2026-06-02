export interface UserPreferences {
  darkMode: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationTone: string;
  reminderAdvance: string;
  reminderRepeat: string;
  fontSize: number;
  highContrast: boolean;
  screenReader: boolean;
  reducedMotion: boolean;
  voiceCommands: string;
  remoteMonitoring: boolean;
  alertMissedDoses: boolean;
  weeklyReports: boolean;
  lowStockAlerts: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  darkMode: false,
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  notificationTone: "default",
  reminderAdvance: "0",
  reminderRepeat: "none",
  fontSize: 16,
  highContrast: false,
  screenReader: false,
  reducedMotion: false,
  voiceCommands: "off",
  remoteMonitoring: true,
  alertMissedDoses: true,
  weeklyReports: true,
  lowStockAlerts: true,
};

const STORAGE_KEY = "medicare_preferences";

export function loadPreferences(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const current = loadPreferences();
  const updated = { ...current, ...prefs };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    applyPreferences(updated);
  }

  return updated;
}

export function applyPreferences(prefs: UserPreferences) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  root.classList.toggle("dark", prefs.darkMode);
  root.classList.toggle("high-contrast", prefs.highContrast);
  root.classList.toggle("reduce-motion", prefs.reducedMotion);
  root.style.fontSize = `${prefs.fontSize}px`;

  if (prefs.screenReader) {
    root.setAttribute("data-screen-reader", "true");
  } else {
    root.removeAttribute("data-screen-reader");
  }
}
