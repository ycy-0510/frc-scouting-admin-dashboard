'use client';

import { useState, useEffect, useRef } from 'react';

interface Member {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  disabled: boolean;
}

interface EditMemberDialogProps {
  isOpen: boolean;
  member: Member | null;
  currentUserUid: string;
  onSave: (uid: string, updates: { displayName?: string; role?: string }) => Promise<void>;
  onClose: () => void;
}

export default function EditMemberDialog({
  isOpen,
  member,
  currentUserUid,
  onSave,
  onClose,
}: EditMemberDialogProps) {
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('');
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const isSelf = member?.uid === currentUserUid;

  useEffect(() => {
    if (member) {
      setDisplayName(member.displayName);
      setRole(member.role);
    }
  }, [member]);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!member) return;
    
    setSaving(true);
    try {
      const updates: { displayName?: string; role?: string } = {};
      
      if (displayName !== member.displayName) {
        updates.displayName = displayName;
      }
      
      if (role !== member.role && !isSelf) {
        updates.role = role;
      }
      
      if (Object.keys(updates).length > 0) {
        await onSave(member.uid, updates);
      }
      onClose();
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !member) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 bg-transparent p-0"
      onClose={onClose}
    >
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
          <h3 className="text-xl font-semibold text-sky-900 mb-4">Edit Member</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-sky-800 mb-1">
                Email
              </label>
              <input
                type="text"
                value={member.email}
                disabled
                className="w-full px-3 py-2 border border-sky-200 rounded-lg bg-sky-50 text-sky-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sky-800 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sky-800 mb-1">
                Role
                {isSelf && (
                  <span className="text-sky-400 font-normal ml-2">
                    (Cannot change own role)
                  </span>
                )}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isSelf}
                className={`w-full px-3 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 ${
                  isSelf ? 'bg-sky-50 text-sky-600 cursor-not-allowed' : ''
                }`}
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium text-sky-700 hover:bg-sky-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
