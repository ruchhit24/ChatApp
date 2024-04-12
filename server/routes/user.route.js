import express from 'express'
import { acceptFriendRequest, forgotPassword, getMyFriends, getMyNotifications, getMyProfile, login, logout, newUser, resetPassword, searchUser, sendFriendRequest, userTestContoller, verifyEmail } from '../controllers/user.controller.js';
import { AvatarUpload } from '../middlewares/multer.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { acceptRequestValidator, loginValidator, registerValidator, sendRequestValidator, validateHandler } from '../utils/validator.js';
import { isResetTokenValid } from '../middlewares/user.js';

export const router = express.Router();


router
.get('/',userTestContoller)
.post('/new',AvatarUpload,registerValidator(),validateHandler,newUser)
.post('/login',loginValidator(),validateHandler,login)
.post('/verify-email',verifyEmail)
.post('/forgot-password',forgotPassword)
.post('/reset-password',isResetTokenValid,resetPassword)


// ab yha se sare routes me authentication required h
router.use(isAuthenticated)
.get("/me",getMyProfile)
.get("/logout",logout)
.get("/search",searchUser)
.put("/sendrequest",sendRequestValidator(),validateHandler,sendFriendRequest)
.put("/acceptrequest",acceptRequestValidator(),validateHandler,acceptFriendRequest)
.get("/notifications",getMyNotifications)
.get("/friends",getMyFriends)
