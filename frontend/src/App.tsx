import { BrowserRouter as Router, Route, Routes } from "react-router";
import Home from "./pages/Home";
import SubmitJob from "./pages/SubmitJob";
import ProcessingJob from './pages/ProcessingJob';
import LookupJob from "./pages/LookupJob";
import Contact from "./pages/Contact";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Results from "./pages/Results";
import { JobSubmissionProvider } from "./context/JobSubmissionContext";
import LoginForm from "./pages/LoginForm";
import Dashboard from "./pages/Dashboard";
import RegisterForm from "./pages/RegisterForm";
import APIRequestForm from "./pages/APIRequestForm";
import SubmitJobModal from "./pages/SubmitJobModal";
import { AuthProvider } from "./context/authContext";
import VerificationPending from "./pages/VerificationPending";
import VerificationCallback from "./pages/AuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
    <AuthProvider>
      <div className="min-h-screen flex flex-col items-center justify-center *:w-full">
      <Header />
        <main className="w-full max-w-[900px] flex-1 flex flex-col *:flex-1 *:flex *:flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path = "/login" element={<LoginForm />} />
            <Route path = "/register" element={<RegisterForm />} />
            <Route path = "/verification-pending" element={<VerificationPending />} />
            <Route path = "/auth/callback" element={<VerificationCallback />} />
            <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/request-apiskey" element={
                <ProtectedRoute>
                  <APIRequestForm />
                </ProtectedRoute>
              } />
            <Route path = "/submit-zip" element={<SubmitJobModal onClose={()=>{}} onUpload={()=>{}}/>} />
            <Route path="/submit-job" element={
              <JobSubmissionProvider>
                <SubmitJob/>
              </JobSubmissionProvider>
              } 
            />
            <Route path="/submit-job/:id" element={<ProcessingJob />} />
            <Route path="/lookup-job" element={<LookupJob />} />
            <Route path="/lookup-job/:id" element={<Results />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      <Footer />
      </div>
    </AuthProvider>
    </Router>
  );
}

export default App;
// added *:flex-col to main, potentially breaking