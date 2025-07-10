export default function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="text-center mt-5">
      <h1>Welcome, {user?.fullName || 'Student'} 🎓</h1>
      <p>This is your student dashboard.</p>
    </div>
  );
}
