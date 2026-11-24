using System;
using UnityEngine;

namespace WonderWiggles.Monetization
{
    public class PlayBillingManager : MonoBehaviour
    {
        public const string PremiumProductId = "com.wonderwiggles.planet.premium_unlock";

        public event Action<bool> OnPurchaseCompleted;

        public void InitiateParentGatedPurchase(bool testMode)
        {
            if (testMode)
            {
                Debug.Log("[WonderWiggles] Test Mode purchase validated. Configure Google Play Billing keys for production.");
                OnPurchaseCompleted?.Invoke(true);
                return;
            }
            // Production: invoke IStoreController.InitiatePurchase(PremiumProductId)
        }
    }
}
