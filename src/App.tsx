import { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { UserProvider } from './lib/UserContext';
import { Toaster } from './components/ui/sonner';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import AudiovisualDashboard from './components/AudiovisualDashboard';
import ConsultorDashboard from './components/ConsultorDashboard';
// Se añade la extensión .tsx explícitamente para evitar problemas de resolución en modo bundler
import ConsultorDocenteDashboard from './components/ConsultorDocenteDashboard';
import ConsultorEstudianteDashboard from './components/ConsultorEstudianteDashboard';
import { initializeDatabase } from './lib/seed-data';
import { AuthService } from './lib/auth';
import type { Usuario } from './lib/models';

// Tipos de usuario: Admin, Usuario Autorizado, Consultor
export type UserRole = 'admin' | 'autorizado' | 'consultor' | 'consultorDocente' | 'consultorEstudiante' | null;

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar la base de datos al montar el componente
  useEffect(() => {
    console.log('🚀 Inicializando aplicación...');
    initializeDatabase();
    
    // Verificar si hay sesión activa
    const session = AuthService.getSession();
    if (session) {
      console.log('✅ Sesión activa detectada:', session.nombre);
      setUserRole(session.rol);
      setUserName(session.nombre);
      setCurrentUser(session);
    }
    
    setIsInitialized(true);
  }, []);

  const handleLogin = (role: UserRole, name: string, usuario: Usuario) => {
    console.log('✅ Login exitoso:', name, role);
    setUserRole(role);
    setUserName(name);
    setCurrentUser(usuario);
  };

  const handleLogout = () => {
    console.log('👋 Cerrando sesión...');
    AuthService.logout();
    setUserRole(null);
    setUserName('');
    setCurrentUser(null);
  };

  // Mostrar loading mientras se inicializa
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Inicializando sistema...</p>
        </div>
      </div>
    );
  }

  // Renderiza el dashboard según el tipo de usuario
  const renderDashboard = () => {
    // Admin: Dashboard completo con todos los permisos
    if (userRole === 'admin') {
      return <AdminDashboard userName={userName} onLogout={handleLogout} userRole={userRole} />;
    }
    // Autorizado: Dashboard específico para gestión de préstamos y recursos
    if (userRole === 'autorizado') {
      return <AudiovisualDashboard userName={userName} onLogout={handleLogout} />;
    }
    // Consultor General: solo lectura
    if (userRole === 'consultor') {
      return <ConsultorDashboard userName={userName} onLogout={handleLogout} />;
    }
    // Consultor Docente: gestión de horario y préstamos personales
    if (userRole === 'consultorDocente') {
      return <ConsultorDocenteDashboard userName={userName} onLogout={handleLogout} />;
    }
    // Consultor Estudiante: consulta de horario propio
    if (userRole === 'consultorEstudiante') {
      return <ConsultorEstudianteDashboard userName={userName} onLogout={handleLogout} />;
    }
    return null;
  };

  return (
    <ThemeProvider>
      <UserProvider usuario={currentUser}>
        {!userRole ? (
          <Login onLogin={handleLogin} />
        ) : (
          renderDashboard()
        )}
        <Toaster position="bottom-right" />
      </UserProvider>
    </ThemeProvider>
  );
}
