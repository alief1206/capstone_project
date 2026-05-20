import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import InsightScreen from './pages/AIInsight/InsightScreen';
import ForgotPasswordScreen from './pages/Auth/ForgotPasswordScreen';
import LoginScreen from './pages/Auth/LoginScreen';
import OtpScreen from './pages/Auth/OtpScreen';
import RegisterScreen from './pages/Auth/RegisterScreen';
import ResetPasswordScreen from './pages/Auth/ResetPasswordScreen';
import DashboardScreen from './pages/Dashboard/DashboardScreen';
import BarcodeScannerScreen from './pages/Diary/BarcodeScannerScreen';
import DiaryScreen from './pages/Diary/DiaryScreen';
import FoodSearchScreen from './pages/Diary/FoodSearchScreen';
import ActivityScreen from './pages/Onboarding/ActivityScreen';
import GoalSelection from './pages/Onboarding/GoalSelection';
import HabitsScreen from './pages/Onboarding/HabitsScreen';
import MotivationScreen from './pages/Onboarding/MotivationScreen';
import PersonalDataScreen from './pages/Onboarding/PersonalDataScreen';
import WelcomeScreen from './pages/Onboarding/WelcomeScreen';
import ProfileScreen from './pages/Profile/ProfileScreen';
import ProgressScreen from './pages/Progress/ProgressScreen';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<WelcomeScreen />} />
                <Route path="/welcome" element={<WelcomeScreen />} />
                <Route path="/sasaran" element={<GoalSelection />} />
                <Route path="/motivasi" element={<MotivationScreen />} />
                <Route path="/datadiri" element={<PersonalDataScreen />} />
                <Route path="/aktivitas" element={<ActivityScreen />} />
                <Route path="/kebiasaan" element={<HabitsScreen />} />
                <Route path="/daftar" element={<RegisterScreen />} />
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/lupa-sandi" element={<ForgotPasswordScreen />} />
                <Route path="/otp" element={<OtpScreen />} />
                <Route path="/reset-sandi" element={<ResetPasswordScreen />} />
                <Route path="/dashboard" element={<DashboardScreen />} />
                <Route path="/cari-makanan" element={<FoodSearchScreen />} />
                <Route path="/scan-barcode" element={<BarcodeScannerScreen />} />
                <Route path="/diary" element={<DiaryScreen />} />
                <Route path="/progress" element={<ProgressScreen />} />
                <Route path="/insight" element={<InsightScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />
            </Routes>
        </Router>
    );
}

export default App;
