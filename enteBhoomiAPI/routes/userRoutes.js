import express from 'express';
import { userSignup, userLogin, updateDetails, getUserDetails, deleteUserDetails, verifyOTP, requestOTP, addAddress, getAllAddresses, setDefaultAddress, updateAddress, deleteAddress, createGuestToken } from '../controller/userController.js';
import { getAllUserDetails, getStoresDetails } from '../controller/adminController.js'
import protect from '../middleWare/userMiddleWare.js'

const app = express.Router()

app.route('/').post(requestOTP).get(getAllUserDetails)
app.route('/guest').post(createGuestToken)
app.route('/getUser').get(protect, getUserDetails)
app.route('/login').post(userLogin)
app.route('/request-otp').post(requestOTP)
app.route('/verify-otp').post(verifyOTP)
app.route('/stores').get(getStoresDetails)
app.route("/").put(protect, updateDetails).delete(deleteUserDetails)
app.route('/address').post(protect, addAddress).get(protect, getAllAddresses)
app.route('/address/default/:addressId').patch(protect, setDefaultAddress)
app.route('/address/:addressId').put(protect, updateAddress).delete(protect, deleteAddress)


export default app