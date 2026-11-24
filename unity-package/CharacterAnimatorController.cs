using UnityEngine;

namespace WonderWiggles.Characters
{
    [RequireComponent(typeof(Animator))]
    public class CharacterAnimatorController : MonoBehaviour
    {
        private Animator _animator;
        private static readonly int WalkHash = Animator.StringToHash("IsWalking");
        private static readonly int JumpHash = Animator.StringToHash("JumpTrigger");
        private static readonly int WaveHash = Animator.StringToHash("WaveTrigger");
        private static readonly int CelebrateHash = Animator.StringToHash("CelebrateTrigger");

        private void Awake() => _animator = GetComponent<Animator>();

        public void SetWalking(bool walking) => _animator.SetBool(WalkHash, walking);
        public void PlayJump() => _animator.SetTrigger(JumpHash);
        public void PlayWave() => _animator.SetTrigger(WaveHash);
        public void PlayCelebrate() => _animator.SetTrigger(CelebrateHash);
    }
}
