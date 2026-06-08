import { useAuth } from '../context/AuthContext'
import { ROLES, ROLE_HIERARCHY } from '../constants/roles'

export { ROLES }

export function useRBAC() {
  const { user, role } = useAuth()

  function hasRole(requiredRole) {
    const userIndex = ROLE_HIERARCHY.indexOf(role)
    const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole)
    return userIndex !== -1 && userIndex <= requiredIndex
  }

  return {
    userRole: role,
    hasRole,
    canAccess: hasRole,
    isSuperAdmin: role === ROLES.SUPER_ADMIN,
    isBakeryOwner: hasRole(ROLES.BAKERY_OWNER),
    isAdmin: hasRole(ROLES.ADMIN),
    isStaff: hasRole(ROLES.STAFF),
  }
}
