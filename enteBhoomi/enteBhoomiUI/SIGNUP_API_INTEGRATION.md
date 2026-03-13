# Store Signup API Integration - Summary

## Overview
Successfully integrated the `storeSignup` API from the backend into the multi-step signup flow of the Ente Bhoomi vendor web application.

## Changes Made

### 1. **API Configuration** (`src/config/api.js`)
- Created a centralized API configuration file
- Defined base URL using environment variable with fallback: `VITE_API_URL` or `http://localhost:5000`
- Added all store-related API endpoints

### 2. **Application State Management** (`src/App.jsx`)
- **Updated `userData` state** to include all fields required by the storeSignup API:
  - Basic signup: `businessName`, `ownerName`, `email`, `mobileNumber`, `password`
  - Store setup: `storeName`, `businessAddress`, `storeLocation`
  - KYC: `panNumber`, `aadhaarOrLicenseImage`, `fssaiCertificate`, `bankDetails`
  - GST: `gstDetails` (gstNumber, gstType, gstCertificate)
- Updated logout function to reset all new fields
- Added `updateUserData` prop to KYCScreen and GSTScreen components

### 3. **SignupScreen** (`src/screens/SignupScreen.jsx`)
- Updated to store `mobileNumber` instead of `mobile` (backend field name)
- Now stores `password` in userData for later API submission
- Data is collected and stored locally, no API call at this step

### 4. **StoreSetupScreen** (`src/screens/StoreSetupScreen.jsx`)
- Updated field names to match backend expectations:
  - `businessAddress` (instead of `address`)
  - `storeLocation` (instead of `location`)
- Data is collected and stored locally, no API call at this step

### 5. **KYCScreen** (`src/screens/KYCScreen.jsx`)
- Added `updateUserData` prop
- Modified `handleFileUpload` to store actual `File` objects (not just metadata)
- Updated `handleSubmit` to save KYC data to userData:
  - PAN number
  - Aadhaar/License image file
  - FSSAI certificate file
  - Bank details (account number, IFSC, branch, passbook image)
- Data is collected and stored locally, no API call at this step

### 6. **GSTScreen** (`src/screens/GSTScreen.jsx`) - **MAIN INTEGRATION POINT**
- **Imported API configuration**
- Added `updateUserData` and `userData` props
- Added `apiError` state for error handling
- Modified `handleFileUpload` to store actual `File` object
- **Completely rewrote `handleSubmit`** to:
  1. Create FormData object for file uploads
  2. Append all collected data from previous steps
  3. Append GST details from current step
  4. Attach all file uploads (aadhaar/license, FSSAI, passbook, GST certificate)
  5. Make POST request to `/store/signup` endpoint
  6. Handle success/error responses
  7. Store returned store ID and show success screen on completion
- Added error display UI to show API errors to users

## Data Flow

```
Step 1: SignupScreen
  ↓ (stores businessName, ownerName, email, mobileNumber, password)
  
Step 2: StoreSetupScreen
  ↓ (adds storeName, businessAddress, storeLocation)
  
Step 3: KYCScreen
  ↓ (adds panNumber, files, bankDetails)
  
Step 4: GSTScreen
  ↓ (adds gstDetails, submits ALL data to API)
  
API Call: POST /store/signup
  ↓
Success → Dashboard
Error → Show error message, allow retry
```

## API Request Format

The final API call sends a FormData object with:

**Text Fields:**
- `businessName`, `ownerName`, `mobileNumber`, `email`, `password`
- `storeName`, `businessAddress`, `storeLocation`, `panNumber`
- `bankDetails[accountNumber]`, `bankDetails[ifscCode]`, `bankDetails[branch]`
- `gstDetails[gstNumber]`, `gstDetails[gstType]`

**File Fields:**
- `aadhaarOrLicenseImage` - File
- `fssaiCertificate` - File
- `passbookImage` - File (optional)
- `gstCertificate` - File (optional)

## Environment Setup

To configure the API URL, create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000
# or for production:
# VITE_API_URL=https://your-api-domain.com
```

If not set, it defaults to `http://localhost:5000`.

## Error Handling

- Client-side validation on each step
- API errors displayed in a user-friendly alert box
- Console logging for debugging
- Loading states to prevent duplicate submissions

## Testing Recommendations

1. **Test the complete flow:**
   - Fill out all 4 steps
   - Verify all data is collected properly
   - Check that API call is made with correct format

2. **Test file uploads:**
   - Ensure files are properly attached
   - Verify file size limits
   - Test with different file types (PDF, JPG, PNG)

3. **Test error scenarios:**
   - Missing required fields
   - Invalid credentials
   - Network errors
   - Server validation errors

4. **Test environment variables:**
   - Verify API URL configuration works
   - Test with different base URLs

## Next Steps

1. Create `.env` file with your backend API URL
2. Ensure backend server is running
3. Test the complete signup flow
4. Handle authentication tokens after successful signup
5. Consider adding email verification or OTP if required
