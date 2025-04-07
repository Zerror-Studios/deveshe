import { createSlice, nanoid } from "@reduxjs/toolkit";
import {Addtocart} from "../../../api_fetch/admin/Cart"

const initialState = {
  itemcount:0,
  cart: []
};


export const CartSlice = createSlice({
  name: 'CartSlice',
  initialState,
  reducers: {
    addtocart: (state, action) => {
      const { qty,variants} = action.payload;

      // Extracting the first variant from the array
      const variant = variants[0];

      // Find the index of the existing item, starting from the second element
      let existingItemIndex = -1;
      state.cart.slice(1).forEach((item, index) => {
        const checkv = item.variants[0];
        if (fun(checkv, variant)) {
          existingItemIndex = index + 1; // Adjust index to account for slicing
        }
      });

      if (existingItemIndex !== -1) {
        // If the item already exists, update the qty
        state.cart[existingItemIndex].qty += qty;
      } else {
        // If the item doesn't exist, add a new item
        state.itemcount += qty;
        state.cart.push({...action.payload});
      }
      sendData(state)
    },

    editqty: (state, action) => {
      const { work, id } = action.payload;
      
      const existingItemIndex = state.cart.findIndex(item => item.productid === id);
      
      if (existingItemIndex !== -1) {
        if (work === -1) {
          // If work is -1, decrement qty
          if (state.cart[existingItemIndex].qty > 0) {
            state.cart[existingItemIndex].qty -= 1;
          }

          // If qty becomes 0, remove the item from the cart
          if (state.cart[existingItemIndex].qty === 0) {
            state.cart.splice(existingItemIndex, 1);
          }
          if (state.cart.length === 0) {
            state.totalprice = 0;
            state.itemcount = 0;
          }
        } 
        else if(work === -2){
            state.cart.splice(existingItemIndex, 1);
            state.itemcount-=1
        }
        else {
          // If work is not -1, increment qty
          state.cart[existingItemIndex].qty += 1;
          
        }

        sendData(state)
      }
    },

    updateCartFromBackend: (state, action) => {
      const cartData = action.payload;
      return{
         ...cartData
      }
    },
  },
});

function fun(item, attributes) {
  return Object.entries(attributes).every(
    ([key, value]) => item[key] === value
  );
}

const sendData = async (fullinfocart) => {
  try {
      const token = localStorage.getItem("token");
      if (!token) {
          console.error("JWT token not found in local storage");
          return;
      }

      const datagone = {token: token, ...fullinfocart}

      const responseData = await Addtocart(datagone)

      if (!responseData) {
          throw new Error(`Failed to add to cart: ${responseData.status} - ${responseData.statusText}`);
      }

      // const responseData = await response.json();
      console.log("Cart updated successfully:", responseData.message);
  } catch (error) {
      console.error("Error adding to cart:", error.message);
  }
};
  
  export const { addtocart, editqty, updateCartFromBackend } = CartSlice.actions;
  
  export default CartSlice.reducer;
  