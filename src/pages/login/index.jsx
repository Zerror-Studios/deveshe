import React, { useState} from 'react'
import Signup from '@/components/login/SignupForm';
import LoginForm from '@/components/login/SigninForm';
import { useRouter } from 'next/router';
import Image from 'next/image';

const Login = () => {

	const [login, setLogin] = useState(true);
	const router = useRouter();

	return (
		<>
			{/* <Navbar/> */}
			<div className="login-cont">
				<div className="login-left-cont" style={{ transform: login ? 'translateY(0%)' : 'translateY(-50%)' }}>
					<div className="left-one">
						<Image width={1000} height={1000} src="/shop/shop2.jpg" alt='' />
					</div>
					<div className="left-one">
						<Image width={1000} height={1000} src="/shop/shop2.jpg" alt='' />
					</div>
				</div>
				<div className="login-right-cont" style={{ transform: login ? 'translateY(-50%)' : 'translateY(0%)' }}>
				<Signup setLogin={setLogin} />
					<LoginForm setLogin={setLogin} />
				</div>
			</div>
		</>

	)
}

export default Login