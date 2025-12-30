import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle, BookOpen, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await signup(name, email, password, role) as unknown as { success: boolean; message?: string };
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      <div className="px-6 lg:px-12 py-4">
        <Link to="/" className="flex items-center gap-2 w-fit text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md shadow-lg">
          <div className="p-8">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-slate-900">CampusHub</h1>
            </div>
            <p className="text-slate-600 mb-8">Create your account</p>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-3 pt-4">
                <Label>Sign up as</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border">
                    <RadioGroupItem value="admin" id="admin-signup" />
                    <Label htmlFor="admin-signup">Admin</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border">
                    <RadioGroupItem value="faculty" id="faculty-signup" />
                    <Label htmlFor="faculty-signup">Faculty</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border">
                    <RadioGroupItem value="student" id="student-signup" />
                    <Label htmlFor="student-signup">Student</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Signing up...' : 'Sign Up'}
              </Button>
            </form>

            <p className="text-center text-slate-600 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}