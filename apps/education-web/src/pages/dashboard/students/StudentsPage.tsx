import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '../../../hooks/useApiClient';
import { Link } from 'react-router-dom';

export default function StudentsPage() {
  const { t } = useTranslation();
  const api = useApiClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['students', page, search],
    queryFn: () => api.students.list({ page, limit: 10, search })
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('students.title', 'Students')}</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">{t('students.add', 'Add Student')}</button>
      </div>

      <div className="mb-4">
        <input 
          type="text" 
          placeholder={t('common.search', 'Search...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />
      </div>

      {isLoading && <div className="text-gray-500">{t('common.loading', 'Loading...')}</div>}
      {error && <div className="text-red-500">{t('common.error', 'An error occurred')}</div>}

      {!isLoading && !error && data?.items?.length === 0 && (
        <div className="text-center py-8 text-gray-500">{t('students.empty', 'No students found.')}</div>
      )}

      {!isLoading && !error && data?.items?.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('students.admissionNumber', 'Admission No')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('students.name', 'Name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('students.status', 'Status')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.items.map((student: any) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.admissionNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.firstName} {student.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/dashboard/students/${student.id}`} className="text-blue-600 hover:text-blue-900">{t('common.view', 'View')}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border rounded disabled:opacity-50">{t('common.prev', 'Previous')}</button>
        <button disabled={!data || data.items.length < 10} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border rounded disabled:opacity-50">{t('common.next', 'Next')}</button>
      </div>
    </div>
  );
}
