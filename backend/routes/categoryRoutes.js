// routes/categoryRoutes.js
import express from 'express';
import {
  getAllCategories,
  createCategory,
  addSubcategory,
  updateCategory,
  updateSubcategory,
  deleteCategory,
  deleteSubcategory,
} from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', getAllCategories);
router.post('/', createCategory);
router.post('/:categoryId/subcategories', addSubcategory);
router.put('/:id', updateCategory);
router.put('/:categoryId/subcategories/:subcategoryId', updateSubcategory);
router.delete('/:id', deleteCategory);
router.delete('/:categoryId/subcategories/:subcategoryId', deleteSubcategory);

export default router;