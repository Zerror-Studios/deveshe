import React from "react";
import { IoBagHandleOutline } from "react-icons/io5";

const Payment = ({ register, errors }) => {
  return (
    <div className="Payment_container">
      <div className="payment_title_cntr">
        <h2 className="same_style_text">Payment</h2>
        <p>All transactions are secure and encrypted.</p>
      </div>
      <div className="payment_inner_container_bg">
        <fieldset>
          <legend className="payment_choose">Choose a payment method</legend>
          <div className="all_payment_input_cntr">
            <label htmlFor="basic-creditCards">
              <div className="cards_inner_content">
                <div className="checkbox_cntr_paypal">
                  <input
                    type="radio"
                    id="basic-creditCards"
                    value="credit-card"
                    {...register("paymentMethod")}
                  />
                </div>
                <div className="credit_card_cntr">
                  <span>Credit card</span>
                  <div className="cards_cntr">
                    <div className="cards_img_cntr">
                      <img src="/0169695890db3db16bfe.svg" alt="card1" />
                      <img src="/card_svg2.svg" alt="card2" />
                      <img src="/card_svg3.svg" alt="card3" />
                      <img src="/card_svg4.svg" alt="card4" />
                    </div>
                  </div>
                </div>
              </div>
            </label>

            <div className="basic-creditCards-collapsible">
              <div className="card_details_cntr">
                <div className="card_details_inner_cntr">
                  <div className="card_details_inner_Top_cntr">
                    <div className="card_number_details_cntr">
                      <div className="card_details_cover_cntr">
                        <input
                          type="text"
                          placeholder="Card number"
                          {...register("cardDetails.cardNumber")}
                        />
                        <IoBagHandleOutline />
                      </div>
                      {errors?.cardDetails?.cardNumber && (
                        <span className="error">
                          {errors?.cardDetails?.cardNumber?.message || ""}
                        </span>
                      )}
                    </div>
                    <div className="card_details_input_cntr">
                      <div className="input_grid_style_for_all">
                        <input
                          type="text"
                          placeholder="Expiration date (MM / YY)"
                          maxLength={7}
                          {...register("cardDetails.cardExpire", {
                            onChange: (e) => {
                              let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
                              if (value.length >= 3) {
                                value = `${value.slice(0, 2)} / ${value.slice(
                                  2,
                                  4
                                )}`;
                              }
                              e.target.value = value;
                            },
                            validate: (value) => {
                              const regex = /^(0[1-9]|1[0-2]) \/ \d{2}$/;
                              return (
                                regex.test(value) || "Format must be MM / YY"
                              );
                            },
                          })}
                        />
                        {errors?.cardDetails?.cardExpire && (
                          <span className="error">
                            {errors?.cardDetails?.cardExpire?.message || ""}
                          </span>
                        )}
                      </div>
                      <div className="input_grid_style_for_all">
                        <input
                          type="password"
                          placeholder="Security code"
                          maxLength={4}
                          {...register("cardDetails.cardCvv")}
                        />
                        {errors?.cardDetails?.cardCvv && (
                          <span className="error">
                            {errors?.cardDetails?.cardCvv?.message || ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="Name_on_card_cntr">
                      <div className="Name_on_card_input_cntr">
                        <input
                          type="text"
                          placeholder="Name on card"
                          {...register("cardDetails.cardHolderName")}
                        />
                        {errors?.cardDetails?.cardHolderName && (
                          <span className="error">
                            {errors?.cardDetails?.cardHolderName?.message || ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  );
};

export default Payment;
