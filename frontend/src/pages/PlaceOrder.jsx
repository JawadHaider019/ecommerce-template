import React from 'react'; // Add this import
import { useState, useContext } from 'react'; // Add this import
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from "react-router-dom"; 
import axios from 'axios';
import { toast } from 'react-toastify';

const PlaceOrder = () => {

  const [method,setMethod] = useState('COD') // Change React.useState to useState
  const {backendUrl,token,cartItems,setCartItems,getCartAmount,deliveryFee,products} = useContext(ShopContext) // Change React.useContext to useContext
  
  const navigate = useNavigate();
  const [formData,setFormData] = useState({ // Change React.useState to useState
    firstName:'',
    lastName:'',
    email:'',
    street:'',
    city:'',
    state:'',
    zipcode:'',
    phone:''
  })

  const onChangeHandler = (e) => {
    const name = e.target.name
    const value = e.target.value
    setFormData({...formData,[name]:value})
  }
const onSubmitHandler = async (e) => {
  e.preventDefault()
  try{

 let orderItems = [];
for (const itemId in cartItems) {
  const quantity = cartItems[itemId];
  if (quantity > 0) {
    const itemInfo = structuredClone(products.find(product => product._id === itemId));
    if (itemInfo) {
      itemInfo.quantity = quantity;
      orderItems.push(itemInfo);
    }
  }
}

let orderData = {
  address: formData,
  items: orderItems,
  amount: getCartAmount() + deliveryFee,
  method: 'COD'
}
const response= await axios.post(backendUrl + '/api/order/place', orderData,{headers:{token}} )
console.log(response);
if(response.data.success){
  setCartItems({})
  toast.success(response.data.message)
  navigate('/orders')
}
else{
  toast.error(response.data.message)
}
 

  }catch(error){
    console.log(error);
    toast.error(error.message)

  }
}

  return  (
    <form onSubmit={onSubmitHandler} className="flex min-h-[80vh] flex-col justify-between gap-4 border-t pt-5 sm:flex-row sm:pt-14">
      <div className="flex w-full flex-col gap-4 sm:max-w-[480px]">
        <div className="my-3 text-xl sm:text-2xl">
          <Title text1={'DELIVERY'} text2={'INFORMATION'}/>
        </div> 
        <div className='flex gap-3'>
          <input onChange={onChangeHandler} name='firstName' value={formData.firstName} className='w-full rounded border border-gray-300 px-3.5 py-1.5' type='text'placeholder='First name'/>
          <input onChange={onChangeHandler} name='lastName' value={formData.lastName} className='w-full rounded border border-gray-300 px-3.5 py-1.5' type='text'placeholder='Last name'/>
        </div>
        <input onChange={onChangeHandler} name='email' value={formData.email} className='w-full rounded border border-gray-300 px-3.5 py-1.5' type='email'placeholder='Email'/>
        <input onChange={onChangeHandler} name='street' value={formData.street} className='w-full rounded border border-gray-300 px-3.5 py-1.5' type='text'placeholder='Adress'/>
        <div className='flex gap-3'>
          <input onChange={onChangeHandler} name='city' value={formData.city} className='w-full rounded border border-gray-300 px-3.5 py-1.5' type='text'placeholder='City'/>
          <input onChange={onChangeHandler} name='state' value={formData.state} className='w-full rounded border border-gray-300 px-3.5 py-1.5' type='text'placeholder='State'/>
        </div>
        <div className='flex gap-3'>
          <input onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className='w-full rounded border border-gray-300 px-3.5 py-1.5' type='number'placeholder='Zipcode'/>
          <input onChange={onChangeHandler} name='phone' value={formData.phone} className='w-full rounded border border-gray-300 px-3.5 py-1.5' type='number'placeholder='Phone'/>
        </div>
      </div>

      <div className ='mt-8'>
        <div className = 'mt-8 min-w-80'>
          <CartTotal/>
        </div>
    

      <div className='mt-12'>
        <Title text1={'PAYMENT'} text2={'METHOD'}/>
        <div className =' flex flex-col gap-3 lg:flex-row'>
            <div className='flex cursor-pointer items-center gap-3 border p-2 px-3'>
         
              <p className='mx-4 text-sm font-medium text-gray-500'>CASH ON DELIVERY</p>
            </div>
        </div>
        <div className='mt-8 w-full text-end'>
          <button type='submit' className= 'btn'>PLACE ORDER</button>
        </div>
      </div>
      </div>
    </form >
  )
}

export default PlaceOrder