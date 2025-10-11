import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faFolderTree, faEdit, faTrash, faCheck, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';

const CategoriesTab = ({ categories, setCategories }) => {
  const [newCategory, setNewCategory] = useState({ name: '', parentId: '' });
  const [editingCategory, setEditingCategory] = useState(null);

  const addCategory = () => {
    if (newCategory.name.trim() === '') return;
    
    const parentId = newCategory.parentId ? parseInt(newCategory.parentId) : null;
    
    if (parentId) {
      // Add as subcategory
      setCategories(categories.map(cat => {
        if (cat.id === parentId) {
          const newSubcategory = {
            id: Date.now(),
            name: newCategory.name,
            count: 0
          };
          return {
            ...cat,
            subcategories: [...cat.subcategories, newSubcategory]
          };
        }
        return cat;
      }));
    } else {
      // Add as main category
      const newCat = {
        id: Date.now(),
        name: newCategory.name,
        subcategories: []
      };
      setCategories([...categories, newCat]);
    }
    
    setNewCategory({ name: '', parentId: '' });
  };

  const updateCategory = () => {
    if (!editingCategory || editingCategory.name.trim() === '') return;
    
    setCategories(categories.map(cat => {
      if (cat.id === editingCategory.id) {
        return {
          ...cat,
          name: editingCategory.name,
        };
      }
      
      // Check if any subcategory needs updating
      if (cat.subcategories.some(sub => sub.id === editingCategory.id)) {
        return {
          ...cat,
          subcategories: cat.subcategories.map(sub => {
            if (sub.id === editingCategory.id) {
              return {
                ...sub,
                name: editingCategory.name,
              };
            }
            return sub;
          })
        };
      }
      
      return cat;
    }));
    
    setEditingCategory(null);
  };

  const deleteCategory = (id, isSubcategory = false, parentId = null) => {
    if (isSubcategory && parentId) {
      // Delete subcategory
      setCategories(categories.map(cat => {
        if (cat.id === parentId) {
          return {
            ...cat,
            subcategories: cat.subcategories.filter(sub => sub.id !== id)
          };
        }
        return cat;
      }));
    } else {
      // Delete main category
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  return (
    <div>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">
          {editingCategory ? 'Edit Category' : 'Add New Category/Subcategory'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="Category Name"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            value={editingCategory ? editingCategory.name : newCategory.name}
            onChange={(e) => editingCategory 
              ? setEditingCategory({...editingCategory, name: e.target.value})
              : setNewCategory({...newCategory, name: e.target.value})
            }
          />
        </div>
        
        {!editingCategory && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category (for subcategories)</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              value={newCategory.parentId}
              onChange={(e) => setNewCategory({...newCategory, parentId: e.target.value})}
            >
              <option value="">Select Parent Category (optional)</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        )}
        
        <div className="flex gap-2">
          {editingCategory ? (
            <>
              <button
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black flex items-center"
                onClick={updateCategory}
              >
                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                Update Category
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center"
                onClick={() => setEditingCategory(null)}
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                Cancel
              </button>
            </>
          ) : (
            <button
              className="px-4 py-2 bg-black text-white hover:bg-black flex items-center"
              onClick={addCategory}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add {newCategory.parentId ? 'Subcategory' : 'Category'}
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <React.Fragment key={category.id}>
                {/* Main Category Row */}
                <tr className="bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    <FontAwesomeIcon icon={faFolder} className="mr-2 text-black" />
                    {category.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">Main Category</td>
                  <td className="px-4 py-4 text-sm font-medium">
                    <button
                      className="text-black hover:text-blue-900 mr-3"
                      onClick={() => setEditingCategory({ ...category })}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => deleteCategory(category.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>

                {/* Subcategories */}
                {category.subcategories?.map(subcategory => (
                  <tr key={subcategory.id}>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 pl-8">
                      <FontAwesomeIcon icon={faFolderTree} className="mr-2 text-green-500" />
                      {subcategory.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">Subcategory</td>
                    <td className="px-4 py-4 text-sm font-medium">
                      <button
                        className="text-black hover:text-blue-900 mr-3"
                        onClick={() => setEditingCategory({ ...subcategory })}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => deleteCategory(subcategory.id, true, category.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoriesTab;