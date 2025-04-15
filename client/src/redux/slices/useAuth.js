export const useAuth = () => {
  const { data, isLoading, isError } = useGetCurrentUserQuery();
  return {
    user: data?.user,
    isLoading,
    isError,
    isAuthenticated: !!data?.user
  };
};