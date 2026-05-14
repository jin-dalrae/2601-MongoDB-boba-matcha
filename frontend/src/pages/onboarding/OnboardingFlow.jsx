import { useState } from 'react';
import RoleSelection from './RoleSelection';
import AccountSetup from './AccountSetup';
import DataLoading from './DataLoading';
import ConnectBank from './ConnectBank';
import Completion from './Completion';
import { userAPI } from '../../services/api';

const STEPS = {
    ROLE_SELECTION: 'role',
    ACCOUNT_SETUP: 'account',
    DATA_LOADING: 'loading',
    CONNECT_BANK: 'bank',
    COMPLETION: 'complete'
};

export default function OnboardingFlow({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(STEPS.ROLE_SELECTION);
    const [userData, setUserData] = useState({
        role: null,
        tiktokUsername: null,
        bankConnected: false
    });

    const handleRoleSelected = (role) => {
        setUserData(prev => ({ ...prev, role }));
        setCurrentStep(STEPS.ACCOUNT_SETUP);
    };

    const handleAccountSetup = (username) => {
        setUserData(prev => ({ ...prev, tiktokUsername: username }));
        setCurrentStep(STEPS.DATA_LOADING);
    };

    const handleDataLoadingComplete = () => {
        setCurrentStep(STEPS.CONNECT_BANK);
    };

    const handleBankConnect = () => {
        setUserData(prev => ({ ...prev, bankConnected: true }));
        setCurrentStep(STEPS.COMPLETION);
    };

    const handleBankSkip = () => {
        setCurrentStep(STEPS.COMPLETION);
    };

    const handleOnboardingComplete = async () => {
        const role = userData.role === 'advertiser' ? 'Advertiser' : 'Creator';
        const name = userData.tiktokUsername || `${role} user`;

        let savedUser = null;
        try {
            savedUser = await userAPI.createUser({
                role,
                name,
                onboarding_status: 'Complete',
            });
            if (savedUser?._id) {
                localStorage.setItem('matcha_user_id', savedUser._id);
                if (role === 'Advertiser') {
                    localStorage.setItem('matcha_advertiser_id', savedUser._id);
                }
            }
        } catch (error) {
            console.error('Failed to persist user during onboarding:', error);
        }

        const finalUser = savedUser ? { ...userData, ...savedUser } : userData;
        localStorage.setItem('matcha_onboarding_complete', 'true');
        localStorage.setItem('matcha_user', JSON.stringify(finalUser));
        onComplete?.(finalUser);
    };

    const goBack = (toStep) => {
        setCurrentStep(toStep);
    };

    switch (currentStep) {
        case STEPS.ROLE_SELECTION:
            return <RoleSelection onContinue={handleRoleSelected} />;

        case STEPS.ACCOUNT_SETUP:
            return (
                <AccountSetup
                    onContinue={handleAccountSetup}
                    onBack={() => goBack(STEPS.ROLE_SELECTION)}
                />
            );

        case STEPS.DATA_LOADING:
            return <DataLoading onComplete={handleDataLoadingComplete} />;

        case STEPS.CONNECT_BANK:
            return (
                <ConnectBank
                    onConnect={handleBankConnect}
                    onSkip={handleBankSkip}
                    onBack={() => goBack(STEPS.ACCOUNT_SETUP)}
                />
            );

        case STEPS.COMPLETION:
            return <Completion onComplete={handleOnboardingComplete} />;

        default:
            return <RoleSelection onContinue={handleRoleSelected} />;
    }
}
