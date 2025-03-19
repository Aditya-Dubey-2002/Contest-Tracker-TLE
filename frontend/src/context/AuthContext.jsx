import { createContext, useContext, useState, useEffect } from "react";

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider component to wrap around the app
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Stores authenticated user info
    const [loading, setLoading] = useState(true);

    // Simulating user authentication check on app load
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Login function (to be connected to API later)
    const login = async (userData) => {
        try {
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData)); // Store user in local storage
            
            // Fetch user profile to get bookmarked contests and reminders
            const response = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
                headers: {
                    Authorization: `Bearer ${userData.token}`
                }
            });
            const userProfile = await response.json();
            
            // Store bookmarked contests and reminders
            const bookmarkedIds = userProfile.bookmarkedContests.map(contest => contest._id);
            const reminderIds = userProfile.reminders.map(reminder => ({
                id: reminder.contest._id,
                type: reminder.type
            }));
            
            localStorage.setItem("bookmarkedContests", JSON.stringify(bookmarkedIds));
            localStorage.setItem("reminderContests", JSON.stringify(reminderIds));
            
            // Now refresh the page after all data is loaded
            window.location.reload();
        } catch (error) {
            console.error("Error fetching user profile:", error);
            // Still refresh even if there's an error, but the bookmarks might not be loaded
            window.location.reload();
        }
    };

    // Logout function
    const logout = () => {
        setUser(null);
        // Clear all relevant localStorage items
        localStorage.removeItem("user");
        localStorage.removeItem("bookmarkedContests");
        localStorage.removeItem("reminderContests");
        window.location.reload(); // Refresh the page after logout
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};
