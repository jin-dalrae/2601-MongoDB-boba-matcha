import { useState } from 'react';
import RoleSelection from './RoleSelection';
import AccountSetup from './AccountSetup';
import DataLoading from './DataLoading';
import ConnectBank from './ConnectBank';
import Completion from './Completion';

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

    const handleOnboardingComplete = () => {
        // Save onboarding state to localStorage
        localStorage.setItem('matcha_onboarding_complete', 'true');
        localStorage.setItem('matcha_user', JSON.stringify(userData));
        onComplete?.(userData);
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
