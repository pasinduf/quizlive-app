import { Link } from 'react-router-dom';

function ThankYou() {
    return (
        <div className="page-container flex-center" style={{ minHeight: '100vh' }}>
            <div className="thankyou-container card" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="thankyou-icon">✅</div>
                <h1 className="thankyou-title">Thank You!</h1>
                <p className="lobby-message mt-md">
                    Your answers have been submitted successfully.
                </p>
                <p className="text-secondary mt-lg">
                    Please wait for the host to end the session and announce the results on the main screen.
                </p>
            </div>
        </div>
    );
}

export default ThankYou;
