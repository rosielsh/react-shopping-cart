import { useEffect, useMemo } from "react";
import { useCartContext } from "../stores/CartContext";
import { useSelectContext } from "../stores/SelectContext";
import useCart from "./useCart";
import { calculateTotalPrice, calculateShippingFee } from "../domains/price";
import { ResponseCartItem } from "../types/types";
import { SelectState } from "../stores/SelectReducer";
import useCartAction from "./useCartAction";
import useSelectAction from "./useSelectAction";

interface UseCartManagerReturn {
  cartData: ResponseCartItem[];
  selectData: SelectState[];
  selectedCartItem: ResponseCartItem[];
  orderPrice: number;
  deliveryPrice: number;
  isCartEmpty: boolean;
  isLoading: boolean;
}

function useCartManager(): UseCartManagerReturn {
  const selectData = useSelectContext();
  const cartData = useCartContext();

  const { setCartInfo } = useCartAction();
  const { setSelectInfo } = useSelectAction();
  const { cartItemList: cartItemRes, isLoading } = useCart();

  useEffect(() => {
    if (cartItemRes.length > 0) {
      setCartInfo({ items: cartItemRes });
      setSelectInfo({ items: cartItemRes });
    }
  }, [cartItemRes, setCartInfo, setSelectInfo]);

  const selectedCartItem = useMemo((): ResponseCartItem[] => {
    return cartData?.filter((_, idx) => selectData[idx]?.selected) || [];
  }, [cartData, selectData]);

  const { orderPrice, deliveryPrice } = useMemo(() => {
    const selectedCartData = cartData.filter(
      (_, idx) => selectData[idx]?.selected
    );
    const calculatedOrderPrice = calculateTotalPrice(selectedCartData);
    const calculatedDeliveryPrice = calculateShippingFee(calculatedOrderPrice);

    return {
      orderPrice: calculatedOrderPrice,
      deliveryPrice: calculatedDeliveryPrice,
    };
  }, [selectData, cartData]);

  const isCartEmpty: boolean = cartData.length === 0;

  return {
    cartData,
    selectData,
    selectedCartItem,
    orderPrice,
    deliveryPrice,
    isCartEmpty,
    isLoading,
  };
}

export default useCartManager;
