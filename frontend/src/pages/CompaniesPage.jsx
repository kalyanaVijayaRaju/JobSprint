import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import CompanyDirectory from '../components/CompanyDirectory.jsx';

export default function CompaniesPage() {
  const { user } = useAuth();
  const { triggerAlert } = useApp();

  return (
    <CompanyDirectory user={user} triggerAlert={triggerAlert} />
  );
}
