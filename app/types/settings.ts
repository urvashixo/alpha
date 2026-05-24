export type UserRole = "Admin" | "Manager";

export type LandingPage = "/overview" | "/products" | "/analytics";

export type SortPreference = "name" | "price" | "rating";

export type UserProfile = {
  photoUrl: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export type DashboardPreferences = {
  defaultLandingPage: LandingPage;
  sidebarCollapsed: boolean;
  rowsPerPage: 10 | 25 | 50;
  defaultSorting: SortPreference;
};

export type AppSettings = {
  profile: UserProfile;
  preferences: DashboardPreferences;
};

export const DEFAULT_SETTINGS: AppSettings = {
  profile: {
    photoUrl: "https://i.pravatar.cc/160?img=47",
    fullName: "Jane Diaz",
    email: "jane.diaz@example.com",
    role: "Admin",
  },
  preferences: {
    defaultLandingPage: "/products",
    sidebarCollapsed: false,
    rowsPerPage: 10,
    defaultSorting: "name",
  },
};
