import Footer from "@/components/common/Footer";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../../store";
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
import "@/styles/collections.css";
import "@/styles/shopAll.css";
import { useState } from "react";
import HomeWrapper from "@/components/HomeWrapper/HomeWrapper";
// import Modal from "@/components/Modal";
export default function App({ Component, pageProps }) {
  const router = useRouter();
  const pathName = router.pathname;
  console.log(pathName, "path")
  const [openBag, setOpenBag] = useState(false)
  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <HomeWrapper  openBag={false} setOpenBag={setOpenBag} >
            <Component {...pageProps}/>
            { pathName !=='/' && <Footer />}
          </HomeWrapper>
        </PersistGate>
      </Provider>
    </>
  );
}
