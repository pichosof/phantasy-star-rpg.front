export type DefaultPadding = {
  mobile: [number, number];
  tablet: [number, number];
  desktop: [number, number];
};

export type PaddingDensity = 'comfy' | 'dense';

export const defaultPaddings: Record<PaddingDensity, DefaultPadding> = {
  comfy: {
    mobile: [16, 12],
    tablet: [20, 16],
    desktop: [24, 24],
  },
  dense: {
    mobile: [12, 10],
    tablet: [14, 12],
    desktop: [16, 16],
  },
};
