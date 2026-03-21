import User from "../models/User.model.js";

export const findById = (id) => {
  return User.findById(id);
};