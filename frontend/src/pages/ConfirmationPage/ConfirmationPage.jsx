import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import apiClient from "../../utils/apiClient";

const ConfirmationPage = () => {
	const { user, setUser } = useContext(AuthContext);
	const [name, setName] = useState(user?.name || "");
	const [email, setEmail] = useState(user?.email || "");
	const [editing, setEditing] = useState(false);
	const [message, setMessage] = useState("");
	const [resetPassword, setResetPassword] = useState(false);
	const [newPassword, setNewPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSave = async () => {
		setLoading(true);
		try {
			const res = await apiClient.put("/user/profile", { name, email });
			setUser({ ...user, name, email });
			setMessage("Profile updated successfully.");
			setEditing(false);
		} catch (err) {
			setMessage("Error updating profile.");
		}
		setLoading(false);
	};

	const handlePasswordReset = async () => {
		setLoading(true);
		try {
			await apiClient.post("/user/reset-password", { password: newPassword });
			setMessage("Password reset successfully.");
			setResetPassword(false);
			setNewPassword("");
		} catch (err) {
			setMessage("Error resetting password.");
		}
		setLoading(false);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-bgPrimary">
			<div className="bg-bgSecondary p-8 rounded-lg shadow-lg w-full max-w-md">
				<h2 className="text-2xl font-bold mb-6 text-primary">Profile</h2>
				{message && <div className="mb-4 text-accent">{message}</div>}
				<div className="mb-4">
					<label className="block text-sm font-medium text-label mb-1">Name</label>
					<input
						type="text"
						value={name}
						onChange={e => setName(e.target.value)}
						disabled={!editing}
						className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary bg-bgInput text-textPrimary"
					/>
				</div>
				<div className="mb-4">
					<label className="block text-sm font-medium text-label mb-1">Email</label>
					<input
						type="email"
						value={email}
						onChange={e => setEmail(e.target.value)}
						disabled={!editing}
						className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary bg-bgInput text-textPrimary"
					/>
				</div>
				{editing ? (
					<button
						onClick={handleSave}
						disabled={loading}
						className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primaryDark transition mb-2"
					>
						{loading ? "Saving..." : "Save Changes"}
					</button>
				) : (
					<button
						onClick={() => setEditing(true)}
						className="w-full py-2 px-4 bg-accent text-white rounded hover:bg-accentDark transition mb-2"
					>
						Edit Profile
					</button>
				)}
				<button
					onClick={() => setResetPassword(!resetPassword)}
					className="w-full py-2 px-4 bg-secondary text-white rounded hover:bg-secondaryDark transition"
				>
					{resetPassword ? "Cancel" : "Reset Password"}
				</button>
				{resetPassword && (
					<div className="mt-4">
						<label className="block text-sm font-medium text-label mb-1">New Password</label>
						<input
							type="password"
							value={newPassword}
							onChange={e => setNewPassword(e.target.value)}
							className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary bg-bgInput text-textPrimary"
						/>
						<button
							onClick={handlePasswordReset}
							disabled={loading}
							className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primaryDark transition mt-2"
						>
							{loading ? "Resetting..." : "Confirm Reset"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default ConfirmationPage;
