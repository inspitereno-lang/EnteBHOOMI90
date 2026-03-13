import { useState, useEffect } from 'react';
import { ChevronLeft, User, Mail, Phone, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { toast } from '../components/ui/sonner';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, updateUserDetails } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || user.fullName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsLoading(true);
    try {
      const success = await updateUserDetails({ name, email });
      if (success) {
        navigate('/profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="section-container py-4">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-[#666666] hover:text-[#5bab00] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Profile
          </button>
        </div>
      </div>

      <div className="section-container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-8">Edit Profile</h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" />
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-3 h-14 bg-[#F5F5F5] border-none rounded-xl focus:ring-2 focus:ring-[#5bab00]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Email Address <span className="text-[#999999]">(Optional)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-12 pr-4 py-3 h-14 bg-[#F5F5F5] border-none rounded-xl focus:ring-2 focus:ring-[#5bab00]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" />
                <Input
                  type="tel"
                  value={user?.phone || '+91 9876543210'}
                  disabled
                  className="w-full pl-12 pr-4 py-3 h-14 bg-[#F5F5F5] border-none rounded-xl text-[#666666]"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#22C55E]">
                  <Check className="w-4 h-4" />
                  <span className="text-xs font-medium">Verified</span>
                </div>
              </div>
              <p className="text-xs text-[#999999] mt-2">
                Phone number cannot be changed. Contact support for assistance.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/profile')}
                className="flex-1 py-4 h-14"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="flex-1 btn-primary py-4 h-14"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
