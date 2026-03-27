import Category from "../models/Category.model.js";

export const GetAllCategories = async (req, res) => {
  try {
    const list = await Category.find().sort({ name: 1 });
    res.status(200).json(list);
  } catch (error) {
    res.status(400).json({ message: "Get categories error", error: error.message });
  }
};

export const CreateCategory = async (req, res) => {
  try {
    const role = req.user?.role;
    if (role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }
    const category = await Category.create({ name: name.trim() });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: "Create category error", error: error.message });
  }
};

export const UpdateCategory = async (req, res) => {
  try {
    const role = req.user?.role;
    if (role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: "Update category error", error: error.message });
  }
};

export const DeleteCategory = async (req, res) => {
  try {
    const role = req.user?.role;
    if (role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Deleted category successfully" });
  } catch (error) {
    res.status(400).json({ message: "Delete category error", error: error.message });
  }
};
