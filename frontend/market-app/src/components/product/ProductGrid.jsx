import ProductCard from './ProductCard';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';

const ProductGrid = ({ products, loading, error }) => {
  if (loading) {
    return <Loading text="Loading products..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;