import apolloClient from "@/lib/apollo-client";

/**
 * Clear Apollo Client cache
 */
export const clearCache = () => {
	apolloClient.cache.reset();
};

/**
 * Refetch all active queries
 */
export const refetchQueries = () => {
	apolloClient.refetchQueries({
		include: "active",
	});
};

/**
 * Set authentication token for future requests
 * @param {string} token - JWT or auth token
 */
export const setAuthToken = (token) => {
	if (typeof window !== "undefined") {
		if (token) {
			localStorage.setItem("authToken", token);
		} else {
			localStorage.removeItem("authToken");
		}
	}
};

/**
 * Get current authentication token
 * @returns {string|null} - Current auth token
 */
export const getAuthToken = () => {
	if (typeof window !== "undefined") {
		return localStorage.getItem("authToken");
	}
	return null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} - Authentication status
 */
export const isAuthenticated = () => {
	return !!getAuthToken();
};

/**
 * Logout user by clearing token and cache
 */
export const logout = () => {
	setAuthToken(null);
	clearCache();
};
