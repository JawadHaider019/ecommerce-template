import { useContext } from "react"
import { ShopContext } from "../context/ShopContext"
import Title from './Title'

const CartTotal = () => {

    const { currency, deliveryFee, getCartAmount } = useContext(ShopContext)


  return (
    <div className="w-full">
        <div className="text-2xl">
            <Title text1={'CART'} text2={'TOTAL'}/>
        </div>
        <div className="mt-2 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
                <p>Subtotal</p>
                <p>{currency} {getCartAmount()}.00</p>
            </div>
            <hr />
            <div className="flex justify-between">
                <p>Shipping Fee</p>
                <p>{currency}{deliveryFee}</p>
            </div>
            <hr />
            <div className="flex justify-between">
                <p>Total</p>
                <p>{currency} {getCartAmount() === 0 ? 0 : getCartAmount () + deliveryFee}</p>
            </div>
        </div>
    </div>
  )
}

export default CartTotal
