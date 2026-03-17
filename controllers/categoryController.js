import Category from "../models/category.js";


// ============================
// GET ALL CATEGORIES
// ============================

export const getCategories = async (req, res) => {
  try {

    const { type } = req.query;
    const user = req.user._id;

    const filter = { user };

    if (type) {
      filter.type = type;
    }

    const categories = await Category.find(filter);

    res.json(categories);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// CREATE CATEGORY
// ============================

export const createCategory = async (req, res) => {
  try {

    const { name, type } = req.body;
    const user = req.user._id;

    const newCategory = new Category({
      name,
      type,
      user,
    });

    const saved = await newCategory.save();

    res.status(201).json(saved);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ============================
// UPDATE CATEGORY
// ============================

export const updateCategory = async (req, res) => {
  try {

    const { id } = req.params;

    const updated = await Category.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ============================
// DELETE CATEGORY
// ============================

export const deleteCategory = async (req, res) => {
  try {

    const { id } = req.params;

    await Category.findByIdAndDelete(id);

    res.json({ message: "Category deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};