export const OPEN_STRATEGIES = ['download', 'audio', 'video', 'image', 'text', 'new-tab'] as const;
export type OpenStrategy = (typeof OPEN_STRATEGIES)[number];
