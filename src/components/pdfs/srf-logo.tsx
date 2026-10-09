import { Image } from '@react-pdf/renderer';

const srfLogoUrl =
  'https://res.cloudinary.com/dakh64xhy/image/upload/v1791516252/WhatsApp_Image_2026-10-08_at_16.43.54_trehag.jpg';

type SrfLogoProps = {
  size?: number;
};

export function SrfLogo({ size = 64 }: SrfLogoProps) {
  return <Image src={srfLogoUrl} style={{ width: size, height: size }} />;
}
