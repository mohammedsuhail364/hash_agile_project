import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const token=localStorage.getItem('token');
  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      const { token, username: name } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('username', name);

      navigate('/chat');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };
  useEffect(()=>{
    if(token){
      navigate('/chat')
    }
  },[])

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Login</h1>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full p-2 border mb-2" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full p-2 border mb-4" />
      <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded w-full">Login</button>
      <p className="mt-2 text-sm text-center">Don't have an account? <Link to="/signup" className="text-blue-600">Signup</Link></p>
    </div>
  );
}
