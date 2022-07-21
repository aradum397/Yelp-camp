const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
	res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
	const geoData = await geocoder.forwardGeocode({
		query: req.body.campground.location,
		limit: 1
	}).send();
	const newCampground = new Campground(req.body.campground);
	newCampground.geometry = geoData.body.features[0].geometry;
	newCampground.images = req.files.map(f => ({
		url: f.path,
		filename: f.filename
	}));
	newCampground.author = req.user._id;
	await newCampground.save();
	req.flash('success', 'Campground successfully added!');
	res.redirect(`/campgrounds/${newCampground._id}`);
};

module.exports.showCampground = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id).populate({
		path: 'reviews',
		populate: {
			path: 'author'
		}
	}).populate('author');
	if (!campground) {
		req.flash('error', 'Campground not found!');
		res.redirect('/campgrounds');
	};
	res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	if (!campground) {
		req.flash('error', 'Campground not found!');
		res.redirect('/campgrounds');
	};
	res.render('campgrounds/edit', { campground });
};

module.exports.editCampground = async (req, res, next) => {
	const { id } = req.params;
	const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
	const images = req.files.map(f => ({
		url: f.path,
		filename: f.filename
	}));
	await campground.save();
	campground.images.push(...images);
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
	}
	req.flash('success', 'Campground successfully updated!');
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
	const { id } = req.params;
	await Campground.findByIdAndDelete(id);
	req.flash('success', 'Campground has been deleted!');
	res.redirect('/campgrounds');
};