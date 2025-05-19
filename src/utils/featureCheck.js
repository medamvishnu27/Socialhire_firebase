import { FEATURES } from '../config/features';

export const isFeatureEnabled = (featureKey) => {
  const feature = FEATURES[featureKey];
  return feature?.ENABLED || false;
};

export const getRedirectUrl = (featureKey) => {
  const feature = FEATURES[featureKey];
  return feature?.REDIRECT_URL || '/';
};