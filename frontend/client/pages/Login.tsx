// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card } from '@/components/ui/card';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { AlertCircle, BookOpen, ArrowLeft } from 'lucide-react';
// import { useAuth } from '@/hooks/useAuth';
// import { UserRole } from '@/types';

// export default function Login() {
//   const navigate = useNavigate();
//   const { login } = useAuth();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [role, setRole] = useState<UserRole>('student');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (!email || !password) {
//       setError('Please fill in all fields');
//       return;
//     }

//     if (password.length < 6) {
//       setError('Password must be at least 6 characters');
//       return;
//     }

//     setLoading(true);
//     try {
//       login(email, password, role);
//       navigate('/dashboard');
//     } catch (err) {
//       setError('Login failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
//       {/* Header */}
//       <div className="px-6 lg:px-12 py-4">
//         <Link to="/" className="flex items-center gap-2 w-fit text-slate-600 hover:text-slate-900">
//           <ArrowLeft className="w-4 h-4" />
//           Back to Home
//         </Link>
//       </div>

//       {/* Login Container */}
//       <div className="flex-1 flex items-center justify-center px-6 py-12">
//         <Card className="w-full max-w-md shadow-medium animate-slide-in-up">
//           <div className="p-8">
//             {/* Header */}
//             <div className="flex items-center gap-2 mb-2">
//               <BookOpen className="w-6 h-6 text-primary" />
//               <h1 className="text-2xl font-bold text-slate-900">CampusHub</h1>
//             </div>
//             <p className="text-slate-600 mb-8">Sign in to your account</p>

//             {/* Error Alert */}
//             {error && (
//               <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex gap-3">
//                 <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//                 <p className="text-sm text-red-600">{error}</p>
//               </div>
//             )}

//             {/* Form */}
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Email */}
//               <div className="space-y-2">
//                 <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="you@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="bg-slate-50 border-slate-200"
//                 />
//               </div>

//               {/* Password */}
//               <div className="space-y-2">
//                 <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="bg-slate-50 border-slate-200"
//                 />
//               </div>

//               {/* Role Selection */}
//               <div className="space-y-3 pt-4">
//                 <Label className="text-slate-700 font-medium">Login as</Label>
//                 <RadioGroup value={role} onValueChange={(value) => setRole(value as UserRole)}>
//                   <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
//                     <RadioGroupItem value="admin" id="admin" />
//                     <Label htmlFor="admin" className="flex-1 cursor-pointer mb-0">
//                       <span className="font-medium text-slate-900">Admin</span>
//                       <span className="text-sm text-slate-500 block">Full access to manage all resources</span>
//                     </Label>
//                   </div>
//                   <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
//                     <RadioGroupItem value="faculty" id="faculty" />
//                     <Label htmlFor="faculty" className="flex-1 cursor-pointer mb-0">
//                       <span className="font-medium text-slate-900">Faculty</span>
//                       <span className="text-sm text-slate-500 block">Book classes and manage availability</span>
//                     </Label>
//                   </div>
//                   <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
//                     <RadioGroupItem value="student" id="student" />
//                     <Label htmlFor="student" className="flex-1 cursor-pointer mb-0">
//                       <span className="font-medium text-slate-900">Student</span>
//                       <span className="text-sm text-slate-500 block">View schedules and borrow books</span>
//                     </Label>
//                   </div>
//                 </RadioGroup>
//               </div>

//               {/* Submit Button */}
//               <Button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5"
//               >
//                 {loading ? 'Signing in...' : 'Sign In'}
//               </Button>
//             </form>

//             {/* Divider */}
//             <div className="relative my-6">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-slate-200"></div>
//               </div>
//               <div className="relative flex justify-center text-sm">
//                 <span className="px-2 bg-white text-slate-500">or</span>
//               </div>
//             </div>

//             {/* Sign Up Link */}
//             <p className="text-center text-slate-600">
//               Don't have an account?{' '}
//               <Link to="/signup" className="text-primary font-medium hover:underline">
//                 Sign up
//               </Link>
//             </p>

//             {/* Demo Credentials */}
//             <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
//               <p className="text-xs font-medium text-blue-900 mb-2">Demo Credentials</p>
//               <p className="text-xs text-blue-800">
//                 Email: <code className="font-mono">demo@example.com</code>
//               </p>
//               <p className="text-xs text-blue-800">
//                 Password: <code className="font-mono">123456</code>
//               </p>
//             </div>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }

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

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, role);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
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
            <p className="text-slate-600 mb-8">Sign in to your account</p>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                <Label>Login as</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="flex-1 cursor-pointer">
                      <span className="font-medium text-slate-900">Admin</span>
                      <span className="text-sm text-slate-500 block">Full access to manage all resources</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200">
                    <RadioGroupItem value="faculty" id="faculty" />
                    <Label htmlFor="faculty" className="flex-1 cursor-pointer">
                      <span className="font-medium text-slate-900">Faculty</span>
                      <span className="text-sm text-slate-500 block">Book classes and manage availability</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student" className="flex-1 cursor-pointer">
                      <span className="font-medium text-slate-900">Student</span>
                      <span className="text-sm text-slate-500 block">View schedules and borrow books</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className="text-center text-slate-600 mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
