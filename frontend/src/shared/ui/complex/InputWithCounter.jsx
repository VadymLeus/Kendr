// frontend/src/shared/ui/complex/InputWithCounter.jsx
import React from 'react';
import { Input } from '../elements/Input'; 
import { TEXT_LIMITS } from '../../config/limits';

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