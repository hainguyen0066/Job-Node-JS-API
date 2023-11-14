const Job = require('../models/jobs');
const geoCoder = require('../untils/geocoder');

// get All Jobs
exports.getJobs = async (req, res, next) => {
	const jobs = await Job.find();

	res.status(200).json({
		sucess: true,
		results: jobs.length,
		data: jobs
	});
};

// create New Job
exports.newJob = async (req, res, next) => {
	const job = await Job.create(req.body);

	res.status(200).json({
		success: true,
		message: 'Job Created.',
		data: job
	});
};

// search jobs
exports.getJobsInRadius = async (req, res, next) => {
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
};

// update jobs
exports.updateJob = async (req, res, next) => {
	let job = Job.findById(req.params.id);

	if (!job) {
		res.status(404).json({
			success: false,
			message: 'Job not found.'
		});
	}

	job = await Job.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true
	});

	res.status(200).json({
		success: true,
		messafe: 'job is update',
		data: job
	});
};

// delete jobs
exports.deleteJob = async (req, res, next) => {
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
};

//  job by id and slug
exports.getJob = async (req, res, next) => {
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
};
// job stast
exports.jobStats = async (req, res) => {
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

};
