import React from 'react'

const ProductContainer = () => {
    const products =[
        "https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F1786x2500%2Ffa3880a39b%2Fsj001cod_1_frontweb.png&w=640&q=90",
        "https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F1786x2500%2F6df946d5a7%2Ftsr003cod_1_frontweb.png&w=640&q=90",
        "https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F1786x2500%2Fd4981330e7%2Fhdr002cod_1_frontweb.png&w=640&q=90",
        "https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F1786x2500%2F04c32de2e7%2Fcap002cod_1_sideweb.png&w=640&q=90",
        "https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F1786x2500%2Fdb82551388%2Fbjo001cod_1_frontweb.png&w=640&q=90",
        "https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F1786x2500%2Fcd87538821%2Fcap003cod_1_sideweb.png&w=640&q=90",
        "https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F1786x2500%2Fe78d5d11e6%2Fvj001cod_1_frontweb.png&w=640&q=90",
        "https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F1786x2500%2Fcd87538821%2Fcap003cod_1_sideweb.png&w=640&q=90"
    ]
  return (
    <div id='prodcut-container'>
        {
            products.map((item, index) => {
                return (
                    <div className="product-lb" key={index}>
                        <img src={item} alt={`Product ${item}`} />
                        <div className="product-info">
                            <h3>Product</h3>
                            <p>Description for product</p>
                        </div>
                    </div>
                )
            })
        }
    </div>
  )
}

export default ProductContainer