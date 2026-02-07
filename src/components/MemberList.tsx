'use client';

import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import EditMemberDialog from './EditMemberDialog';

interface Member {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  disabled: boolean;
  createdAt?: string;
}

interface MemberListProps {
  members: Member[];
  currentUserUid: string;
  currentUserRole?: string;
  teamId: string;
  onRefresh: () => void;
}

export default function MemberList({
  members,
  currentUserUid,
  currentUserRole,
  teamId,
  onRefresh,
}: MemberListProps) {
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [editTarget, setEditTarget] = useState<Member | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    setLoading(deleteTarget.uid);
    try {
      const response = await fetch(
        `/api/teams/${teamId}/members/${deleteTarget.uid}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
      }
      
      onRefresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setLoading(null);
      setDeleteTarget(null);
    }
  };

  const handleToggleDisable = async (member: Member) => {
    setLoading(member.uid);
    try {
      const response = await fetch(
        `/api/teams/${teamId}/members/${member.uid}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ disabled: !member.disabled }),
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Update failed');
      }
      
      onRefresh();
    } catch (error) {
      console.error('Toggle disable error:', error);
      alert(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setLoading(null);
    }
  };

  const handleSaveEdit = async (uid: string, updates: { displayName?: string; role?: string }) => {
    const response = await fetch(`/api/teams/${teamId}/members/${uid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Update failed');
    }
    
    onRefresh();
  };

  const getRoleBadgeStyle = (role: string) => {
    if (role === 'admin') {
      return 'bg-sky-100 text-sky-800 border-sky-200';
    }
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-sky-50 border-b border-sky-100">
                <th className="text-left px-6 py-4 text-sm font-semibold text-sky-900">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-sky-900">
                  Name
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-sky-900">
                  Role
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-sky-900">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-sky-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const isSelf = member.uid === currentUserUid;
                const isProcessing = loading === member.uid;
                
                return (
                  <tr
                    key={member.uid}
                    className="border-b border-sky-50 hover:bg-sky-25 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sky-900">{member.email}</span>
                        {isSelf && (
                          <span className="text-xs bg-sky-500 text-white px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sky-700">
                      {member.displayName || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getRoleBadgeStyle(
                          member.role
                        )}`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {member.disabled ? (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Disabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditTarget(member)}
                          disabled={isProcessing}
                          className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        
                        {!isSelf && (
                          <>
                            <button
                              onClick={() => handleToggleDisable(member)}
                              disabled={isProcessing}
                              className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                                member.disabled
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-amber-600 hover:bg-amber-50'
                              }`}
                              title={member.disabled ? 'Enable' : 'Disable'}
                            >
                              {member.disabled ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              )}
                            </button>
                            
                            <button
                              onClick={() => setDeleteTarget(member)}
                              disabled={isProcessing}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {members.length === 0 && (
          <div className="p-8 text-center text-sky-600">
            No members found
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Member"
        message={`Are you sure you want to delete ${deleteTarget?.email}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isDestructive
      />

      <EditMemberDialog
        isOpen={!!editTarget}
        member={editTarget}
        currentUserUid={currentUserUid}
        currentUserRole={currentUserRole}
        onSave={handleSaveEdit}
        onClose={() => setEditTarget(null)}
      />
    </>
  );
}
