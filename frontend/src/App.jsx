import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { router } from './router.jsx';
import './styles/variables.css';
import './styles/reset.css';
import './styles/layout.css';
import './styles/forms.css';
import './styles/components.css';
import './styles/animations.css';
import './styles.css';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
