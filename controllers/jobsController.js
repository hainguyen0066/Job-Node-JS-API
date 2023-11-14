const Job = require('../models/jobs');
const ErrorHandler = require('../utils/errorHandler');
const geoCoder = require('../utils/geocoder');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFilters = require('../utils/apiFilters');
// get All Jobs
exports.getJobs = catchAsyncErrors(async (req, res, next) => {
	const apiFilter = new APIFilters(Job.find(), req.query)
		.filter()
		.sort()
		.searchByQuery()
        .pagination();

	const jobs = await apiFilter.query;

	res.status(200).json({
		sucess: true,
		results: jobs.length,
		data: jobs
	});
});

// create New Job
exports.newJob = catchAsyncErrors(async (req, res, next) => {
	const job = await Job.create(req.body);

	res.status(200).json({
		success: true,
		message: 'Job Created.',
		data: job
	});
});

// search jobs
exports.getJobsInRadius = catchAsyncErrors(async (req, res, next) => {
	const { zipcode, distance } = req.params;

	// Getting latitude & longitude from geocoder with zipcode
	const loc = await geoCoder.geocode(zipcode);
	const latitude = loc[0].latitude;
	const longitude = loc[0].longitude;

	const radius = distance / 3963;

	const jobs = await Job.find({
		location: {
			$geoWithin: { $centerSphere: [[longitude, latitude], radius] }
		}
	});

	res.status(200).json({
		success: true,
		results: jobs.length,
		data: jobs
	});
});

// update jobs
exports.updateJob = catchAsyncErrors(async (req, res, next) => {
	let job = await Job.findById(req.params.id);

	if (!job) {
        return next(new ErrorHandler('Job not found', 404));
	}

	job = await Job.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
		useFindAndModify: false
	});

	res.status(200).json({
		success: true,
		message: 'Job is updated',
		data: job
	});
});

// delete jobs
exports.deleteJob = catchAsyncErrors(async (req, res, next) => {
	let job = await Job.findById(req.params.id);

	if (!job) {
		return res.status(404).json({
			success: false,
			message: 'Job not found.'
		}); // Dừng xử lý tại đây
	}

	job = await Job.findByIdAndDelete(req.params.id);

	res.status(200).json({
		success: true,
		messafe: 'job is delete'
	});
});

//  job by id and slug
exports.getJob = catchAsyncErrors(async (req, res, next) => {

	let job = await Job.find({
		$and: [
			{
				_id: req.params.id
			},
			{
				slug: req.params.slug
			}
		]
	});

	if (!job || job.length === 0) {
		return next(new ErrorHandler('Job not found', 404));

		return res.status(404).json({
			success: false,
			message: 'Job not found.'
		}); // Dừng xử lý tại đây
	}

	res.status(200).json({
		success: true,
		results: job.length,
		data: job
	});
});
// job stast
exports.jobStats = catchAsyncErrors(async (req, res) => {
	const stats = await Job.aggregate([
		{
			$match: {
				$text: {
					$search: '"' + req.params.topic + '"'
				}
			}
		},
		{
			$group: {
				_id: { $toUpper: '$experience' },
				totalJobs: { $sum: 1 },
				avgPosition: { $avg: '$position' },
				avgSalary: {
					$avg: '$salary'
				},
				minSalary: { $min: '$salary' },
				maxSalary: { $max: '$salary' }
			}
		}
	]);

	if (stats.length === 0) {
		return res.status(404).json({
			success: false,
			message: `Not stats not found for ${req.params.topic}`
		});
	}

	return res.status(200).json({
		success: true,
		data: stats
	});
});
