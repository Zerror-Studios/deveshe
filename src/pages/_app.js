import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ApolloProvider } from "@apollo/client";
import { store, persistor } from "../../store";
import apolloClient from "@/lib/apollo-client";
import { useRouter } from "next/router";
import "@/styles/globals.css";
import "@/styles/home.css";
import "@/styles/login.css";
import "@/styles/checkout.css";
import "@/styles/checkout2.css";
import "@/styles/success.css";
import "@/styles/address.css";
import "@/styles/cartModal.css";
import "@/styles/navbar.css";
import "@/styles/profile.css";
import "@/styles/productLoader.css";
import "@/styles/collectionLoader.css";
import "@/styles/lookBook.css";
import { useState } from "react";
import HomeWrapper from "@/components/HomeWrapper/HomeWrapper";
import ModalProvider from "@/components/context/ModalProvider";
import SmoothScroller from "@/components/smoothScroll/SmoothScroll";
export default function App({ Component, pageProps }) {
	const router = useRouter();
	const [openBag, setOpenBag] = useState(false);
	return (
		<>
			<ApolloProvider client={apolloClient}>
				<Provider store={store}>
					<PersistGate loading={null} persistor={persistor}>
						<ModalProvider>
							<HomeWrapper openBag={false} setOpenBag={setOpenBag}>
								<SmoothScroller />
								<Component {...pageProps} />
							</HomeWrapper>
						</ModalProvider>
					</PersistGate>
				</Provider>
			</ApolloProvider>
		</>
	);
}
