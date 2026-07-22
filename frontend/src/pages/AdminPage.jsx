import { useAuth } from '../context/AuthContext.jsx';
import AdminDashboard from '../components/admin/AdminDashboard.jsx';

export default function AdminPage() {
  const { user } = useAuth();
  return <AdminDashboard user={user} />;
}
