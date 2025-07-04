import React, { useContext, useEffect, useState } from "react";
import styles from "./shop.module.css";
import Image from "next/image";
import { useRouter } from "next/router";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useQuery } from "@apollo/client";
import { GET_CLIENT_SIDE_CATEGORIES } from "@/graphql/categories.gql";
import { GET_PRODUCTS } from "@/graphql/products.gql";
import ProductLoader from "@/components/loaders/ProductLoader";
import { useDispatch } from "react-redux";
import { addtocart } from "@/features/cart/CartSlice";
import { ModalContext } from "../context/ModalProvider";
gsap.registerPlugin(ScrollTrigger);
const ProductListing = () => {
	const [modalIsOpen, setModalIsOpen] = useContext(ModalContext);
	const dispatch = useDispatch();
	const router = useRouter();
	const [displayedProducts, setDisplayedProducts] = useState([]);
	const { data, loading, error } = useQuery(GET_PRODUCTS, {
		variables: {
			offset: 0,
			limit: 11,
			filter: {
				search: null,
			},
		},
	});

	console.log(data, " data");

	useGSAP(() => {
		if (window.innerWidth > 576) return;
		const strip1Height =
			document.querySelector("#productStrip1").getBoundingClientRect().height / 2;
		const strip2Height = document.querySelector("#productStrip2").getBoundingClientRect().height;
		const productContHeight = document.querySelector("#productCont").getBoundingClientRect().height;

		const strip1Value = strip1Height - productContHeight;
		const strip2Value = strip2Height - productContHeight;

		var tl = gsap.timeline({
			scrollTrigger: {
				trigger: "#productListing",
				scroller: "body",
				start: "35.3% 65px",
				end: "35.3% -120%",
				scrub: 1,
				// markers: true,
				pin: true,
			},
		});

		tl.to(
			"#productStrip1",
			{
				transform: `translateY(-56%)`,
				duration: 1.4,
			},
			"a"
		).to(
			"#productStrip2",
			{
				transform: `translateY(-61.5%)`,
				duration: 1.4,
			},
			"a"
		);
	}, []);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 576) {
				if (data) {
					setDisplayedProducts(data?.getClientSideProducts?.products.slice(0, 10));
				}
			} else {
				if (data) {
					setDisplayedProducts(data?.getClientSideProducts?.products);
				}
			}
		};

		handleResize(); // check on mount

		window.addEventListener("resize", handleResize); // update on resize
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		if (data) {
			setDisplayedProducts(data.getClientSideProducts.products);
		}
	}, [data]);

	// Function to handle navigation to product details with state
	const handleProductNavigation = (productData) => {
		// Store product data in localStorage to pass to product details page (persists across refreshes)
		localStorage.setItem(`product_${productData._id}`, JSON.stringify(productData));

		// Navigate to product details page
		router.push(`/product?id=${productData._id}`);
	};

  const handleAddToCart = (index) => {
    setTimeout(() => {
      setModalIsOpen(true);
    }, 100);

    const colors = ["Black", "Brown", "Grey", "White"];
    const sizes = ["S", "M", "L", "XL"];

    // generating random varient for now
    const vararray = [
      {
        color: colors[Math.floor(Math.random() * colors.length)],
        size: sizes[Math.floor(Math.random() * sizes.length)],
      },
    ];
    dispatch(
      addtocart({
        name: "Belted Leather Jacket",
        img: displayedProducts[index]?.assets[0]?.path,
        productid: index,
        qty: 1,
        variants: vararray,
      })
    );
  };

	if (loading) {
		return <ProductLoader />;
	}
	return (
		<div className={styles.productListing} id="productListing">
			<div className={styles.leftProCon}>
				<div
					onClick={() => displayedProducts[0] && handleProductNavigation(displayedProducts[0])}
					style={{ cursor: "pointer" }}
				>
					<Image
						width={1000}
						height={1000}
						alt="image"
						src={displayedProducts[0]?.assets[0]?.path || "/newproduct/BI02.jpg"}
					/>
				</div>

				<div className={styles.productOverlay}>
					<div className={styles.bagCont}>
						<button onClick={() => handleAddToCart(displayedProducts[0]._id)}>
							<svg
								class="icon-cart"
								width="15"
								height="18"
								viewBox="0 0 15 18"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								data-v-f756b3ad=""
							>
								<path
									d="M1.19891 5.8049C1.2448 5.02484 1.89076 4.41576 2.67216 4.41576H12.0298C12.8112 4.41576 13.4572 5.02485 13.5031 5.8049L14.0884 15.7547C14.1382 16.6023 13.4643 17.3171 12.6151 17.3171H2.08688C1.23775 17.3171 0.563767 16.6023 0.61363 15.7547L1.19891 5.8049Z"
									stroke-width="1.2"
								></path>
								<path
									d="M11.4354 6.3737C11.4354 3.21604 9.60694 0.65625 7.35147 0.65625C5.096 0.65625 3.26758 3.21604 3.26758 6.3737"
									stroke-width="1.2"
									stroke-linecap="round"
								></path>
							</svg>
						</button>
					</div>
					<div className={styles.proDets}>
						<h4> {displayedProducts[0]?.name}</h4>
						<div>
							<span>{displayedProducts[0]?.price}</span>
							<span>&nbsp;INR</span>
						</div>
					</div>
				</div>
			</div>
			<div className={styles.rightProCon} id="productCont">
				<div className={styles.rightProConWrap}>
					{displayedProducts?.slice(1, 11)?.map((productItem, index) => (
						<div key={index} className={styles.productCard}>
							<div
								onClick={() => handleProductNavigation(productItem)}
								style={{ cursor: "pointer" }}
							>
								<Image width={1000} height={1000} alt="image" src={productItem?.assets[0]?.path} />
							</div>
							<div className={styles.productOverlay}>
								<div className={styles.bagCont}>
									<button onClick={() => handleAddToCart(productItem._id)}>
										<svg
											class="icon-cart"
											width="15"
											height="18"
											viewBox="0 0 15 18"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											data-v-f756b3ad=""
										>
											<path
												d="M1.19891 5.8049C1.2448 5.02484 1.89076 4.41576 2.67216 4.41576H12.0298C12.8112 4.41576 13.4572 5.02485 13.5031 5.8049L14.0884 15.7547C14.1382 16.6023 13.4643 17.3171 12.6151 17.3171H2.08688C1.23775 17.3171 0.563767 16.6023 0.61363 15.7547L1.19891 5.8049Z"
												stroke-width="1.2"
											></path>
											<path
												d="M11.4354 6.3737C11.4354 3.21604 9.60694 0.65625 7.35147 0.65625C5.096 0.65625 3.26758 3.21604 3.26758 6.3737"
												stroke-width="1.2"
												stroke-linecap="round"
											></path>
										</svg>
									</button>
								</div>
								<div className={styles.proDets}>
									<h4> {productItem?.name}</h4>
									<div>
										<span>{productItem?.price}</span>
										<span>&nbsp;INR</span>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default ProductListing;
