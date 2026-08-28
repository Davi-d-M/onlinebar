/**
 * ONLINE BAR: IDENTITY ENGINE (RBAC)
 * Centralizes permission checks and role-based access logic.
 */

export type Role =
    | 'OWNER'               // Full system access
    | 'SUPER_ADMIN'         // High level management
    | 'OPERATIONS_ADMIN'    // Orders, Riders, Dispatch
    | 'FINANCE_ADMIN'       // Ledger, Payouts, Reports
    | 'SUPPORT_ADMIN'       // Tickets, Messages, Reviews
    | 'SECURITY_ADMIN'      // Audit logs, Risk Engine, IP blocking
    | 'SUPPLIER_ADMIN'      // Limited to own inventory
    | 'RIDER_MANAGER'       // Limited to rider coordination
    | 'STAFF'               // Basic operational entry
    | 'VIEWER';             // Read-only access

export type Permission =
    | 'CAN_VIEW_REVENUE'
    | 'CAN_MANAGE_INVENTORY'
    | 'CAN_MANAGE_ORDERS'
    | 'CAN_EXECUTE_PAYOUTS'
    | 'CAN_VIEW_AUDIT_LOGS'
    | 'CAN_MANAGE_SETTINGS'
    | 'CAN_MANAGE_STAFF'
    | 'CAN_VIEW_SENSITIVE_DATA'
    | 'CAN_MANAGE_COMMUNICATIONS'
    | 'CAN_MANAGE_MARKETING';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    'OWNER': [
        'CAN_VIEW_REVENUE', 'CAN_MANAGE_INVENTORY', 'CAN_MANAGE_ORDERS',
        'CAN_EXECUTE_PAYOUTS', 'CAN_VIEW_AUDIT_LOGS', 'CAN_MANAGE_SETTINGS',
        'CAN_MANAGE_STAFF', 'CAN_VIEW_SENSITIVE_DATA', 'CAN_MANAGE_COMMUNICATIONS',
        'CAN_MANAGE_MARKETING'
    ],
    'SUPER_ADMIN': [
        'CAN_VIEW_REVENUE', 'CAN_MANAGE_INVENTORY', 'CAN_MANAGE_ORDERS',
        'CAN_VIEW_AUDIT_LOGS', 'CAN_MANAGE_SETTINGS', 'CAN_MANAGE_STAFF',
        'CAN_VIEW_SENSITIVE_DATA', 'CAN_MANAGE_COMMUNICATIONS', 'CAN_MANAGE_MARKETING'
    ],
    'OPERATIONS_ADMIN': [
        'CAN_MANAGE_INVENTORY', 'CAN_MANAGE_ORDERS', 'CAN_VIEW_SENSITIVE_DATA',
        'CAN_MANAGE_COMMUNICATIONS'
    ],
    'FINANCE_ADMIN': [
        'CAN_VIEW_REVENUE', 'CAN_EXECUTE_PAYOUTS', 'CAN_VIEW_AUDIT_LOGS'
    ],
    'SUPPORT_ADMIN': [
        'CAN_MANAGE_COMMUNICATIONS', 'CAN_MANAGE_ORDERS'
    ],
    'SECURITY_ADMIN': [
        'CAN_VIEW_AUDIT_LOGS', 'CAN_VIEW_SENSITIVE_DATA'
    ],
    'SUPPLIER_ADMIN': [
        'CAN_MANAGE_INVENTORY'
    ],
    'RIDER_MANAGER': [
        'CAN_MANAGE_ORDERS', 'CAN_VIEW_SENSITIVE_DATA'
    ],
    'STAFF': [
        'CAN_MANAGE_ORDERS'
    ],
    'VIEWER': [
        'CAN_VIEW_AUDIT_LOGS' // Limited read-only
    ]
};

/**
 * Checks if a user has a specific permission based on their role
 */
export function hasPermission(role: Role | string, permission: Permission): boolean {
    const normalizedRole = (role || 'STAFF').toUpperCase() as Role;
    const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
    return permissions.includes(permission);
}

/**
 * Checks if a user can access a specific admin route
 */
export function canAccessRoute(role: Role | string, pathname: string): boolean {
    const r = (role || 'STAFF').toUpperCase() as Role;

    // Global Rules
    if (r === 'OWNER') return true;

    // specific route mapping
    if (pathname.startsWith('/admin/finance')) return hasPermission(r, 'CAN_VIEW_REVENUE');
    if (pathname.startsWith('/admin/payouts')) return hasPermission(r, 'CAN_EXECUTE_PAYOUTS');
    if (pathname.startsWith('/admin/staff')) return hasPermission(r, 'CAN_MANAGE_STAFF');
    if (pathname.startsWith('/admin/audit')) return hasPermission(r, 'CAN_VIEW_AUDIT_LOGS');
    if (pathname.startsWith('/admin/settings')) return hasPermission(r, 'CAN_MANAGE_SETTINGS');
    if (pathname.startsWith('/admin/marketing')) return hasPermission(r, 'CAN_MANAGE_MARKETING');

    // Default: If they are any admin role, they can likely see the dashboard
    return true;
}
