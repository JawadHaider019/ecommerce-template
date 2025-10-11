import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
//payment using Cash on Delivery
const placeOrder =async (req,res) => {
    try{

        const { items, amount, address } = req.body;
        const userId = req.userId;

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        };
        const newOrder = new orderModel(orderData);
        await newOrder.save();

        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({success:true, message:"Order Placed Successfully"})
    }
    catch(error){
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

// All Orders data from Admin Panel
const allOrders = async (req,res) => {
try {
    const orders = await orderModel.find({})
    res.json({success:true, orders})
} catch (error) {
    console.log(error)
    res.json({success:false, message:error.message})
}
}

//User Order Data For Frontend

const userOrders = async (req, res) => {
    try {
        const userId = req.userId; 
        
        const orders = await orderModel.find({ userId });
        console.log("Found orders:", orders);
        
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


//Update Order Status from Admin Panel
const updateStatus = async (req,res) => {

    try {
        const { orderId, status } = req.body;
        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: "Order status updated successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }

}

export {placeOrder, allOrders, userOrders, updateStatus}