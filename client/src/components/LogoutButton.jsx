const LogoutButton = () => {
    const [logout] = useLogoutMutation();
    const navigate = useNavigate();
  
    const handleLogout = async () => {
      try {
        await logout().unwrap();
        navigate('/login');
      } catch (err) {
        console.error('Logout failed:', err);
      }
    };
  
    return (
      <button onClick={handleLogout}>
        Logout
      </button>
    );
  };