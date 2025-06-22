import React, { useEffect, useState } from "react";
import styles from "./shop.module.css";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useQuery } from "@apollo/client";
import { GET_CLIENT_SIDE_CATEGORIES } from "@/graphql/categories.gql";
import { GET_PRODUCTS } from "@/graphql/products.gql";
import ProductLoader from "@/components/loaders/ProductLoader";
gsap.registerPlugin(ScrollTrigger);
const ProductListing = () => {
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
					setDisplayedProducts(data.getClientSideProducts.products.slice(0, 10));
				}
			} else {
				if (data) {
					setDisplayedProducts(data.getClientSideProducts.products);
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

	if (loading) {
		return <ProductLoader />;
	}
	return (
		<div className={styles.productListing} id="productListing">
			<div className={styles.leftProCon}>
				<Link href={`/product?id=${displayedProducts[0]._id}`}>
					<Image
						width={1000}
						height={1000}
						alt="image"
						src={displayedProducts[0]?.assets[0]?.path || "/newproduct/BI02.jpg"}
					/>
				</Link>

				<div className={styles.productOverlay}>
					<div className={styles.bagCont}>
						<button>
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
						<h4> Belted Leather Jacket</h4>
						<div>
							<span>1,545</span>
							<span>&nbsp;INR</span>
						</div>
					</div>
				</div>
			</div>
			<div className={styles.rightProCon} id="productCont">
				<div className={styles.rightProConWrap}>
					{displayedProducts?.slice(1, 11).map((productItem, index) => (
						<div key={index} className={styles.productCard}>
							<Link href={`/product?id=${productItem._id}`}>
								<Image
									width={1000}
									height={1000}
									alt={productItem?.assets[0]?.altText || "image"}
									src={
										productItem?.assets[0]?.path
											? productItem.assets[0].path
											: "/newproduct/BI02.jpg"
									}
								/>
							</Link>
							<div className={styles.productOverlay}>
								<div className={styles.bagCont}>
									<button>
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
				<div className={styles.rightProConStrip} id="productStrip1">
					{displayedProducts.slice(0, 7).map((productItem, index) => (
						<Link
							href={`/product?id=${productItem._id}`}
							key={index}
							className={styles.productCard}
						>
							<Image
								width={1000}
								height={1000}
								alt={productItem?.assets[0]?.altText || "image"}
								src={productItem?.assets[0]?.path || "/newproduct/BI02.jpg"}
							/>
						</Link>
					))}
				</div>
				<div className={styles.rightProConStrip} id="productStrip2">
					{displayedProducts.slice(0, 8).map((productItem, index) => (
						<Link
							href={`/product?id=${productItem._id}`}
							key={index}
							className={styles.productCard}
						>
							<Image
								width={1000}
								height={1000}
								alt={productItem?.assets[0]?.altText || "image"}
								src={productItem?.assets[0]?.path || "/newproduct/BI02.jpg"}
							/>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
};

export default ProductListing;
