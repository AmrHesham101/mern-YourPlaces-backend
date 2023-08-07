const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const PlaceModal = require("../models/place");
const UserModel = require("../models/user");
const { default: mongoose } = require("mongoose");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await PlaceModal.findById(placeId);
  } catch (err) {
    return next(
      new HttpError("Somthing went wrong, could not find a place", 500)
    );
  }
  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided id.", 404)
    );
  }
  res.json({ place: place.toObject({ getters: true }) }); // => { place } => { place: place }
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let userWithPlaces;
  try {
    userWithPlaces = await UserModel.findById(userId).populate("places");
  } catch (error) {
    return next(
      new HttpError("Fetching places failed, please try again later", 500)
    );
  }
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError("Could not find a place for the provided user id.", 404)
    );
  }
  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};
const createPlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data ", 422)
    );
  }
  const { title, description, address } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }
  const createdPlace = new PlaceModal({
    title,
    description,
    address,
    location: {
      lat: coordinates.lat,
      lng: coordinates.lon,
    },
    image: req.file.path,
    creator: req.userData.userId,
  });
  let user;
  try {
    user = await UserModel.findById(req.userData.userId);
  } catch (error) {
    return next(new HttpError("creating place failed, please try again", 500));
  }
  if (!user) {
    return next(
      new HttpError(
        "Could not find user for provided id, please try again",
        500
      )
    );
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return next(new HttpError("created place failed, please try again", 500));
  }
  res.status(201).json({ place: createdPlace.toObject({ getters: true }) });
};
const updatePlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data ", 422)
    );
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;
  let place;
  try {
    place = await PlaceModal.findById(placeId);
  } catch (error) {
    return next(
      new HttpError("Somthing went wrong, could not update place", 500)
    );
  }
  if (place.creator.toString() !== req.userData.userId) {
    return next(new HttpError("You are not allowed to edit this place", 401));
  }
  place.title = title;
  place.description = description;
  try {
    await place.save();
  } catch (error) {
    return next(
      new HttpError("Somthing went wrong, could not update place", 500)
    );
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};
const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await PlaceModal.findById(placeId).populate("creator");
  } catch (error) {
    return next(
      new HttpError("Somthing went wrong, could not delete place", 500)
    );
  }
  if (!place) {
    return next(new HttpError("Could not find place for this id", 404));
  }
  if (place.creator.id !== req.userData.userId) {
    return next(new HttpError("You are not allowed to delete this place", 401));
  }
  const imagePath = place.image;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return next(
      new HttpError("Somthing went wrong, could not delete place", 500)
    );
  }
  fs.unlink(imagePath, (err) => {});
  res.status(200).json({ message: "Deleted place" });
};
exports.updatePlaceById = updatePlace;
exports.deletePlaceById = deletePlace;
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
