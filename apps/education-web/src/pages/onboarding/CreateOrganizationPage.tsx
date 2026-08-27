import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

const orgSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  type: z.string(),
  timezone: z.string(),
  currency: z.string(),
});

type OrgForm = z.infer<typeof orgSchema>;

export function CreateOrganizationPage() {
  const { t } = useTranslation();
  
  const { register, watch, handleSubmit, formState: { errors } } = useForm<OrgForm>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      type: 'school',
      timezone: 'UTC',
      currency: 'USD',
    }
  });

  const slugValue = watch('slug');

  const onSubmit = (data: OrgForm) => {
    console.log(data);
  };

  return (
    <div className="min-h-screen bg-surface-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-surface p-8 rounded-xl shadow-md border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-6">Create Organization</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground">Organization Name</label>
            <input
              type="text"
              {...register('name')}
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-background"
            />
            {errors.name && <p className="mt-1 text-sm text-danger">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Organization Slug</label>
            <input
              type="text"
              {...register('slug')}
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-background"
            />
            {slugValue && (
              <p className="mt-2 text-sm text-muted-foreground">
                Your portal will be available at: <span className="font-semibold text-foreground">{slugValue}.sitehookz.com</span>
              </p>
            )}
            {errors.slug && <p className="mt-1 text-sm text-danger">{errors.slug.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground">Institution Type</label>
              <select
                {...register('type')}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-background"
              >
                <option value="school">School</option>
                <option value="college">College</option>
                <option value="university">University</option>
                <option value="institute">Institute</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Timezone</label>
              <select
                {...register('timezone')}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-background"
              >
                <option value="UTC">UTC</option>
                <option value="Asia/Karachi">Asia/Karachi</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Create Organization
          </button>
        </form>
      </div>
    </div>
  );
}
