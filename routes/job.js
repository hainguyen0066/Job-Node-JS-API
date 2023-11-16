const express = require('express');
const router = express.Router();

const {
	getJobs,
	newJob,
	getJobsInRadius,
	updateJob,
	deleteJob,
	getJob,
	jobStats,
	applyJob
} = require('../controllers/jobsController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.route('/jobs').get(getJobs);
router
	.route('/jobs/new')
	.post(isAuthenticatedUser, authorizeRoles('user', 'employeer'), newJob);
router.route('/jobs/:zipcode/:distance').get(getJobsInRadius);
router.route('/stats/:topic').get(jobStats);

router
	.route('/job/:id/')
	.put(isAuthenticatedUser, authorizeRoles('user', 'employeer'), updateJob)
	.delete(isAuthenticatedUser, authorizeRoles('user', 'employeer'), deleteJob);

router.route('/job/:id/:slug').get(getJob);

router
	.route('/job/:id/apply')
	.put(isAuthenticatedUser, authorizeRoles('user'), applyJob);

module.exports = router;
