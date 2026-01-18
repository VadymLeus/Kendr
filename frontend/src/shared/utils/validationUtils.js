// frontend/src/shared/utils/validationUtils.js
export const PASSWORD_REQUIREMENTS = {
    minLength: 8,
    hasNumber: /\d/,
    hasCapital: /[A-Z]/,
    hasLower: /[a-z]/
};

export const analyzePassword = (password) => {
    if (!password) {
        return { 
            isValid: false, 
            score: 0,
            checks: {
                isLongEnough: false,
                hasNumber: false,
                hasCapital: false,
                hasLower: false
            }
        };
    }

    const checks = {
        isLongEnough: password.length >= PASSWORD_REQUIREMENTS.minLength,
        hasNumber: PASSWORD_REQUIREMENTS.hasNumber.test(password),
        hasCapital: PASSWORD_REQUIREMENTS.hasCapital.test(password),
        hasLower: PASSWORD_REQUIREMENTS.hasLower.test(password)
    };

    const passedChecksCount = Object.values(checks).filter(Boolean).length;

    return {
        isValid: passedChecksCount === 4,
        score: passedChecksCount,
        checks
    };
};