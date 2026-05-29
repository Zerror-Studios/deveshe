import { GET_CLIENT_SIDE_CATEGORIES, GET_LOOKBOOKS, GET_PRODUCTS } from '@/graphql';
import { createApolloClientServer } from '@/lib/apolloClient.server';
import { ProductStatus } from '@/utils/Constant';
import ShopClient from './ShopClient';
import React from 'react'

export const dynamic = "force-dynamic";
const ShopPage = async () => {

  const client = createApolloClientServer();
  let productData = [];
  let categories = [];
  let lookbooks = [];

  try {
    const [productsRes, categoriesRes, lookbooksRes] = await Promise.all([
      client.query({
        query: GET_PRODUCTS,
        variables: {
          offset: 0,
          limit: 1000,
          filters: {
            categoryIds: ["6898b3cdddf0354e025da816"],
            status: ProductStatus.PUBLISHED,
          },
        },
      }),
      client.query({
        query: GET_CLIENT_SIDE_CATEGORIES,
        variables: { offset: 0, limit: 100, filter: {} },
      }),
      client.query({
        query: GET_LOOKBOOKS,
        variables: {
          offset: 0,
          limit: 100,
          filter: { status: ProductStatus.PUBLISHED },
        },
      }),
    ]);
    productData = productsRes?.data?.getClientSideProducts?.products || [];
    categories = categoriesRes?.data?.getClientSideCategories?.categories || [];
    lookbooks = lookbooksRes?.data?.getClientSideLookBooks?.lookBooks || [];
  } catch (error) {
    console.error("Error fetching shop products:", error?.message);
  }
  
  return (
    <ShopClient
      productData={productData}
      categories={categories}
      lookbooks={lookbooks}
    />
  )
}
export default ShopPage
