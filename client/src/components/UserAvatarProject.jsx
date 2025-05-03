import { useGetCurrentUserQuery } from '../redux/slices/apiSlice';
import { getInitials } from '../utils/userUtils';


const ProjectUserAvatar = ({ user }) => {
    // If this is the current user, add a "You" badge
    const { data: currentUser } = useGetCurrentUserQuery();
    const isCurrentUser = currentUser?.user?._id === user._id;

    return (
        <div className="flex items-center">
            {user.profilePicture ? (
                <img
                    src={user.profilePicture}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-8 h-8 rounded-full object-cover"
                />
            ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {getInitials(user.firstName, user.lastName)}
                </div>
            )}
            <div className="ml-3">
                <span className="text-gray-700">
                    {user.firstName} {user.lastName}
                    {isCurrentUser && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            You
                        </span>
                    )}
                </span>
                {user.role && (
                    <span className="block text-xs text-gray-500 capitalize">{user.role}</span>
                )}
            </div>
        </div>
    );
};

export default ProjectUserAvatar;