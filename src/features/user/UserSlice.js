import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
	name: "user",
	initialState: {
		user: false,
		userData: null,
	},
	reducers: {
		fetchuser: (state, action) => {
			let token = localStorage.getItem("token");
			if (token) {
				state.user = true;
			}
		},
		setUserTrue: (state, action) => {
			state.user = true;
		},
		setUserData: (state, action) => {
			state.userData = action.payload;
			state.user = true;
			localStorage.setItem("user", JSON.stringify(action.payload));
		},
		getUserData: (state, action) => {
			let local = localStorage.getItem("user");
			if (local) {
				state.userData = JSON.parse(local);
				state.user = true;
			}
		},
	},
});

export const { fetchuser, setUserTrue, setUserData, getUserData } = userSlice.actions;

export default userSlice.reducer;
