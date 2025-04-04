import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', { username, password });
      if (res.status === 200) {
        navigate('/');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Signup</h1>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full p-2 border mb-2" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full p-2 border mb-4" />
      <button onClick={handleSignup} className="bg-green-500 text-white px-4 py-2 rounded w-full">Signup</button>
      <p className="mt-2 text-sm text-center">Already have an account? <Link to="/" className="text-blue-600">Login</Link></p>
    </div>
  );
}
