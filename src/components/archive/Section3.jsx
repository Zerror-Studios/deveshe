import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import React, { useEffect } from "react";
import styles from "./archive.module.css";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import Image from "next/image";
import { useQuery } from "@apollo/client";
import { GET_LOOKBOOKS } from "@/graphql/lookbook.gql";
gsap.registerPlugin(ScrollTrigger);

const Section3 = () => {
	console.log("look book chapteres");

	const { data, loading, error } = useQuery(GET_LOOKBOOKS, {
		variables: {
			offset: 0,
			limit: 3,
		},
	});
	useEffect(() => {
		// Create a context for cleanup
		const ctx = gsap.context(() => {
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: "#archiveSection3",
					scroller: "body",
					start: "top 60px",
					end: "top -300%",
					pin: true,
					scrub: 1,
					// markers: true,
					invalidateOnRefresh: true, // makes pin and dimensions reliable on refresh
				},
			});

			tl.to(
				"#elem1",
				{
					clipPath: `polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)`,
					duration: 1.5,
					ease: "none",
				},
				"a"
			);

			tl.to(
				"#elem2",
				{
					clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`,
					duration: 1.5,
					ease: "none",
				},
				"a"
			);

			tl.fromTo(
				"#textc2",
				{
					y: 50,
					opacity: 0,
				},
				{
					y: 0,
					opacity: 1,
					duration: 0.5,
					ease: "none",
				},
				"a+=1.2"
			);

			tl.to(
				"#elem2",
				{
					clipPath: `polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)`,
					duration: 1.5,
					ease: "none",
				},
				"b"
			);

			tl.to(
				"#elem3",
				{
					clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`,
					duration: 1.5,
					ease: "none",
				},
				"b"
			);

			tl.fromTo(
				"#textc3",
				{
					y: 50,
					opacity: 0,
				},
				{
					y: 0,
					opacity: 1,
					duration: 0.5,
					ease: "none",
				},
				"b+=1.2"
			);

			// Refresh ScrollTrigger after a delay
			setTimeout(() => ScrollTrigger.refresh(), 200);
		});

		return () => {
			ctx.revert(); // clean everything created inside the context
			ScrollTrigger.getAll().forEach((trigger) => trigger.kill()); // extra safety
		};
	}, []);

	const lookbookChapters = [
		{
			href: "/lookbook/chapter1",
			imgSrc: "/archive/lookbook1.jpg",
			id: "elem1",
			textId: "textc1",
			chapter: "Chapter 1",
			title: "What’s on the menu?",
			desc: `A tribute to food lovers everywhere, this summery capsule
    collection was created in collaboration with visual artist Rhea
    Zaveri. Inspired by abstract recipes, each print layers
    ingredients in playful proportions—think avocado toast, jalapeño
    bucatini, and watermelon lemonade. A vibrant nod to shared
    cravings and creative expression.`,
		},
		{
			href: "/lookbook/chapter2",
			imgSrc: "/archive/lookbook2.jpg",
			id: "elem2",
			textId: "textc2",
			chapter: "Chapter 2",
			title: " Its all about crochet!",
			desc: `A celebration of festive elegance, this collection with artist
    Bindal Shah features handcrafted metallic crochet on vibrant ombré
    silks. In jewel tones of ruby, emerald, ochre, and blue, each
    piece blends lightness with intricate detail—perfect for wedding
    soirées and Diwali nights. Fusion wear made effortless, ornate,
    and unforgettable.`,
		},
		{
			href: "/lookbook/chapter3",
			imgSrc: "/archive/lookbook3.jpg",
			id: "elem3",
			textId: "textc3",
			chapter: "Chapter 3",
			title: "What’s on the menu?",
			desc: `A tribute to food lovers everywhere, this summery capsule
    collection was created in collaboration with visual artist Rhea
    Zaveri. Inspired by abstract recipes, each print layers
    ingredients in playful proportions—think avocado toast, jalapeño
    bucatini, and watermelon lemonade. A vibrant nod to shared
    cravings and creative expression.`,
		},
	];

	return (
		<div id="archiveSection3" className={styles.archiveSection3}>
			{data?.getClientSideLookBooks?.lookBooks?.map((item, index) => (
				<Link
					href={`/lookbook/${item._id}`}
					className={`${styles.elem} ${styles[`elem${index + 1}`]}`}
					id={item._id}
					key={item._id}
				>
					<Image
						width={1000}
						height={1000}
						src={item.assets[0]?.path || "/archive/lookbook1.jpg"}
						alt="image"
					/>
					<div className={styles.overlay3a}>
						<div className={styles.textContainer} id={`textc${index + 1}`}>
							<h3>{item.subName}</h3>
							<h4>{item.title}</h4>
							<p>{item.description}</p>
							<span className={styles.exploreBtn}>
								Explore <FiArrowUpRight />
							</span>
						</div>
					</div>
				</Link>
			))}
		</div>
	);
};

export default Section3;
