import { useState, useEffect } from 'react';
import styled from 'styled-components';

const WORD = 'PLACEDIN';
const ANIMATION_DELAY = 80; // Faster animation for quicker loading

const Loader = () => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (visibleCount < WORD.length) {
      const timeout = setTimeout(() => setVisibleCount(visibleCount + 1), ANIMATION_DELAY);
      return () => clearTimeout(timeout);
    } else {
      // Reduced wait time before fade out
      const timeout = setTimeout(() => setDone(true), 300);
      return () => clearTimeout(timeout);
    }
  }, [visibleCount]);

  return (
    <StyledWrapper done={done}>
      <div className="placedin-loader">
        {WORD.split('').map((char, i) => (
          <span
            key={i}
            className={`placedin-letter${i < visibleCount ? ' visible' : ''}`}
            style={{ transitionDelay: `${i * ANIMATION_DELAY}ms` }}
          >
            {char}
          </span>
        ))}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ done: boolean }>`
  .placedin-loader {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 3rem;
    font-weight: 800;
    letter-spacing: 0.2em;
    color: #0369a1;
    min-width: 420px;
    min-height: 120px;
    user-select: none;
    opacity: ${props => (props.done ? 0 : 1)};
    transition: opacity 0.4s cubic-bezier(.4,0,.2,1);
  }
  .placedin-letter {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
    display: inline-block;
    transition: opacity 0.15s, transform 0.2s;
  }
  .placedin-letter.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
    color: #22d3ee;
    text-shadow: 0 2px 12px #0369a1aa;
  }
`;

export default Loader;
