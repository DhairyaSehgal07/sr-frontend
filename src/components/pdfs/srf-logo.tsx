import { Image } from '@react-pdf/renderer';

type SrfLogoProps = {
  src: string;
  size?: number;
};

export function SrfLogo({ src, size = 64 }: SrfLogoProps) {
  if (!src) return null;
  return <Image src={src} style={{ width: size, height: size }} />;
}
