import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-surface p-8 rounded-xl shadow-md border border-border text-center">
        <h2 className="text-2xl font-bold">{t('auth.resetPassword', 'Reset Password')}</h2>
        <p className="text-muted-foreground">Not implemented yet.</p>
        <Link to="/login" className="block text-primary hover:underline">Back to Login</Link>
      </div>
    </div>
  );
}
