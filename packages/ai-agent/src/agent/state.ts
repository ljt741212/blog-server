import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";

export interface DecisionRecord {
  action: string;
  result: string;
  resourceId?: string;
  timestamp: string;
}

export const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),

  longTermSummary: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),

  decisions: Annotation<DecisionRecord[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),

  turnCount: Annotation<number>({
    reducer: (prev, next) => prev + next,
    default: () => 0,
  }),
});
