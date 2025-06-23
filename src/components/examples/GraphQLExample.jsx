import React, { useState } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { useMutationHandler } from '@/hooks/useMutationHandler';

// Import GraphQL queries and mutations from feature files
import { 
  GET_PRODUCTS, 
  GET_PRODUCT_BY_ID, 
  CREATE_PRODUCT, 
  UPDATE_PRODUCT,
  DELETE_PRODUCT 
} from '@/graphql/products.gql';

const GraphQLExample = () => {
  const [productId, setProductId] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Example of using useQuery hook with imported query
  const { data: productsData, loading: productsLoading, error: productsError, refetch } = useQuery(GET_PRODUCTS, {
    variables: { limit: 10, offset: 0 },
    errorPolicy: 'all'
  });

  // Example of using useLazyQuery hook
  const [getProduct, { data: productData, loading: productLoading, error: productError }] = useLazyQuery(GET_PRODUCT_BY_ID, {
    errorPolicy: 'all'
  });

  // Example of using useMutationHandler for CREATE
  const [createProduct, { loading: createLoading, isSuccess: createSuccess }] = useMutationHandler(CREATE_PRODUCT, {
    successMessage: 'Product created successfully! 🎉',
    errorMessage: 'Failed to create product. Please try again.',
    refetchQueries: [{ query: GET_PRODUCTS, variables: { limit: 10, offset: 0 } }],
    onSuccess: (data) => {
      console.log('Product created:', data.createProduct);
      // Additional success logic here
    },
    onError: (error) => {
      console.error('Create product error:', error);
      // Additional error handling here
    }
  });

  // Example of using useMutationHandler for UPDATE
  const [updateProduct, { loading: updateLoading }] = useMutationHandler(UPDATE_PRODUCT, {
    successMessage: (data) => `Product "${data.updateProduct.name}" updated successfully!`,
    errorMessage: 'Failed to update product.',
    onSuccess: () => {
      setEditingProduct(null);
      refetch(); // Refetch products list
    }
  });

  // Example of using useMutationHandler for DELETE
  const [deleteProduct, { loading: deleteLoading }] = useMutationHandler(DELETE_PRODUCT, {
    successMessage: 'Product deleted successfully!',
    errorMessage: 'Failed to delete product.',
    refetchQueries: [{ query: GET_PRODUCTS, variables: { limit: 10, offset: 0 } }],
    onSuccess: () => {
      console.log('Product deleted');
    }
  });

  // Handle product creation
  const handleCreateProduct = async () => {
    try {
      await createProduct({
        input: {
          name: 'New Sample Product',
          description: 'A sample product created via GraphQL',
          price: 99.99,
          imageUrl: 'https://example.com/image.jpg',
          categoryId: '1'
        }
      });
    } catch (err) {
      // Error is already handled by useMutationHandler
      console.log('Create failed:', err);
    }
  };

  // Handle product update
  const handleUpdateProduct = async (product) => {
    try {
      await updateProduct({
        id: product.id,
        input: {
          name: product.name + ' (Updated)',
          description: product.description,
          price: product.price + 10
        }
      });
    } catch (err) {
      console.log('Update failed:', err);
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct({ id: productId });
      } catch (err) {
        console.log('Delete failed:', err);
      }
    }
  };

  // Handle lazy product fetch
  const handleGetProduct = () => {
    if (productId) {
      getProduct({ variables: { id: productId } });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>GraphQL with Feature-based Structure</h1>
      
      {/* Products List Section */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Products List</h2>
        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => refetch()} disabled={productsLoading}>
            {productsLoading ? 'Refreshing...' : 'Refresh Products'}
          </button>
          <button 
            onClick={handleCreateProduct} 
            disabled={createLoading}
            style={{ marginLeft: '10px' }}
          >
            {createLoading ? 'Creating...' : 'Create Sample Product'}
          </button>
        </div>
        
        {productsLoading && <p>Loading products...</p>}
        {productsError && (
          <div style={{ color: 'red', margin: '10px 0' }}>
            <p>Error loading products: {productsError.message}</p>
          </div>
        )}
        
        {productsData?.products && (
          <div style={{ marginTop: '20px' }}>
            <h3>Products ({productsData.products.length}):</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              {productsData.products.map((product) => (
                <div key={product.id} style={{ 
                  border: '1px solid #ccc', 
                  padding: '15px', 
                  borderRadius: '5px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <strong>{product.name}</strong> - ${product.price}
                      <br />
                      <small>{product.description}</small>
                      {product.category && (
                        <span style={{ color: 'blue', marginLeft: '10px' }}>
                          Category: {product.category.name}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button 
                        onClick={() => handleUpdateProduct(product)}
                        disabled={updateLoading}
                        style={{ fontSize: '12px', padding: '5px 10px' }}
                      >
                        {updateLoading ? 'Updating...' : 'Update'}
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deleteLoading}
                        style={{ fontSize: '12px', padding: '5px 10px', backgroundColor: '#ff4444', color: 'white' }}
                      >
                        {deleteLoading ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Single Product Section */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Get Single Product</h2>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Enter Product ID"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            style={{ padding: '8px', marginRight: '10px', width: '200px' }}
          />
          <button onClick={handleGetProduct} disabled={productLoading || !productId}>
            {productLoading ? 'Loading...' : 'Get Product'}
          </button>
        </div>
        
        {productError && (
          <div style={{ color: 'red', margin: '10px 0' }}>
            <p>Error loading product: {productError.message}</p>
          </div>
        )}
        
        {productData?.product && (
          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
            <h3>{productData.product.name}</h3>
            <p><strong>Price:</strong> ${productData.product.price}</p>
            <p><strong>Description:</strong> {productData.product.description}</p>
            {productData.product.category && (
              <p><strong>Category:</strong> {productData.product.category.name}</p>
            )}
            <p><strong>In Stock:</strong> {productData.product.inStock ? 'Yes' : 'No'}</p>
          </div>
        )}
      </section>

      {/* GraphQL Endpoint Info */}
      <section style={{ marginTop: '40px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h3>GraphQL Configuration</h3>
        <p><strong>Endpoint:</strong> {process.env.NEXT_PUBLIC_GRAPHQL_API_URL}</p>
        <p><strong>Status:</strong> {productsError ? 'Disconnected' : 'Connected'}</p>
        <p><strong>Features:</strong></p>
        <ul>
          <li>✅ Feature-based GraphQL file organization</li>
          <li>✅ Custom mutation handler with toast notifications</li>
          <li>✅ Automatic error handling and loading states</li>
          <li>✅ Customizable success/error messages</li>
          <li>✅ Automatic cache updates and refetching</li>
        </ul>
      </section>
    </div>
  );
};

export default GraphQLExample;
