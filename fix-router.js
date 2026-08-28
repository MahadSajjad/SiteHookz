const fs = require('fs');
let router = fs.readFileSync('apps/education-web/src/router/index.tsx', 'utf8');

router = router.replace(/\{\s*path:\s*'\/dashboard',\s*element:\s*<DashboardPage \/>\s*\}/, `{ path: '/dashboard', element: <DashboardPage /> },
      { path: '/dashboard/students', element: <StudentsPage /> },
      { path: '/dashboard/guardians', element: <GuardiansPage /> },
      { path: '/dashboard/staff', element: <StaffPage /> }`);

fs.writeFileSync('apps/education-web/src/router/index.tsx', router, 'utf8');
