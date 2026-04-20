import React from 'react';
import { SuccessScreen } from '../SuccessScreen';

type SuccessStepProps = {
  onReturnHome: () => void;
};

export const SuccessStep: React.FC<SuccessStepProps> = ({ onReturnHome }) => {
  return (
    <SuccessScreen
      title="Thank you — our team will reach out shortly to schedule an intro call."
      subtitle="We onboard all property managers personally to ensure alignment, quality, and long-term success in the network."
      onReturnHome={onReturnHome}
    />
  );
};