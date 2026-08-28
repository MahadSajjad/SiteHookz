const fs = require('fs');
const path = require('path');

const baseDir = 'apps/education-web/src/pages/dashboard';
fs.mkdirSync(path.join(baseDir, 'students'), { recursive: true });
fs.mkdirSync(path.join(baseDir, 'guardians'), { recursive: true });
fs.mkdirSync(path.join(baseDir, 'staff'), { recursive: true });

const studentPage = `
export default function StudentsPage() {
  return <div className="p-6"><h1>Students</h1></div>;
}
`;
fs.writeFileSync(path.join(baseDir, 'students', 'StudentsPage.tsx'), studentPage, 'utf8');
fs.writeFileSync(path.join(baseDir, 'students', 'StudentDetailPage.tsx'), `export default function StudentDetailPage() { return <div className="p-6"><h1>Student Detail</h1></div>; }`, 'utf8');

fs.writeFileSync(path.join(baseDir, 'guardians', 'GuardiansPage.tsx'), `export default function GuardiansPage() { return <div className="p-6"><h1>Guardians</h1></div>; }`, 'utf8');
fs.writeFileSync(path.join(baseDir, 'staff', 'StaffPage.tsx'), `export default function StaffPage() { return <div className="p-6"><h1>Staff</h1></div>; }`, 'utf8');

const routerFile = 'apps/education-web/src/router/index.tsx';
let router = fs.readFileSync(routerFile, 'utf8');

router = `
import StudentsPage from '../pages/dashboard/students/StudentsPage';
import GuardiansPage from '../pages/dashboard/guardians/GuardiansPage';
import StaffPage from '../pages/dashboard/staff/StaffPage';
` + router;

router = router.replace(/{\s*path:\s*'\/dashboard',\s*element:\s*<DashboardLayout \/>,\s*children:\s*\[/, `
      { path: '/dashboard', element: <DashboardLayout />, children: [
        { path: 'students', element: <StudentsPage /> },
        { path: 'guardians', element: <GuardiansPage /> },
        { path: 'staff', element: <StaffPage /> },
`);

fs.writeFileSync(routerFile, router, 'utf8');
