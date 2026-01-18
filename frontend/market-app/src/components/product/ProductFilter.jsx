import { useState, useEffect } from 'react';

const ProductFilter = ({ categories, onFilterChange }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    const filters = {
      category: selectedCategory,
      min_price: priceRange.min,
      max_price: priceRange.max,
      sort_by: sortBy
    };
    onFilterChange(filters);
  }, [selectedCategory, priceRange, sortBy]);

  const handleReset = () => {
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSortBy('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Filters</h3>
        <button
          onClick={handleReset}
          className="text-sm text-primary-400 hover:text-primary-300"
        >
          Reset
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Categories</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Price Range
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Sort By */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Default</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest First</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>
    </div>
  );
};

export default ProductFilter;
