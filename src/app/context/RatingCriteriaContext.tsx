import React, { createContext, useContext, useState, ReactNode } from "react";

interface RatingCriteriaContextType {
  accordions: any[];
  setAccordions: React.Dispatch<React.SetStateAction<any[]>>;
  expandedPanel: string | null;
  setExpandedPanel: React.Dispatch<React.SetStateAction<string | null>>;
  totalWeight: number;
  setTotalWeight: React.Dispatch<React.SetStateAction<number>>;
  questioners: any[];
  setQuestioners: React.Dispatch<React.SetStateAction<any[]>>;
}

const RatingCriteriaContext = createContext<
  RatingCriteriaContextType | undefined
>(undefined);

interface ProviderProps {
  children: ReactNode;
}

export const RatingCriteriaProvider: React.FC<ProviderProps> = ({
  children,
}) => {
  const [accordions, setAccordions] = useState<any[]>([]);
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [questioners, setQuestioners] = useState<any[]>([]);
  const [award, setAward] = useState<any>(null);

  return (
    <RatingCriteriaContext.Provider
      value={{
        accordions,
        setAccordions,
        expandedPanel,
        setExpandedPanel,
        totalWeight,
        setTotalWeight,
        questioners,
        setQuestioners,
      }}
    >
      {children}
    </RatingCriteriaContext.Provider>
  );
};

export const useRatingCriteria = (): RatingCriteriaContextType => {
  const context = useContext(RatingCriteriaContext);
  if (context === undefined) {
    throw new Error(
      "useRatingCriteria must be used within a RatingCriteriaProvider"
    );
  }
  return context;
};
