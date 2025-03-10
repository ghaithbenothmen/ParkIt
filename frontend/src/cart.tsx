/*import { useDispatch, useSelector } from "react-redux";
import {
  decrementQuantity,
  emptyCart,
  incrementQuantity,
  removeCartItem,
  totalAmount,
} from "../actions/action";
import toast from "react-hot-toast";
import { NavLink, useNavigate } from "react-router-dom";
import { apiURL } from "../api/index";
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js"; // Import Stripe library
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

function Cart() {
  const cart = useSelector((state) => state.AddToCart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const loadPage = async () => {
      try {
        const res = await fetch(`${apiURL}/cart`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const data = await res.json();
        setCity(data.city);
        setAddress(data.address);
      } catch (error) {
        console.error("Error loading cart data:", error);
      }
    };

    loadPage();
  }, []);

  const makePayment = async () => {
    const stripe = await loadStripe("pk_test_51KqJ4DAAUyqQ9D2Qg");
    const body = {
      products: cart,
    };
    const headers = {
      "Content-Type": "application/json",
    };

    const response = await fetch(`${apiURL}/create-checkout-session`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    const session = await response.json();
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.log(result.error);
    }
  };

  const NetTotal = () => {
    return cart.reduce((total, product) => total + product.price * product.quantity, 0);
  };

  return (
    <div className="font-primary overflow-hidden">
      <div className="pl-5 pt-14 pb-10 w-[90%] mx-auto flex justify-start items-center">
        Home <MdOutlineKeyboardArrowRight size="20" /> Cart <MdOutlineKeyboardArrowRight size="20" />
      </div>

      }
      <div className="flex justify-between md:w-[88%] md:flex-row flex-col mx-auto">
        <div className="md:w-[78%] w-[88%] md:mx-0 mx-auto overflow-scroll lg:overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-background text-gray-900">
                <th className="py-2 px-4 font-semibold">Product</th>
                <th className="py-2 px-4 font-semibold">Price</th>
                <th className="py-2 px-4 font-semibold">Quantity</th>
                <th className="py-2 px-4 font-semibold">Subtotal</th>
                <th className="py-2 px-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((product) => {
                return (
                  <tr key={product.id}>
                    <td className="py-2 px-4 font-bold text-primary w-52 flex items-center">
                      <img width="30" src={product.image} alt="product" />
                      <span className="pl-2">{product.name}</span>
                    </td>
                    <td className="py-2 px-4">${product.price}</td>
                    <td className="py-2 px-4 flex">
                      <button
                        onClick={() => {
                          dispatch(decrementQuantity(product.id));
                          dispatch(totalAmount());
                        }}
                        className="bg-transparent text-black border px-2 border-gray-500"
                      >
                        -
                      </button>
                      <button className="cursor-auto bg-transparent text-black border px-4 border-gray-500">
                        {product.quantity}
                      </button>
                      <button
                        onClick={() => {
                          dispatch(incrementQuantity(product.id));
                          dispatch(totalAmount());
                        }}
                        className="bg-transparent text-black border px-2 border-gray-500"
                      >
                        +
                      </button>
                    </td>
                    <td className="py-2 px-4">${(product.price * product.quantity).toFixed(2)}</td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => {
                          dispatch(removeCartItem(product.id));
                          dispatch(totalAmount());
                          toast.success("Item removed from cart");
                        }}
                        className="text-red-500"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="md:w-[20%] w-[88%] mx-auto">
          <div className="flex justify-between py-5 font-normal">
            <span>Total Amount</span>
            <span className="pl-1">${NetTotal().toFixed(2)}</span>
          </div>
          <button
            onClick={makePayment}
            className={`${
              NetTotal() === 0 ? "bg-gray-400" : "bg-primary"
            } text-white p-2 rounded-sm w-full`}
            disabled={NetTotal() === 0}
          >
            Pay ${NetTotal() === 0 ? "0.00" : NetTotal().toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
