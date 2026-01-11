// frontend/src/shared/ui/complex/InputWithCounter.jsx
import React from 'react';
import { Input } from '../elements/Input'; // Імпорт вашого базового інпуту
import { TEXT_LIMITS } from '../../config/limits';

/**
 * InputWithCounter - Smart Wrapper
 * * @param {string} limitKey - Ключ з файлу limits.js
 * @param {number} customLimit - (Опціонально) Перезаписати ліміт вручну
 * @param {object} props - Всі інші пропси, які приймає звичайний Input
 */
export const InputWithCounter = ({ 
  limitKey, 
  customLimit, 
  ...props 
}) => {
  const limit = customLimit || (limitKey ? TEXT_LIMITS[limitKey] : 255);

  return (
    <Input
      {...props}
      maxLength={limit}
      showCounter={true}
    />
  );
};

export default InputWithCounter;