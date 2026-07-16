export type Role = "admin" | "editor" | "viewer";

export type Permission =
  | "users:read"
  | "users:write"
  | "products:read"
  | "products:write"
  | "categories:read"
  | "categories:write"
  | "rentals:read"
  | "rentals:write"
  | "reports:read"
  | "reports:write"
  | "customers:read"
  | "customers:write";

const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    "users:read",
    "users:write",
    "products:read",
    "products:write",
    "categories:read",
    "categories:write",
    "rentals:read",
    "rentals:write",
    "reports:read",
    "reports:write",
    "customers:read",
    "customers:write",
  ],
  editor: [
    "products:read",
    "products:write",
    "categories:read",
    "categories:write",
    "rentals:read",
    "rentals:write",
    "reports:read",
    "customers:read",
    "customers:write",
  ],
  viewer: [
    "products:read",
    "categories:read",
    "rentals:read",
    "reports:read",
    "customers:read",
  ],
};

export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function canWrite(role: Role | undefined, resource: "products" | "categories" | "rentals" | "customers" | "users"): boolean {
  return hasPermission(role, `${resource}:write` as Permission);
}

export function canRead(role: Role | undefined, resource: "products" | "categories" | "rentals" | "customers" | "users"): boolean {
  return hasPermission(role, `${resource}:read` as Permission);
}

export function isAdmin(role: Role | undefined): boolean {
  return role === "admin";
}

export function roleLabel(role: string | undefined): string {
  switch (role) {
    case "admin":
      return "Administrador";
    case "editor":
      return "Editor";
    case "viewer":
      return "Visualizador";
    default:
      return "Sin rol";
  }
}

export function roleBadgeColor(role: string | undefined): string {
  switch (role) {
    case "admin":
      return "bg-purple-100 text-purple-700";
    case "editor":
      return "bg-blue-100 text-blue-700";
    case "viewer":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-500";
  }
}


