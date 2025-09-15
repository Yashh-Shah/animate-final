module.exports = {theme: {
  extend: {
    keyframes: {
      'thinking-anim': {
        '0%, 100%': { transform: 'rotate(-2deg) translateY(0)' },
        '50%': { transform: 'rotate(2deg) translateY(-2px)' }
      },
      'wave-anim': {
        '0%': { transform: 'rotate(0deg)' }, '20%': { transform: 'rotate(14deg)' }, '40%': { transform: 'rotate(-8deg)' }, '60%': { transform: 'rotate(14deg)' }, '80%': { transform: 'rotate(-4deg)' }, '100%': { transform: 'rotate(0deg)' }
      },
      'cheer-anim': {
        '0%,100%': { transform: 'scale(1)' }, '25%': { transform: 'scale(1.1) rotate(-5deg)' }, '75%': { transform: 'scale(1.1) rotate(5deg)' }
      }
    },
    animation: {
      'thinking-anim': 'thinking-anim 1.5s ease-in-out infinite',
      'wave-anim': 'wave-anim 2s ease-in-out infinite',
      'cheer-anim': 'cheer-anim 0.8s ease-in-out 2',
      'bounce-soft': 'bounce 1s infinite'
    }
  }
}

};
