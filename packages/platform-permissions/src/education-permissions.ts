import { PermissionDefinition } from './platform-permissions';

export const EDUCATION_PERMISSIONS: PermissionDefinition[] = [
  { key: 'education.academic_sessions.read', description: 'Read academic sessions', category: 'Education' },
  { key: 'education.academic_sessions.create', description: 'Create academic sessions', category: 'Education' },
  { key: 'education.academic_sessions.update', description: 'Update academic sessions', category: 'Education' },
  { key: 'education.academic_sessions.archive', description: 'Archive academic sessions', category: 'Education' },
];
