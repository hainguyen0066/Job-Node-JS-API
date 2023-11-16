const express = require('express');
const router = express.Router();

const {
	getUserProfile,
	updatePassword,
	updateUser,
	deleteUser,
	getAppliedJobs,
	getPublishedJobs,
	getUsers,
	deleteUserAdmin
} = require('../controllers/userController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.route('/password/update').post(isAuthenticatedUser, updatePassword);
router.route('/me').get(isAuthenticatedUser, getUserProfile);
router.route('/me/update').put(isAuthenticatedUser, updateUser);
router.route('/me/delete').delete(isAuthenticatedUser, deleteUser);

router.route('/jobs/applied').get(isAuthenticatedUser, authorizeRoles('user'),(getAppliedJobs));
router
	.route('/jobs/published')
	.get(isAuthenticatedUser, authorizeRoles('employeer'), getPublishedJobs);

// Admin only routes
router
	.route('/users')
	.get(isAuthenticatedUser, authorizeRoles('admin'), getUsers);
router
	.route('/user/:id')
	.delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUserAdmin);

module.exports = router;