import { useAuth } from '../../context/AuthContext.jsx';
import AdminDashboard from '../../components/AdminDashboard.jsx';

export default function AdminPage() {
  const { user } = useAuth();
  return <AdminDashboard user={user} />;
}
