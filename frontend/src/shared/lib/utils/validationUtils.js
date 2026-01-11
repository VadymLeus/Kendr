// frontend/src/shared/lib/utils/validationUtils.js

export const PASSWORD_REQUIREMENTS = {
    minLength: 8,
    hasNumber: /\d/,
    hasCapital: /[A-Z]/
};

export const validatePassword = (password) => {
    return {
        length: password.length >= PASSWORD_REQUIREMENTS.minLength,
        number: PASSWORD_REQUIREMENTS.hasNumber.test(password),
        capital: PASSWORD_REQUIREMENTS.hasCapital.test(password),
        isValid: 
            password.length >= PASSWORD_REQUIREMENTS.minLength &&
            PASSWORD_REQUIREMENTS.hasNumber.test(password) &&
            PASSWORD_REQUIREMENTS.hasCapital.test(password)
    };
};