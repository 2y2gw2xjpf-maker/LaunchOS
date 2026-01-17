import { useState, type ReactNode } from 'react';
import { useSubscription, type FeatureName } from '@/hooks/useSubscription';
import { UpgradeModal } from './UpgradeModal';
import { Lock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureGateProps {
  feature: FeatureName;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradeOnClick?: boolean;
}

export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradeOnClick = true
}: FeatureGateProps) {
  const { canUseFeature } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const hasAccess = canUseFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showUpgradeOnClick) {
    return (
      <>
        <div onClick={() => setShowUpgrade(true)} className="cursor-pointer">
          {fallback || children}
        </div>
        <UpgradeModal
          isOpen={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          feature={feature}
        />
      </>
    );
  }

  return <>{fallback || null}</>;
}

// Hook for programmatic usage
export function useFeatureGate() {
  const { canUseFeature } = useSubscription();
  const [upgradeFeature, setUpgradeFeature] = useState<FeatureName | null>(null);

  const checkFeature = (feature: FeatureName): boolean => {
    const hasAccess = canUseFeature(feature);
    if (!hasAccess) {
      setUpgradeFeature(feature);
    }
    return hasAccess;
  };

  return {
    checkFeature,
    upgradeFeature,
    clearUpgrade: () => setUpgradeFeature(null),
  };
}

// Upgrade Prompt Component for full-page gates
interface UpgradePromptProps {
  feature: FeatureName;
  title: string;
  description: string;
  icon?: ReactNode;
}

export function UpgradePrompt({ feature, title, description, icon }: UpgradePromptProps) {
  return (
    <div className="flex items-center justify-center p-8 min-h-[400px]">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          {icon || <Lock className="w-8 h-8 text-brand-600" />}
        </div>
        <h2 className="text-2xl font-bold text-navy mb-2">
          {title}
        </h2>
        <p className="text-charcoal/60 mb-6">
          {description}
        </p>
        <Link
          to={`/pricing?plan=pro&feature=${feature}`}
          className="inline-flex items-center gap-2 px-6 py-3
                   bg-gradient-to-r from-brand-600 to-brand-500
                   text-white font-semibold rounded-xl hover:shadow-lg
                   hover:shadow-brand-500/25 transition-all"
        >
          <Zap className="w-5 h-5" />
          Upgrade auf Pro
        </Link>
      </div>
    </div>
  );
}

export default FeatureGate;
