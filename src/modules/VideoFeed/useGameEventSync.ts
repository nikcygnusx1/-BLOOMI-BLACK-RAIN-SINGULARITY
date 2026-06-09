import { useEffect, useState, useRef } from 'react';
import { SimState } from '../../types';

interface UseGameEventSyncProps {
  state: SimState | null;
  onFeedSwitch: (feedId: 'CERN' | 'MRKTS' | 'INTEL' | 'DARK') => void;
}

export function useGameEventSync({ state, onFeedSwitch }: UseGameEventSyncProps) {
  const [glitchTrigger, setGlitchTrigger] = useState(0);
  const [colorGrade, setColorGrade] = useState<'normal' | 'warm' | 'cold'>('normal');
  const [borderPulse, setBorderPulse] = useState<'none' | 'red' | 'amber'>('none');
  const [energySpike, setEnergySpike] = useState(13.6);
  const [currentEventText, setCurrentEventText] = useState<string>('SYSTEM_STEADY // FEED_SECURE');

  // Keep references to previous state to detect events on tick change
  const prevWeatherRef = useRef<string | null>(null);
  const prevTickRef = useRef<number>(-1);
  const prevCablesLength = useRef<number>(-1);
  const prevMembersCount = useRef<number>(-1);

  useEffect(() => {
    if (!state) return;

    // Fast random micro-glitches during storms or high threat
    let randomGlitchInterval: NodeJS.Timeout | null = null;
    if (state.currentWeather === 'LIGHTNING_STORM' || state.currentWeather === 'MONSOON_BREACH' || state.omegaThreatLevel > 75) {
      randomGlitchInterval = setInterval(() => {
        if (Math.random() < 0.25) {
          setGlitchTrigger(prev => prev + 1);
        }
      }, 1500);
    }

    // Tick-by-tick observation
    if (state.currentTick !== prevTickRef.current) {
      // 1. Weather reaction
      if (state.currentWeather !== prevWeatherRef.current) {
        if (state.currentWeather === 'LIGHTNING_STORM' || state.currentWeather === 'GRID_COLLAPSE') {
          // LIGHTNING_STRIKE event
          setGlitchTrigger(prev => prev + 1);
          setCurrentEventText('WEATHER ANOMALY: ELECTROMAGNETIC PULSE BURST');
        } else if (state.currentWeather === 'HEAT_DOME') {
          // HEAT_DOME_ACTIVE event
          setColorGrade('warm');
          setCurrentEventText('CLIMATE THREAT: SEVERE THERMAL HEAT DOME');
        } else if (state.currentWeather === 'FLASH_FLOOD' || state.currentWeather === 'MONSOON_BREACH') {
          // FLASH_FLOOD event
          setColorGrade('cold');
          setCurrentEventText('CLIMATE BREACH: DEEP HYB-AQUEOUS FLASH FLOOD');
        } else {
          setColorGrade('normal');
          setCurrentEventText('METEOROLOGICAL SCAN: NOMINAL WEATHER STABILIZED');
        }
        prevWeatherRef.current = state.currentWeather;
      }

      // 2. Sovereign Debt Crisis / Default
      // Check if any country debt stress crossed severe threshold or defaulted
      const severeCDS = Object.values(state.countries).some(c => c.debtStress > 85);
      if (severeCDS) {
        // SOVEREIGN_DEFAULT event
        onFeedSwitch('MRKTS');
        setBorderPulse('red');
        setCurrentEventText('SYSTEMIC EVENT: HYPAN-LIQUIDITY BANKRUPTCY PULSE');
        setTimeout(() => setBorderPulse('none'), 3000);
      }

      // 3. Hadron Collider State Reaction
      // If weather is GRID_COLLAPSE or biomass is high, simulate CERN collider state
      if (state.labPowerUsed > state.labPowerMax * 0.85) {
        // COLLIDER_ARMED event
        onFeedSwitch('CERN');
        setEnergySpike(13.6 + Math.random() * 4.2);
        setCurrentEventText('HADRON ACCELERATOR: MAXIMUM COUPLING RATIO');
        setTimeout(() => setEnergySpike(13.6), 2500);
      }

      // 4. Dynasty Genetic Splice Check
      const curMembers = state.dynasty?.members?.length || 0;
      if (prevMembersCount.current !== -1 && curMembers !== prevMembersCount.current) {
        // DYNASTY_SPLICE event
        setCurrentEventText('SOMATIC CORRIDOR: CHROMOSOMATIVE SEQUENCING MUTATION');
        setGlitchTrigger(prev => prev + 1);
        setBorderPulse('amber');
        setTimeout(() => setBorderPulse('none'), 2000);
      }
      prevMembersCount.current = curMembers;

      // 5. Cable feed logs to trigger glitch
      const curCables = state.cables?.length || 0;
      if (prevCablesLength.current !== -1 && curCables !== prevCablesLength.current) {
        setGlitchTrigger(prev => prev + 1);
      }
      prevCablesLength.current = curCables;

      prevTickRef.current = state.currentTick;
    }

    return () => {
      if (randomGlitchInterval) clearInterval(randomGlitchInterval);
    };
  }, [state, onFeedSwitch]);

  return {
    glitchTrigger,
    colorGrade,
    borderPulse,
    energySpike,
    currentEventText
  };
}
