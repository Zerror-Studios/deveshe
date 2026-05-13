import { GET_PRODUCTS } from '@/graphql';
import { createApolloClientServer } from '@/lib/apolloClient.server';
import { ProductStatus } from '@/utils/Constant';
import React from 'react'
import ShopClient from '../ShopClient';

export const dynamic = "force-dynamic";
const CollectionPage = async () => {

  const client = createApolloClientServer();
  let productData = [];

  try {
    const { data } = await client.query({
      query: GET_PRODUCTS,
      variables: {
        offset: 0,
        limit: 1000,
        filters: {
          categoryIds: ["6898b3cdddf0354e025da816"],
          status: ProductStatus.PUBLISHED,
        },
      },
    });
    productData = data?.getClientSideProducts?.products || [];
  } catch (error) {
    console.error("Error fetching home products:", error?.message);
  }
  
  return (
    <ShopClient productData={productData} />
  )
}
export default CollectionPage
