import { useLocation } from 'react-router';

const VerificationPending = () => {
    const location = useLocation();
    const email = location.state?.email;

    return (
        <div className="flex h-screen items-center justify-center w-full px-4">
            <div className="flex flex-col w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden p-8 text-center">
                <h2 className="text-3xl font-bold text-blue-700 mb-4">Verify Your Email</h2>
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <p className="text-gray-700 mb-4">
                        We've sent a verification link to:
                        <br />
                        <span className="font-semibold">{email}</span>
                    </p>
                    <p className="text-gray-600 text-sm">
                        Please check your email and click the verification link to complete your registration.
                    </p>
                </div>
                {/* <p className="text-sm text-gray-500">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button className="text-blue-500 hover:underline">resend verification email</button>
                </p> */}
            </div>
        </div>
    );
};

export default VerificationPending;