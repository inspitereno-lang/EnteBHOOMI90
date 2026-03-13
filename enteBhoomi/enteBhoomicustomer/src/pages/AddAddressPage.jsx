import { useState } from 'react';
import { ChevronLeft, MapPin, Home, Briefcase, MapPinned } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentPosition, getAddressFromCoords } from '../services/locationService';
import { useStore } from '../context/StoreContext.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { toast } from '../components/ui/sonner';

export default function AddAddressPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editAddress = location.state?.editAddress;
  const returnTo = location.state?.returnTo || '/addresses';
  const { addAddress, updateAddress } = useStore();
  const [addressType, setAddressType] = useState(editAddress?.type || 'home');
  const [name, setName] = useState(editAddress?.name || '');
  const [fullAddress, setFullAddress] = useState(editAddress?.fullAddress || '');
  const [landmark, setLandmark] = useState(editAddress?.landmark || '');
  const [pincode, setPincode] = useState(editAddress?.pincode || '');
  const [phone, setPhone] = useState(editAddress?.phone || '');
  const [isDefault, setIsDefault] = useState(editAddress?.isDefault || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const safeAddress = String(fullAddress || '');
    const safePincode = String(pincode || '');
    const safePhone = String(phone || '');
    const safeName = String(name || '');
    const safeLandmark = String(landmark || '');

    if (!safeName.trim()) {
      toast.error('Please enter a name for this address');
      return;
    }

    if (!safeAddress.trim()) {
      toast.error('Please enter your address');
      return;
    }

    if (!safePincode.trim() || safePincode.length < 6) {
      toast.error('Please enter a valid pincode');
      return;
    }

    if (!safePhone.trim() || safePhone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: safeName.trim(),
        type: addressType,
        fullAddress: safeAddress.trim(),
        landmark: safeLandmark.trim() || undefined,
        pincode: safePincode.trim(),
        phone: safePhone.trim(),
        isDefault,
      };

      let success;
      if (editAddress) {
        success = await updateAddress(editAddress._id, payload);
      } else {
        success = await addAddress(payload);
      }

      if (success) {
        toast.success(editAddress ? 'Address updated successfully!' : 'Address saved successfully!');
        navigate(returnTo, { state: { from: location.state?.from } });
      }
    } catch (error) {
      toast.error('Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="section-container py-4">
          <button
            onClick={() => navigate(returnTo, { state: { from: location.state?.from } })}
            className="flex items-center gap-2 text-[#666666] hover:text-[#5bab00] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Addresses
          </button>
        </div>
      </div>

      <div className="section-container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-8">
            {editAddress ? 'Edit Address' : 'Add New Address'}
          </h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-3">
                Address Type
              </label>
              <div className="flex gap-3">
                {['home', 'work', 'other'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAddressType(type)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${addressType === type
                      ? 'border-[#5bab00] bg-[#f1f7e8] text-[#5bab00]'
                      : 'border-[#E5E5E5] text-[#666666] hover:border-[#5bab00]/50'
                      }`}
                  >
                    {type === 'home' && <Home className="w-4 h-4" />}
                    {type === 'work' && <Briefcase className="w-4 h-4" />}
                    {type === 'other' && <MapPinned className="w-4 h-4" />}
                    <span className="capitalize font-medium">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Name <span className="text-[#E85A24]">*</span>
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Home, Office, John Doe"
                className="w-full px-4 py-3 h-12 bg-[#F5F5F5] border-none rounded-xl focus:ring-2 focus:ring-[#5bab00]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Full Address <span className="text-[#E85A24]">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-[#999999]" />
                <textarea
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  placeholder="Enter your complete address (House no., Street, Area, City, Pincode)"
                  rows={3}
                  className="w-full pl-12 pr-4 py-3 bg-[#F5F5F5] border-none rounded-xl focus:ring-2 focus:ring-[#5bab00]/20 resize-none"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setIsLoading(true);
                      toast.info('Detecting location...', { duration: 1000 });
                      const coords = await getCurrentPosition();
                      const address = await getAddressFromCoords(coords.lat, coords.lng);

                      setFullAddress(address.formatted);
                      if (address.details.postcode) {
                        setPincode(address.details.postcode);
                      }
                      toast.success('Address filled from location!');
                    } catch (error) {
                      toast.error('Could not detect location');
                      console.error(error);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="absolute right-2 bottom-2 text-xs font-medium text-[#5bab00] hover:bg-[#f1f7e8] px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  <MapPinned className="w-3 h-3" />
                  Use Current Location
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Pincode <span className="text-[#E85A24]">*</span>
              </label>
              <Input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="682001"
                className="w-full px-4 py-3 h-12 bg-[#F5F5F5] border-none rounded-xl focus:ring-2 focus:ring-[#5bab00]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Landmark <span className="text-[#999999]">(Optional)</span>
              </label>
              <Input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g., Near City Mall, Opposite Metro Station"
                className="w-full px-4 py-3 h-12 bg-[#F5F5F5] border-none rounded-xl focus:ring-2 focus:ring-[#5bab00]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Phone Number <span className="text-[#E85A24]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A] font-medium">
                  +91
                </span>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="w-full pl-14 pr-4 py-3 h-12 bg-[#F5F5F5] border-none rounded-xl focus:ring-2 focus:ring-[#5bab00]/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDefault(!isDefault)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isDefault
                  ? 'bg-[#5bab00] border-[#5bab00]'
                  : 'border-[#999999] hover:border-[#5bab00]'
                  }`}
              >
                {isDefault && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className="text-[#1A1A1A]">Set as default address</span>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(returnTo, { state: { from: location.state?.from } })}
                className="flex-1 py-4 h-14"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !String(fullAddress || '').trim()}
                className="flex-1 btn-primary py-4 h-14"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  editAddress ? 'Update Address' : 'Save Address'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
