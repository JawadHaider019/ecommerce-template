import { Link } from "react-router-dom"
import { assets } from "../assets/assets"
const Footer = () => {
    return (
        <div >
        <div className="my-10 mt-40 flex grid-cols-[3fr_1fr_1fr] flex-col gap-14 text-sm sm:grid">
            <div>
                <img src={assets.logo} className="mb-5 w-32" alt="" />
                <p className="w-full text-gray-600 md:w-2/3">Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque eveniet sapiente, temporibus, aliquid sequi est nesciunt illo deserunt facere necessitatibus, reprehenderit dolores minus explicabo natus excepturi mollitia saepe magnam? Velit.</p>
            </div>
            <div>
                <p className="mb-5 text-xl font-medium">COMPANY</p>
                <ul className="flex flex-col gap-1 text-gray-600">
                    <li>Home</li>
                    <li>About Us</li>
                    <li>Delivery</li>
                    <li>Privacy Policy</li>
                </ul>
            </div>
            <div>
                <p className="mb-5 text-xl font-medium">GET IN TOUCH</p>
                <ul className="flex flex-col gap-1 text-gray-600">
                    <li>+92-3333333</li>
                    <li>neturabliss@gmail.com</li>
                </ul>
            </div>
            </div>
            <div>
                <hr />
                <p className="py-5 text-center text-sm">
                &copy; {new Date().getFullYear()} Natura Bliss. All rights reserved. Developed by <Link to='https://jawumitech.com/' className="text-gray-500">JawumiTech</Link>
                </p>
            </div>
        </div>
    )
}

export default Footer
