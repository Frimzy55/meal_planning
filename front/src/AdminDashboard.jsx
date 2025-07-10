// ✅ Correct - has default export
export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="text-center mt-5">
      <h1>Welcome, {user?.fullName || 'Admin'} 🛡️</h1>
      <p>This is your admin dashboard.</p>
    </div>
  );
}
