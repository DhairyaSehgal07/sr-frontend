import { Image } from '@react-pdf/renderer';

import srfLogo from '@/assets/srf-logo.jpg';

type SrfLogoProps = {
  size?: number;
};

export function SrfLogo({ size = 64 }: SrfLogoProps) {
  return <Image src={srfLogo} style={{ width: size, height: size, marginBottom: 6 }} />;
}
