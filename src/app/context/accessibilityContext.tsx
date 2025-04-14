"use client";
import PropTypes from "prop-types";
import {
  useEffect,
  useMemo,
  useCallback,
  useState,
  useContext,
  createContext,
} from "react";

const MIN_FONT_SIZE_PERCENT = 64;
const MAX_FONT_SIZE_PERCENT = 140;
const MIN_LETTER_SPACING = -0.5;
const MAX_LETTER_SPACING = 0.4;

export const AccessibilityContext = createContext(undefined);

export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);

  if (context === undefined) {
    throw new Error(
      "useAccessibilityContext must be used inside AccessibilityProvider"
    );
  }

  return context;
};

export function AccessibilityProvider({ children, defaultSettings = {} }) {
  const [rootFontSize, setRootFontSize] = useState(
    defaultSettings.rootFontSize || 100
  );
  const [colorBlind, setColorBlind] = useState(
    defaultSettings.colorBlind || false
  );
  const [cursorMode, setCursorMode] = useState(
    defaultSettings.cursorMode || "auto"
  );
  const [letterSpacing, setLetterSpacing] = useState(
    defaultSettings.letterSpacing || 0
  );

  const onToggleColorBlind = useCallback(() => {
    setColorBlind((prev) => !prev);
  }, []);

  const onDecreaseRootFontSize = useCallback(() => {
    setRootFontSize((prev) => Math.max(prev - 9, MIN_FONT_SIZE_PERCENT));
  }, []);

  const onIncreaseRootFontSize = useCallback(() => {
    setRootFontSize((prev) => Math.min(prev + 10, MAX_FONT_SIZE_PERCENT));
  }, []);

  const onDecreaseLetterSpacing = useCallback(() => {
    setLetterSpacing((prev) => Math.max(prev - 0.1, MIN_LETTER_SPACING));
  }, []);

  const onIncreaseLetterSpacing = useCallback(() => {
    setLetterSpacing((prev) => Math.min(prev + 0.15, MAX_LETTER_SPACING));
  }, []);

  const onChangeCursorMode = useCallback((mode) => {
    setCursorMode(mode);
  }, []);

  const onReset = useCallback(() => {
    setRootFontSize(defaultSettings.rootFontSize || 100);
    setColorBlind(defaultSettings.colorBlind || false);
    setCursorMode(defaultSettings.cursorMode || "auto");
    setLetterSpacing(defaultSettings.letterSpacing || 0);
  }, [defaultSettings]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${rootFontSize}%`;
  }, [rootFontSize]);

  useEffect(() => {
    document.documentElement.style.letterSpacing = `${letterSpacing}em`;
  }, [letterSpacing]);

  useEffect(() => {
    document.documentElement.style.filter = colorBlind ? "grayscale(100%)" : "";
  }, [colorBlind]);

  const memoizedValue = useMemo(
    () => ({
      onReset,
      rootFontSize,
      onDecreaseRootFontSize,
      onIncreaseRootFontSize,
      letterSpacing,
      onDecreaseLetterSpacing,
      onIncreaseLetterSpacing,
      colorBlind,
      onToggleColorBlind,
      cursorMode,
      onChangeCursorMode,
    }),
    [
      onReset,
      rootFontSize,
      onDecreaseRootFontSize,
      onIncreaseRootFontSize,
      letterSpacing,
      onDecreaseLetterSpacing,
      onIncreaseLetterSpacing,
      colorBlind,
      onToggleColorBlind,
      cursorMode,
      onChangeCursorMode,
    ]
  );

  return (
    <AccessibilityContext.Provider value={memoizedValue}>
      {children}
    </AccessibilityContext.Provider>
  );
}

AccessibilityProvider.propTypes = {
  children: PropTypes.node.isRequired,
  defaultSettings: PropTypes.shape({
    rootFontSize: PropTypes.number,
    colorBlind: PropTypes.bool,
    cursorMode: PropTypes.string,
    letterSpacing: PropTypes.number,
  }),
};

AccessibilityProvider.defaultProps = {
  defaultSettings: {
    rootFontSize: 100,
    colorBlind: false,
    cursorMode: "auto",
    letterSpacing: 0,
  },
};
