import React, { useState } from 'react'
import { useAccessControl } from '../contexts/AccessControlContext'
import { useAccessManagement } from '../hooks/useAccessManagement'
import { DASHBOARD_REGISTRY } from '../types/access'
import { 
  Users, 
  Shield, 
  Settings, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Upload,
  RotateCcw,
  Eye,
  EyeOff,
  UserPlus,
  UserMinus,
  Key,
  Calendar,
  MapPin,
  Activity,
  History,
  Save,
  X,
  Send,
  Building,
  Target,
  Award,
  Bell
} from 'lucide-react'

interface AccessControlDashboardProps {
  tenantId: string
  locationId?: string
  currentUserId: string
}

export default function AccessControlDashboard({ 
  tenantId, 
  locationId, 
  currentUserId 
}: AccessControlDashboardProps) {
  const {
    currentUser,
    policy,
    users,
    roles,
    auditLogs,
    loading,
    error,
    hasCapability,
    canAccessDashboard
  } = useAccessControl()

  const {
    grantCapability,
    revokeCapability,
    assignRole,
    removeRole,
    grantTemporaryAccess,
    suspendUser,
    restoreUser,
    updateRole,
    createCustomRole,
    rollbackToVersion,
    bulkAssignRole,
    exportAccessReport
  } = useAccessManagement(tenantId, currentUserId)

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'roles' | 'dashboards' | 'locations' | 'audit'>('overview')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showGrantModal, setShowGrantModal] = useState(false)
  const [showTempAccessModal, setShowTempAccessModal] = useState(false)
  const [showRoleEditor, setShowRoleEditor] = useState(false)

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'all' || user.roles.some(r => r.key === filterRole)
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'invited': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'invited': return <Clock className="w-4 h-4" />
      case 'suspended': return <XCircle className="w-4 h-4" />
      case 'expired': return <AlertTriangle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const handleExportReport = async () => {
    try {
      const blob = await exportAccessReport()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `access-report-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to export report')
    }
  }

  const handleGrantCapability = async (userId: string, capability: string) => {
    try {
      await grantCapability(userId, capability, undefined, 'Manual grant from admin')
      alert('Capability granted successfully!')
    } catch (err) {
      alert('Failed to grant capability')
    }
  }

  const handleRevokeCapability = async (userId: string, capability: string) => {
    try {
      await revokeCapability(userId, capability, 'Manual revoke from admin')
      alert('Capability revoked successfully!')
    } catch (err) {
      alert('Failed to revoke capability')
    }
  }

  const handleAssignRole = async (userId: string, roleKey: string) => {
    try {
      await assignRole(userId, roleKey, 'Manual role assignment from admin')
      alert('Role assigned successfully!')
    } catch (err) {
      alert('Failed to assign role')
    }
  }

  const handleRemoveRole = async (userId: string, roleKey: string) => {
    try {
      await removeRole(userId, roleKey, 'Manual role removal from admin')
      alert('Role removed successfully!')
    } catch (err) {
      alert('Failed to remove role')
    }
  }
  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'active').length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Custom Roles</p>
              <p className="text-2xl font-bold text-gray-900">{roles.filter(r => r.isCustom).length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Policy Version</p>
              <p className="text-2xl font-bold text-gray-900">v{policy?.version}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <History className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Access Matrix */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Dashboard Access Overview</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Dashboard</th>
                {roles.filter(r => r.isDefault).map(role => (
                  <th key={role.key} className="text-center py-3 px-4 font-medium text-gray-900">
                    {role.displayName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.values(DASHBOARD_REGISTRY).map(dashboard => (
                <tr key={dashboard.key} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{dashboard.name}</div>
                        <div className="text-sm text-gray-500">{dashboard.description}</div>
                      </div>
                    </div>
                  </td>
                  {roles.filter(r => r.isDefault).map(role => (
                    <td key={role.key} className="py-3 px-4 text-center">
                      <div className="flex justify-center space-x-1">
                        {dashboard.capabilities.map(cap => {
                          const hasAccess = role.capabilities.includes(cap.key)
                          return (
                            <div
                              key={cap.key}
                              className={`w-3 h-3 rounded-full ${
                                hasAccess ? 'bg-green-500' : 'bg-gray-200'
                              }`}
                              title={`${cap.name}: ${hasAccess ? 'Granted' : 'Denied'}`}
                            />
                          )
                        })}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderUsersTab = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role.key} value={role.key}>{role.displayName}</option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="invited">Invited</option>
              <option value="suspended">Suspended</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowGrantModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Grant Access</span>
            </button>
            <button 
              onClick={handleExportReport}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">User Access Management</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dashboard Access</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(role => (
                        <span 
                          key={role.key}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: role.color }}
                        >
                          {role.displayName}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {getStatusIcon(user.status)}
                      <span className="ml-1 capitalize">{user.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {Object.values(DASHBOARD_REGISTRY).map(dashboard => {
                        const hasAccess = dashboard.capabilities.some(cap => 
                          cap.type === 'view' && user.capabilities.includes(cap.key)
                        )
                        return (
                          <div
                            key={dashboard.key}
                            className={`w-3 h-3 rounded-full ${
                              hasAccess ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                            title={`${dashboard.name}: ${hasAccess ? 'Access' : 'No Access'}`}
                          />
                        )
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedUser(user.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {user.status === 'active' && (
                        <button
                          onClick={() => suspendUser(user.id, 'Manual suspension')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      {user.status === 'suspended' && (
                        <button
                          onClick={() => restoreUser(user.id, 'Manual restoration')}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                      <button 
                        onClick={() => setSelectedUser(member.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Manage Access
                      </button>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Access Management Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Manage Access - {users.find(u => u.id === selectedUser)?.firstName} {users.find(u => u.id === selectedUser)?.lastName}
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Role Assignment */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Role Assignment</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {roles.map(role => {
                    const user = users.find(u => u.id === selectedUser)
                    const hasRole = user?.roles.some(r => r.key === role.key)
                    
                    return (
                      <div key={role.key} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: role.color }}
                            ></div>
                            <span className="font-medium text-gray-900">{role.displayName}</span>
                          </div>
                          <button
                            onClick={() => {
                              if (hasRole) {
                                handleRemoveRole(selectedUser, role.key)
                              } else {
                                handleAssignRole(selectedUser, role.key)
                              }
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              hasRole 
                                ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {hasRole ? 'Remove' : 'Assign'}
                          </button>
                        </div>
                        <div className="text-xs text-gray-500">
                          {role.capabilities.length} capabilities
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Dashboard Access Matrix */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Dashboard Access</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Dashboard</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">View</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Manage</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Sensitive</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(DASHBOARD_REGISTRY).map(dashboard => {
                        const user = users.find(u => u.id === selectedUser)
                        const viewCap = dashboard.capabilities.find(c => c.type === 'view')
                        const manageCap = dashboard.capabilities.find(c => c.type === 'manage')
                        const sensitiveCap = dashboard.capabilities.find(c => c.type === 'sensitive')
                        
                        return (
                          <tr key={dashboard.key} className="border-t border-gray-200">
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-900">{dashboard.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {viewCap && (
                                <button
                                  onClick={() => {
                                    const hasCapability = user?.capabilities.includes(viewCap.key)
                                    if (hasCapability) {
                                      handleRevokeCapability(selectedUser, viewCap.key)
                                    } else {
                                      handleGrantCapability(selectedUser, viewCap.key)
                                    }
                                  }}
                                  className={`w-6 h-6 rounded-full border-2 ${
                                    user?.capabilities.includes(viewCap.key)
                                      ? 'bg-green-500 border-green-500'
                                      : 'border-gray-300 hover:border-green-400'
                                  }`}
                                >
                                  {user?.capabilities.includes(viewCap.key) && (
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  )}
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {manageCap && (
                                <button
                                  onClick={() => {
                                    const hasCapability = user?.capabilities.includes(manageCap.key)
                                    if (hasCapability) {
                                      handleRevokeCapability(selectedUser, manageCap.key)
                                    } else {
                                      handleGrantCapability(selectedUser, manageCap.key)
                                    }
                                  }}
                                  className={`w-6 h-6 rounded-full border-2 ${
                                    user?.capabilities.includes(manageCap.key)
                                      ? 'bg-blue-500 border-blue-500'
                                      : 'border-gray-300 hover:border-blue-400'
                                  }`}
                                >
                                  {user?.capabilities.includes(manageCap.key) && (
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  )}
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {sensitiveCap && (
                                <button
                                  onClick={() => {
                                    const hasCapability = user?.capabilities.includes(sensitiveCap.key)
                                    if (hasCapability) {
                                      if (confirm('Remove sensitive capability? This requires admin confirmation.')) {
                                        handleRevokeCapability(selectedUser, sensitiveCap.key)
                                      }
                                    } else {
                                      if (confirm('Grant sensitive capability? This allows critical actions.')) {
                                        handleGrantCapability(selectedUser, sensitiveCap.key)
                                      }
                                    }
                                  }}
                                  className={`w-6 h-6 rounded-full border-2 ${
                                    user?.capabilities.includes(sensitiveCap.key)
                                      ? 'bg-red-500 border-red-500'
                                      : 'border-gray-300 hover:border-red-400'
                                  }`}
                                >
                                  {user?.capabilities.includes(sensitiveCap.key) && (
                                    <AlertTriangle className="w-4 h-4 text-white" />
                                  )}
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderRolesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Role Templates & Presets</h3>
          <button 
            onClick={() => setShowRoleEditor(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Role</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map(role => (
            <div key={role.key} className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: role.color }}
                  >
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{role.displayName}</h4>
                    <p className="text-sm text-gray-500">{role.isDefault ? 'Default' : 'Custom'}</p>
                  </div>
                </div>
                {role.isCustom && (
                  <button
                    onClick={() => setSelectedRole(role.key)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <strong>Capabilities:</strong> {role.capabilities.length}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Users:</strong> {users.filter(u => u.roles.some(r => r.key === role.key)).length}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1">
                {role.capabilities.slice(0, 3).map(cap => (
                  <span key={cap} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {cap.replace('_', ' ')}
                  </span>
                ))}
                {role.capabilities.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    +{role.capabilities.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderDashboardsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Dashboard Capabilities Matrix</h3>
        
        <div className="space-y-6">
          {Object.values(DASHBOARD_REGISTRY).map(dashboard => (
            <div key={dashboard.key} className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{dashboard.name}</h4>
                    <p className="text-sm text-gray-500">{dashboard.description}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">
                  {dashboard.category}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboard.capabilities.map(capability => (
                  <div key={capability.key} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{capability.name}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        capability.type === 'view' ? 'bg-blue-100 text-blue-800' :
                        capability.type === 'manage' ? 'bg-green-100 text-green-800' :
                        capability.type === 'action' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {capability.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{capability.description}</p>
                    {capability.requiresConfirmation && (
                      <div className="mt-2 flex items-center space-x-1 text-xs text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Requires confirmation</span>
                      </div>
                    )}
                    {capability.stationScoped && (
                      <div className="mt-2 flex items-center space-x-1 text-xs text-purple-600">
                        <MapPin className="w-3 h-3" />
                        <span>Station scoped</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAuditTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Access Control Audit Log</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleExportReport}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Audit</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {auditLogs.slice(0, 20).map(log => (
            <div key={log.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    log.action === 'grant' || log.action === 'role_assign' ? 'bg-green-100' :
                    log.action === 'revoke' || log.action === 'role_remove' ? 'bg-red-100' :
                    log.action === 'suspend' ? 'bg-red-100' :
                    log.action === 'restore' ? 'bg-green-100' :
                    'bg-blue-100'
                  }`}>
                    {log.action === 'grant' || log.action === 'role_assign' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : log.action === 'revoke' || log.action === 'role_remove' ? (
                      <XCircle className="w-4 h-4 text-red-600" />
                    ) : log.action === 'suspend' ? (
                      <XCircle className="w-4 h-4 text-red-600" />
                    ) : log.action === 'restore' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {log.action.replace('_', ' ').toUpperCase()}: {log.targetUserEmail}
                    </div>
                    <div className="text-sm text-gray-500">
                      {log.capability && `Capability: ${log.capability}`}
                      {log.role && `Role: ${log.role}`}
                      {log.reason && ` • ${log.reason}`}
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>{log.createdAt.toLocaleDateString()}</div>
                  <div>{log.createdAt.toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Access Control</h2>
          <p className="text-gray-600">Manage user permissions and dashboard access</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-800">Live Policy v{policy?.version}</span>
          </div>
          <button 
            onClick={() => rollbackToVersion(policy?.version ? policy.version - 1 : 1)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rollback</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Users & Assignments
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Roles & Presets
          </button>
          <button
            onClick={() => setActiveTab('dashboards')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboards'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Dashboards & Capabilities
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'audit'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Audit & Versions
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'users' && renderUsersTab()}
      {activeTab === 'roles' && renderRolesTab()}
      {activeTab === 'dashboards' && renderDashboardsTab()}
      {activeTab === 'audit' && renderAuditTab()}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-900">Updating access control...</span>
          </div>
        </div>
      )}
    </div>
  )
}