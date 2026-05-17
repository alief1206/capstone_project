import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Icon } from '@iconify/react';
import Button from './components/ui/Button';

import mascotImage from './assets/images/mascot.png';
import logoIcon from './assets/icons/logo-icon.png';
import confettiImg from './assets/images/confetti.png';
import profileImg from './assets/images/profile.png';
import robotImg from './assets/images/robot.png';
import foodImg from './assets/images/makanan.png';
import WelcomeScreen  from './pages/Onboarding/WelcomeScreen';
import GoalSelection from './pages/Onboarding/GoalSelection';
import MotivationScreen from './pages/Onboarding/MotivationScreen';
import PersonalDataScreen from './pages/Onboarding/PersonalDataScreen';
import ActivityScreen from './pages/Onboarding/ActivityScreen';
import HabitsScreen from './pages/Onboarding/HabitsScreen';
import RegisterScreen from './pages/Auth/RegisterScreen';
import LoginScreen from './pages/Auth/LoginScreen';
import ForgotPasswordScreen from './pages/Auth/ForgotPasswordScreen';
import OtpScreen from './pages/Auth/OtpScreen';
import ResetPasswordScreen from './pages/Auth/ResetPasswordScreen';
import DashboardScreen from './pages/Dashboard/DashboardScreen';
import FoodSearchScreen from './pages/Diary/FoodSearchScreen';
import BarcodeScannerScreen from './pages/Diary/BarcodeScannerScreen';
import DiaryScreen from './pages/Diary/DiaryScreen';
import ProgressScreen from './pages/Progress/ProgressScreen';
import InsightScreen from './pages/AIInsight/InsightScreen';
import ProfileScreen from './pages/Profile/ProfileScreen';

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